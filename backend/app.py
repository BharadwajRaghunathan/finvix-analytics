from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import os
import random
from config import GEMINI_API_KEY
from models import predict_conversions, predict_roi, predict_actual_roi, predict_actual_conversions
from utils import fetch_suggestions
from reports import generate_pdf
from input_predict import validate_file, process_file
from database_models import db
from auth import register_user, login_user
import warnings

warnings.filterwarnings('ignore', category=UserWarning, module='pickle')

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ✅ FIXED CORS CONFIGURATION
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://finvix-frontend.onrender.com",
            "https://*.onrender.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

# Database Configuration
database_url = os.getenv('DATABASE_URL')

if database_url:
    # Render provides postgres:// but SQLAlchemy needs postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Fallback to individual environment variables for local development
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'finvix_db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key-change-in-production')

# Initialize extensions
db.init_app(app)
app.bcrypt = Bcrypt(app)
jwt = JWTManager(app)

input_features = [
    'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate',
    'Click-Through Rate (CTR)', 'Cost Per Click (CPC)', 'Cost Per Conversion',
    'Customer Acquisition Cost (CAC)', 'Campaign Type', 'Region', 'Industry',
    'Company Size', 'Seasonality Factor'
]

expected_categories = {
    'Campaign Type': ['Search Ads', 'Display Ads', 'Email', 'Social Media'],
    'Region': ['South America', 'North America', 'Asia', 'Europe'],
    'Industry': ['Tech', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'],
    'Company Size': ['Small']
}

numeric_features = [
    'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate',
    'Click-Through Rate (CTR)', 'Cost Per Click (CPC)', 'Cost Per Conversion',
    'Customer Acquisition Cost (CAC)', 'Seasonality Factor'
]

last_predict_input = None

def determine_status(predicted, actual):
    if actual == 0:
        return 'moderate'
    relative_diff = (predicted - actual) / abs(actual)
    if relative_diff > 0.05:
        return 'positive'
    elif relative_diff < -0.05:
        return 'negative'
    return 'moderate'

def simulate_dashboard_data():
    global last_predict_input
    if last_predict_input:
        base_input = last_predict_input.copy()
    else:
        base_input = {
            'Ad Spend': 5000, 'Clicks': 1000, 'Impressions': 50000, 'Conversion Rate': 0.05,
            'Click-Through Rate (CTR)': 0.02, 'Cost Per Click (CPC)': 5, 'Cost Per Conversion': 100,
            'Customer Acquisition Cost (CAC)': 200, 'Campaign Type': 'Search Ads', 'Region': 'North America',
            'Industry': 'Retail', 'Company Size': 'Small', 'Seasonality Factor': 1.0
        }
    input_df = pd.DataFrame([base_input])
    
    actual_roi = predict_actual_roi(input_df)
    actual_conversions = predict_actual_conversions(input_df)

    data = []
    now = datetime.now()
    campaign_types = ['Search Ads', 'Display Ads', 'Email', 'Social Media']
    regions = ['South America', 'North America', 'Asia', 'Europe']
    for i in range(24):
        time = (now - timedelta(hours=i)).isoformat()
        fluctuated_input = input_df.copy()
        for feature in numeric_features:
            fluctuation = np.random.uniform(-0.15, 0.15)
            fluctuated_input[feature] = input_df[feature] * (1 + fluctuation)

        conv_pred = predict_conversions(fluctuated_input)
        roi_df = fluctuated_input.copy()
        roi_df['Conversions'] = conv_pred
        roi_pred = predict_roi(roi_df)

        conv_status = determine_status(conv_pred, actual_conversions)
        roi_status = determine_status(roi_pred, actual_roi)

        impressions = fluctuated_input['Impressions'].values[0]
        ctr = fluctuated_input['Click-Through Rate (CTR)'].values[0]
        base_clicks = impressions * ctr
        clicks_fluctuation = np.random.uniform(-0.2, 0.2)
        clicks = base_clicks * (1 + clicks_fluctuation)
        clicks = max(0, min(clicks, impressions))

        ad_spend = fluctuated_input['Ad Spend'].values[0]
        cost_per_conversion = ad_spend / conv_pred if conv_pred > 0 else 0
        campaign_type = campaign_types[i % len(campaign_types)]
        region = regions[i % len(regions)]

        data.append({
            'time': time,
            'conversions': float(conv_pred),
            'roi': float(roi_pred),
            'impressions': float(impressions),
            'clicks': float(clicks),
            'cost_per_conversion': float(cost_per_conversion),
            'ad_spend': float(ad_spend),
            'ctr': float(ctr),
            'campaign_type': campaign_type,
            'region': region,
            'conversions_status': conv_status,
            'roi_status': roi_status
        })
    return data[::-1]

# Health check endpoint for Render
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'finvix-backend'}), 200

# Public Routes
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Welcome to Finvix AI Prediction API. Use /predict with POST to get insights.',
        'status': 'success',
        'version': '1.0.0'
    })

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({"message": "Missing required fields"}), 400
        
        user, error = register_user(username, email, password)
        if error:
            return jsonify({"message": error}), 409
        
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"message": "Missing username or password"}), 400
        
        access_token, error = login_user(username, password)
        if error:
            return jsonify({"message": error}), 401
        
        return jsonify({"access_token": access_token}), 200
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Login failed"}), 500

# ✅ ADDED: GREETING ROUTE
@app.route('/greeting', methods=['GET'])
@jwt_required()
def greeting():
    try:
        current_user = get_jwt_identity()
        
        # Sample motivational quotes
        quotes = [
            "Success is not final, failure is not fatal: It is the courage to continue that counts.",
            "The only way to do great work is to love what you do.",
            "Believe you can and you're halfway there.",
            "Innovation distinguishes between a leader and a follower.",
            "The future belongs to those who believe in the beauty of their dreams."
        ]
        
        return jsonify({
            'username': current_user,
            'quotes': random.sample(quotes, min(2, len(quotes)))
        }), 200
        
    except Exception as e:
        print(f"Greeting error: {str(e)}")
        return jsonify({'message': 'Failed to fetch greeting'}), 500

# Protected Routes
@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    try:
        data = simulate_dashboard_data()
        return jsonify({'data': data, 'status': 'success'}), 200
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return jsonify({'message': f'Dashboard error: {str(e)}', 'status': 'error'}), 500

@app.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    try:
        data = request.get_json()
        model_type = data.get('model_type', 'both')
        
        if 'input' not in data:
            return jsonify({'error': 'Missing input data', 'status': 'error'}), 400
        
        if len(data['input']) != len(input_features):
            return jsonify({
                'error': f'Expected {len(input_features)} features, got {len(data["input"])}',
                'status': 'error'
            }), 400

        input_dict = dict(zip(input_features, data['input']))

        categorical_features = ['Campaign Type', 'Region', 'Industry', 'Company Size']
        for feature in categorical_features:
            value = input_dict[feature]
            if value not in expected_categories[feature]:
                return jsonify({
                    'error': f'Invalid category for {feature}: {value}',
                    'status': 'error'
                }), 400

        for feature in numeric_features:
            try:
                input_dict[feature] = float(input_dict[feature])
            except ValueError:
                return jsonify({'error': f'Invalid numeric value for {feature}', 'status': 'error'}), 400

        global last_predict_input
        last_predict_input = input_dict.copy()

        input_df = pd.DataFrame([input_dict])

        actual_roi = predict_actual_roi(input_df)
        actual_conversions = predict_actual_conversions(input_df)

        result = {}

        if model_type in ['conversions', 'both']:
            conv_pred = predict_conversions(input_df)
            result['conversions'] = float(conv_pred)
            result['conversions_status'] = determine_status(conv_pred, actual_conversions)
            result['actual_conversions'] = float(actual_conversions)

        if model_type in ['roi', 'both']:
            if 'conversions' not in result:
                conv_pred = predict_conversions(input_df)
            else:
                conv_pred = result['conversions']
            roi_df = input_df.copy()
            roi_df['Conversions'] = conv_pred
            roi_pred = predict_roi(roi_df)
            result['roi'] = float(roi_pred)
            result['roi_status'] = determine_status(roi_pred, actual_roi)
            result['actual_roi'] = float(actual_roi)

        # Generate AI suggestions
        if model_type in ['conversions', 'both']:
            status = result['conversions_status']
            if status == 'positive':
                conv_prompt = (
                    f"Predicted conversions of {result['conversions']:.2f} exceed actual conversions of {actual_conversions:.2f} for a {input_dict['Campaign Type']} campaign "
                    f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why this improvement occurred, referencing key metrics: "
                    f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
                    f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to sustain or further increase conversions."
                )
            elif status == 'negative':
                conv_prompt = (
                    f"Predicted conversions of {result['conversions']:.2f} are below actual conversions of {actual_conversions:.2f} for a {input_dict['Campaign Type']} campaign "
                    f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why this decline occurred, referencing key metrics: "
                    f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
                    f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to improve conversions."
                )
            else:
                conv_prompt = (
                    f"Predicted conversions of {result['conversions']:.2f} are stable compared to actual conversions of {actual_conversions:.2f} for a {input_dict['Campaign Type']} campaign "
                    f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why performance is stable, referencing key metrics: "
                    f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
                    f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to enhance conversions."
                )
            result['conversions_suggestions'] = fetch_suggestions(conv_prompt)

        if model_type in ['roi', 'both']:
            status = result['roi_status']
            if status == 'positive':
                roi_prompt = (
                    f"Predicted ROI of {result['roi']:.2f} exceeds actual ROI of {actual_roi:.2f} for a {input_dict['Campaign Type']} campaign "
                    f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why this improvement occurred, referencing key metrics: "
                    f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
                    f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to sustain or further increase ROI."
                )
            elif status == 'negative':
                roi_prompt = (
                    f"Predicted ROI of {result['roi']:.2f} is below actual ROI of {actual_roi:.2f} for a {input_dict['Campaign Type']} campaign "
                    f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why this decline occurred, referencing key metrics: "
                    f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
                    f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to improve ROI."
                )
            else:
                roi_prompt = (
                    f"Predicted ROI of {result['roi']:.2f} is stable compared to actual ROI of {actual_roi:.2f} for a {input_dict['Campaign Type']} campaign "
                    f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why performance is stable, referencing key metrics: "
                    f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
                    f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to enhance ROI."
                )
            result['roi_suggestions'] = fetch_suggestions(roi_prompt)

        return jsonify(result)

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 400

@app.route('/report', methods=['POST'])
@jwt_required()
def report():
    try:
        data = request.get_json()
        dashboard_data = data.get('dashboard_data', simulate_dashboard_data())
        model_type = data.get('model_type', 'both')

        if 'results' not in data or not isinstance(data['results'], dict):
            return jsonify({'error': 'Invalid or missing results', 'status': 'error'}), 400

        results = data['results']

        if model_type == 'roi':
            if 'roi' not in results or 'actual_roi' not in results:
                return jsonify({'error': 'Missing ROI fields in results', 'status': 'error'}), 400
            actual_roi = float(results['actual_roi'])
            predicted_roi = float(results['roi'])
            actual_conversions = 0
            predicted_conversions = 0
            suggestions = results.get('roi_suggestions', '')
        elif model_type == 'conversions':
            if 'conversions' not in results or 'actual_conversions' not in results:
                return jsonify({'error': 'Missing Conversions fields in results', 'status': 'error'}), 400
            actual_roi = 0
            predicted_roi = 0
            actual_conversions = float(results['actual_conversions'])
            predicted_conversions = float(results['conversions'])
            suggestions = results.get('conversions_suggestions', '')
        else:
            if not all(key in results for key in ['roi', 'actual_roi', 'conversions', 'actual_conversions']):
                return jsonify({'error': 'Missing required fields in results', 'status': 'error'}), 400
            actual_roi = float(results['actual_roi'])
            predicted_roi = float(results['roi'])
            actual_conversions = float(results['actual_conversions'])
            predicted_conversions = float(results['conversions'])
            suggestions = ""
            if 'conversions_suggestions' in results:
                suggestions += results['conversions_suggestions'] + "\n"
            if 'roi_suggestions' in results:
                suggestions += results['roi_suggestions'] + "\n"
            suggestions = suggestions.strip() or "No specific suggestions provided."

        filename = f"/tmp/report_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        generate_pdf(filename, dashboard_data, actual_roi, predicted_roi, actual_conversions, predicted_conversions, suggestions, model_type, results=None)

        return send_file(filename, as_attachment=True, mimetype='application/pdf')

    except Exception as e:
        print(f"Report generation error: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 400

@app.route('/upload_predict', methods=['POST'])
@jwt_required()
def upload_predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded', 'status': 'error'}), 400
        
        file = request.files['file']
        model_type = request.form.get('model_type', 'both')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected', 'status': 'error'}), 400
        
        if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
            return jsonify({'error': 'Only CSV and Excel files are supported', 'status': 'error'}), 400
        
        filename = secure_filename(file.filename)
        temp_path = os.path.join('/tmp', filename)
        file.save(temp_path)
        
        if filename.endswith('.csv'):
            df = pd.read_csv(temp_path)
        else:
            df = pd.read_excel(temp_path)
        
        validation_error = validate_file(df)
        if validation_error:
            os.remove(temp_path)
            return jsonify({'error': f'Validation failed: {validation_error}', 'status': 'error'}), 400
        
        results = process_file(df, model_type)
        
        os.remove(temp_path)
        
        if not results:
            return jsonify({'error': 'No predictions returned from process_file', 'status': 'error'}), 400
        
        if len(results) == 1:
            return jsonify(results[0])
        else:
            return jsonify({'results': results, 'status': 'success'})
    
    except Exception as e:
        print(f"Upload processing error: {str(e)}")
        return jsonify({'error': f'Upload processing failed: {str(e)}', 'status': 'error'}), 400

@app.route('/upload_report', methods=['POST'])
@jwt_required()
def upload_report():
    try:
        data = request.get_json()
        results = data.get('results')
        model_type = data.get('model_type', 'both')

        if not results or not isinstance(results, list) or len(results) == 0:
            return jsonify({'error': 'No valid prediction results provided', 'status': 'error'}), 400

        required_fields = []
        if model_type == 'roi':
            required_fields = ['roi', 'actual_roi']
        elif model_type == 'conversions':
            required_fields = ['conversions', 'actual_conversions']
        else:
            required_fields = ['roi', 'actual_roi', 'conversions', 'actual_conversions']

        for row in results:
            missing = [field for field in required_fields if field not in row or row[field] is None]
            if missing:
                return jsonify({'error': f'Missing fields in results: {", ".join(missing)}', 'status': 'error'}), 400

        actual_roi_avg = np.mean([float(row.get('actual_roi', 0)) for row in results])
        predicted_roi_avg = np.mean([float(row.get('roi', 0)) for row in results])
        actual_conversions_avg = np.mean([float(row.get('actual_conversions', 0)) for row in results])
        predicted_conversions_avg = np.mean([float(row.get('conversions', 0)) for row in results])

        suggestions = ""
        for row in results:
            if model_type in ['conversions', 'both'] and 'conversions_suggestions' in row:
                suggestions += row.get('conversions_suggestions', '') + "\n"
            if model_type in ['roi', 'both'] and 'roi_suggestions' in row:
                suggestions += row.get('roi_suggestions', '') + "\n"
        suggestions = suggestions.strip() or "No specific suggestions available based on the provided results."

        dashboard_data = simulate_dashboard_data()
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"/tmp/upload_report_{model_type}_{timestamp}.pdf"
        
        generate_pdf(filename, dashboard_data, actual_roi_avg, predicted_roi_avg, actual_conversions_avg, predicted_conversions_avg, suggestions, model_type, results=results)
        
        return send_file(filename, as_attachment=True, download_name=f"{model_type}_report.pdf")
    
    except Exception as e:
        print(f"Upload report error: {str(e)}")
        return jsonify({'error': f'PDF generation failed: {str(e)}', 'status': 'error'}), 400

@app.route('/download_results', methods=['POST'])
@jwt_required()
def download_results():
    try:
        data = request.get_json()
        results = data.get('results')
        model_type = data.get('model_type', 'both')
        file_type = data.get('file_type', 'csv')
        
        if not results:
            return jsonify({'error': 'No results to download', 'status': 'error'}), 400
        
        df = pd.DataFrame(results)
        
        roi_columns = ['actual_roi', 'roi', 'roi_status', 'roi_suggestions']
        conversions_columns = ['actual_conversions', 'conversions', 'conversions_status', 'conversions_suggestions']
        
        if model_type == 'roi':
            columns = [col for col in roi_columns if col in df.columns]
        elif model_type == 'conversions':
            columns = [col for col in conversions_columns if col in df.columns]
        else:
            columns = df.columns.tolist()
        
        if not columns:
            return jsonify({'error': f'No relevant columns found for model_type: {model_type}', 'status': 'error'}), 400
        
        df = df[columns]
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        if file_type == 'xlsx':
            filename = f"/tmp/{model_type}_results_{timestamp}.xlsx"
            df.to_excel(filename, index=False)
            mime_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        else:
            filename = f"/tmp/{model_type}_results_{timestamp}.csv"
            df.to_csv(filename, index=False)
            mime_type = 'text/csv'
        
        return send_file(filename, as_attachment=True, mimetype=mime_type)
    
    except Exception as e:
        print(f"Download results error: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 400

# Initialize database
def init_db():
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables verified/created")
        except Exception as e:
            print(f"⚠️ Database initialization warning: {str(e)}")

if __name__ == '__main__':
    init_db()
    port = int(os.getenv('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

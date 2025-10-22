import joblib
import pandas as pd

# Load models
roi_model = joblib.load('models/best_xgb_roi.pkl')
conv_model = joblib.load('models/conversions_model.pkl')

# Sample input matching your training features
sample_input = {
    'Ad Spend': 5000, 'Clicks': 1000, 'Impressions': 50000,
    'Conversion Rate': 0.05, 'Click-Through Rate (CTR)': 0.02,
    'Cost Per Click (CPC)': 5, 'Cost Per Conversion': 100,
    'Customer Acquisition Cost (CAC)': 200, 'Campaign Type': 'Search Ads',
    'Region': 'North America', 'Industry': 'Retail', 'Company Size': 'Small',
    'Seasonality Factor': 1.2
}
input_df = pd.DataFrame([sample_input])

# Predict conversions
conv_pred = conv_model.predict(input_df)
print(f"Predicted Conversions: {conv_pred[0]}")

# Add conversions for ROI prediction
input_df['Conversions'] = conv_pred
roi_pred = roi_model.predict(input_df)
print(f"Predicted ROI: {roi_pred[0]}")
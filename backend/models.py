import joblib
import pandas as pd
import numpy as np
import os
import warnings


warnings.filterwarnings('ignore')


# Get the base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')


# Model file paths
MODEL_PATHS = {
    'roi_model': os.path.join(MODELS_DIR, 'best_xgb_roi.pkl'),
    'conv_model': os.path.join(MODELS_DIR, 'conversions_model.pkl'),
    'actual_roi_model': os.path.join(MODELS_DIR, 'actual_roi_model.pkl'),
    'actual_conversions_model': os.path.join(MODELS_DIR, 'actual_conversions_model.pkl'),
    'label_encoders': os.path.join(MODELS_DIR, 'label_encoders.pkl')
}


# Initialize models as None
roi_model = None
conv_model = None
actual_roi_model = None
actual_conversions_model = None
label_encoders = None


def load_models():
    """Load all models with error handling"""
    global roi_model, conv_model, actual_roi_model, actual_conversions_model, label_encoders
    
    try:
        print(f"📂 Loading models from: {MODELS_DIR}")
        
        # Check if models directory exists
        if not os.path.exists(MODELS_DIR):
            print(f"⚠️ Models directory not found: {MODELS_DIR}")
            return False
        
        # Load ROI model
        if os.path.exists(MODEL_PATHS['roi_model']):
            roi_model = joblib.load(MODEL_PATHS['roi_model'])
            print("✅ ROI model loaded successfully")
        else:
            print(f"⚠️ ROI model not found at: {MODEL_PATHS['roi_model']}")
        
        # Load Conversions model
        if os.path.exists(MODEL_PATHS['conv_model']):
            conv_model = joblib.load(MODEL_PATHS['conv_model'])
            print("✅ Conversions model loaded successfully")
        else:
            print(f"⚠️ Conversions model not found at: {MODEL_PATHS['conv_model']}")
        
        # Load Actual ROI model
        if os.path.exists(MODEL_PATHS['actual_roi_model']):
            actual_roi_model = joblib.load(MODEL_PATHS['actual_roi_model'])
            print("✅ Actual ROI model loaded successfully")
        else:
            print(f"⚠️ Actual ROI model not found at: {MODEL_PATHS['actual_roi_model']}")
        
        # Load Actual Conversions model
        if os.path.exists(MODEL_PATHS['actual_conversions_model']):
            actual_conversions_model = joblib.load(MODEL_PATHS['actual_conversions_model'])
            print("✅ Actual Conversions model loaded successfully")
        else:
            print(f"⚠️ Actual Conversions model not found at: {MODEL_PATHS['actual_conversions_model']}")
        
        # Load Label Encoders
        if os.path.exists(MODEL_PATHS['label_encoders']):
            label_encoders = joblib.load(MODEL_PATHS['label_encoders'])
            print("✅ Label encoders loaded successfully")
            print(f"📋 Available encoders: {list(label_encoders.keys())}")
        else:
            print(f"⚠️ Label encoders not found at: {MODEL_PATHS['label_encoders']}")
        
        # Verify all models loaded
        if all([roi_model, conv_model, actual_roi_model, actual_conversions_model, label_encoders]):
            print("✅ All models loaded successfully!")
            return True
        else:
            missing = []
            if not roi_model: missing.append('ROI model')
            if not conv_model: missing.append('Conversions model')
            if not actual_roi_model: missing.append('Actual ROI model')
            if not actual_conversions_model: missing.append('Actual Conversions model')
            if not label_encoders: missing.append('Label encoders')
            print(f"⚠️ Missing models: {', '.join(missing)}")
            return False
            
    except Exception as e:
        print(f"❌ Error loading models: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


# Load models on module import
load_models()


def encode_categorical(input_df):
    """
    Encode categorical features in the input DataFrame using saved label encoders.
    Ensures all values are properly converted to numeric types using vectorized operations.
    
    Args:
        input_df (pd.DataFrame): Input data with categorical features.
    
    Returns:
        pd.DataFrame: Encoded DataFrame with all features as numeric types.
    """
    if label_encoders is None:
        print("⚠️ Label encoders not loaded. Cannot encode categorical features.")
        raise Exception("Label encoders not loaded")
    
    # Create a copy to avoid modifying original
    df_encoded = input_df.copy()
    
    # Define categorical features that need encoding
    categorical_features = ['Campaign Type', 'Region', 'Industry', 'Company Size']
    
    print(f"🔍 Input DataFrame shape: {df_encoded.shape}")
    print(f"🔍 Input columns: {df_encoded.columns.tolist()}")
    print(f"🔍 Input dtypes BEFORE encoding:\n{df_encoded.dtypes}")
    
    # Encode each categorical feature using vectorized operations
    for feature in categorical_features:
        if feature not in df_encoded.columns:
            print(f"⚠️ Feature '{feature}' not found in DataFrame")
            df_encoded[feature] = 0
            continue
        
        if feature not in label_encoders:
            print(f"⚠️ No encoder for '{feature}', using 0")
            df_encoded[feature] = 0
            continue
        
        le = label_encoders[feature]
        
        try:
            # Convert to string and get values as numpy array
            values = df_encoded[feature].astype(str).values
            
            # Create mapping dictionary for known classes
            encoding_map = {str(cls): int(idx) for idx, cls in enumerate(le.classes_)}
            default_value = 0  # Use 0 (first class index) as default for unknown values
            
            # Vectorized encoding using pandas Series.map()
            # This is much faster and more type-safe than .apply()
            encoded_series = pd.Series(values).map(encoding_map)
            
            # Fill NaN values (unmapped categories) with default
            encoded_series = encoded_series.fillna(default_value)
            
            # Explicitly convert to int64 using numpy array
            encoded_values = encoded_series.values.astype(np.int64)
            
            # Assign back to dataframe
            df_encoded[feature] = encoded_values
            
            print(f"✅ Encoded '{feature}': dtype={df_encoded[feature].dtype}, values={df_encoded[feature].tolist()}")
            
        except Exception as e:
            print(f"❌ Error encoding '{feature}': {str(e)}")
            import traceback
            traceback.print_exc()
            df_encoded[feature] = 0
    
    # Ensure all numeric features are float64
    numeric_features = [
        'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate',
        'Click-Through Rate (CTR)', 'Cost Per Click (CPC)', 'Cost Per Conversion',
        'Customer Acquisition Cost (CAC)', 'Seasonality Factor'
    ]
    
    for feature in numeric_features:
        if feature in df_encoded.columns:
            # Convert to numeric, coercing errors to NaN, then fill with 0.0
            df_encoded[feature] = pd.to_numeric(df_encoded[feature], errors='coerce').fillna(0.0).astype(np.float64)
    
    # Handle Conversions column if present (for ROI prediction)
    if 'Conversions' in df_encoded.columns:
        df_encoded['Conversions'] = pd.to_numeric(df_encoded['Conversions'], errors='coerce').fillna(0.0).astype(np.float64)
    
    print(f"🔍 Output dtypes AFTER encoding:\n{df_encoded.dtypes}")
    
    # Final validation - ensure NO object types remain
    object_cols = df_encoded.select_dtypes(include=['object']).columns.tolist()
    if object_cols:
        print(f"⚠️ WARNING: Object columns still present: {object_cols}")
        for col in object_cols:
            print(f"   Converting '{col}' to 0")
            df_encoded[col] = 0
    
    # Final dtype check
    print(f"✅ Final encoded DataFrame dtypes:\n{df_encoded.dtypes}")
    
    return df_encoded


def predict_conversions(input_df):
    """
    Predict conversions using the trained conversions model.
    """
    if conv_model is None:
        raise Exception("Conversions model not loaded. Please check model files.")
    
    try:
        print("\n" + "="*50)
        print("🔮 PREDICT CONVERSIONS")
        print("="*50)
        
        # Encode categorical features
        encoded_df = encode_categorical(input_df)
        
        # Ensure correct column order (if model expects specific order)
        expected_features = [
            'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate',
            'Click-Through Rate (CTR)', 'Cost Per Click (CPC)', 'Cost Per Conversion',
            'Customer Acquisition Cost (CAC)', 'Campaign Type', 'Region', 'Industry',
            'Company Size', 'Seasonality Factor'
        ]
        
        # Reorder columns to match expected features
        encoded_df = encoded_df[expected_features]
        
        print(f"📊 Final DataFrame shape: {encoded_df.shape}")
        print(f"📊 Final DataFrame dtypes:\n{encoded_df.dtypes}")
        print(f"📊 Sample values:\n{encoded_df.iloc[0].to_dict()}")
        
        # Make prediction
        prediction = conv_model.predict(encoded_df)[0]
        
        print(f"✅ Prediction successful: {prediction}")
        print("="*50 + "\n")
        
        return float(prediction)
        
    except Exception as e:
        print(f"❌ Error in predict_conversions: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Error predicting conversions: {str(e)}")


def predict_roi(input_df):
    """
    Predict ROI using the trained ROI model.
    """
    if roi_model is None:
        raise Exception("ROI model not loaded. Please check model files.")
    
    try:
        print("\n" + "="*50)
        print("🔮 PREDICT ROI")
        print("="*50)
        
        # Encode categorical features
        encoded_df = encode_categorical(input_df)
        
        # Expected features for ROI model (includes Conversions)
        expected_features = [
            'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate',
            'Click-Through Rate (CTR)', 'Cost Per Click (CPC)', 'Cost Per Conversion',
            'Customer Acquisition Cost (CAC)', 'Campaign Type', 'Region', 'Industry',
            'Company Size', 'Seasonality Factor', 'Conversions'
        ]
        
        # Reorder columns
        encoded_df = encoded_df[expected_features]
        
        print(f"📊 Final DataFrame shape: {encoded_df.shape}")
        print(f"📊 Final DataFrame dtypes:\n{encoded_df.dtypes}")
        
        # Make prediction
        prediction = roi_model.predict(encoded_df)[0]
        
        print(f"✅ Prediction successful: {prediction}")
        print("="*50 + "\n")
        
        return float(prediction)
        
    except Exception as e:
        print(f"❌ Error in predict_roi: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Error predicting ROI: {str(e)}")


def predict_actual_roi(input_df):
    """
    Predict actual ROI using the trained actual ROI model.
    """
    if actual_roi_model is None:
        raise Exception("Actual ROI model not loaded. Please check model files.")
    
    try:
        encoded_df = encode_categorical(input_df)
        
        expected_features = [
            'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate',
            'Click-Through Rate (CTR)', 'Cost Per Click (CPC)', 'Cost Per Conversion',
            'Customer Acquisition Cost (CAC)', 'Campaign Type', 'Region', 'Industry',
            'Company Size', 'Seasonality Factor'
        ]
        
        encoded_df = encoded_df[expected_features]
        prediction = actual_roi_model.predict(encoded_df)[0]
        return float(prediction)
        
    except Exception as e:
        print(f"❌ Error in predict_actual_roi: {str(e)}")
        raise Exception(f"Error predicting actual ROI: {str(e)}")


def predict_actual_conversions(input_df):
    """
    Predict actual conversions using the trained actual conversions model.
    """
    if actual_conversions_model is None:
        raise Exception("Actual conversions model not loaded. Please check model files.")
    
    try:
        encoded_df = encode_categorical(input_df)
        
        expected_features = [
            'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate',
            'Click-Through Rate (CTR)', 'Cost Per Click (CPC)', 'Cost Per Conversion',
            'Customer Acquisition Cost (CAC)', 'Campaign Type', 'Region', 'Industry',
            'Company Size', 'Seasonality Factor'
        ]
        
        encoded_df = encoded_df[expected_features]
        prediction = actual_conversions_model.predict(encoded_df)[0]
        return float(prediction)
        
    except Exception as e:
        print(f"❌ Error in predict_actual_conversions: {str(e)}")
        raise Exception(f"Error predicting actual conversions: {str(e)}")


# Utility function to check if models are ready
def models_ready():
    """Check if all required models are loaded."""
    return all([roi_model, conv_model, actual_roi_model, actual_conversions_model, label_encoders])


# Export function to get model status
def get_model_status():
    """Get the loading status of all models."""
    return {
        'roi_model': roi_model is not None,
        'conv_model': conv_model is not None,
        'actual_roi_model': actual_roi_model is not None,
        'actual_conversions_model': actual_conversions_model is not None,
        'label_encoders': label_encoders is not None,
        'all_loaded': models_ready()
    }

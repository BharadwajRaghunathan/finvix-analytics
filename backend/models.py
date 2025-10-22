import joblib
import pandas as pd
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
    
    Args:
        input_df (pd.DataFrame): Input data with categorical features.
    
    Returns:
        pd.DataFrame: Encoded DataFrame with all categorical features as integers.
    
    Raises:
        Exception: If label encoders are not loaded.
    """
    if label_encoders is None:
        print("⚠️ Label encoders not loaded. Cannot encode categorical features.")
        raise Exception("Label encoders not loaded")
    
    df_encoded = input_df.copy()
    
    # Define categorical features that need encoding
    categorical_features = ['Campaign Type', 'Region', 'Industry', 'Company Size']
    
    for feature in categorical_features:
        if feature not in df_encoded.columns:
            print(f"⚠️ Feature '{feature}' not found in DataFrame columns")
            continue
        
        if feature not in label_encoders:
            print(f"⚠️ No encoder found for '{feature}', using default value 0")
            df_encoded[feature] = 0
            continue
        
        le = label_encoders[feature]
        
        try:
            # Get current values
            current_values = df_encoded[feature]
            
            # Encode each value
            encoded_values = []
            for value in current_values:
                if value in le.classes_:
                    # Value exists in encoder, transform it
                    encoded_values.append(le.transform([value])[0])
                else:
                    # Unseen value, use first class as default
                    print(f"⚠️ Unseen value '{value}' for '{feature}', using default")
                    encoded_values.append(le.transform([le.classes_[0]])[0])
            
            # Assign encoded values as integers
            df_encoded[feature] = pd.Series(encoded_values, dtype=int)
            
            print(f"✅ Encoded '{feature}': {current_values.tolist()} -> {encoded_values}")
            
        except Exception as e:
            print(f"❌ Error encoding '{feature}': {str(e)}")
            # Use default value (0) if encoding fails
            df_encoded[feature] = 0
    
    # Verify all categorical features are now numeric
    for feature in categorical_features:
        if feature in df_encoded.columns:
            if not pd.api.types.is_numeric_dtype(df_encoded[feature]):
                print(f"⚠️ Feature '{feature}' is still not numeric after encoding!")
                df_encoded[feature] = 0
    
    return df_encoded

def predict_conversions(input_df):
    """
    Predict conversions using the trained conversions model.
    
    Args:
        input_df (pd.DataFrame): Input data for prediction.
    
    Returns:
        float: Predicted conversions.
    
    Raises:
        Exception: If conversions model is not loaded.
    """
    if conv_model is None:
        raise Exception("Conversions model not loaded. Please check model files.")
    
    try:
        print(f"📊 Input DataFrame columns: {input_df.columns.tolist()}")
        print(f"📊 Input DataFrame dtypes: {input_df.dtypes.to_dict()}")
        
        # Encode categorical features
        encoded_df = encode_categorical(input_df)
        
        print(f"📊 Encoded DataFrame dtypes: {encoded_df.dtypes.to_dict()}")
        
        prediction = conv_model.predict(encoded_df)[0]
        return float(prediction)
    except Exception as e:
        print(f"❌ Error in predict_conversions: {str(e)}")
        raise Exception(f"Error predicting conversions: {str(e)}")

def predict_roi(input_df):
    """
    Predict ROI using the trained ROI model.
    
    Args:
        input_df (pd.DataFrame): Input data for prediction, including 'Conversions'.
    
    Returns:
        float: Predicted ROI.
    
    Raises:
        Exception: If ROI model is not loaded.
    """
    if roi_model is None:
        raise Exception("ROI model not loaded. Please check model files.")
    
    try:
        # Encode categorical features
        encoded_df = encode_categorical(input_df)
        prediction = roi_model.predict(encoded_df)[0]
        return float(prediction)
    except Exception as e:
        raise Exception(f"Error predicting ROI: {str(e)}")

def predict_actual_roi(input_df):
    """
    Predict actual ROI using the trained actual ROI model.
    
    Args:
        input_df (pd.DataFrame): Input data for prediction.
    
    Returns:
        float: Predicted actual ROI.
    
    Raises:
        Exception: If actual ROI model is not loaded.
    """
    if actual_roi_model is None:
        raise Exception("Actual ROI model not loaded. Please check model files.")
    
    try:
        encoded_df = encode_categorical(input_df)
        prediction = actual_roi_model.predict(encoded_df)[0]
        return float(prediction)
    except Exception as e:
        raise Exception(f"Error predicting actual ROI: {str(e)}")

def predict_actual_conversions(input_df):
    """
    Predict actual conversions using the trained actual conversions model.
    
    Args:
        input_df (pd.DataFrame): Input data for prediction.
    
    Returns:
        float: Predicted actual conversions.
    
    Raises:
        Exception: If actual conversions model is not loaded.
    """
    if actual_conversions_model is None:
        raise Exception("Actual conversions model not loaded. Please check model files.")
    
    try:
        encoded_df = encode_categorical(input_df)
        prediction = actual_conversions_model.predict(encoded_df)[0]
        return float(prediction)
    except Exception as e:
        raise Exception(f"Error predicting actual conversions: {str(e)}")

# Utility function to check if models are ready
def models_ready():
    """
    Check if all required models are loaded.
    
    Returns:
        bool: True if all models are loaded, False otherwise.
    """
    return all([roi_model, conv_model, actual_roi_model, actual_conversions_model, label_encoders])

# Export function to get model status
def get_model_status():
    """
    Get the loading status of all models.
    
    Returns:
        dict: Status of each model.
    """
    return {
        'roi_model': roi_model is not None,
        'conv_model': conv_model is not None,
        'actual_roi_model': actual_roi_model is not None,
        'actual_conversions_model': actual_conversions_model is not None,
        'label_encoders': label_encoders is not None,
        'all_loaded': models_ready()
    }

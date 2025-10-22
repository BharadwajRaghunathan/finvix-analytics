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
            raise Exception(f"Models directory not found: {MODELS_DIR}")
        
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
        pd.DataFrame: Encoded DataFrame.
    """
    if label_encoders is None:
        raise Exception("Label encoders not loaded. Cannot encode categorical features.")
    
    df_encoded = input_df.copy()
    
    for feature, le in label_encoders.items():
        if feature not in df_encoded.columns:
            continue
            
        # Handle unseen categories by mapping to a default value (most frequent)
        df_encoded[feature] = df_encoded[feature].apply(
            lambda x: le.transform([x])[0] if x in le.classes_ else le.transform([le.classes_[0]])[0]
        )
    
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
        # Encode categorical features
        encoded_df = encode_categorical(input_df)
        prediction = conv_model.predict(encoded_df)[0]
        return float(prediction)
    except Exception as e:
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

import joblib
import pandas as pd

# Load the trained models and label encoders from the models/ folder
roi_model = joblib.load('models/best_xgb_roi.pkl')
conv_model = joblib.load('models/conversions_model.pkl')
actual_roi_model = joblib.load('models/actual_roi_model.pkl')
actual_conversions_model = joblib.load('models/actual_conversions_model.pkl')
label_encoders = joblib.load('models/label_encoders.pkl')

def encode_categorical(input_df):
    """
    Encode categorical features in the input DataFrame using saved label encoders.
    
    Args:
        input_df (pd.DataFrame): Input data with categorical features.
    
    Returns:
        pd.DataFrame: Encoded DataFrame.
    """
    df_encoded = input_df.copy()
    for feature, le in label_encoders.items():
        # Handle unseen categories by mapping to a default value (e.g., most frequent)
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
    """
    return float(conv_model.predict(input_df)[0])

def predict_roi(input_df):
    """
    Predict ROI using the trained ROI model.
    
    Args:
        input_df (pd.DataFrame): Input data for prediction, including 'Conversions'.
    
    Returns:
        float: Predicted ROI.
    """
    return float(roi_model.predict(input_df)[0])

def predict_actual_roi(input_df):
    """
    Predict actual ROI using the trained actual ROI model.
    
    Args:
        input_df (pd.DataFrame): Input data for prediction.
    
    Returns:
        float: Predicted actual ROI.
    """
    encoded_df = encode_categorical(input_df)
    return float(actual_roi_model.predict(encoded_df)[0])

def predict_actual_conversions(input_df):
    """
    Predict actual conversions using the trained actual conversions model.
    
    Args:
        input_df (pd.DataFrame): Input data for prediction.
    
    Returns:
        float: Predicted actual conversions.
    """
    encoded_df = encode_categorical(input_df)
    return float(actual_conversions_model.predict(encoded_df)[0])
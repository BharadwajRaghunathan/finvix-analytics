import pandas as pd
import numpy as np
from models import predict_conversions, predict_roi, predict_actual_roi, predict_actual_conversions
from utils import fetch_suggestions
import time

expected_columns = [
    'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate', 'Click-Through Rate (CTR)',
    'Cost Per Click (CPC)', 'Cost Per Conversion', 'Customer Acquisition Cost (CAC)',
    'Campaign Type', 'Region', 'Industry', 'Company Size', 'Seasonality Factor'
]

expected_categories = {
    'Campaign Type': ['Search Ads', 'Display Ads', 'Email', 'Social Media'],
    'Region': ['South America', 'North America', 'Asia', 'Europe'],
    'Industry': ['Tech', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'],
    'Company Size': ['Small']
}

numeric_features = [
    'Ad Spend', 'Clicks', 'Impressions', 'Conversion Rate', 'Click-Through Rate (CTR)',
    'Cost Per Click (CPC)', 'Cost Per Conversion', 'Customer Acquisition Cost (CAC)', 'Seasonality Factor'
]

def validate_file(df):
    if list(df.columns) != expected_columns:
        return f"Invalid columns. Expected: {expected_columns}, Got: {list(df.columns)}"
    
    for feature in ['Campaign Type', 'Region', 'Industry', 'Company Size']:
        invalid_values = df[feature].apply(lambda x: x not in expected_categories[feature])
        if invalid_values.any():
            return f"Invalid category in {feature}: {df[feature][invalid_values].unique()}"
    
    for feature in numeric_features:
        if not pd.api.types.is_numeric_dtype(df[feature]):
            return f"Non-numeric values in {feature}"
    
    return None

def process_file(df, model_type):
    results = []
    for _, row in df.iterrows():
        input_df = pd.DataFrame([row.to_dict()])
        
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
        
        if model_type in ['conversions', 'both']:
            conv_prompt = generate_prompt(result, 'conversions', row.to_dict())
            result['conversions_suggestions'] = fetch_suggestions(conv_prompt)
            time.sleep(1)
        if model_type in ['roi', 'both']:
            roi_prompt = generate_prompt(result, 'roi', row.to_dict())
            result['roi_suggestions'] = fetch_suggestions(roi_prompt)
            time.sleep(1)
        
        results.append(result)
    
    return results

def determine_status(predicted, actual):
    if actual == 0:
        return 'moderate'
    relative_diff = (predicted - actual) / abs(actual)
    if relative_diff > 0.05:
        return 'positive'
    elif relative_diff < -0.05:
        return 'negative'
    return 'moderate'

def generate_prompt(result, metric, input_dict):
    status = result[f'{metric}_status']
    predicted = result[metric]
    actual = result[f'actual_{metric}']
    
    if status == 'positive':
        return (
            f"Predicted {metric} of {predicted:.2f} exceeds actual {metric} of {actual:.2f} for a {input_dict['Campaign Type']} campaign "
            f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why this improvement occurred, referencing key metrics: "
            f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
            f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to sustain or further increase {metric}."
        )
    elif status == 'negative':
        return (
            f"Predicted {metric} of {predicted:.2f} is below actual {metric} of {actual:.2f} for a {input_dict['Campaign Type']} campaign "
            f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why this decline occurred, referencing key metrics: "
            f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
            f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to improve {metric}."
        )
    else:
        return (
            f"Predicted {metric} of {predicted:.2f} is stable compared to actual {metric} of {actual:.2f} for a {input_dict['Campaign Type']} campaign "
            f"in {input_dict['Region']} targeting the {input_dict['Industry']} industry. Explain (1 sentence) why performance is stable, referencing key metrics: "
            f"Ad Spend={input_dict['Ad Spend']:.2f}, CTR={input_dict['Click-Through Rate (CTR)']:.2f}, CPC={input_dict['Cost Per Click (CPC)']:.2f}, "
            f"Conversion Rate={input_dict['Conversion Rate']:.2f}. Then, suggest 2 strategies to enhance {metric}."
        )
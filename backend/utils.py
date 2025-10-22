import requests
from config import GEMINI_API_KEY

def fetch_suggestions(prompt):
    """
    Fetch suggestions from the Gemini AI API based on the given prompt.
    
    Args:
        prompt (str): The prompt to send to the API.
    
    Returns:
        str: The generated suggestions or an error message.
    """
    gemini_payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {'Content-Type': 'application/json'}
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    response = requests.post(gemini_url, headers=headers, json=gemini_payload)
    if response.status_code == 200:
        try:
            return response.json()['candidates'][0]['content']['parts'][0]['text']
        except (KeyError, IndexError):
            return 'Failed to parse Gemini API response'
    else:
        return f'Unable to fetch suggestions (HTTP {response.status_code})'
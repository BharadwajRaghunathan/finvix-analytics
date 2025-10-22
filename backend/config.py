import os
from dotenv import load_dotenv

# Load environment variables from .env file (local development only)
# Render will provide these via dashboard environment variables
load_dotenv()

# ======================
# API Keys & Secrets
# ======================

# Gemini AI API key for AI-powered suggestions
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

# JWT Secret Key for authentication
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable is required")

# ======================
# Database Configuration
# ======================

# Render provides DATABASE_URL automatically
DATABASE_URL = os.getenv('DATABASE_URL')

# Individual database credentials (fallback for local development)
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_NAME = os.getenv('DB_NAME', 'finvix_db')
DB_PORT = os.getenv('DB_PORT', '5432')

# ======================
# Application Settings
# ======================

# Frontend URL for CORS
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Flask environment (development/production)
FLASK_ENV = os.getenv('FLASK_ENV', 'development')

# Debug mode (should be False in production)
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Server port
PORT = int(os.getenv('PORT', 5000))

# ======================
# File Storage
# ======================

# Temporary directory for file uploads (Render uses /tmp)
TEMP_DIR = os.getenv('TEMP_DIR', '/tmp')

# Maximum file size (in bytes) - 16MB
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 16 * 1024 * 1024))

# ======================
# Model Configuration
# ======================

# Path to ML models (relative to backend folder)
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

# ======================
# Logging Configuration
# ======================

LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# ======================
# Validation
# ======================

def validate_config():
    """
    Validates that all required configuration variables are set.
    Raises ValueError if any required variable is missing.
    """
    required_vars = {
        'GEMINI_API_KEY': GEMINI_API_KEY,
        'JWT_SECRET_KEY': JWT_SECRET_KEY,
    }
    
    missing_vars = [var for var, value in required_vars.items() if not value]
    
    if missing_vars:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_vars)}\n"
            "Please set these in your .env file (local) or Render dashboard (production)."
        )
    
    return True

# Run validation when config is imported
try:
    validate_config()
except ValueError as e:
    if FLASK_ENV == 'production':
        raise e
    else:
        print(f"⚠️ Configuration Warning: {e}")

# ======================
# Config Summary
# ======================

def print_config_summary():
    """Prints a summary of the current configuration (for debugging)"""
    print("\n" + "="*50)
    print("🔧 FINVIX Configuration Summary")
    print("="*50)
    print(f"Environment: {FLASK_ENV}")
    print(f"Debug Mode: {DEBUG}")
    print(f"Port: {PORT}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Database: {'✓ Connected' if DATABASE_URL else '✗ Not configured'}")
    print(f"Gemini API: {'✓ Configured' if GEMINI_API_KEY else '✗ Missing'}")
    print(f"JWT Secret: {'✓ Configured' if JWT_SECRET_KEY else '✗ Missing'}")
    print(f"Temp Directory: {TEMP_DIR}")
    print("="*50 + "\n")

# Print config summary in development mode
if FLASK_ENV == 'development' and __name__ == '__main__':
    print_config_summary()

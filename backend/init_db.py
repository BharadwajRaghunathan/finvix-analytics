import os
from dotenv import load_dotenv

# Load production environment
load_dotenv('.env.production')

from app import app, db
from database_models import User

def init_database():
    """Initialize the database tables on Render PostgreSQL"""
    print(f"🔗 Connecting to: {os.getenv('DATABASE_URL')[:50]}...")
    
    with app.app_context():
        try:
            # Create all tables
            print("📋 Creating database tables...")
            db.create_all()
            
            print("✅ Database tables created successfully!")
            
            # Verify tables
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📊 Available tables: {tables}")
            
            # Check if users table exists
            if 'users' in tables:
                print("✅ 'users' table confirmed!")
                
                # Check columns
                columns = [col['name'] for col in inspector.get_columns('users')]
                print(f"📝 Columns in 'users' table: {columns}")
            else:
                print("❌ 'users' table not found!")
                
        except Exception as e:
            print(f"❌ Error initializing database: {str(e)}")
            raise

if __name__ == "__main__":
    print("🚀 Starting database initialization for Render PostgreSQL...")
    init_database()
    print("🎉 Database initialization complete!")

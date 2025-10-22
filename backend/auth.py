from flask import current_app
from flask_jwt_extended import create_access_token
from database_models import User, db

def register_user(username, email, password):
    """Register a new user with hashed password."""
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return None, "Username or email already exists"
    password_hash = current_app.bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()
    return new_user, None

def login_user(username, password):
    """Log in a user and return a JWT token if credentials are valid."""
    user = User.query.filter_by(username=username).first()
    if user and current_app.bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=username)  # Changed to use username as string
        return access_token, None
    return None, "Invalid username or password"
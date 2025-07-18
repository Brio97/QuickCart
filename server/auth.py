from functools import wraps
from flask import request, jsonify, current_app
from models import User
import jwt
from datetime import datetime, timedelta

def generate_token(user_id, email):
    """Generate JWT token for user authentication"""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    """Decode JWT token and return user info"""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token for protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            payload = decode_token(token)
            if payload is None:
                return jsonify({'error': 'Token is invalid or expired'}), 401
                
            current_user = User.query.get(payload['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
                
        except Exception as e:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def optional_token(f):
    """Decorator for routes that can work with or without authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
                payload = decode_token(token)
                if payload:
                    current_user = User.query.get(payload['user_id'])
            except (IndexError, Exception):
                pass  # Continue without user if token is invalid
        
        return f(current_user, *args, **kwargs)
    
    return decorated

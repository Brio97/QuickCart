import pytest
import json
from app import create_app
from models import db, User
from auth import generate_token

class TestAuthAPI:
    """Test authentication API endpoints"""
    
    def test_register_success(self, client):
        """Test successful user registration"""
        user_data = {
            'email': 'newuser@example.com',  # Different email to avoid conflicts
            'password': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(user_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'token' in data
        assert data['user']['email'] == 'newuser@example.com'
        assert data['user']['first_name'] == 'Test'
        assert data['user']['last_name'] == 'User'
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email"""
        user_data = {
            'email': test_user['email'],  # Same as test_user
            'password': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(user_data),
                             content_type='application/json')
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already exists' in data['error']
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email format"""
        user_data = {
            'email': 'invalid-email',
            'password': 'password123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(user_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid email format' in data['error']
    
    def test_register_short_password(self, client):
        """Test registration with password too short"""
        user_data = {
            'email': 'test@example.com',
            'password': '123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(user_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'at least 6 characters' in data['error']
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields"""
        user_data = {
            'email': 'test@example.com',
            'password': 'password123'
            # Missing first_name and last_name
        }
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(user_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_login_success(self, client, test_user):
        """Test successful login"""
        login_data = {
            'email': test_user['email'],
            'password': 'password123'
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'token' in data
        assert data['user']['email'] == test_user['email']
    
    def test_login_invalid_email(self, client, test_user):
        """Test login with non-existent email"""
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'password123'
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid email or password' in data['error']
    
    def test_login_invalid_password(self, client, test_user):
        """Test login with wrong password"""
        login_data = {
            'email': test_user['email'],
            'password': 'wrongpassword'
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid email or password' in data['error']
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields"""
        login_data = {
            'email': 'test@example.com'
            # Missing password
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Email and password are required' in data['error']
    
    def test_get_current_user_success(self, client, test_user, auth_headers):
        """Test getting current user info with valid token"""
        response = client.get('/api/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['email'] == test_user['email']
    
    def test_get_current_user_no_token(self, client):
        """Test getting current user without token"""
        response = client.get('/api/auth/me')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Token is missing' in data['error']
    
    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        headers = {'Authorization': 'Bearer invalid_token'}
        response = client.get('/api/auth/me', headers=headers)
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'invalid' in data['error'].lower()
    
    def test_logout_success(self, client, test_user, auth_headers):
        """Test successful logout"""
        response = client.post('/api/auth/logout', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'Logged out successfully' in data['message']
    
    def test_logout_no_token(self, client):
        """Test logout without token"""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

class TestUserProfileAPI:
    """Test user profile API endpoints"""
    
    def test_get_user_profile_success(self, client, test_user, auth_headers):
        """Test getting user profile"""
        response = client.get('/api/user/profile', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert 'orders' in data
        assert data['user']['email'] == test_user['email']
    
    def test_update_user_profile_success(self, client, test_user, auth_headers):
        """Test updating user profile"""
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com'
        }
        
        response = client.put('/api/user/profile', 
                            data=json.dumps(update_data),
                            headers=auth_headers,
                            content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['user']['first_name'] == 'Updated'
        assert data['user']['last_name'] == 'Name'
        assert data['user']['email'] == 'updated@example.com'
    
    def test_update_user_profile_invalid_email(self, client, test_user, auth_headers):
        """Test updating profile with invalid email"""
        update_data = {
            'email': 'invalid-email'
        }
        
        response = client.put('/api/user/profile', 
                            data=json.dumps(update_data),
                            headers=auth_headers,
                            content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid email format' in data['error']
    
    def test_update_user_profile_duplicate_email(self, client, app, auth_headers):
        """Test updating profile with email already taken by another user"""
        with app.app_context():
            # Create another user
            user2 = User(
                email='user2@example.com',
                first_name='User',
                last_name='Two'
            )
            user2.set_password('password123')
            db.session.add(user2)
            db.session.commit()
        
        # Try to update profile with user2's email
        update_data = {
            'email': 'user2@example.com'
        }
        
        response = client.put('/api/user/profile', 
                            data=json.dumps(update_data),
                            headers=auth_headers,
                            content_type='application/json')
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already taken' in data['error']

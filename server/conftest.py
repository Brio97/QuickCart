import pytest
import tempfile
import os
from app import create_app
from models import db, Product, User
from auth import generate_token

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app({
        'TESTING': True,
        'DATABASE': db_path,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'WTF_CSRF_ENABLED': False
    })
    
    with app.app_context():
        db.create_all()
        
    yield app
    
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()

@pytest.fixture
def test_user(app):
    """Create a test user for authentication tests."""
    with app.app_context():
        user = User(
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        # Store the user data we need for later use
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
        return user_data

@pytest.fixture
def auth_headers(app, test_user):
    """Create authorization headers with valid JWT token."""
    with app.app_context():
        # Use the stored user data instead of accessing attributes
        token = generate_token(test_user['id'], test_user['email'])
        return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

@pytest.fixture
def sample_products(app):
    """Create sample products for testing."""
    with app.app_context():
        products = [
            Product(
                name='Test Product 1',
                description='A test product for testing',
                price=29.99,
                category='electronics',
                image_url='https://example.com/image1.jpg',
                stock_quantity=10
            ),
            Product(
                name='Test Product 2',
                description='Another test product',
                price=49.99,
                category='home',
                image_url='https://example.com/image2.jpg',
                stock_quantity=5
            )
        ]
        
        for product in products:
            db.session.add(product)
        db.session.commit()
        
        return products
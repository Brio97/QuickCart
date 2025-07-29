from __future__ import annotations

import os
import re
import time
import uuid
import random
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from contextlib import contextmanager
from functools import wraps
import logging

from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
from werkzeug.exceptions import BadRequest, NotFound, Conflict, Unauthorized

from models import db, Product, Order, OrderItem, User
from auth import generate_token, token_required, optional_token
from database import get_database_url
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()


@dataclass
class PaymentResult:
    """Data class for payment processing results."""
    success: bool
    payment_id: Optional[str] = None
    method: Optional[str] = None
    error: Optional[str] = None


@dataclass
class ValidationResult:
    """Data class for cart validation results."""
    product_id: int
    valid: bool
    error: Optional[str] = None
    available_quantity: Optional[int] = None
    current_price: Optional[float] = None


class PaymentProcessor:
    """Payment processing service with mock implementations."""
    
    FAILURE_RATE = 0.05  # 5% chance of random failure
    
    @classmethod
    def process_payment(cls, amount: float, method: str, payment_details: Dict[str, Any]) -> PaymentResult:
        """Process payment using specified method."""
        if amount <= 0:
            return PaymentResult(success=False, error="Invalid amount")
        
        # Simulate processing delay
        time.sleep(0.5)
        
        # Simulate random failures
        if random.random() < cls.FAILURE_RATE:
            return PaymentResult(success=False, error="Payment declined by bank")
        
        payment_handlers = {
            'stripe': cls._process_stripe,
            'paypal': cls._process_paypal,
            'apple_pay': cls._process_apple_pay,
        }
        
        handler = payment_handlers.get(method, cls._process_default)
        return handler(amount, method)
    
    @staticmethod
    def _process_stripe(amount: float, method: str) -> PaymentResult:
        return PaymentResult(
            success=True,
            payment_id=f'pi_{uuid.uuid4().hex[:24]}',
            method=method
        )
    
    @staticmethod
    def _process_paypal(amount: float, method: str) -> PaymentResult:
        return PaymentResult(
            success=True,
            payment_id=f'PAYID-{uuid.uuid4().hex[:20].upper()}',
            method=method
        )
    
    @staticmethod
    def _process_apple_pay(amount: float, method: str) -> PaymentResult:
        return PaymentResult(
            success=True,
            payment_id=f'ap_{uuid.uuid4().hex[:24]}',
            method=method
        )
    
    @staticmethod
    def _process_default(amount: float, method: str) -> PaymentResult:
        return PaymentResult(
            success=True,
            payment_id=f'mock_{uuid.uuid4().hex[:16]}',
            method=method
        )


class CartValidator:
    """Service for validating cart items."""
    
    @staticmethod
    def validate_cart_items(items: List[Dict[str, Any]]) -> Tuple[bool, List[ValidationResult]]:
        """Validate cart items and return results."""
        validation_results = []
        all_valid = True
        
        for item in items:
            result = CartValidator._validate_single_item(item)
            validation_results.append(result)
            if not result.valid:
                all_valid = False
        
        return all_valid, validation_results
    
    @staticmethod
    def _validate_single_item(item: Dict[str, Any]) -> ValidationResult:
        """Validate a single cart item."""
        product_id = item['product_id']
        requested_qty = item['quantity']
        
        product = Product.query.get(product_id)
        if not product:
            return ValidationResult(
                product_id=product_id,
                valid=False,
                error='Product not found'
            )
        
        if product.stock_quantity < requested_qty:
            return ValidationResult(
                product_id=product_id,
                valid=False,
                error=f'Only {product.stock_quantity} items available',
                available_quantity=product.stock_quantity
            )
        
        return ValidationResult(
            product_id=product_id,
            valid=True,
            current_price=product.price
        )


def handle_api_errors(func):
    """Decorator to handle common API errors."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except BadRequest as e:
            return jsonify({'error': str(e)}), 400
        except NotFound as e:
            return jsonify({'error': str(e)}), 404
        except Conflict as e:
            return jsonify({'error': str(e)}), 409
        except Unauthorized as e:
            return jsonify({'error': str(e)}), 401
        except Exception as e:
            logger.exception("Unexpected error in %s", func.__name__)
            db.session.rollback()
            return jsonify({'error': 'Internal server error'}), 500
    return wrapper


@contextmanager
def database_transaction():
    """Context manager for database transactions."""
    try:
        yield db.session
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise


class EmailValidator:
    """Email validation utility."""
    
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    @classmethod
    def is_valid(cls, email: str) -> bool:
        """Check if email format is valid."""
        return bool(cls.EMAIL_REGEX.match(email))


def create_app(config: Optional[Dict[str, Any]] = None) -> Flask:
    """Application factory."""
    app = Flask(__name__)
    
    # Configuration
    app.config.update({
        'SECRET_KEY': os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production'),
        'SQLALCHEMY_DATABASE_URI': get_database_url(),
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SQLALCHEMY_ENGINE_OPTIONS': {
            'pool_pre_ping': True,
            'pool_recycle': 300,
        }
    })
    
    if config:
        app.config.update(config)
    
    # Initialize extensions
    db.init_app(app)
    
    # CORS configuration
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    allowed_origins = [
        'http://localhost:3000',
        'http://localhost:3001',
        frontend_url,
    ]
    
    CORS(app, 
         origins=allowed_origins,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    # Register routes
    _register_product_routes(app)
    _register_order_routes(app)
    _register_auth_routes(app)
    _register_user_routes(app)
    _register_utility_routes(app)
    
    # Register error handlers
    _register_error_handlers(app)
    
    return app


def _register_product_routes(app: Flask) -> None:
    """Register product-related routes."""
    
    @app.route('/api/products', methods=['GET'])
    @handle_api_errors
    def get_products():
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)  # Limit max per_page
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = Product.query
        
        if category:
            query = query.filter(Product.category == category)
        
        if search:
            query = query.filter(Product.name.contains(search))
        
        products = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'products': [product.to_dict() for product in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': page
        })
    
    @app.route('/api/products/<int:product_id>', methods=['GET'])
    @handle_api_errors
    def get_product(product_id: int):
        product = Product.query.get_or_404(product_id)
        return jsonify(product.to_dict())
    
    @app.route('/api/categories', methods=['GET'])
    @handle_api_errors
    def get_categories():
        categories = db.session.query(Product.category).distinct().all()
        category_list = [cat[0] for cat in categories if cat[0]]
        return jsonify({'categories': category_list})


def _register_order_routes(app: Flask) -> None:
    """Register order-related routes."""
    
    @app.route('/api/checkout', methods=['POST'])
    @optional_token
    @handle_api_errors
    def checkout(current_user):
        data = request.get_json()
        
        if not data or 'items' not in data:
            raise BadRequest('Invalid request data')
        
        with database_transaction():
            # Validate items and calculate total
            total_amount, order_items = _process_checkout_items(data['items'])
            
            # Create order
            order = _create_order(data, total_amount)
            db.session.add(order)
            db.session.flush()  # Get order ID
            
            # Create order items and update stock
            _create_order_items(order, order_items)
            
            # Process payment
            payment_method = data.get('payment_method', 'stripe')
            payment_details = data.get('payment_details', {})
            payment_result = PaymentProcessor.process_payment(
                total_amount, payment_method, payment_details
            )
            
            if not payment_result.success:
                raise BadRequest(f'Payment failed: {payment_result.error}')
            
            order.status = 'confirmed'
            
            return jsonify({
                'success': True,
                'order_number': order.order_number,
                'total_amount': order.total_amount,
                'status': order.status,
                'payment_id': payment_result.payment_id
            }), 201
    
    @app.route('/api/orders/<order_number>', methods=['GET'])
    @handle_api_errors
    def get_order(order_number: str):
        order = Order.query.filter_by(order_number=order_number).first_or_404()
        return jsonify(order.to_dict())
    
    @app.route('/api/cart/validate', methods=['POST'])
    @handle_api_errors
    def validate_cart():
        """Validate cart items before checkout."""
        data = request.get_json()
        items = data.get('items', [])
        
        is_valid, validation_results = CartValidator.validate_cart_items(items)
        
        return jsonify({
            'valid': is_valid,
            'items': [result.__dict__ for result in validation_results]
        })


def _process_checkout_items(items: List[Dict[str, Any]]) -> Tuple[float, List[Dict[str, Any]]]:
    """Process and validate checkout items."""
    total_amount = 0
    order_items = []
    
    for item in items:
        product = Product.query.get(item['product_id'])
        if not product:
            raise BadRequest(f'Product {item["product_id"]} not found')
        
        quantity = item['quantity']
        if product.stock_quantity < quantity:
            raise BadRequest(
                f'Insufficient stock for {product.name}. '
                f'Available: {product.stock_quantity}'
            )
        
        item_total = product.price * quantity
        total_amount += item_total
        
        order_items.append({
            'product': product,
            'quantity': quantity,
            'price': product.price
        })
    
    return total_amount, order_items


def _create_order(data: Dict[str, Any], total_amount: float) -> Order:
    """Create order with shipping information."""
    order = Order(
        total_amount=total_amount,
        status='pending'
    )
    
    # Add shipping info if provided
    shipping_info = data.get('shipping_info', {})
    if shipping_info:
        order.shipping_address = shipping_info.get('address')
        order.shipping_city = shipping_info.get('city')
        order.shipping_state = shipping_info.get('state')
        order.shipping_zip = shipping_info.get('zip')
    
    return order


def _create_order_items(order: Order, order_items: List[Dict[str, Any]]) -> None:
    """Create order items and update product stock."""
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data['product'].id,
            quantity=item_data['quantity'],
            price=item_data['price']
        )
        db.session.add(order_item)
        
        # Update product stock
        item_data['product'].stock_quantity -= item_data['quantity']


def _register_auth_routes(app: Flask) -> None:
    """Register authentication routes."""
    
    @app.route('/api/auth/register', methods=['POST'])
    @handle_api_errors
    def register():
        data = request.get_json()
        
        _validate_registration_data(data)
        
        email = data['email'].lower().strip()
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            raise Conflict('User with this email already exists')
        
        with database_transaction():
            # Create new user
            user = User(
                email=email,
                first_name=data['first_name'].strip(),
                last_name=data['last_name'].strip()
            )
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.flush()
            
            # Generate token
            token = generate_token(user.id, user.email)
            
            return jsonify({
                'success': True,
                'token': token,
                'user': user.to_dict()
            }), 201
    
    @app.route('/api/auth/login', methods=['POST'])
    @handle_api_errors
    def login():
        data = request.get_json()
        
        if not data or not all(data.get(field) for field in ['email', 'password']):
            raise BadRequest('Email and password are required')
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            raise Unauthorized('Invalid email or password')
        
        # Generate token
        token = generate_token(user.id, user.email)
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user.to_dict()
        })
    
    @app.route('/api/auth/me', methods=['GET'])
    @token_required
    @handle_api_errors
    def get_current_user(current_user):
        """Get current authenticated user info."""
        return jsonify({'user': current_user.to_dict()})
    
    @app.route('/api/auth/logout', methods=['POST'])
    @token_required
    @handle_api_errors
    def logout(current_user):
        """Logout user (client-side token removal)."""
        return jsonify({'success': True, 'message': 'Logged out successfully'})


def _validate_registration_data(data: Dict[str, Any]) -> None:
    """Validate user registration data."""
    required_fields = ['email', 'password', 'first_name', 'last_name']
    
    for field in required_fields:
        if not data.get(field):
            raise BadRequest(f'{field} is required')
    
    email = data['email'].lower().strip()
    password = data['password']
    
    # Validate email format
    if not EmailValidator.is_valid(email):
        raise BadRequest('Invalid email format')
    
    # Validate password strength
    if len(password) < 6:
        raise BadRequest('Password must be at least 6 characters')


def _register_user_routes(app: Flask) -> None:
    """Register user-related routes."""
    
    @app.route('/api/user/profile', methods=['GET'])
    @token_required
    @handle_api_errors
    def get_user_profile(current_user):
        """Get user profile with orders."""
        orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
        
        return jsonify({
            'user': current_user.to_dict(),
            'orders': [order.to_dict() for order in orders]
        })
    
    @app.route('/api/user/profile', methods=['PUT'])
    @token_required
    @handle_api_errors
    def update_user_profile(current_user):
        """Update user profile."""
        data = request.get_json()
        
        with database_transaction():
            _update_user_fields(current_user, data)
            
            return jsonify({
                'success': True,
                'user': current_user.to_dict()
            })


def _update_user_fields(user: User, data: Dict[str, Any]) -> None:
    """Update user fields from request data."""
    if 'first_name' in data:
        user.first_name = data['first_name'].strip()
    
    if 'last_name' in data:
        user.last_name = data['last_name'].strip()
    
    if 'email' in data:
        email = data['email'].lower().strip()
        
        if not EmailValidator.is_valid(email):
            raise BadRequest('Invalid email format')
        
        # Check if email is already taken by another user
        existing_user = User.query.filter(
            User.email == email,
            User.id != user.id
        ).first()
        
        if existing_user:
            raise Conflict('Email is already taken')
        
        user.email = email


def _register_utility_routes(app: Flask) -> None:
    """Register utility routes."""
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'quickcart-api'})


def _register_error_handlers(app: Flask) -> None:
    """Register error handlers."""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500


def seed_database() -> None:
    """Seed the database with sample products."""
    sample_products = [
        {
            'name': 'Wireless Bluetooth Headphones',
            'description': 'High-quality wireless headphones with noise cancellation',
            'price': 99.99,
            'category': 'electronics',
            'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            'stock_quantity': 25
        },
        {
            'name': 'Smartphone Case',
            'description': 'Protective case for smartphones with drop protection',
            'price': 24.99,
            'category': 'electronics',
            'image_url': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500',
            'stock_quantity': 50
        },
        {
            'name': 'Coffee Mug',
            'description': 'Ceramic coffee mug with ergonomic handle',
            'price': 12.99,
            'category': 'home',
            'image_url': 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500',
            'stock_quantity': 30
        },
        {
            'name': 'Running Shoes',
            'description': 'Comfortable running shoes with excellent cushioning',
            'price': 79.99,
            'category': 'sports',
            'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
            'stock_quantity': 15
        },
        {
            'name': 'Notebook Set',
            'description': 'Set of 3 premium notebooks for writing and sketching',
            'price': 18.99,
            'category': 'office',
            'image_url': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
            'stock_quantity': 40
        }
    ]
    
    for product_data in sample_products:
        if not Product.query.filter_by(name=product_data['name']).first():
            product = Product(**product_data)
            db.session.add(product)
    
    db.session.commit()


if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        db.create_all()
        seed_database()
    
    app.run(debug=True, host='0.0.0.0', port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Product, Order, OrderItem, User
from auth import generate_token, token_required, optional_token
import os
import re

def create_app(config=None):
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///quickcart.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    if config:
        app.config.update(config)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # API Routes
    @app.route('/api/products', methods=['GET'])
    def get_products():
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
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
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/products/<int:product_id>', methods=['GET'])
    def get_product(product_id):
        try:
            product = Product.query.get_or_404(product_id)
            return jsonify(product.to_dict())
        except Exception as e:
            return jsonify({'error': 'Product not found'}), 404
    
    @app.route('/api/categories', methods=['GET'])
    def get_categories():
        try:
            categories = db.session.query(Product.category).distinct().all()
            category_list = [cat[0] for cat in categories if cat[0]]
            return jsonify({'categories': category_list})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/checkout', methods=['POST'])
    @optional_token
    def checkout(current_user):
        try:
            data = request.get_json()
            
            if not data or 'items' not in data:
                return jsonify({'error': 'Invalid request data'}), 400
            
            # Validate items and calculate total
            total_amount = 0
            order_items = []
            
            for item in data['items']:
                product = Product.query.get(item['product_id'])
                if not product:
                    return jsonify({'error': f'Product {item["product_id"]} not found'}), 400
                
                quantity = item['quantity']
                if product.stock_quantity < quantity:
                    return jsonify({'error': f'Insufficient stock for {product.name}. Available: {product.stock_quantity}'}), 400
                
                item_total = product.price * quantity
                total_amount += item_total
                
                order_items.append({
                    'product': product,
                    'quantity': quantity,
                    'price': product.price
                })
            
            # Create order
            order = Order(
                total_amount=total_amount,
                status='pending',
                user_id=current_user.id if current_user else None
            )
            
            # Add shipping info if provided
            shipping_info = data.get('shipping_info', {})
            if shipping_info:
                order.shipping_address = shipping_info.get('address')
                order.shipping_city = shipping_info.get('city')
                order.shipping_state = shipping_info.get('state')
                order.shipping_zip = shipping_info.get('zip')
            
            db.session.add(order)
            db.session.flush()  # Get order ID
            
            # Create order items and update stock
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
            
            # Process payment (mock)
            payment_method = data.get('payment_method', 'stripe')
            payment_result = process_payment(total_amount, payment_method, data.get('payment_details', {}))
            
            if payment_result['success']:
                order.status = 'confirmed'
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'order_number': order.order_number,
                    'total_amount': order.total_amount,
                    'status': order.status,
                    'payment_id': payment_result.get('payment_id')
                }), 201
            else:
                db.session.rollback()
                return jsonify({
                    'error': 'Payment failed',
                    'details': payment_result.get('error')
                }), 400
                
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/orders/<order_number>', methods=['GET'])
    def get_order(order_number):
        try:
            order = Order.query.filter_by(order_number=order_number).first_or_404()
            return jsonify(order.to_dict())
        except Exception as e:
            return jsonify({'error': 'Order not found'}), 404
    
    @app.route('/api/cart/validate', methods=['POST'])
    def validate_cart():
        """Validate cart items before checkout"""
        try:
            data = request.get_json()
            items = data.get('items', [])
            
            validation_results = []
            total_valid = True
            
            for item in items:
                product = Product.query.get(item['product_id'])
                if not product:
                    validation_results.append({
                        'product_id': item['product_id'],
                        'valid': False,
                        'error': 'Product not found'
                    })
                    total_valid = False
                    continue
                
                requested_quantity = item['quantity']
                if product.stock_quantity < requested_quantity:
                    validation_results.append({
                        'product_id': item['product_id'],
                        'valid': False,
                        'error': f'Only {product.stock_quantity} items available',
                        'available_quantity': product.stock_quantity
                    })
                    total_valid = False
                else:
                    validation_results.append({
                        'product_id': item['product_id'],
                        'valid': True,
                        'current_price': product.price
                    })
            
            return jsonify({
                'valid': total_valid,
                'items': validation_results
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # Authentication Routes
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['email', 'password', 'first_name', 'last_name']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'error': f'{field} is required'}), 400
            
            email = data['email'].lower().strip()
            password = data['password']
            first_name = data['first_name'].strip()
            last_name = data['last_name'].strip()
            
            # Validate email format
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Validate password strength
            if len(password) < 6:
                return jsonify({'error': 'Password must be at least 6 characters'}), 400
            
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({'error': 'User with this email already exists'}), 409
            
            # Create new user
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            # Generate token
            token = generate_token(user.id, user.email)
            
            return jsonify({
                'success': True,
                'token': token,
                'user': user.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            
            if not data or not data.get('email') or not data.get('password'):
                return jsonify({'error': 'Email and password are required'}), 400
            
            email = data['email'].lower().strip()
            password = data['password']
            
            # Find user by email
            user = User.query.filter_by(email=email).first()
            
            if not user or not user.check_password(password):
                return jsonify({'error': 'Invalid email or password'}), 401
            
            # Generate token
            token = generate_token(user.id, user.email)
            
            return jsonify({
                'success': True,
                'token': token,
                'user': user.to_dict()
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/auth/me', methods=['GET'])
    @token_required
    def get_current_user(current_user):
        """Get current authenticated user info"""
        return jsonify({
            'user': current_user.to_dict()
        }), 200
    
    @app.route('/api/auth/logout', methods=['POST'])
    @token_required
    def logout(current_user):
        """Logout user (client-side token removal)"""
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

    # Protected user routes
    @app.route('/api/user/profile', methods=['GET'])
    @token_required
    def get_user_profile(current_user):
        """Get user profile with orders"""
        orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
        
        return jsonify({
            'user': current_user.to_dict(),
            'orders': [order.to_dict() for order in orders]
        }), 200
    
    @app.route('/api/user/profile', methods=['PUT'])
    @token_required
    def update_user_profile(current_user):
        """Update user profile"""
        try:
            data = request.get_json()
            
            if 'first_name' in data:
                current_user.first_name = data['first_name'].strip()
            if 'last_name' in data:
                current_user.last_name = data['last_name'].strip()
            if 'email' in data:
                email = data['email'].lower().strip()
                email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if not re.match(email_regex, email):
                    return jsonify({'error': 'Invalid email format'}), 400
                
                # Check if email is already taken by another user
                existing_user = User.query.filter(
                    User.email == email,
                    User.id != current_user.id
                ).first()
                if existing_user:
                    return jsonify({'error': 'Email is already taken'}), 409
                
                current_user.email = email
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'user': current_user.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'quickcart-api'})
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

def process_payment(amount, method, payment_details):
    """
    Mock payment processing function
    In a real app, this would integrate with Stripe, PayPal, etc.
    """
    import uuid
    import random
    
    # Simulate payment processing delay
    import time
    time.sleep(0.5)
    
    # Mock payment methods
    if method == 'stripe':
        # Simulate Stripe payment
        if amount > 0:
            return {
                'success': True,
                'payment_id': f'pi_{uuid.uuid4().hex[:24]}',
                'method': 'stripe'
            }
    elif method == 'paypal':
        # Simulate PayPal payment
        if amount > 0:
            return {
                'success': True,
                'payment_id': f'PAYID-{uuid.uuid4().hex[:20].upper()}',
                'method': 'paypal'
            }
    elif method == 'apple_pay':
        # Simulate Apple Pay
        if amount > 0:
            return {
                'success': True,
                'payment_id': f'ap_{uuid.uuid4().hex[:24]}',
                'method': 'apple_pay'
            }
    
    # Simulate random payment failures (5% chance)
    if random.random() < 0.05:
        return {
            'success': False,
            'error': 'Payment declined by bank'
        }
    
    return {
        'success': True,
        'payment_id': f'mock_{uuid.uuid4().hex[:16]}',
        'method': method
    }

def seed_database():
    """Seed the database with sample products"""
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
        existing_product = Product.query.filter_by(name=product_data['name']).first()
        if not existing_product:
            product = Product(**product_data)
            db.session.add(product)
    
    db.session.commit()

# Application factory pattern
if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        db.create_all()
        seed_database()
    
    app.run(debug=True, host='0.0.0.0', port=5000)

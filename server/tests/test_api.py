import pytest
import json
from models import Product, Order, OrderItem
from app import db

class TestProductAPI:
    def test_get_products_empty(self, client):
        """Test getting products when none exist"""
        response = client.get('/api/products')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['products'] == []
        assert data['total'] == 0
    
    def test_get_products_with_data(self, client, app):
        """Test getting products with sample data"""
        with app.app_context():
            product1 = Product(name="Product 1", price=10.99, stock_quantity=5)
            product2 = Product(name="Product 2", price=20.99, stock_quantity=3)
            db.session.add_all([product1, product2])
            db.session.commit()
        
        response = client.get('/api/products')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['products']) == 2
        assert data['total'] == 2
    
    def test_get_product_by_id(self, client, app):
        """Test getting a specific product by ID"""
        with app.app_context():
            product = Product(name="Test Product", price=15.99, stock_quantity=10)
            db.session.add(product)
            db.session.commit()
            product_id = product.id
        
        response = client.get(f'/api/products/{product_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == "Test Product"
        assert data['price'] == 15.99
    
    def test_get_nonexistent_product(self, client):
        """Test getting a product that doesn't exist"""
        response = client.get('/api/products/999')
        assert response.status_code == 404

class TestCheckoutAPI:
    def test_checkout_success(self, client, app):
        """Test successful checkout process"""
        with app.app_context():
            product = Product(name="Checkout Product", price=25.99, stock_quantity=10)
            db.session.add(product)
            db.session.commit()
            product_id = product.id
        
        checkout_data = {
            'items': [
                {'product_id': product_id, 'quantity': 2}
            ],
            'shipping_info': {
                'address': '123 Test St',
                'city': 'Test City',
                'state': 'TS',
                'zip': '12345'
            },
            'payment_method': 'stripe'
        }
        
        response = client.post('/api/checkout', 
                             data=json.dumps(checkout_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'order_number' in data
        assert data['total_amount'] == 51.98  # 25.99 * 2
        assert data['status'] == 'confirmed'
    
    def test_checkout_insufficient_stock(self, client, app):
        """Test checkout with insufficient stock"""
        with app.app_context():
            product = Product(name="Low Stock Product", price=30.00, stock_quantity=1)
            db.session.add(product)
            db.session.commit()
            product_id = product.id
        
        checkout_data = {
            'items': [
                {'product_id': product_id, 'quantity': 5}
            ],
            'shipping_info': {
                'address': '123 Test St',
                'city': 'Test City',
                'state': 'TS',
                'zip': '12345'
            }
        }
        
        response = client.post('/api/checkout',
                             data=json.dumps(checkout_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'insufficient stock' in data['error'].lower()

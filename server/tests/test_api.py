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
    
    def test_get_products_with_data(self, client, sample_products):
        """Test getting products with sample data"""
        response = client.get('/api/products')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data['products']) == 2
        assert data['total'] == 2
    
    def test_get_product_by_id(self, client, sample_products):
        """Test getting a specific product by ID"""
        response = client.get('/api/products/1')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == "Test Product 1"
        assert data['price'] == 29.99
    
    def test_get_nonexistent_product(self, client):
        """Test getting a product that doesn't exist"""
        response = client.get('/api/products/999')
        assert response.status_code == 404

class TestCheckoutAPI:
    def test_checkout_success(self, client, sample_products):
        """Test successful checkout process"""
        checkout_data = {
            'items': [
                {'product_id': 1, 'quantity': 2}
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
        assert data['total_amount'] == 59.98  # 29.99 * 2
        assert data['status'] == 'confirmed'
    
    def test_checkout_insufficient_stock(self, client, sample_products):
        """Test checkout with insufficient stock"""
        checkout_data = {
            'items': [
                {'product_id': 1, 'quantity': 15}  # More than the 10 available
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
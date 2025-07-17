import pytest
from models import Product, User, Order, OrderItem
from app import db

class TestProduct:
    def test_product_creation(self, app):
        """Test product model creation"""
        with app.app_context():
            product = Product(
                name="Test Product",
                description="Test Description",
                price=29.99,
                category="electronics",
                image_url="test.jpg",
                stock_quantity=10
            )
            db.session.add(product)
            db.session.commit()
            
            assert product.id is not None
            assert product.name == "Test Product"
            assert product.price == 29.99
            assert product.is_available() == True
    
    def test_product_availability(self, app):
        """Test product availability logic"""
        with app.app_context():
            product = Product(
                name="Out of Stock Product",
                price=19.99,
                stock_quantity=0
            )
            db.session.add(product)
            db.session.commit()
            
            assert product.is_available() == False
    
    def test_product_serialization(self, app):
        """Test product to_dict method"""
        with app.app_context():
            product = Product(
                name="Serialization Test",
                description="Test",
                price=39.99,
                category="books",
                stock_quantity=5
            )
            db.session.add(product)
            db.session.commit()
            
            product_dict = product.to_dict()
            assert product_dict['name'] == "Serialization Test"
            assert product_dict['price'] == 39.99
            assert 'id' in product_dict

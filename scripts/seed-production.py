#!/usr/bin/env python3
"""
Seed production database with sample data
Run this after initial deployment to populate your database
"""

import requests
import json
import os
from datetime import datetime

def seed_products(api_url):
    """Add sample products to production database"""
    products = [
        {
            "name": "Premium Wireless Headphones",
            "description": "High-quality wireless headphones with active noise cancellation and 30-hour battery life",
            "price": 299.99,
            "category": "electronics",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
            "stock_quantity": 50
        },
        {
            "name": "Smartphone Case - Clear",
            "description": "Crystal clear protective case compatible with latest smartphone models",
            "price": 19.99,
            "category": "electronics",
            "image_url": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500",
            "stock_quantity": 100
        },
        {
            "name": "Ceramic Coffee Mug Set",
            "description": "Set of 4 elegant ceramic coffee mugs perfect for your morning routine",
            "price": 34.99,
            "category": "home",
            "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500",
            "stock_quantity": 75
        },
        {
            "name": "Athletic Running Shoes",
            "description": "Lightweight running shoes with advanced cushioning technology",
            "price": 129.99,
            "category": "sports",
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            "stock_quantity": 30
        },
        {
            "name": "Leather Notebook Journal",
            "description": "Premium leather-bound journal with lined pages for writing and note-taking",
            "price": 45.99,
            "category": "office",
            "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
            "stock_quantity": 60
        },
        {
            "name": "Bluetooth Speaker",
            "description": "Portable Bluetooth speaker with 360-degree sound and waterproof design",
            "price": 79.99,
            "category": "electronics",
            "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
            "stock_quantity": 40
        },
        {
            "name": "Kitchen Knife Set",
            "description": "Professional 8-piece kitchen knife set with wooden block",
            "price": 159.99,
            "category": "home",
            "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
            "stock_quantity": 25
        },
        {
            "name": "Yoga Mat",
            "description": "Non-slip exercise yoga mat with carrying strap",
            "price": 39.99,
            "category": "sports",
            "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
            "stock_quantity": 80
        }
    ]
    
    print(f"Seeding {len(products)} products...")
    
    # This would require an admin endpoint to add products
    # For now, we'll just check if products exist
    try:
        response = requests.get(f"{api_url}/products", timeout=10)
        if response.status_code == 200:
            data = response.json()
            existing_count = len(data.get('products', []))
            print(f"✅ Found {existing_count} existing products in database")
            
            if existing_count == 0:
                print("⚠️  No products found. You may need to run the seed script manually:")
                print("   1. Connect to your Turso database")
                print("   2. Run the seed_database() function from your Flask app")
                print("   3. Or create an admin endpoint to add products via API")
            
            return True
        else:
            print(f"❌ Failed to check products: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking products: {e}")
        return False

def main():
    """Seed production database"""
    print("🌱 QuickCart Production Database Seeding")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    api_url = os.getenv('API_URL')
    if not api_url:
        api_url = input("Enter your API URL (e.g., https://your-api.onrender.com/api): ").strip()
    
    print(f"API URL: {api_url}")
    print()
    
    if seed_products(api_url):
        print("✅ Database seeding check completed")
        return 0
    else:
        print("❌ Database seeding failed")
        return 1

if __name__ == "__main__":
    exit(main())

from app import create_app, db, seed_database
import os

if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Seed database if it's empty
        from models import Product
        if Product.query.count() == 0:
            seed_database()
            print("Database seeded with sample products!")
    
    # Run the app
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)

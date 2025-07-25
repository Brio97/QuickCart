import os
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv

load_dotenv()

def get_database_url():
    """Get database URL based on environment"""
    
    # Production: Use Turso
    if os.getenv('TURSO_DATABASE_URL') and os.getenv('TURSO_AUTH_TOKEN'):
        turso_url = os.getenv('TURSO_DATABASE_URL')
        turso_token = os.getenv('TURSO_AUTH_TOKEN')
        
        # Use libsql+http scheme for Turso
        if turso_url.startswith('libsql://'):
            return f"libsql+http://{turso_url[9:]}?authToken={turso_token}"
        else:
            return f"libsql+http://{turso_url}?authToken={turso_token}"
    
    # Development: Use local SQLite
    return os.getenv('DATABASE_URL', 'sqlite:///quickcart.db')

def create_database_engine():
    """Create database engine with appropriate settings"""
    database_url = get_database_url()
    
    if 'libsql' in database_url:
        # Turso/libsql configuration
        return create_engine(
            database_url,
            echo=os.getenv('FLASK_ENV') == 'development'
        )
    else:
        # Local SQLite configuration
        return create_engine(
            database_url,
            poolclass=StaticPool,
            connect_args={
                "check_same_thread": False,
            },
            echo=os.getenv('FLASK_ENV') == 'development'
        )

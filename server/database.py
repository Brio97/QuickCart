import os
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv

load_dotenv()

def get_database_url():
    """Get database URL based on environment"""
    
    # Use SQLite for all environments for reliable deployment
    # TODO: Add Turso integration later once deployment is stable
    return os.getenv('DATABASE_URL', 'sqlite:///quickcart.db')

def create_database_engine():
    """Create database engine with appropriate settings"""
    database_url = get_database_url()
    
    # SQLite configuration for all environments
    return create_engine(
        database_url,
        poolclass=StaticPool,
        connect_args={
            "check_same_thread": False,
        },
        echo=os.getenv('FLASK_ENV') == 'development'
    )

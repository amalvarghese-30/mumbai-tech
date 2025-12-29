import os
from datetime import timedelta

class Config:
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'industrial-mumbai-tech-secure-key-2024'
    
    # MongoDB
    MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://localhost:27017/mumbai_tech_industrial'
    
    # File Uploads
    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # Email Configuration
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@mumbai-tech.com')
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Application Settings
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    FLASK_DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    
    # Admin Settings
    ADMIN_USERS = ['admin', 'supervisor', 'manager']
    DEFAULT_ADMIN_PASSWORD_HASH = None  # Will be set on first admin creation
    
    # Pagination
    PRODUCTS_PER_PAGE = 20
    ENQUIRIES_PER_PAGE = 15
    
    # Cache Settings (for production)
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    MAIL_USE_TLS = True
    
class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    MONGODB_URI = 'mongodb://localhost:27017/mumbai_tech_test'
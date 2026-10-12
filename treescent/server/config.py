import os
import sys
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Environment detection
FLASK_ENV = os.getenv("FLASK_ENV", "development")
IS_PRODUCTION = FLASK_ENV == "production"


def _database_url():
    url = os.getenv("DATABASE_URL")
    if not url:
        return f"sqlite:///{os.path.join(BASE_DIR, 'treescent.db')}"
    # Some hosts (Render, Heroku) give "postgres://", but SQLAlchemy needs "postgresql://"
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def _require_secret(key: str, env_var: str) -> str:
    """Get secret from env, fail clearly if missing in production."""
    value = os.getenv(env_var)
    if not value:
        if IS_PRODUCTION:
            sys.exit(f"FATAL: Missing required environment variable: {env_var}")
        # Development: warn but allow empty for .env.example template
        print(f"WARNING: {env_var} not set. Using insecure default for development only.", file=sys.stderr)
        return "dev-insecure-do-not-use-in-production"
    if IS_PRODUCTION and len(value) < 32:
        sys.exit(f"FATAL: {env_var} must be at least 32 characters in production")
    return value


class Config:
    SECRET_KEY = _require_secret("SECRET_KEY", "SECRET_KEY")

    # Database
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = _require_secret("JWT_SECRET_KEY", "JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # CORS: the React dev server (Vite) runs on port 5173
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

    # Security: ensure HTTPS in production
    if IS_PRODUCTION:
        SESSION_COOKIE_SECURE = True
        SESSION_COOKIE_HTTPONLY = True
        SESSION_COOKIE_SAMESITE = "Lax"
        REMEMBER_COOKIE_SECURE = True
        REMEMBER_COOKIE_HTTPONLY = True
        REMEMBER_COOKIE_SAMESITE = "Lax"

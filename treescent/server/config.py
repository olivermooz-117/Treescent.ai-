import os
import sys
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

FLASK_ENV = os.getenv("FLASK_ENV", "production")  # fail closed unless explicitly development
IS_PRODUCTION = FLASK_ENV != "development"


def _database_url():
    url = os.getenv("DATABASE_URL")
    if not url:
        return f"sqlite:///{os.path.join(BASE_DIR, 'treescent.db')}"
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def _require_secret(env_var: str) -> str:
    value = os.getenv(env_var)
    if not value:
        if IS_PRODUCTION:
            sys.exit(f"FATAL: Missing required environment variable: {env_var}")
        print(
            f"WARNING: {env_var} not set. Using insecure default for development only.",
            file=sys.stderr,
        )
        return "dev-insecure-do-not-use-in-production"
    if len(value) < 32 and IS_PRODUCTION:
        sys.exit(f"FATAL: {env_var} must be at least 32 characters")
    return value


class Config:
    SECRET_KEY = _require_secret("SECRET_KEY")

    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = _require_secret("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

    # Rate limiting: disable storage warning noise in tests via RATELIMIT_ENABLED
    RATELIMIT_DEFAULT = "200 per day;50 per hour"
    # Public read-heavy routes should not share aggressive defaults in production —
    # set RATELIMIT_STORAGE_URI=redis://... when deploying multi-worker.
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")

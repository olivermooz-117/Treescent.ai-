import os
import sys
import tempfile

import pytest

# Add server directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app
from extensions import db
from models import User


class TestConfig:
    """Test configuration using in-memory SQLite."""
    SECRET_KEY = "test-secret-key"
    JWT_SECRET_KEY = "test-jwt-secret"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 3600
    JWT_REFRESH_TOKEN_EXPIRES = 2592000
    CORS_ORIGINS = ["http://localhost:5173"]


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Register a user and return auth headers."""
    # Register user
    client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "username": "testuser", "password": "password123"},
    )
    # Login
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    data = response.get_json()
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]
    return {
        "access": {"Authorization": f"Bearer {access_token}"},
        "refresh": {"Authorization": f"Bearer {refresh_token}"},
    }


def test_health_endpoint(client):
    """Test health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    assert data["app"] == "treescent"


def test_register_success(client):
    """Test successful user registration."""
    response = client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "username": "newuser", "password": "password123"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert "user" in data
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "new@example.com"
    assert data["user"]["username"] == "newuser"


def test_register_duplicate_email(client):
    """Test registration with duplicate email fails."""
    client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "username": "user1", "password": "password123"},
    )
    response = client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "username": "user2", "password": "password123"},
    )
    assert response.status_code == 409
    assert "already registered" in response.get_json()["error"]


def test_register_duplicate_username(client):
    """Test registration with duplicate username fails."""
    client.post(
        "/api/auth/register",
        json={"email": "user1@example.com", "username": "dupuser", "password": "password123"},
    )
    response = client.post(
        "/api/auth/register",
        json={"email": "user2@example.com", "username": "dupuser", "password": "password123"},
    )
    assert response.status_code == 409
    assert "already taken" in response.get_json()["error"]


def test_register_invalid_email(client):
    """Test registration with invalid email fails."""
    response = client.post(
        "/api/auth/register",
        json={"email": "invalid-email", "username": "validuser", "password": "password123"},
    )
    assert response.status_code == 400
    assert "valid email" in response.get_json()["error"].lower()


def test_register_invalid_username(client):
    """Test registration with invalid username fails."""
    response = client.post(
        "/api/auth/register",
        json={"email": "valid@example.com", "username": "ab", "password": "password123"},
    )
    assert response.status_code == 400


def test_register_short_password(client):
    """Test registration with short password fails."""
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "username": "testuser", "password": "short"},
    )
    assert response.status_code == 400
    assert "at least 8" in response.get_json()["error"]


def test_register_reserved_username(client):
    """Test registration with reserved username fails."""
    response = client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "username": "api", "password": "password123"},
    )
    assert response.status_code == 400
    assert "not available" in response.get_json()["error"]


def test_login_success(client):
    """Test successful login."""
    client.post(
        "/api/auth/register",
        json={"email": "login@example.com", "username": "loginuser", "password": "password123"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "user" in data
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password(client):
    """Test login with wrong password fails."""
    client.post(
        "/api/auth/register",
        json={"email": "wrongpass@example.com", "username": "wrongpass", "password": "password123"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "wrongpass@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "invalid" in response.get_json()["error"].lower()


def test_login_nonexistent_user(client):
    """Test login with nonexistent user fails."""
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "password123"},
    )
    assert response.status_code == 401
    assert "invalid" in response.get_json()["error"].lower()


def test_refresh_token(client, auth_headers):
    """Test token refresh."""
    response = client.post("/api/auth/refresh", headers=auth_headers["refresh"])
    assert response.status_code == 200
    assert "access_token" in response.get_json()


def test_me_endpoint(client, auth_headers):
    """Test /me endpoint returns current user."""
    response = client.get("/api/auth/me", headers=auth_headers["access"])
    assert response.status_code == 200
    data = response.get_json()
    assert "user" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["username"] == "testuser"


def test_update_me(client, auth_headers):
    """Test updating current user profile."""
    response = client.patch(
        "/api/auth/me",
        headers=auth_headers["access"],
        json={"display_name": "New Name", "bio": "New bio", "theme": "dark"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["user"]["display_name"] == "New Name"
    assert data["user"]["bio"] == "New bio"
    assert data["user"]["theme"] == "dark"


def test_update_me_invalid_theme(client, auth_headers):
    """Test updating with invalid theme fails."""
    response = client.patch(
        "/api/auth/me",
        headers=auth_headers["access"],
        json={"theme": "invalid-theme"},
    )
    assert response.status_code == 400
    assert "theme must be one of" in response.get_json()["error"].lower()


def test_update_me_invalid_avatar(client, auth_headers):
    """Test updating with invalid avatar URL fails."""
    response = client.patch(
        "/api/auth/me",
        headers=auth_headers["access"],
        json={"avatar_url": "not-a-url"},
    )
    assert response.status_code == 400
    assert "must start with" in response.get_json()["error"]


def test_me_requires_auth(client):
    """Test /me endpoint requires authentication."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_user_password_hashing():
    """Test password hashing and verification."""
    user = User(email="hash@example.com", username="hashuser", display_name="hashuser")
    user.set_password("mypassword")
    assert user.check_password("mypassword")
    assert not user.check_password("wrongpassword")


def test_user_to_dict():
    """Test user serialization."""
    user = User(id=1, email="dict@example.com", username="dictuser", display_name="Dict User")
    d = user.to_dict()
    assert d["id"] == 1
    assert d["email"] == "dict@example.com"
    assert d["username"] == "dictuser"
    assert d["display_name"] == "Dict User"


def test_user_to_public_dict():
    """Test public user serialization (no email)."""
    user = User(id=1, email="private@example.com", username="publicuser", display_name="Public User")
    d = user.to_public_dict()
    assert "email" not in d
    assert d["username"] == "publicuser"
    assert d["display_name"] == "Public User"


def test_link_model():
    """Test Link model creation."""
    from models import Link
    link = Link(user_id=1, title="Test Link", url="https://example.com", position=0)
    assert link.title == "Test Link"
    assert link.url == "https://example.com"
    assert link.position == 0
    # is_active defaults to True at database level
    assert link.is_active is not False


def test_click_model():
    """Test Click model creation."""
    from models import Click
    click = Click(link_id=1, referrer="https://google.com", user_agent="Mozilla/5.0")
    assert click.link_id == 1
    assert click.referrer == "https://google.com"
    assert click.user_agent == "Mozilla/5.0"
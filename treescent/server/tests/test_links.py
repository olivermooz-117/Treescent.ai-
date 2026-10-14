import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app
from extensions import db
from models import Click, Link, User


class TestConfig:
    SECRET_KEY = "test-secret-key"
    JWT_SECRET_KEY = "test-jwt-secret"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 3600
    JWT_REFRESH_TOKEN_EXPIRES = 2592000
    CORS_ORIGINS = ["http://localhost:5173"]
    RATELIMIT_ENABLED = False


@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Register a user and return access token headers."""
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "password123",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    data = response.get_json()
    return {"Authorization": f"Bearer {data['access_token']}"}


@pytest.fixture
def second_user_headers(client):
    """A second user for ownership tests."""
    client.post(
        "/api/auth/register",
        json={
            "email": "other@example.com",
            "username": "otheruser",
            "password": "password123",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "other@example.com", "password": "password123"},
    )
    data = response.get_json()
    return {"Authorization": f"Bearer {data['access_token']}"}


# ─── Links CRUD ───────────────────────────────────────────────────────────────

def test_create_link(client, auth_headers):
    response = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "My Site", "url": "https://example.com"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["link"]["title"] == "My Site"
    assert data["link"]["url"] == "https://example.com"
    assert data["link"]["is_active"] is True
    assert data["link"]["position"] == 0
    assert data["link"]["click_count"] == 0


def test_create_link_missing_title(client, auth_headers):
    response = client.post(
        "/api/links",
        headers=auth_headers,
        json={"url": "https://example.com"},
    )
    assert response.status_code == 400
    assert "title" in response.get_json()["error"].lower()


def test_create_link_invalid_url(client, auth_headers):
    response = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Bad", "url": "not-a-url"},
    )
    assert response.status_code == 400
    assert "http" in response.get_json()["error"].lower()


def test_create_link_requires_auth(client):
    response = client.post(
        "/api/links",
        json={"title": "No Auth", "url": "https://example.com"},
    )
    assert response.status_code == 401


def test_list_links(client, auth_headers):
    client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Link 1", "url": "https://one.com"},
    )
    client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Link 2", "url": "https://two.com"},
    )

    response = client.get("/api/links", headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data["links"]) == 2
    assert data["links"][0]["title"] == "Link 1"
    assert data["links"][1]["title"] == "Link 2"


def test_update_link(client, auth_headers):
    create = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Old Title", "url": "https://old.com"},
    )
    link_id = create.get_json()["link"]["id"]

    response = client.patch(
        f"/api/links/{link_id}",
        headers=auth_headers,
        json={"title": "New Title", "is_active": False},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["link"]["title"] == "New Title"
    assert data["link"]["is_active"] is False


def test_update_link_not_found(client, auth_headers):
    response = client.patch(
        "/api/links/9999",
        headers=auth_headers,
        json={"title": "Nope"},
    )
    assert response.status_code == 404


def test_update_other_users_link_fails(client, auth_headers, second_user_headers):
    # User 1 creates a link
    create = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Private", "url": "https://private.com"},
    )
    link_id = create.get_json()["link"]["id"]

    # User 2 tries to update it
    response = client.patch(
        f"/api/links/{link_id}",
        headers=second_user_headers,
        json={"title": "Hacked"},
    )
    assert response.status_code == 404


def test_delete_link(client, auth_headers):
    create = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Delete Me", "url": "https://delete.com"},
    )
    link_id = create.get_json()["link"]["id"]

    response = client.delete(f"/api/links/{link_id}", headers=auth_headers)
    assert response.status_code == 200

    # Confirm it's gone
    list_resp = client.get("/api/links", headers=auth_headers)
    assert len(list_resp.get_json()["links"]) == 0


def test_delete_other_users_link_fails(client, auth_headers, second_user_headers):
    create = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Keep Me", "url": "https://keep.com"},
    )
    link_id = create.get_json()["link"]["id"]

    response = client.delete(
        f"/api/links/{link_id}", headers=second_user_headers
    )
    assert response.status_code == 404


# ─── Reorder ──────────────────────────────────────────────────────────────────

def test_reorder_links(client, auth_headers):
    # Create 3 links
    ids = []
    for title in ["A", "B", "C"]:
        resp = client.post(
            "/api/links",
            headers=auth_headers,
            json={"title": title, "url": f"https://{title.lower()}.com"},
        )
        ids.append(resp.get_json()["link"]["id"])

    # Reverse the order
    new_order = list(reversed(ids))
    response = client.put(
        "/api/links/reorder",
        headers=auth_headers,
        json={"order": new_order},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert [link["id"] for link in data["links"]] == new_order
    assert data["links"][0]["title"] == "C"
    assert data["links"][2]["title"] == "A"


def test_reorder_invalid_id(client, auth_headers):
    response = client.put(
        "/api/links/reorder",
        headers=auth_headers,
        json={"order": [9999]},
    )
    # Must be the exact set of owned link IDs — foreign/missing IDs → 400
    assert response.status_code == 400


def test_reorder_empty_list(client, auth_headers):
    response = client.put(
        "/api/links/reorder",
        headers=auth_headers,
        json={"order": []},
    )
    assert response.status_code == 400


# ─── Public profile ───────────────────────────────────────────────────────────

def test_public_profile(client, auth_headers):
    client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Public Link", "url": "https://public.com"},
    )

    response = client.get("/api/public/testuser")
    assert response.status_code == 200
    data = response.get_json()
    assert data["profile"]["username"] == "testuser"
    assert data["profile"]["display_name"] == "testuser"
    assert "email" not in data["profile"]  # never expose email
    assert len(data["links"]) == 1
    assert data["links"][0]["title"] == "Public Link"


def test_public_profile_hides_inactive_links(client, auth_headers):
    # Create active link
    client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Active", "url": "https://active.com"},
    )
    # Create then deactivate a link
    create = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Inactive", "url": "https://inactive.com"},
    )
    link_id = create.get_json()["link"]["id"]
    client.patch(
        f"/api/links/{link_id}",
        headers=auth_headers,
        json={"is_active": False},
    )

    response = client.get("/api/public/testuser")
    data = response.get_json()
    assert len(data["links"]) == 1
    assert data["links"][0]["title"] == "Active"


def test_public_profile_not_found(client):
    response = client.get("/api/public/doesnotexist")
    assert response.status_code == 404


# ─── Click tracking + redirect ────────────────────────────────────────────────

def test_click_tracking_redirect(client, auth_headers):
    create = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Track Me", "url": "https://tracked.com"},
    )
    link_id = create.get_json()["link"]["id"]

    # Hit the redirect endpoint
    response = client.get(f"/api/public/r/{link_id}")
    assert response.status_code == 302
    assert response.location == "https://tracked.com"

    # Click count should now be 1
    list_resp = client.get("/api/links", headers=auth_headers)
    links = list_resp.get_json()["links"]
    tracked = next(l for l in links if l["id"] == link_id)
    assert tracked["click_count"] == 1


def test_click_tracking_inactive_link(client, auth_headers):
    create = client.post(
        "/api/links",
        headers=auth_headers,
        json={"title": "Inactive", "url": "https://inactive.com"},
    )
    link_id = create.get_json()["link"]["id"]
    client.patch(
        f"/api/links/{link_id}",
        headers=auth_headers,
        json={"is_active": False},
    )

    response = client.get(f"/api/public/r/{link_id}")
    assert response.status_code == 404


def test_click_tracking_not_found(client):
    response = client.get("/api/public/r/9999")
    assert response.status_code == 404

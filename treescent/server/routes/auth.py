import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from sqlalchemy.exc import IntegrityError

from extensions import db, limiter
from models import User

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_RE = re.compile(r"^[a-z0-9_]{3,30}$")

# Usernames become public URLs (/<username>), so block names that clash with app routes
RESERVED_USERNAMES = {
    "api", "admin", "login", "register", "signup", "logout", "dashboard",
    "settings", "profile", "me", "static", "assets", "treescent", "about",
    "help", "support", "terms", "privacy",
}

ALLOWED_THEMES = {"default", "light", "dark", "forest", "sunset"}


def error(message, status=400):
    return jsonify({"error": message}), status


def tokens_for(user):
    identity = str(user.id)  # JWT subject must be a string
    return {
        "access_token": create_access_token(identity=identity),
        "refresh_token": create_refresh_token(identity=identity),
    }


@auth_bp.post("/register")
@limiter.limit("5 per minute")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    if not EMAIL_RE.match(email):
        return error("A valid email is required")
    if not USERNAME_RE.match(username):
        return error(
            "Username must be 3-30 characters: lowercase letters, numbers, underscores"
        )
    if username in RESERVED_USERNAMES:
        return error("That username is not available")
    if len(password) < 8:
        return error("Password must be at least 8 characters")

    if User.query.filter_by(email=email).first():
        return error("Email already registered", 409)
    if User.query.filter_by(username=username).first():
        return error("Username already taken", 409)

    user = User(email=email, username=username, display_name=username)
    user.set_password(password)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        # Race condition: someone grabbed the email/username between check and insert
        db.session.rollback()
        return error("Email or username already in use", 409)

    return jsonify({"user": user.to_dict(), **tokens_for(user)}), 201


@auth_bp.post("/login")
@limiter.limit("10 per minute")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    # Same message for unknown email and wrong password, so attackers can't probe for accounts
    if not user or not user.check_password(password):
        return error("Invalid email or password", 401)

    return jsonify({"user": user.to_dict(), **tokens_for(user)})


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    return jsonify({"access_token": create_access_token(identity=identity)})


@auth_bp.get("/me")
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return error("User not found", 404)
    return jsonify({"user": user.to_dict()})


@auth_bp.patch("/me")
@jwt_required()
def update_me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return error("User not found", 404)

    data = request.get_json(silent=True) or {}

    if "display_name" in data:
        value = (data["display_name"] or "").strip()
        if len(value) > 80:
            return error("Display name must be 80 characters or fewer")
        user.display_name = value or user.username

    if "bio" in data:
        value = (data["bio"] or "").strip()
        if len(value) > 280:
            return error("Bio must be 280 characters or fewer")
        user.bio = value

    if "avatar_url" in data:
        value = (data["avatar_url"] or "").strip()
        if value and not value.startswith(("http://", "https://")):
            return error("Avatar URL must start with http:// or https://")
        if len(value) > 500:
            return error("Avatar URL is too long")
        user.avatar_url = value or None

    if "theme" in data:
        if data["theme"] not in ALLOWED_THEMES:
            return error(f"Theme must be one of: {', '.join(sorted(ALLOWED_THEMES))}")
        user.theme = data["theme"]

    db.session.commit()
    return jsonify({"user": user.to_dict()})

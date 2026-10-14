import re

from flask import Blueprint, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from sqlalchemy.exc import IntegrityError

from extensions import db, limiter
from models import User
from routes.helpers import as_str, error, get_json_object

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_RE = re.compile(r"^[a-z0-9_]{3,30}$")
MAX_PASSWORD_BYTES = 72

RESERVED_USERNAMES = {
    "api", "admin", "login", "register", "signup", "logout", "dashboard",
    "settings", "profile", "me", "static", "assets", "treescent", "about",
    "help", "support", "terms", "privacy",
}

ALLOWED_THEMES = {"default", "light", "dark", "forest", "sunset"}


def tokens_for(user):
    identity = str(user.id)
    return {
        "access_token": create_access_token(identity=identity),
        "refresh_token": create_refresh_token(identity=identity),
    }


@auth_bp.post("/register")
@limiter.limit("5 per minute")
def register():
    data, err = get_json_object()
    if err:
        return err

    email, err = as_str(data.get("email"), "email", required=True, max_len=255)
    if err:
        return err
    email = email.lower()

    username, err = as_str(data.get("username"), "username", required=True, max_len=30)
    if err:
        return err
    username = username.lower()

    password = data.get("password")
    if not isinstance(password, str):
        return error("password must be a string")
    if len(password) < 8:
        return error("Password must be at least 8 characters")
    if len(password.encode("utf-8")) > MAX_PASSWORD_BYTES:
        return error(f"Password must be at most {MAX_PASSWORD_BYTES} bytes")

    if not EMAIL_RE.match(email):
        return error("A valid email is required")
    if not USERNAME_RE.match(username):
        return error(
            "Username must be 3-30 characters: lowercase letters, numbers, underscores"
        )
    if username in RESERVED_USERNAMES:
        return error("That username is not available")

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
        db.session.rollback()
        return error("Email or username already in use", 409)

    return jsonify({"user": user.to_dict(), **tokens_for(user)}), 201


@auth_bp.post("/login")
@limiter.limit("10 per minute")
def login():
    data, err = get_json_object()
    if err:
        return err

    email, err = as_str(data.get("email"), "email", required=True)
    if err:
        return err
    email = email.lower()

    password = data.get("password")
    if not isinstance(password, str):
        return error("Invalid email or password", 401)

    user = User.query.filter_by(email=email).first()
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

    data, err = get_json_object()
    if err:
        return err

    if "display_name" in data:
        value, err = as_str(data["display_name"], "display_name", max_len=80, allow_empty=True)
        if err:
            return err
        user.display_name = value or user.username

    if "bio" in data:
        value, err = as_str(data["bio"], "bio", max_len=280, allow_empty=True)
        if err:
            return err
        user.bio = value

    if "avatar_url" in data:
        value, err = as_str(data["avatar_url"], "avatar_url", max_len=500, allow_empty=True)
        if err:
            return err
        if value and not value.startswith(("http://", "https://")):
            return error("Avatar URL must start with http:// or https://")
        user.avatar_url = value or None

    if "theme" in data:
        theme, err = as_str(data["theme"], "theme", required=True)
        if err:
            return err
        if theme not in ALLOWED_THEMES:
            return error(f"Theme must be one of: {', '.join(sorted(ALLOWED_THEMES))}")
        user.theme = theme

    db.session.commit()
    return jsonify({"user": user.to_dict()})

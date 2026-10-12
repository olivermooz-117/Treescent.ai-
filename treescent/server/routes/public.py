from flask import Blueprint, jsonify, redirect, request
from flask_jwt_extended import jwt_required

from extensions import db
from models import Click, Link, User

public_bp = Blueprint("public", __name__)


def error(message, status=400):
    return jsonify({"error": message}), status


@public_bp.get("/<username>")
def get_public_profile(username):
    """Public profile page data — no auth required."""
    username = (username or "").strip().lower()
    user = User.query.filter_by(username=username).first()
    if not user:
        return error("User not found", 404)

    links = (
        Link.query.filter_by(user_id=user.id, is_active=True)
        .order_by(Link.position.asc(), Link.id.asc())
        .all()
    )

    return jsonify({
        "profile": user.to_public_dict(),
        "links": [link.to_dict() for link in links],
    })


@public_bp.get("/r/<int:link_id>")
def track_and_redirect(link_id):
    """
    Click tracking + redirect.
    Public page should point buttons to this endpoint instead of the real URL.
    Example: https://yoursite.com/api/public/r/42
    """
    link = Link.query.filter_by(id=link_id, is_active=True).first()
    if not link:
        return error("Link not found", 404)

    # Log the click
    click = Click(
        link_id=link.id,
        referrer=request.headers.get("Referer"),
        user_agent=request.headers.get("User-Agent"),
    )
    db.session.add(click)
    db.session.commit()

    return redirect(link.url, code=302)

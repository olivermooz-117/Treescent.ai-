from flask import Blueprint, jsonify, redirect, request

from extensions import db
from models import Click, Link, User
from routes.helpers import error

public_bp = Blueprint("public", __name__)


def _truncate(value, max_len=500):
    if not value:
        return None
    value = str(value)
    return value[:max_len] if len(value) > max_len else value


@public_bp.get("/<username>")
def get_public_profile(username):
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
    link = Link.query.filter_by(id=link_id, is_active=True).first()
    if not link:
        return error("Link not found", 404)

    try:
        click = Click(
            link_id=link.id,
            referrer=_truncate(request.headers.get("Referer")),
            user_agent=_truncate(request.headers.get("User-Agent")),
        )
        db.session.add(click)
        db.session.commit()
    except Exception:
        db.session.rollback()
        # Redirect anyway — never block the visitor

    return redirect(link.url, code=302)

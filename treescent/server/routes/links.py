from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import Link, User

links_bp = Blueprint("links", __name__)


def error(message, status=400):
    return jsonify({"error": message}), status


def get_current_user():
    return db.session.get(User, int(get_jwt_identity()))


@links_bp.get("")
@jwt_required()
def list_links():
    user = get_current_user()
    if not user:
        return error("User not found", 404)

    links = (
        Link.query.filter_by(user_id=user.id)
        .order_by(Link.position.asc(), Link.id.asc())
        .all()
    )
    return jsonify({"links": [link.to_dict(include_clicks=True) for link in links]})


@links_bp.post("")
@jwt_required()
def create_link():
    user = get_current_user()
    if not user:
        return error("User not found", 404)

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    url = (data.get("url") or "").strip()

    if not title:
        return error("Title is required")
    if len(title) > 100:
        return error("Title must be 100 characters or fewer")
    if not url:
        return error("URL is required")
    if not url.startswith(("http://", "https://")):
        return error("URL must start with http:// or https://")
    if len(url) > 2048:
        return error("URL is too long")

    # Put new link at the end
    max_pos = (
        db.session.query(db.func.max(Link.position))
        .filter_by(user_id=user.id)
        .scalar()
    )
    next_pos = (max_pos or 0) + 1

    link = Link(
        user_id=user.id,
        title=title,
        url=url,
        position=next_pos,
        is_active=True,
    )
    db.session.add(link)
    db.session.commit()

    return jsonify({"link": link.to_dict(include_clicks=True)}), 201


@links_bp.patch("/<int:link_id>")
@jwt_required()
def update_link(link_id):
    user = get_current_user()
    if not user:
        return error("User not found", 404)

    link = Link.query.filter_by(id=link_id, user_id=user.id).first()
    if not link:
        return error("Link not found", 404)

    data = request.get_json(silent=True) or {}

    if "title" in data:
        title = (data["title"] or "").strip()
        if not title:
            return error("Title cannot be empty")
        if len(title) > 100:
            return error("Title must be 100 characters or fewer")
        link.title = title

    if "url" in data:
        url = (data["url"] or "").strip()
        if not url:
            return error("URL cannot be empty")
        if not url.startswith(("http://", "https://")):
            return error("URL must start with http:// or https://")
        if len(url) > 2048:
            return error("URL is too long")
        link.url = url

    if "is_active" in data:
        link.is_active = bool(data["is_active"])

    db.session.commit()
    return jsonify({"link": link.to_dict(include_clicks=True)})


@links_bp.delete("/<int:link_id>")
@jwt_required()
def delete_link(link_id):
    user = get_current_user()
    if not user:
        return error("User not found", 404)

    link = Link.query.filter_by(id=link_id, user_id=user.id).first()
    if not link:
        return error("Link not found", 404)

    db.session.delete(link)
    db.session.commit()
    return jsonify({"message": "Link deleted"}), 200


@links_bp.put("/reorder")
@jwt_required()
def reorder_links():
    """
    Body: { "order": [3, 1, 5, 2] }  ← list of link IDs in the desired order
    """
    user = get_current_user()
    if not user:
        return error("User not found", 404)

    data = request.get_json(silent=True) or {}
    order = data.get("order")

    if not isinstance(order, list) or not order:
        return error("order must be a non-empty list of link IDs")

    # Fetch all the user's links
    links = Link.query.filter_by(user_id=user.id).all()
    link_map = {link.id: link for link in links}

    # Validate that every ID belongs to the user
    for link_id in order:
        if link_id not in link_map:
            return error(f"Link {link_id} not found or does not belong to you", 404)

    # Update positions
    for position, link_id in enumerate(order):
        link_map[link_id].position = position

    db.session.commit()

    # Return the new ordered list
    reordered = (
        Link.query.filter_by(user_id=user.id)
        .order_by(Link.position.asc())
        .all()
    )
    return jsonify({"links": [link.to_dict(include_clicks=True) for link in reordered]})

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from extensions import db
from models import Click, Link, User
from routes.helpers import as_bool, as_int_list, as_str, error, get_json_object

links_bp = Blueprint("links", __name__)


def get_current_user():
    return db.session.get(User, int(get_jwt_identity()))


def click_counts_for(user_id):
    rows = (
        db.session.query(Link.id, func.count(Click.id))
        .outerjoin(Click, Click.link_id == Link.id)
        .filter(Link.user_id == user_id)
        .group_by(Link.id)
        .all()
    )
    return {link_id: count for link_id, count in rows}


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
    counts = click_counts_for(user.id)
    result = []
    for link in links:
        data = link.to_dict()
        data["click_count"] = counts.get(link.id, 0)
        result.append(data)
    return jsonify({"links": result})


@links_bp.post("")
@jwt_required()
def create_link():
    user = get_current_user()
    if not user:
        return error("User not found", 404)

    data, err = get_json_object()
    if err:
        return err

    title, err = as_str(data.get("title"), "title", required=True, max_len=100)
    if err:
        return err
    url, err = as_str(data.get("url"), "url", required=True, max_len=2048)
    if err:
        return err
    if not url.startswith(("http://", "https://")):
        return error("URL must start with http:// or https://")

    max_pos = (
        db.session.query(func.max(Link.position))
        .filter_by(user_id=user.id)
        .scalar()
    )
    # Keep 0-based positions consistent with reorder
    next_pos = 0 if max_pos is None else max_pos + 1

    link = Link(
        user_id=user.id,
        title=title,
        url=url,
        position=next_pos,
        is_active=True,
    )
    db.session.add(link)
    db.session.commit()

    data = link.to_dict()
    data["click_count"] = 0
    return jsonify({"link": data}), 201


@links_bp.patch("/<int:link_id>")
@jwt_required()
def update_link(link_id):
    user = get_current_user()
    if not user:
        return error("User not found", 404)

    link = Link.query.filter_by(id=link_id, user_id=user.id).first()
    if not link:
        return error("Link not found", 404)

    data, err = get_json_object()
    if err:
        return err

    if "title" in data:
        title, err = as_str(data["title"], "title", required=True, max_len=100)
        if err:
            return err
        link.title = title

    if "url" in data:
        url, err = as_str(data["url"], "url", required=True, max_len=2048)
        if err:
            return err
        if not url.startswith(("http://", "https://")):
            return error("URL must start with http:// or https://")
        link.url = url

    if "is_active" in data:
        is_active, err = as_bool(data["is_active"], "is_active")
        if err:
            return err
        link.is_active = is_active

    db.session.commit()
    data = link.to_dict()
    data["click_count"] = link.clicks.count()
    return jsonify({"link": data})


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
    user = get_current_user()
    if not user:
        return error("User not found", 404)

    data, err = get_json_object()
    if err:
        return err

    order, err = as_int_list(data.get("order"), "order")
    if err:
        return err

    links = Link.query.filter_by(user_id=user.id).all()
    link_map = {link.id: link for link in links}
    owned_ids = set(link_map.keys())
    order_ids = set(order)

    if len(order) != len(order_ids):
        return error("order must not contain duplicate link IDs")
    if order_ids != owned_ids:
        return error("order must include every link ID exactly once")

    for position, link_id in enumerate(order):
        link_map[link_id].position = position

    db.session.commit()

    reordered = (
        Link.query.filter_by(user_id=user.id)
        .order_by(Link.position.asc())
        .all()
    )
    counts = click_counts_for(user.id)
    result = []
    for link in reordered:
        data = link.to_dict()
        data["click_count"] = counts.get(link.id, 0)
        result.append(data)
    return jsonify({"links": result})

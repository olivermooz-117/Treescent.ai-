from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from extensions import db
from models import Click, Link, User

analytics_bp = Blueprint("analytics", __name__)


def error(message, status=400):
    return jsonify({"error": message}), status


@analytics_bp.get("")
@jwt_required()
def get_analytics():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return error("User not found", 404)

    links = Link.query.filter_by(user_id=user.id).all()
    link_ids = [l.id for l in links]

    total_clicks = 0
    if link_ids:
        total_clicks = (
            db.session.query(func.count(Click.id))
            .filter(Click.link_id.in_(link_ids))
            .scalar()
            or 0
        )

    # Per-link breakdown
    per_link = []
    for link in sorted(links, key=lambda l: l.position):
        count = link.clicks.count()
        per_link.append({
            "id": link.id,
            "title": link.title,
            "url": link.url,
            "is_active": link.is_active,
            "click_count": count,
        })

    # Clicks over last 14 days
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=13)
    daily = []
    if link_ids:
        rows = (
            db.session.query(
                func.date(Click.clicked_at).label("day"),
                func.count(Click.id).label("count"),
            )
            .filter(
                Click.link_id.in_(link_ids),
                Click.clicked_at >= start,
            )
            .group_by(func.date(Click.clicked_at))
            .all()
        )
        by_day = {str(r.day): r.count for r in rows}
        for i in range(14):
            d = (start + timedelta(days=i)).date()
            daily.append({"date": str(d), "clicks": by_day.get(str(d), 0)})
    else:
        for i in range(14):
            d = (start + timedelta(days=i)).date()
            daily.append({"date": str(d), "clicks": 0})

    return jsonify({
        "total_clicks": total_clicks,
        "total_links": len(links),
        "active_links": sum(1 for l in links if l.is_active),
        "per_link": per_link,
        "daily": daily,
    })

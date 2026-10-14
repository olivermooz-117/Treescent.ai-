"""
M-Pesa Daraja STK Push scaffold.
Set these in .env when you're ready:
  MPESA_CONSUMER_KEY=
  MPESA_CONSUMER_SECRET=
  MPESA_SHORTCODE=
  MPESA_PASSKEY=
  MPESA_CALLBACK_URL=
"""
import os
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import User

payments_bp = Blueprint("payments", __name__)


def error(message, status=400):
    return jsonify({"error": message}), status


@payments_bp.post("/tip")
def request_tip():
    """
    Public endpoint: fan tips a creator.
    Body: { "username": "demo", "phone": "2547XXXXXXXX", "amount": 50 }
    """
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    amount = data.get("amount")

    if not username:
        return error("username is required")
    if not phone or not phone.startswith("254") or len(phone) != 12:
        return error("phone must be in format 2547XXXXXXXX")
    try:
        amount = int(amount)
        if amount < 1:
            raise ValueError
    except (TypeError, ValueError):
        return error("amount must be a positive integer (KES)")

    user = User.query.filter_by(username=username).first()
    if not user:
        return error("Creator not found", 404)

    # TODO: call Daraja STK Push here
    # For now return a stub so the frontend can be wired up
    if not os.getenv("MPESA_CONSUMER_KEY"):
        return jsonify({
            "status": "pending_config",
            "message": "M-Pesa is not configured yet. Add Daraja credentials to .env.",
            "tip": {
                "username": username,
                "phone": phone,
                "amount": amount,
            },
        }), 202

    return jsonify({
        "status": "initiated",
        "message": "STK push sent. Check your phone.",
    }), 200


@payments_bp.post("/callback")
def mpesa_callback():
    """Daraja will POST payment results here."""
    payload = request.get_json(silent=True) or {}
    # TODO: verify + record successful tips
    print("M-Pesa callback:", payload)
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200

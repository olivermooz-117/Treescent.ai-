from flask import jsonify, request


def error(message, status=400):
    return jsonify({"error": message}), status


def get_json_object():
    """Return JSON body only if it is a dict; otherwise (None, error_response)."""
    data = request.get_json(silent=True)
    if data is None:
        return None, error("JSON body required")
    if not isinstance(data, dict):
        return None, error("JSON body must be an object")
    return data, None


def as_str(value, field, *, required=False, max_len=None, allow_empty=False):
    """Coerce to stripped string or return an error response."""
    if value is None:
        if required:
            return None, error(f"{field} is required")
        return None, None
    if not isinstance(value, str):
        return None, error(f"{field} must be a string")
    value = value.strip()
    if not value and not allow_empty:
        if required:
            return None, error(f"{field} is required")
        return None, None
    if max_len is not None and len(value) > max_len:
        return None, error(f"{field} must be {max_len} characters or fewer")
    return value, None


def as_bool(value, field):
    """Strict boolean: only true/false (JSON bools), not 'false' strings."""
    if not isinstance(value, bool):
        return None, error(f"{field} must be a boolean")
    return value, None


def as_int_list(value, field):
    """Non-empty list of integers."""
    if not isinstance(value, list) or not value:
        return None, error(f"{field} must be a non-empty list of integers")
    out = []
    for item in value:
        if isinstance(item, bool) or not isinstance(item, int):
            return None, error(f"{field} must be a list of integers")
        out.append(item)
    return out, None

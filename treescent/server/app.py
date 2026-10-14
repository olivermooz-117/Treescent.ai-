from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

from config import Config, IS_PRODUCTION
from extensions import bcrypt, db, jwt, limiter, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Trust X-Forwarded-* from one proxy hop (Render / Railway / Nginx)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])

    import models  # noqa: F401

    from routes.auth import auth_bp
    from routes.links import links_bp
    from routes.public import public_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(links_bp, url_prefix="/api/links")
    app.register_blueprint(public_bp, url_prefix="/api/public")

    # Optional blueprints (analytics / payments) if present
    try:
        from routes.analytics import analytics_bp
        app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    except ImportError:
        pass
    try:
        from routes.payments import payments_bp
        app.register_blueprint(payments_bp, url_prefix="/api/payments")
    except ImportError:
        pass

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "treescent"})

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(_):
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=not IS_PRODUCTION, port=5000)

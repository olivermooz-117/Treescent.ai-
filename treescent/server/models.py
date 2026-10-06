from datetime import datetime, timezone

from extensions import bcrypt, db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(30), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # Public profile
    display_name = db.Column(db.String(80))
    bio = db.Column(db.String(280))
    avatar_url = db.Column(db.String(500))
    theme = db.Column(db.String(30), default="default", nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    links = db.relationship(
        "Link",
        backref="user",
        cascade="all, delete-orphan",
        order_by="Link.position",
        lazy="dynamic",
    )

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Full account data, for the logged-in owner."""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "display_name": self.display_name,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "theme": self.theme,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def to_public_dict(self):
        """Only what a visitor to /<username> should see (no email)."""
        return {
            "username": self.username,
            "display_name": self.display_name or self.username,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "theme": self.theme,
        }

    def __repr__(self):
        return f"<User {self.username}>"


class Link(db.Model):
    __tablename__ = "links"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    title = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(2048), nullable=False)
    position = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)

    clicks = db.relationship(
        "Click",
        backref="link",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def to_dict(self, include_clicks=False):
        data = {
            "id": self.id,
            "title": self.title,
            "url": self.url,
            "position": self.position,
            "is_active": self.is_active,
        }
        if include_clicks:
            data["click_count"] = self.clicks.count()
        return data

    def __repr__(self):
        return f"<Link {self.id} {self.title}>"


class Click(db.Model):
    __tablename__ = "clicks"

    id = db.Column(db.Integer, primary_key=True)
    link_id = db.Column(
        db.Integer, db.ForeignKey("links.id"), nullable=False, index=True
    )
    clicked_at = db.Column(
        db.DateTime(timezone=True), default=utcnow, nullable=False, index=True
    )
    referrer = db.Column(db.String(500))
    user_agent = db.Column(db.String(500))

    def __repr__(self):
        return f"<Click link={self.link_id} at={self.clicked_at}>"

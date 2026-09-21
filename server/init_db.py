"""Create/seed the database (SQLite locally, Postgres when DATABASE_URL is set)."""
from werkzeug.security import generate_password_hash  # noqa: F401

try:
    from server import db
except ImportError:
    import db


def main():
    conn = db.get_conn()
    db.ensure_database(db.DB(conn))
    conn.commit()
    conn.close()
    print("Database ready (" + ("postgres" if db.IS_PG else db.DB_PATH) + ")")


if __name__ == "__main__":
    main()

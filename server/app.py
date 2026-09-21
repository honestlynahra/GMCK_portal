"""GMC KOZHIKODE — Flask backend.

Serves the static site and provides a JSON API:
  public  : GET /api/bootstrap, POST /api/appointments
  auth    : POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
  admin   : CRUD for departments/doctors/notices/notifications/opd/emergency,
            appointments management (login required)

Run:  python app.py    -> http://127.0.0.1:5000
"""
import datetime
import io
import json
import os
import secrets

from flask import Flask, Response, g, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash

try:
    from server import db as dbm
except ImportError:
    import db as dbm

SERVER = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(SERVER, ".."))
KEY_FILE = os.path.join(SERVER, ".secret_key")
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
IMAGE_MIME = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".gif": "image/gif",
}

app = Flask(__name__, static_folder=None)
app.secret_key = (os.environ.get("SECRET_KEY") or "").strip()
if not app.secret_key:
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE) as f:
            app.secret_key = f.read().strip()
    else:
        app.secret_key = secrets.token_hex(32)
        try:
            with open(KEY_FILE, "w") as f:
                f.write(app.secret_key)
        except OSError:
            pass


# ---------------------------------------------------------------- db helpers
def get_db():
    if "db" not in g:
        g.db = dbm.DB(dbm.get_conn())
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def row_to_dict(row):
    return {k: row[k] for k in row.keys()}


# ---------------------------------------------------------------- auth helpers
def current_user():
    uid = session.get("uid")
    if not uid:
        return None
    row = get_db().execute("SELECT id, username, role FROM users WHERE id=?", (uid,)).fetchone()
    return row_to_dict(row) if row else None


def login_required(fn):
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user():
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper


# ---------------------------------------------------------------- site serving
@app.route("/")
def index():
    resp = send_from_directory(SITE, "index.html")
    resp.headers["Cache-Control"] = "no-cache"
    return resp


@app.route("/<path:path>")
def site_files(path):
    if path.startswith("assets/"):
        resp = send_from_directory(os.path.join(SITE, "assets"), path[len("assets/"):])
        resp.headers["Cache-Control"] = "no-cache"
        return resp
    candidate = path
    if path.endswith("/"):
        candidate = path + "index.html"
    target = os.path.normpath(os.path.join(SITE, candidate))
    if target.startswith(SITE) and os.path.isfile(target):
        resp = send_from_directory(SITE, candidate)
        resp.headers["Cache-Control"] = "no-cache"
        return resp
    return jsonify({"error": "Not found"}), 404


# ---------------------------------------------------------------- bootstrap
@app.route("/api/bootstrap")
def bootstrap():
    db = get_db()

    def fetch(table, cols="*"):
        return [row_to_dict(r) for r in db.execute(f"SELECT {cols} FROM {table} ORDER BY id").fetchall()]

    departments = fetch("departments")
    for d in departments:
        try:
            d["services"] = json.loads(d.get("services") or "[]")
        except (TypeError, ValueError):
            d["services"] = []

    opd_rows = fetch("opd")
    opd_by_day = {}
    for r in opd_rows:
        opd_by_day.setdefault(r["day"], {})[r["session"].lower()] = r["info"]
    opd = [{"day": d, **v} for d, v in opd_by_day.items()]

    em = db.execute("SELECT phone, helpdesk FROM emergency_settings WHERE id=1").fetchone()

    return jsonify({
        "departments": departments,
        "doctors": fetch("doctors"),
        "notices": fetch("notices"),
        "notifications": fetch("notifications"),
        "events": fetch("events"),
        "opd": opd,
        "emergency": row_to_dict(em) if em else {},
        "auth": (lambda u: {"logged_in": bool(u), "username": u["username"] if u else None})(current_user()),
    })


# ---------------------------------------------------------------- public appointments
@app.route("/api/appointments", methods=["POST"])
def create_appointment():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    department = (data.get("department") or "").strip()
    date = (data.get("preferred_date") or "").strip()
    message = (data.get("message") or "").strip()
    if not name or not phone:
        return jsonify({"error": "Name and phone number are required"}), 400
    db = get_db()
    db.execute(
        "INSERT INTO appointments(name, phone, department, preferred_date, message, status) VALUES (?,?,?,?,?,?)",
        (name, phone, department, date, message, "new"),
    )
    db.commit()
    return jsonify({"ok": True, "message": "Appointment request submitted."}), 201


# ---------------------------------------------------------------- auth
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    row = get_db().execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "Invalid username or password"}), 401
    session["uid"] = row["id"]
    return jsonify({"ok": True, "user": {"username": row["username"], "role": row["role"]}})


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop("uid", None)
    return jsonify({"ok": True})


@app.route("/api/auth/me")
def me():
    u = current_user()
    return jsonify({"logged_in": bool(u), "user": u})


# ---------------------------------------------------------------- admin: generic CRUD
# resource -> (table, editable columns, payload key)
RESOURCES = {
    "departments": ("departments", ["name", "desc", "cat", "loc", "opd", "services"]),
    "doctors": ("doctors", ["name", "des", "dept", "spec"]),
    "notices": ("notices", ["title", "category", "cat_class", "date", "summary"]),
    "events": ("events", ["title", "category", "cat_class", "date", "venue", "time", "summary", "poster"]),
    "notifications": ("notifications", ["title", "body", "icon_bg", "icon_col", "time", "unread"]),
    "opd": ("opd", ["dept", "day", "session", "info", "available"]),
}


def _clean(data, cols):
    out = {}
    for c in cols:
        if c == "services":
            sv = data.get(c)
            out[c] = json.dumps(sv) if isinstance(sv, list) else (sv or "[]")
        elif c == "unread":
            out[c] = 1 if data.get(c) in (True, 1, "1", "true", "on") else 0
        elif c == "available":
            out[c] = 1 if data.get(c) in (True, 1, "1", "true", "on") else 0
        else:
            out[c] = (data.get(c) or "").strip()
    return out


@app.route("/api/admin/<res>", methods=["GET", "POST"])
@login_required
def admin_list_create(res):
    if res not in RESOURCES:
        return jsonify({"error": "Unknown resource"}), 404
    table, cols = RESOURCES[res]
    db = get_db()
    if request.method == "GET":
        rows = [row_to_dict(r) for r in db.execute(f"SELECT * FROM {table} ORDER BY id").fetchall()]
        if res == "departments":
            for d in rows:
                try:
                    d["services"] = json.loads(d.get("services") or "[]")
                except (TypeError, ValueError):
                    d["services"] = []
        return jsonify(rows)
    data = _clean(request.get_json(silent=True) or {}, cols)
    cols_sql = ", ".join(dbm.ident(c) for c in cols)
    placeholders = ", ".join("?" * len(cols))
    row = db.execute(
        f"INSERT INTO {table} ({cols_sql}) VALUES ({placeholders}) RETURNING id",
        [data[c] for c in cols],
    ).fetchone()
    db.commit()
    return jsonify({"ok": True, "id": row["id"]}), 201


@app.route("/api/admin/<res>/<int:rid>", methods=["PUT", "DELETE"])
@login_required
def admin_update_delete(res, rid):
    if res not in RESOURCES:
        return jsonify({"error": "Unknown resource"}), 404
    table, cols = RESOURCES[res]
    db = get_db()
    if request.method == "DELETE":
        db.execute(f"DELETE FROM {table} WHERE id=?", (rid,))
        db.commit()
        return jsonify({"ok": True})
    data = _clean(request.get_json(silent=True) or {}, cols)
    sets = ", ".join(f"{dbm.ident(c)} = ?" for c in cols)
    db.execute(f"UPDATE {table} SET {sets} WHERE id=?", [data[c] for c in cols] + [rid])
    db.commit()
    return jsonify({"ok": True})


# ---------------------------------------------------------------- appointments (admin)
@app.route("/api/admin/appointments")
@app.route("/api/admin/appointments/<int:aid>", methods=["PATCH", "DELETE"])
@login_required
def appointments_admin(aid=None):
    db = get_db()
    if request.method == "GET":
        rows = [row_to_dict(r) for r in db.execute(
            "SELECT * FROM appointments ORDER BY id DESC").fetchall()]
        return jsonify(rows)
    if request.method == "DELETE":
        db.execute("DELETE FROM appointments WHERE id=?", (aid,))
        db.commit()
        return jsonify({"ok": True})
    data = request.get_json(silent=True) or {}
    status = (data.get("status") or "new").strip()
    db.execute("UPDATE appointments SET status=? WHERE id=?", (status, aid))
    db.commit()
    return jsonify({"ok": True})


# ---------------------------------------------------------------- emergency + password (admin)
@app.route("/api/admin/emergency", methods=["GET", "PUT"])
@login_required
def emergency_admin():
    db = get_db()
    if request.method == "GET":
        return jsonify(row_to_dict(db.execute("SELECT * FROM emergency_settings WHERE id=1").fetchone()))
    data = _clean(request.get_json(silent=True) or {}, ["phone", "helpdesk"])
    now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    db.execute("UPDATE emergency_settings SET phone=?, helpdesk=?, updated_at=? WHERE id=1",
               (data["phone"], data["helpdesk"], now))
    db.commit()
    return jsonify({"ok": True})


@app.route("/api/events/<int:eid>/poster")
def get_event_poster(eid):
    row = get_db().execute("SELECT data, ext FROM posters WHERE event_id=?", (eid,)).fetchone()
    if not row:
        return jsonify({"error": "Not found"}), 404
    mime = IMAGE_MIME.get((row["ext"] or "").lower(), "application/octet-stream")
    resp = Response(bytes(row["data"]), mimetype=mime)
    resp.headers["Cache-Control"] = "no-cache"
    return resp


@app.route("/api/admin/events/<int:eid>/poster", methods=["POST", "DELETE"])
@login_required
def upload_event_poster(eid):
    db = get_db()
    row = db.execute("SELECT id FROM events WHERE id=?", (eid,)).fetchone()
    if not row:
        return jsonify({"error": "Event not found"}), 404
    if request.method == "DELETE":
        db.execute("DELETE FROM posters WHERE event_id=?", (eid,))
        db.execute("UPDATE events SET poster='' WHERE id=?", (eid,))
        db.commit()
        return jsonify({"ok": True})
    f = request.files.get("poster")
    if not f or not f.filename:
        return jsonify({"error": "No file provided"}), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        return jsonify({"error": "Only image files are allowed"}), 400
    db.execute(
        "INSERT INTO posters(event_id, data, ext) VALUES (?,?,?) "
        "ON CONFLICT (event_id) DO UPDATE SET data=excluded.data, ext=excluded.ext",
        (eid, bytes(f.read()), ext),
    )
    url = f"/api/events/{eid}/poster"
    db.execute("UPDATE events SET poster=? WHERE id=?", (url, eid))
    db.commit()
    return jsonify({"ok": True, "poster": url}), 201


@app.route("/api/admin/password", methods=["POST"])
@login_required
def change_password():
    data = request.get_json(silent=True) or {}
    old, new = data.get("old") or "", data.get("new") or ""
    u = current_user()
    row = get_db().execute("SELECT * FROM users WHERE id=?", (u["id"],)).fetchone()
    if not check_password_hash(row["password_hash"], old):
        return jsonify({"error": "Current password is incorrect"}), 400
    if len(new) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400
    get_db().execute("UPDATE users SET password_hash=? WHERE id=?",
                     (generate_password_hash(new), u["id"]))
    get_db().commit()
    return jsonify({"ok": True})


# ---------------------------------------------------------------- admin users
@app.route("/api/admin/users", methods=["GET", "POST"])
@login_required
def users_admin():
    db = get_db()
    if request.method == "GET":
        rows = [dict(r) for r in db.execute(
            "SELECT id, username, role, created_at FROM users ORDER BY id").fetchall()]
        return jsonify(rows)
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    role = (data.get("role") or "admin").strip() or "admin"
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    try:
        db.execute("INSERT INTO users(username, password_hash, role) VALUES (?,?,?)",
                   (username, generate_password_hash(password), role))
        db.commit()
    except dbm.IntegrityError:
        return jsonify({"error": "Username already exists"}), 400
    return jsonify({"ok": True}), 201


@app.route("/api/admin/users/<int:uid>", methods=["PUT", "DELETE"])
@login_required
def user_update_delete(uid):
    db = get_db()
    me = current_user()
    row = db.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    if not row:
        return jsonify({"error": "User not found"}), 404
    if request.method == "DELETE":
        if uid == me["id"]:
            return jsonify({"error": "You cannot delete your own account"}), 400
        count = db.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
        if count <= 1:
            return jsonify({"error": "Cannot delete the only admin account"}), 400
        db.execute("DELETE FROM users WHERE id=?", (uid,))
        db.commit()
        return jsonify({"ok": True})
    data = request.get_json(silent=True) or {}
    new_pw = data.get("password") or ""
    role = (data.get("role") or row["role"]).strip() or "admin"
    if new_pw and len(new_pw) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if new_pw:
        db.execute("UPDATE users SET password_hash=?, role=? WHERE id=?",
                   (generate_password_hash(new_pw), role, uid))
    else:
        db.execute("UPDATE users SET role=? WHERE id=?", (role, uid))
    db.commit()
    return jsonify({"ok": True})


if __name__ == "__main__":
    print("GMC Kozhikode backend — http://127.0.0.1:5000 (also localhost / LAN)")
    app.run(host="0.0.0.0", port=5000, debug=True)
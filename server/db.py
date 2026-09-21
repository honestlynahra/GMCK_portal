"""Database layer for GMC Kozhikode.

Uses PostgreSQL when DATABASE_URL is set (Vercel + Neon), otherwise a local
SQLite file so the app still runs with `python server/app.py`.
"""
import json
import os
import sqlite3
import tempfile

from werkzeug.security import generate_password_hash

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from psycopg2 import errors as pg_errors
except ImportError:  # pragma: no cover - psycopg2 only needed in production
    psycopg2 = None
    RealDictCursor = None
    pg_errors = None

SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_DIR = os.path.abspath(os.path.join(SERVER_DIR, ".."))
_ON_VERCEL = bool(os.environ.get("VERCEL"))
if _ON_VERCEL and not (os.environ.get("DATABASE_URL") or "").strip():
    DATA_DIR = os.path.join(tempfile.gettempdir(), "gmc_data")
else:
    DATA_DIR = os.path.join(SERVER_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "gmc.db")
SQLITE_SCHEMA = os.path.join(SERVER_DIR, "schema.sql")
PG_SCHEMA = os.path.join(SERVER_DIR, "schema_pg.sql")

DATABASE_URL = (os.environ.get("DATABASE_URL") or "").strip()
IS_PG = bool(DATABASE_URL)

IntegrityError = sqlite3.IntegrityError if not IS_PG else (pg_errors.UniqueViolation if pg_errors else Exception)

_READY = False


def ident(name):
    return '"' + name.replace('"', '""') + '"'


class DB:
    """Thin wrapper so callers can use `?` placeholders on both backends."""

    def __init__(self, raw):
        self.raw = raw
        self.pg = IS_PG

    def execute(self, sql, params=()):
        if self.pg:
            sql = sql.replace("?", "%s")
        return self.raw.execute(sql, params)

    def commit(self):
        try:
            self.raw.commit()
        except Exception:
            pass

    def close(self):
        try:
            self.raw.close()
        except Exception:
            pass


def get_conn():
    global _READY
    if IS_PG:
        if psycopg2 is None:
            raise RuntimeError("psycopg2 is required when DATABASE_URL is set")
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        conn.autocommit = True
    else:
        os.makedirs(DATA_DIR, exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
    if not _READY:
        _READY = True
        ensure_database(DB(conn))
    return conn


# ------------------------------------------------------------------ schema
def _run_sql_script(db, script):
    for chunk in script.split(";"):
        stmt = "\n".join(l for l in chunk.splitlines() if not l.strip().startswith("--")).strip()
        if stmt:
            db.execute(stmt)


def ensure_database(db):
    schema = PG_SCHEMA if IS_PG else SQLITE_SCHEMA
    with open(schema, encoding="utf-8") as f:
        _run_sql_script(db, f.read())
    _seed(db)
    db.commit()


# ------------------------------------------------------------------ seed data
DEPARTMENTS = [
    ("Cardiology", "Heart & cardiovascular care", "Super Speciality", "Main Hospital", "Mon–Sat, sample",
     ["ECG & ECHO", "Cardiac OPD", "Pre-op cardiac evaluation", "Heart failure clinic"]),
    ("Pulmonology", "Lungs & respiratory care", "Super Speciality", "OPD Block", "Mon–Sat, sample",
     ["Pulmonary function test", "Asthma & allergy clinic", "Chest OPD", "Sleep clinic"]),
    ("Neurology", "Brain, spine & nervous system", "Super Speciality", "Main Hospital", "Sample timing",
     ["Stroke unit", "Epilepsy clinic", "Neuro-OPD", "EEG & EMG"]),
    ("Orthopaedics", "Bones, joints & trauma care", "Surgical", "Ortho Block", "Mon–Sat, sample",
     ["Fracture care", "Joint replacement", "Sports injury", "Spine clinic"]),
    ("Ophthalmology", "Eye care & vision services", "Clinical", "OPD Block", "Sample timing",
     ["Cataract clinic", "Retina clinic", "Vision testing", "Ocular medicines"]),
    ("ENT", "Ear, nose & throat care", "Clinical", "OPD Block", "Sample timing",
     ["Hearing tests", "Voice clinic", "Sinus care", "Minor ENT procedures"]),
    ("Paediatrics", "Child health & care", "Clinical", "OPD Block", "Sample timing",
     ["Newborn care", "Vaccination", "Child development clinic", "Paediatric OPD"]),
    ("Obstetrics & Gynaecology", "Pregnancy & womens health", "Clinical", "Maternity Block", "Sample timing",
     ["Antenatal clinic", "Labour & delivery", "Gynaecology OPD", "Family planning"]),
    ("Dentistry", "Dental & oral health", "Clinical", "OPD Block", "Sample timing",
     ["General dentistry", "Oral surgery", "Root canal", "Paediatric dentistry"]),
    ("Dermatology", "Skin, hair & nail care", "Clinical", "OPD Block", "Sample timing",
     ["Skin OPD", "Allergy clinic", "Cosmetic procedures", "Dermatological surgery"]),
    ("General Medicine", "Adult internal medicine", "Clinical", "Main Hospital", "Mon–Sat, sample",
     ["Physician OPD", "Diabetes clinic", "Hypertension clinic", "Fever clinic"]),
    ("Radiology", "Diagnostic imaging services", "Diagnostic", "Radiology Wing", "Sample timing",
     ["X-Ray", "Ultrasound", "CT scan", "MRI"]),
]

DOCTORS = [
    ("Dr. [Sample Name]", "Professor & HOD", "Cardiology", "Interventional Cardiology"),
    ("Dr. [Sample Name]", "Associate Professor", "Cardiology", "Non-invasive Cardiology"),
    ("Dr. [Sample Name]", "Assistant Professor", "Medicine", "General & Internal Medicine"),
    ("Dr. [Sample Name]", "Professor", "Orthopaedics", "Joint Replacement & Trauma"),
    ("Dr. [Sample Name]", "Assistant Professor", "Paediatrics", "Neonatology"),
    ("Dr. [Sample Name]", "Consultant", "Neurology", "Stroke & Epilepsy"),
    ("Dr. [Sample Name]", "Associate Professor", "Dermatology", "Clinical Dermatology"),
]

NOTICES = [
    ("OPD schedule update for the week", "Hospital", "cat-hosp", "5 Sep 2026",
     "Sample notice text. Weekly OPD timings may be updated. Refer to the OPD desk."),
    ("UG admission counselling schedule", "Admission", "cat-adm", "4 Sep 2026",
     "Sample notice. Candidates should refer to the official admission portal for dates."),
    ("Final year examination timetable", "Examination", "cat-exam", "2 Sep 2026",
     "Sample notice. Examination schedule issued by the examination cell."),
    ("Emergency preparedness drill announced", "Hospital", "cat-emo", "30 Aug 2026",
     "Sample notice. Periodic emergency drill for hospital staff."),
    ("Research colloquium registration open", "Academics", "cat-acad", "28 Aug 2026",
     "Sample notice. Research colloquium for postgraduate students and faculty."),
]

NOTIFICATIONS = [
    ("OPD schedule update", "OPD timings updated for this week.", "var(--primary-light)", "var(--primary)", "2h ago", 1),
    ("Hospital notice", "Main block maintenance notice.", "var(--primary-light)", "var(--primary)", "5h ago", 1),
    ("Admission notice", "UG counselling schedule published.", "var(--amber-light)", "var(--amber)", "1d ago", 1),
    ("Exam notification", "Timetable for final year released.", "#F0EBFA", "#6B4FA0", "2d ago", 0),
    ("Emergency announcement", "Emergency drill scheduled this week.", "var(--danger-light)", "var(--danger)", "3d ago", 0),
]

EVENTS = [
    ("Annual Medical Freshers' Fest", "Cultural", "cat-adm", "12 Nov 2026", "Main Auditorium", "5:00 PM",
     "Welcome cultural programme for the new first-year batch."),
    ("Research Colloquium", "Academic", "cat-acad", "18 Nov 2026", "Seminar Hall", "10:00 AM",
     "Postgraduate students and faculty present ongoing research work."),
    ("Health Awareness Camp", "Community", "cat-emo", "25 Nov 2026", "OPD Block", "9:00 AM",
     "Free screening and awareness sessions for the public."),
    ("Inter-College Sports Meet", "Sports", "cat-exam", "5 Dec 2026", "College Ground", "8:00 AM",
     "Annual sports meet across batches and participating colleges."),
    ("National Seminar on Public Health", "Academic", "cat-acad", "12 Dec 2026", "Convention Centre", "9:30 AM",
     "Guest lectures and panel discussions with invited speakers."),
    ("Arts Day", "Cultural", "cat-adm", "20 Dec 2026", "College Auditorium", "4:00 PM",
     "Student arts and cultural performances to close the year."),
]

OPD_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
OPD_COUNTS = {
    "Monday": (4, 3), "Tuesday": (4, 3), "Wednesday": (5, 3),
    "Thursday": (4, 4), "Friday": (3, 4), "Saturday": (2, 0),
}


def _count(db, table):
    return db.execute(f"SELECT COUNT(*) AS c FROM {table}").fetchone()["c"]


def _seed(db):
    if _count(db, "users") == 0:
        db.execute(
            "INSERT INTO users(username, password_hash, role) VALUES (?,?,?)",
            ("admin", generate_password_hash("admin123"), "admin"),
        )
        print("Created default admin account: admin / admin123  (CHANGE THIS!)")

    if _count(db, "departments") == 0:
        for d in DEPARTMENTS:
            db.execute(
                'INSERT INTO departments(name, "desc", cat, loc, opd, services) VALUES (?,?,?,?,?,?)',
                (d[0], d[1], d[2], d[3], d[4], json.dumps(d[5])),
            )
    if _count(db, "doctors") == 0:
        for row in DOCTORS:
            db.execute("INSERT INTO doctors(name, des, dept, spec) VALUES (?,?,?,?)", row)
    if _count(db, "notices") == 0:
        for row in NOTICES:
            db.execute("INSERT INTO notices(title, category, cat_class, date, summary) VALUES (?,?,?,?,?)", row)
    if _count(db, "notifications") == 0:
        for row in NOTIFICATIONS:
            db.execute(
                "INSERT INTO notifications(title, body, icon_bg, icon_col, time, unread) VALUES (?,?,?,?,?,?)", row
            )
    if _count(db, "events") == 0:
        for row in EVENTS:
            db.execute(
                "INSERT INTO events(title, category, cat_class, date, venue, time, summary) VALUES (?,?,?,?,?,?,?)",
                row,
            )
    if _count(db, "opd") == 0:
        for day in OPD_DAYS:
            m, a = OPD_COUNTS.get(day, (0, 0))
            db.execute("INSERT INTO opd(dept, day, session, info, available) VALUES (?,?,?,?,?)",
                       ("Cardiology", day, "Morning", f"{m} doctors available" if m else "No OPD", 1 if m else 0))
            db.execute("INSERT INTO opd(dept, day, session, info, available) VALUES (?,?,?,?,?)",
                       ("Cardiology", day, "Afternoon", f"{a} doctors available" if a else "No OPD", 1 if a else 0))

"""Seed the SQLite database with starter data (mirrors the current sample content)."""
import json
import os
import sqlite3
from werkzeug.security import generate_password_hash

SERVER = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SERVER, "data")
DB_PATH = os.path.join(DATA_DIR, "gmc.db")
SCHEMA = os.path.join(SERVER, "schema.sql")

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

OPD_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
OPD_COUNTS = {  # day, morning doctors, afternoon doctors
    "Monday": (4, 3), "Tuesday": (4, 3), "Wednesday": (5, 3),
    "Thursday": (4, 4), "Friday": (3, 4), "Saturday": (2, 0),
}


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(SCHEMA, encoding="utf-8") as f:
        schema = f.read()
    with sqlite3.connect(DB_PATH) as con:
        con.executescript(schema)

        admin = con.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if admin == 0:
            con.execute(
                "INSERT INTO users(username, password_hash, role) VALUES (?,?,?)",
                ("admin", generate_password_hash("admin123"), "admin"),
            )
            print("Created default admin account: admin / admin123  (CHANGE THIS!)")

        if con.execute("SELECT COUNT(*) FROM departments").fetchone()[0] == 0:
            con.executemany(
                "INSERT INTO departments(name, desc, cat, loc, opd, services) VALUES (?,?,?,?,?,?)",
                [(d[0], d[1], d[2], d[3], d[4], json.dumps(d[5])) for d in DEPARTMENTS],
            )
        if con.execute("SELECT COUNT(*) FROM doctors").fetchone()[0] == 0:
            con.executemany("INSERT INTO doctors(name, des, dept, spec) VALUES (?,?,?,?)", DOCTORS)
        if con.execute("SELECT COUNT(*) FROM notices").fetchone()[0] == 0:
            con.executemany("INSERT INTO notices(title, category, cat_class, date, summary) VALUES (?,?,?,?,?)", NOTICES)
        if con.execute("SELECT COUNT(*) FROM notifications").fetchone()[0] == 0:
            con.executemany(
                "INSERT INTO notifications(title, body, icon_bg, icon_col, time, unread) VALUES (?,?,?,?,?,?)",
                NOTIFICATIONS,
            )
        if con.execute("SELECT COUNT(*) FROM opd").fetchone()[0] == 0:
            rows = []
            for day in OPD_DAYS:
                m, a = OPD_COUNTS.get(day, (0, 0))
                if m:
                    rows.append(("Cardiology", day, "Morning", f"{m} doctors available", 1))
                else:
                    rows.append(("Cardiology", day, "Morning", "No OPD", 0))
                if a:
                    rows.append(("Cardiology", day, "Afternoon", f"{a} doctors available", 1))
                else:
                    rows.append(("Cardiology", day, "Afternoon", "No OPD", 0))
            con.executemany(
                "INSERT INTO opd(dept, day, session, info, available) VALUES (?,?,?,?,?)", rows
            )
        con.commit()
    print("Database ready at", DB_PATH)


if __name__ == "__main__":
    main()
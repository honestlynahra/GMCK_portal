-- GMC KOZHIKODE — PostgreSQL schema (for Vercel + Neon)

CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS'))
);

CREATE TABLE IF NOT EXISTS departments(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  "desc" TEXT NOT NULL DEFAULT '',
  cat TEXT NOT NULL DEFAULT 'Clinical',
  loc TEXT NOT NULL DEFAULT '',
  opd TEXT NOT NULL DEFAULT 'Sample timing',
  services TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS doctors(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  des TEXT NOT NULL DEFAULT '',
  dept TEXT NOT NULL DEFAULT '',
  spec TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notices(
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Hospital',
  cat_class TEXT NOT NULL DEFAULT 'cat-hosp',
  date TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS opd(
  id SERIAL PRIMARY KEY,
  dept TEXT NOT NULL DEFAULT 'Cardiology',
  day TEXT NOT NULL DEFAULT 'Monday',
  session TEXT NOT NULL DEFAULT 'Morning',
  info TEXT NOT NULL DEFAULT 'Sample OPD',
  available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS notifications(
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  icon_bg TEXT NOT NULL DEFAULT 'var(--primary-light)',
  icon_col TEXT NOT NULL DEFAULT 'var(--primary)',
  time TEXT NOT NULL DEFAULT '',
  unread INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS events(
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Academic',
  cat_class TEXT NOT NULL DEFAULT 'cat-acad',
  date TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  poster TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS posters(
  event_id INTEGER PRIMARY KEY,
  data BYTEA NOT NULL,
  ext TEXT NOT NULL DEFAULT '.png'
);

CREATE TABLE IF NOT EXISTS appointments(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  preferred_date TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS'))
);

CREATE TABLE IF NOT EXISTS emergency_settings(
  id INTEGER PRIMARY KEY CHECK (id = 1),
  phone TEXT NOT NULL DEFAULT '(Placeholder)',
  helpdesk TEXT NOT NULL DEFAULT 'Main entrance, Ground Floor',
  updated_at TEXT NOT NULL DEFAULT (to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS'))
);

INSERT INTO emergency_settings(id, phone) VALUES (1, '(Placeholder — set official number)') ON CONFLICT (id) DO NOTHING;

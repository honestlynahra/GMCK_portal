-- GMC KOZHIKODE — SQLite schema (v1)
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS departments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  desc TEXT NOT NULL DEFAULT '',
  cat TEXT NOT NULL DEFAULT 'Clinical',
  loc TEXT NOT NULL DEFAULT '',
  opd TEXT NOT NULL DEFAULT 'Sample timing',
  services TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS doctors(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  des TEXT NOT NULL DEFAULT '',
  dept TEXT NOT NULL DEFAULT '',
  spec TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notices(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Hospital',
  cat_class TEXT NOT NULL DEFAULT 'cat-hosp',
  date TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS opd(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dept TEXT NOT NULL DEFAULT 'Cardiology',
  day TEXT NOT NULL DEFAULT 'Monday',
  session TEXT NOT NULL DEFAULT 'Morning',
  info TEXT NOT NULL DEFAULT 'Sample OPD',
  available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS notifications(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  icon_bg TEXT NOT NULL DEFAULT 'var(--primary-light)',
  icon_col TEXT NOT NULL DEFAULT 'var(--primary)',
  time TEXT NOT NULL DEFAULT '',
  unread INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Academic',
  cat_class TEXT NOT NULL DEFAULT 'cat-acad',
  date TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  poster TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS appointments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  preferred_date TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS emergency_settings(
  id INTEGER PRIMARY KEY CHECK (id = 1),
  phone TEXT NOT NULL DEFAULT '(Placeholder)',
  helpdesk TEXT NOT NULL DEFAULT 'Main entrance, Ground Floor',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO emergency_settings(id, phone) VALUES (1, '(Placeholder — set official number)');
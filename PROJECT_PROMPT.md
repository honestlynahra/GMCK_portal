# GMC Kozhikode Hospital App — Complete Project Prompt

You are continuing development of a full-stack **mobile-style hospital app for the Government Medical College (GMC), Kozhikode, Kerala**. Treat this document as the single source of truth for the codebase, conventions, current state, and what to do next.

---

## 1. Mission

Build a smartphone-style "one home" app for GMC Kozhikode: a multi-page mobile web app (phone-frame layout) that lets patients, visitors and staff browse hospital services, departments, doctors, OPD schedules, notices, admissions, academics and a campus map — backed by a real Python + Flask + SQLite backend with an admin console for editing content.

**Non-negotiable policy:** All "official" GMC data (phones, OPD timings, doctor names, admission details, dean/academic calendar entries) stays clearly-marked **placeholder/sample** data. NEVER invent or present fabricated hospital operational information as real. Only factual public info (e.g., the campus name/location "Medical College Junction, Kozhikode, Kerala") and the external Paadha map link (https://maps.paadha.com/) may be treated as real.

---

## 2. Stack

- Front-end: hand-rolled ES5 (no framework), generated static HTML pages, single shared CSS + JS.
- Generator: Node.js (`tools/build.js`) builds every HTML page from one shell template.
- Backend: Python 3.11.9 (`C:\Users\LOQ\AppData\Local\Programs\Python\Python311\python.exe`), Flask 3.1.3, SQLite.
- Admin console: vanilla JS SPA in `admin/`.
- No git repo. Windows 10/11, PowerShell 5.1 host.

---

## 3. Commands (run from `C:\Users\LOQ\GMCK_Hospital_App`)

| Task | Command |
|---|---|
| Rebuild all static pages | `node tools/build.js` (writes 22 pages at project root) |
| Seed SQLite DB (once) | `python server/init_db.py` → creates `server/data/gmc.db`, default admin `admin / admin123` |
| Run server | `python server/app.py` (binds `0.0.0.0:5000`, serves site root + API + admin) |
| Front-end validation | `node C:\Users\LOQ\AppData\Local\Temp\opencode\gmcksite\validate.js` (jsdom, 210 checks) |
| API integration test | `powershell -ExecutionPolicy Bypass -File C:\Users\LOQ\AppData\Local\Temp\opencode\gmcksite\integration.ps1` (33 checks) |
| Visual check | Headless Chrome screenshot, see "Validation" below |

Flask is installed. If the jsdom `node_modules` under `Temp\opencode\gmcksite` is missing, reinstall with `npm.cmd install jsdom` there (PS blocks `npm.ps1`; use `npm.cmd`).

---

## 4. Directory structure

```
C:\Users\LOQ\GMCK_Hospital_App\
├── index.html ... notifications.html   # 22 generated pages (do NOT hand-edit; rebuild)
├── tools\build.js                      # page generator — the "source" for static HTML
├── assets\
│   ├── css\gmc.css                     # design system (see §6)
│   ├── js\data.js                      # sample/fallback data (DEPTS, DOCS, NOTICES, NOTIFS, OPD, EMERGENCY…)
│   ├── js\gmc.js                       # runtime: boot shell, page inits, API client
│   └── img\GMC-Kozhikode.webp          # real GMC logo (background of home greet block)
├── server\                             # Flask backend
│   ├── app.py      ├── schema.sql      # SQLite schema             ├── init_db.py (seed)
│   ├── requirements.txt                ├── data\gmc.db (seeded)    ├── .secret_key (auto)
├── admin\                              # admin console (index.html, admin.css, admin.js)
└── out\                                # unused placeholder — ignore
```

The **22 pages** (file → page): index(home), hospital, search, notices, profile, emergency, departments, department(detail via `?dept=`), doctors, doctor(detail via `?name=`), opd, appointment, navigation, map, tests, test(detail via `?title=`), admissions, academics, academiccal, library, student, notifications.

---

## 5. Runtime behaviour (`assets/js/gmc.js`)

Boot sequence (flower of the app):
1. `document.addEventListener('DOMContentLoaded')` → `bootShell()` → `runPageInit()` → `initData()`.
2. `bootShell()` injects: status bar clock, bottom nav (only on the 5 main tab pages), EMERGENCY FAB + **MAP FAB** (see §8), and calls `initEmergency()` on the emergency page.
3. `runPageInit()` renders with current data (sample data sync first).
4. `initData()` fires an async XHR `GET /api/bootstrap`; **on success it re-renders the page in place** with real DB data. Render code writes via `innerHTML =` (idempotent). The only guarded spot is `initAppointment()` (resets the `<select>` and uses a `_submitBound` flag before binding the submit listener). If the XHR fails/404s (offline, `file://`, jsdom), the sample data render simply stays.

API field mapping in `initData()`: notices `{title→t, category→cat, cat_class→c, date→d, summary→s}`; notifications `{title→t, body→s, time→time, icon_bg→b, icon_col→col, unread}`.

Key globals/functions (all `onclick=` handlers must exist as globals — validated):
- `PAGES` map (`appointment:'appointment.html'`, etc.), `qp()` for query params, `go()`, `back()`.
- Detail pages: `department.html?dept=&issue=`, `doctor.html?name=&des=&dept=&spec=`, `test.html?title=&type=&sample=&prep=`.
- `navResult(title, sub, floor, point)`, `vice` search, `openTest()`, `mapLoc()` (geolocation → opens Paadha map in new tab + reports coords to `#locStatus`).

---

## 6. Design system (`assets/css/gmc.css`)

- Phone frame: `.frame` max-width 430px, centred; on ≥480px screens becomes a rounded "handset" mockup (92dvh, radius 28px).
- Tokens: primary `#1267B2`, teal `#0F9D8F`, bg `#F3F7FB`, text `#12324F`, danger `#D93025`, soft/amber/purple accents; 8px grid; Inter font; `--radius`/`--radius-lg`, shadow vars; `.bg` `.hidden` `.spacer` `.gap8` helpers.
- Components: `.appbar`, `.svc` service cards (in `.grid2`), `.chip` problem chips, `.infoitem`, `.notice`, `.dept-card`, `.doc`, `.filter-row` `.fchip`, `.daybook` OPD, `.tabs-scroll`, `.btn` (full-width), `.btn-primary`/`.btn-ghost`, `.note-callout`, `#toast`, `.fabwrap`/`.bn-fab`/`.bn-fab-label`.
- Home greet block uses the GMC logo as a layered gradient+image background. Splash (home only) fades via `.hide` then `display:none` after 1800ms. Greeting text is static **"Welcome to GMC Kozhikode"** (no time-based greeting).

---

## 7. Backend / API

Flask app `server/app.py`. Serves the site root via `/` and `/<path:path>` (directory indexes: `/admin/` → `admin/index.html`; traversal-guarded; HTML responses get `Cache-Control: no-cache`). Routes:

- `GET /api/bootstrap` → `{departments[], doctors[], notices[], notifications[], opd[] (grouped by day), emergency{phone,helpdesk}, auth{logged_in}}`. Departments include parsed `services[]`.
- `POST /api/appointments` → public appointment request `{name, phone, department, preferred_date, message}` → 201.
- `POST /api/auth/login|logout`, `GET /api/auth/me`. Sessions via Flask session cookie.
- `GET/POST /api/admin/<res>` and `PUT/DELETE /api/admin/<res>/<id>` → generic CRUD for departments, doctors, notices, notifications, opd (login required, 401 otherwise).
- `GET/PATCH/DELETE /api/admin/appointments[/<id>]` → admin list + status change.
- `GET/PUT /api/admin/emergency`, `POST /api/admin/password`.

SQLite schema (`server/schema.sql`): users, departments, doctors, notices, opd, notifications, appointments, emergency_settings. Seeded by `init_db.py`. **Default admin: `admin` / `admin123` — CHANGE IT via the Settings tab before real use.** Edit content through the admin console, NOT by hand in the DB.

---

## 8. Map feature (user-driven changes)

- External map: https://maps.paadha.com/ (GMC indoor map by Paadha). It **refuses to render inside an iframe** (verified), so we do NOT embed it.
- `map.html`: card with **"Locate me"** (`onclick="mapLoc()"`, geolocation via `navigator.geolocation.getCurrentPosition`, reports "You are here: lat, lng (±acc m)" into `#locStatus`), an **"Open map directly ↗"** ghost link, and a note. Older "Use my location & Get Directions" (Google Maps `dir`) button and the campus address were removed during iteration.
- **MAP FAB** (`.bn-fab-loc`): circular primary-blue floating button + "MAP" label, stacked ABOVE the emergency FAB in `.fabwrap` on every page; calls `mapLoc()`. This is how users access the location map now.
- Home page deliberately has **no** Hospital Map section or Locate-me card anymore (removed on request; the FAB replaces it). Navigation page links to `map.html` via an "Interactive Hospital Map" card.

---

## 9. Current feature state

Done:
- 22 generated pages; home/hospital grids show: Hospital Navigation, Doctor's Directory, OPD Schedule, Departments, Admissions (Book Appointment and Tests & Reports cards were REMOVED on request; underlying pages `appointment.html`/`tests.html` still exist).
- Backend + seeded DB + admin console (login → tabs: Departments, Doctors, Notices, OPD, Notifications, Appointments, Emergency, Settings; modal CRUD; appointment status; emergency phone/helpdesk; password change). Admin reachable from profile → "Admin Console".
- All validation green: jsdom 210/210; API integration 33/33.

Pending/notes:
- `appointment.html`, `tests.html`, `test.html` are built but no longer linked from the grids (user removed the entry cards). Ask before deleting entire pages.
- Emergency phone/helpdesk are placeholders until official numbers are provided; `#emPhone` only becomes tappable/dialable once a real number is stored via admin.
- Admin password is `admin/admin123`.

---

## 10. Validation

- jsdom suite checks: every internal link resolves; every `onclick`/`oninput` handler exists as a global; pages render content after async boot (home splash fade = 2000ms wait); filters/detail pages via `qp()`; bottomnav navigation; appointment form/dept options; map page handlers.
- Integration suite checks pages served (incl. `/admin/`), bootstrap payload shapes, appointment POST, login/logout/401, CRUD round-trip, emergency live update propagation, password change round-trip via PowerShell WebRequestSession (cookies shared).
- Both suites must pass after any change. Rebuild pages with `node tools/build.js` before validating.

---

## 11. Conventions & guardrails

- Edit page markup via `tools/build.js` + rebuild; NEVER hand-edit generated HTML.
- All `onclick` handlers must be functions in `gmc.js` (global scope, ES5, `var`).
- `innerHTML =` only (replace, not append) for re-renderable containers; guard any `addEventListener`.
- Keep design tokens/components consistent; phone-first UX.
- Lock the page stream: DON'T invent real GMC data; keep placeholders visibly marked.
- Server binds `0.0.0.0` so it's reachable at `127.0.0.1`/`localhost`/LAN. Browsers cache HTML — server sends `Cache-Control: no-cache`; tell users to hard-refresh.
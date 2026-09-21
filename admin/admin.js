/* GMC KOZHIKODE — Admin console */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var CATS = ['Clinical', 'Surgical', 'Super Speciality', 'Diagnostic', 'Other'];
  var NOTE_CATS = ['Hospital', 'Admission', 'Examination', 'Academics', 'General'];
  var NOTE_CLASSES = [
    ['cat-hosp', 'cat-hosp'], ['cat-acad', 'cat-acad'], ['cat-adm', 'cat-adm'],
    ['cat-exam', 'cat-exam'], ['cat-emo', 'cat-emo']
  ];
  var EVENT_CATS = ['Academic', 'Cultural', 'Community', 'Sports', 'Workshop', 'Other'];
  var EVENT_CLASSES = [
    ['cat-acad', 'cat-acad'], ['cat-adm', 'cat-adm'], ['cat-emo', 'cat-emo'],
    ['cat-exam', 'cat-exam'], ['cat-hosp', 'cat-hosp'], ['cat-res', 'cat-res']
  ];
  var SESSIONS = ['Morning', 'Afternoon'];

  // date/time helpers: stored as human text ("12 Nov 2026", "5:00 PM") <-> native inputs
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function toDateInput(v) {
    if (!v) return '';
    var m = String(v).match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (m) {
      var i = MONTHS.indexOf(m[2].charAt(0).toUpperCase() + m[2].slice(1).toLowerCase());
      if (i > -1) {
        var dd = m[1]; if (dd.length === 1) dd = '0' + dd;
        var mm = i + 1; var mmS = (mm < 10 ? '0' : '') + mm;
        return m[3] + '-' + mmS + '-' + dd;
      }
    }
    return v;
  }
  function fromDateInput(v) {
    if (!v) return '';
    var m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      var dd = parseInt(m[3], 10), mm = parseInt(m[2], 10);
      if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) return dd + ' ' + MONTHS[mm - 1] + ' ' + m[1];
    }
    return v;
  }
  function toTimeInput(v) {
    if (!v) return '';
    var t = String(v).trim();
    var m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m) {
      var h = parseInt(m[1], 10), mn = m[2];
      if (/pm/i.test(m[3]) && h < 12) h += 12;
      if (/am/i.test(m[3]) && h === 12) h = 0;
      return (h < 10 ? '0' : '') + h + ':' + mn;
    }
    return t;
  }
  function fromTimeInput(v) {
    if (!v) return '';
    var m = String(v).match(/^(\d{2}):(\d{2})$/);
    if (m) {
      var h = parseInt(m[1], 10), mn = m[2];
      var ap = h >= 12 ? 'PM' : 'AM';
      var h12 = h % 12 || 12;
      return h12 + ':' + mn + ' ' + ap;
    }
    return v;
  }

  // resource -> modal field definitions
  var FIELDS = {
    departments: [
      { k: 'name', label: 'Name *', type: 'text', req: true },
      { k: 'desc', label: 'Short description', type: 'text' },
      { k: 'cat', label: 'Category', type: 'select', options: CATS },
      { k: 'loc', label: 'Location / Building', type: 'text' },
      { k: 'opd', label: 'OPD timing', type: 'text' },
      { k: 'services', label: 'Services (comma separated)', type: 'list' }
    ],
    doctors: [
      { k: 'name', label: 'Name *', type: 'text', req: true },
      { k: 'des', label: 'Designation', type: 'text' },
      { k: 'dept', label: 'Department', type: 'text' },
      { k: 'spec', label: 'Speciality', type: 'text' }
    ],
    notices: [
      { k: 'title', label: 'Title *', type: 'text', req: true },
      { k: 'category', label: 'Category', type: 'select', options: NOTE_CATS },
      { k: 'cat_class', label: 'Badge class', type: 'select', options: NOTE_CLASSES },
      { k: 'date', label: 'Date', type: 'text' },
      { k: 'summary', label: 'Summary', type: 'textarea' }
    ],
    events: [
      { k: 'title', label: 'Title *', type: 'text', req: true },
      { k: 'category', label: 'Category', type: 'select', options: EVENT_CATS },
      { k: 'cat_class', label: 'Badge class', type: 'select', options: EVENT_CLASSES },
      { k: 'date', label: 'Date', type: 'date' },
      { k: 'venue', label: 'Venue', type: 'text' },
      { k: 'time', label: 'Time', type: 'time' },
      { k: 'summary', label: 'Summary', type: 'textarea' },
      { k: 'poster', label: 'Poster image (optional)', type: 'file' }
    ],
    opd: [
      { k: 'dept', label: 'Department', type: 'text' },
      { k: 'day', label: 'Day', type: 'select', options: DAYS },
      { k: 'session', label: 'Session', type: 'select', options: SESSIONS },
      { k: 'info', label: 'Info (e.g. "4 doctors available")', type: 'text' },
      { k: 'available', label: 'Available', type: 'checkbox' }
    ],
    notifications: [
      { k: 'title', label: 'Title *', type: 'text', req: true },
      { k: 'body', label: 'Body', type: 'textarea' },
      { k: 'time', label: 'Time label (e.g. "2h ago")', type: 'text' },
      { k: 'unread', label: 'Unread', type: 'checkbox' }
    ],
    users: [
      { k: 'username', label: 'Username *', type: 'text', req: true },
      { k: 'password', label: 'Password (min 6 chars) — leave blank when editing to keep current', type: 'password' },
      { k: 'role', label: 'Role', type: 'select', options: ['admin', 'editor'] }
    ]
  };

  var DEPT_NAMES = [];
  var CURRENT = null; // {id, row} being edited
  var RES_TYPE = null;

  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    return fetch(path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.error || r.statusText); e.status = r.status; throw e; }
        return j;
      });
    });
  }

  // ---------------- auth ----------------
  function checkAuth() {
    return api('/api/auth/me').then(function (m) {
      if (m.logged_in) {
        $('tb-user').textContent = 'Signed in as ' + (m.user && m.user.username);
        showDash();
      } else {
        showLogin();
      }
    }).catch(showLogin);
  }

  function showLogin() {
    $('login-view').classList.remove('hidden');
    $('dash-view').classList.add('hidden');
  }
  function showDash() {
    $('login-view').classList.add('hidden');
    $('dash-view').classList.remove('hidden');
    api('/api/admin/departments').then(function (ds) {
      DEPT_NAMES = (ds || []).map(function (d) { return d.name; });
    }).catch(function () {});
    switchTab('departments');
  }

  $('login-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    $('login-err').textContent = '';
    api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: $('login-user').value, password: $('login-pass').value })
    }).then(function () {
      checkAuth();
    }).catch(function (e) {
      $('login-err').textContent = e.message || 'Login failed';
    });
  });

  $('btn-logout').addEventListener('click', function () {
    api('/api/auth/logout', { method: 'POST' }).then(showLogin).catch(showLogin);
  });

  // ---------------- tabs ----------------
  var TABS = ['departments', 'doctors', 'notices', 'events', 'opd', 'notifications', 'appointments', 'emergency', 'users', 'settings'];

  function switchTab(t) {
    RES_TYPE = null;
    TABS.forEach(function (x) {
      var tb = document.querySelector('.tab[data-tab="' + x + '"]');
      if (tb) tb.classList.toggle('on', x === t);
      var p = $('panel-' + x);
      if (p) p.classList.toggle('on', x === t);
    });
    if (t === 'appointments') loadAppointments();
    else if (t === 'emergency') loadEmergency();
    else if (t === 'settings') { /* nothing */ }
    else loadTable(t);
  }

  document.getElementById('tabs').addEventListener('click', function (ev) {
    var t = ev.target.closest('.tab');
    if (t) switchTab(t.getAttribute('data-tab'));
  });

  // ---------------- tables ----------------
  var RENDER = {
    departments: function (r) {
      return '<td>' + r.id + '</td><td><b>' + esc(r.name) + '</b></td><td>' + esc(r.cat) + '</td>' +
        '<td>' + esc(r.loc) + '</td><td>' + esc(r.opd) + '</td><td><div class="svc-list">' +
        esc((r.services || []).join(', ')) + '</div></td>';
    },
    doctors: function (r) {
      return '<td>' + r.id + '</td><td><b>' + esc(r.name) + '</b></td><td>' + esc(r.des) + '</td>' +
        '<td>' + esc(r.dept) + '</td><td>' + esc(r.spec) + '</td>';
    },
    notices: function (r) {
      return '<td>' + r.id + '</td><td><b>' + esc(r.title) + '</b></td><td>' + esc(r.category) + '</td>' +
        '<td>' + esc(r.date) + '</td><td>' + esc(r.cat_class) + '</td>';
    },
    events: function (r) {
      var poster = r.poster
        ? '<div style="display:flex;align-items:center;gap:6px"><img class="thumb" src="' + esc(r.poster) + '" alt="poster">' +
          '<button class="btn ghost" data-delposter="' + r.id + '" title="Remove poster" style="padding:3px 8px;font-size:12px">&#10005;</button></div>'
        : '<span class="mild">—</span>';
      return '<td>' + r.id + '</td><td><b>' + esc(r.title) + '</b></td><td>' + esc(r.category) + '</td>' +
        '<td>' + esc(r.date) + '</td><td>' + esc(r.venue) + '</td><td>' + esc(r.time) + '</td><td>' + poster + '</td>';
    },
    opd: function (r) {
      return '<td>' + r.id + '</td><td>' + esc(r.dept) + '</td><td>' + esc(r.day) + '</td>' +
        '<td>' + esc(r.session) + '</td><td>' + esc(r.info) + '</td>' +
        '<td><span class="pill ' + (r.available ? 'done' : 'new') + '">' + (r.available ? 'Yes' : 'No') + '</span></td>';
    },
    notifications: function (r) {
      return '<td>' + r.id + '</td><td><b>' + esc(r.title) + '</b></td><td>' + esc(r.body) + '</td>' +
        '<td>' + esc(r.time) + '</td><td><span class="pill ' + (r.unread ? 'new' : 'done') + '">' +
        (r.unread ? 'Unread' : 'Read') + '</span></td>';
    },
    users: function (r) {
      return '<td>' + r.id + '</td><td><b>' + esc(r.username) + '</b></td><td>' + esc(r.role) + '</td><td>' +
        esc(r.created_at) + '</td>';
    }
  };

  function loadTable(res) {
    var tbody = $('tb-' + res);
    tbody.innerHTML = '<tr><td colspan="9" style="color:var(--mild)">Loading…</td></tr>';
    api('/api/admin/' + res).then(function (rows) {
      var html = '';
      (rows || []).forEach(function (r) {
        var posterBtn = res === 'events'
          ? '<button class="btn ghost" data-poster="' + r.id + '" title="Upload poster">&#8593; Poster</button>'
          : '';
        html += '<tr>' + RENDER[res](r) + '<td class="act">' + posterBtn +
          '<button class="btn" data-edit="' + r.id + '" data-res="' + res + '">Edit</button>' +
          '<button class="btn danger" data-del="' + r.id + '" data-res="' + res + '">Del</button></td></tr>';
      });
      tbody.innerHTML = html || '<tr><td colspan="9" style="color:var(--mild)">No records</td></tr>';
    }).catch(function (e) {
      tbody.innerHTML = '<tr><td colspan="9" style="color:var(--danger)">' + esc(e.message) + '</td></tr>';
    });
  }

  // ---------------- appointments (admin) ----------------
  function loadAppointments() {
    var tbody = $('tb-appointments');
    tbody.innerHTML = '<tr><td colspan="9" style="color:var(--mild)">Loading…</td></tr>';
    api('/api/admin/appointments').then(function (rows) {
      var html = '';
      (rows || []).forEach(function (a) {
        html += '<tr><td>' + a.id + '</td><td><b>' + esc(a.name) + '</b></td><td>' + esc(a.phone) + '</td>' +
          '<td>' + esc(a.department) + '</td><td>' + esc(a.preferred_date) + '</td><td>' + esc(a.message) + '</td>' +
          '<td><select class="l-input st" data-st="' + a.id + '" style="padding:6px 8px;border-radius:9px">' +
          ['new', 'done', 'cancelled'].map(function (s) {
            return '<option value="' + s + '"' + (s === a.status ? ' selected' : '') + '>' + s + '</option>';
          }).join('') + '</select></td>' +
          '<td>' + esc(a.created_at) + '</td>' +
          '<td class="act"><button class="btn danger" data-delapp="' + a.id + '">Del</button></td></tr>';
      });
      tbody.innerHTML = html || '<tr><td colspan="9" style="color:var(--mild)">No appointment requests</td></tr>';
      tbody.querySelectorAll('.st').forEach(function (sel) {
        sel.addEventListener('change', function () {
          var id = sel.getAttribute('data-st');
          api('/api/admin/appointments/' + id, { method: 'PATCH', body: JSON.stringify({ status: sel.value }) })
            .then(function () { loadAppointments(); }).catch(function () {});
        });
      });
      tbody.querySelectorAll('[data-delapp]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!confirm('Delete this appointment?')) return;
          api('/api/admin/appointments/' + b.getAttribute('data-delapp'), { method: 'DELETE' })
            .then(loadAppointments).catch(function () {});
        });
      });
    }).catch(function () {});
  }

  // ---------------- emergency ----------------
  function loadEmergency() {
    api('/api/admin/emergency').then(function (e) {
      $('em-phone').value = e.phone || '';
      $('em-help').value = e.helpdesk || '';
    }).catch(function () {});
  }
  $('em-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    $('em-msg').textContent = 'Saving…';
    api('/api/admin/emergency', {
      method: 'PUT',
      body: JSON.stringify({ phone: $('em-phone').value, helpdesk: $('em-help').value })
    }).then(function () {
      $('em-msg').textContent = 'Saved. Emergency number now live on the site.';
    }).catch(function (e) {
      $('em-msg').textContent = e.message || 'Save failed';
    });
  });

  // ---------------- password ----------------
  $('pw-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    $('pw-msg').textContent = '';
    api('/api/admin/password', {
      method: 'POST',
      body: JSON.stringify({ old: $('pw-old').value, new: $('pw-new').value })
    }).then(function () {
      $('pw-msg').textContent = 'Password updated.';
      $('pw-old').value = ''; $('pw-new').value = '';
    }).catch(function (e) {
      $('pw-msg').textContent = e.message || 'Could not update';
    });
  });

  // ---------------- modal form ----------------
  function buildModal(res, row) {
    RES_TYPE = res;
    CURRENT = row || null;
    $('modal-title').textContent = (CURRENT ? 'Edit' : 'New') + ' ' + res.replace(/s$/, '');
    var html = '';
    FIELDS[res].forEach(function (f) {
      var val = CURRENT ? CURRENT[f.k] : '';
      html += '<label class="l-label">' + f.label + '</label>';
      if (f.type === 'select') {
        var opts = f.options.map(function (o) {
          var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
          return '<option value="' + esc(v) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
        }).join('');
        html += '<select class="l-input" name="' + f.k + '">' + opts + '</select>';
      } else if (f.type === 'textarea') {
        html += '<textarea class="l-input" rows="2" name="' + f.k + '">' + esc(val) + '</textarea>';
      } else if (f.type === 'checkbox') {
        html += '<div style="display:flex;align-items:center;gap:8px;margin-top:2px"><input type="checkbox" name="' + f.k + '"' + (val ? ' checked' : '') + '></div>';
      } else if (f.type === 'file') {
        var cur = CURRENT ? (CURRENT[f.k] || '') : '';
        html += '<input class="l-input" type="file" name="' + f.k + '" accept="image/*">';
        html += '<div class="l-hint">' + (cur ? 'Current poster: ' + esc(cur) : 'No poster yet') + '. Upload replaces it.</div>';
      } else if (f.type === 'list') {
        html += '<input class="l-input" name="' + f.k + '" value="' + esc(Array.isArray(val) ? val.join(', ') : val) + '">';
      } else if (f.type === 'password') {
        html += '<input class="l-input" type="password" name="' + f.k + '" value="' + esc(val) + '" autocomplete="new-password">';
      } else if (f.type === 'date') {
        html += '<input class="l-input" type="date" name="' + f.k + '" value="' + esc(toDateInput(val)) + '">';
      } else if (f.type === 'time') {
        html += '<input class="l-input" type="time" name="' + f.k + '" value="' + esc(toTimeInput(val)) + '">';
      } else {
        html += '<input class="l-input" name="' + f.k + '" value="' + esc(val) + '">';
      }
    });
    $('modal-fields').innerHTML = html;
    $('modal-remove').style.display = CURRENT ? 'inline-block' : 'none';
    $('modal').classList.remove('hidden');
  }

  $('modal-close').addEventListener('click', closeModal);
  $('modal-cancel').addEventListener('click', closeModal);
  $('modal-remove').addEventListener('click', function () {
    if (!CURRENT || !confirm('Delete this record?')) return;
    api('/api/admin/' + RES_TYPE + '/' + CURRENT.id, { method: 'DELETE' }).then(function () {
      closeModal(); loadTable(RES_TYPE);
    }).catch(function () {});
  });

  function closeModal() {
    $('modal').classList.add('hidden');
    CURRENT = null; RES_TYPE = null;
  }

  $('modal-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var data = {};
    var pendingFile = null;
    FIELDS[RES_TYPE].forEach(function (f) {
      var el = document.querySelector('#modal-form [name="' + f.k + '"]');
      if (!el) return;
      if (f.type === 'file') {
        if (el.files && el.files[0]) pendingFile = el.files[0];
        return;
      }
      if (f.type === 'checkbox') data[f.k] = el.checked ? 1 : 0;
      else if (f.type === 'date') data[f.k] = fromDateInput(el.value);
      else if (f.type === 'time') data[f.k] = fromTimeInput(el.value);
      else if (f.type === 'list') data[f.k] = el.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      else data[f.k] = el.value;
    });
    var need = FIELDS[RES_TYPE].filter(function (f) { return f.req; }).some(function (f) { return !String(data[f.k] || '').trim(); });
    if (need) { alert('Please fill required fields marked *'); return; }
    if (RES_TYPE === 'users' && !CURRENT && !String(data.password || '').trim()) {
      alert('Please set a password for the new admin'); return;
    }
    if (RES_TYPE === 'users' && CURRENT) delete data.username;
    var isNew = !CURRENT;
    var url = '/api/admin/' + RES_TYPE + (CURRENT ? '/' + CURRENT.id : '');
    api(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(data) }).then(function (j) {
      var id = CURRENT ? CURRENT.id : j.id;
      if (pendingFile) {
        uploadEventPoster(id, pendingFile, function (err) {
          closeModal(); loadTable(RES_TYPE);
          if (err) alert('Event saved, but poster upload failed: ' + err);
        });
      } else {
        closeModal(); loadTable(RES_TYPE);
      }
    }).catch(function (e) { alert(e.message || 'Save failed'); });
  });

  function uploadEventPoster(id, file, done) {
    var fd = new FormData();
    fd.append('poster', file);
    fetch('/api/admin/events/' + id + '/poster', { method: 'POST', body: fd })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) { throw new Error(j.error || 'Upload failed'); }
          return j;
        });
      })
      .then(function () { done(null); })
      .catch(function (e) { done(e.message || 'Upload failed'); });
  }

  //-------- events poster: one-click upload with visible status --------
  function posterMsg(text, isErr) {
    var el = $('events-msg');
    if (el) { el.textContent = text; el.className = 'events-msg' + (isErr ? ' err' : ''); }
  }

  function uploadPosterClick(id) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      document.body.removeChild(input);
      if (!file) return;
      posterMsg('Uploading poster\u2026', false);
      uploadEventPoster(id, file, function (err) {
        if (err) { posterMsg('Upload failed: ' + err, true); return; }
        posterMsg('Poster uploaded successfully.', false);
        loadTable('events');
      });
    });
    input.click();
  }

  // ---------------- delegation for edit/delete buttons ----------------
  document.querySelectorAll('[id^="tb-"]').forEach(function (tbody) {
    tbody.addEventListener('click', function (ev) {
      var ed = ev.target.closest('[data-edit]');
      var del = ev.target.closest('[data-del]');
      var poster = ev.target.closest('[data-poster]');
      var delposter = ev.target.closest('[data-delposter]');
      if (delposter) {
        if (!confirm('Remove this event poster?')) return;
        fetch('/api/admin/events/' + delposter.getAttribute('data-delposter') + '/poster', { method: 'DELETE' })
          .then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (j) {
            posterMsg((j && j.ok) ? 'Poster removed.' : 'Could not remove poster.', !(j && j.ok));
            loadTable('events');
          })
          .catch(function () { posterMsg('Could not remove poster.', true); });
        return;
      }
      if (poster) {
        uploadPosterClick(poster.getAttribute('data-poster'));
        return;
      }
      if (del) {
        if (!confirm('Delete this record?')) return;
        api('/api/admin/' + del.getAttribute('data-res') + '/' + del.getAttribute('data-del'), { method: 'DELETE' })
          .then(function () { loadTable(del.getAttribute('data-res')); }).catch(function () {});
        return;
      }
      if (ed) {
        var res = ed.getAttribute('data-res'); var id = ed.getAttribute('data-edit');
        api('/api/admin/' + res).then(function (rows) {
          var row = (rows || []).filter(function (r) { return String(r.id) === String(id); })[0];
          if (row) buildModal(res, row);
        }).catch(function () {});
      }
    });
  });

  // "New" buttons
  document.querySelectorAll('.new').forEach(function (btn) {
    btn.addEventListener('click', function () {
      buildModal(btn.getAttribute('data-res'), null);
    });
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  checkAuth();
})();
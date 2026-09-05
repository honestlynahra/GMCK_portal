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
  var SESSIONS = ['Morning', 'Afternoon'];

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
  var TABS = ['departments', 'doctors', 'notices', 'opd', 'notifications', 'appointments', 'emergency', 'settings'];

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
    opd: function (r) {
      return '<td>' + r.id + '</td><td>' + esc(r.dept) + '</td><td>' + esc(r.day) + '</td>' +
        '<td>' + esc(r.session) + '</td><td>' + esc(r.info) + '</td>' +
        '<td><span class="pill ' + (r.available ? 'done' : 'new') + '">' + (r.available ? 'Yes' : 'No') + '</span></td>';
    },
    notifications: function (r) {
      return '<td>' + r.id + '</td><td><b>' + esc(r.title) + '</b></td><td>' + esc(r.body) + '</td>' +
        '<td>' + esc(r.time) + '</td><td><span class="pill ' + (r.unread ? 'new' : 'done') + '">' +
        (r.unread ? 'Unread' : 'Read') + '</span></td>';
    }
  };

  function loadTable(res) {
    var tbody = $('tb-' + res);
    tbody.innerHTML = '<tr><td colspan="9" style="color:var(--mild)">Loading…</td></tr>';
    api('/api/admin/' + res).then(function (rows) {
      var html = '';
      (rows || []).forEach(function (r) {
        html += '<tr>' + RENDER[res](r) + '<td class="act">' +
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
      } else if (f.type === 'list') {
        html += '<input class="l-input" name="' + f.k + '" value="' + esc(Array.isArray(val) ? val.join(', ') : val) + '">';
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
    FIELDS[RES_TYPE].forEach(function (f) {
      var el = document.querySelector('#modal-form [name="' + f.k + '"]');
      if (!el) return;
      if (f.type === 'checkbox') data[f.k] = el.checked ? 1 : 0;
      else if (f.type === 'list') data[f.k] = el.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      else data[f.k] = el.value;
    });
    var need = FIELDS[RES_TYPE].filter(function (f) { return f.req; }).some(function (f) { return !String(data[f.k] || '').trim(); });
    if (need) { alert('Please fill required fields marked *'); return; }
    var isNew = !CURRENT;
    var url = '/api/admin/' + RES_TYPE + (CURRENT ? '/' + CURRENT.id : '');
    api(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(data) }).then(function () {
      closeModal(); loadTable(RES_TYPE);
    }).catch(function (e) { alert(e.message || 'Save failed'); });
  });

  // ---------------- delegation for edit/delete buttons ----------------
  document.querySelectorAll('[id^="tb-"]').forEach(function (tbody) {
    tbody.addEventListener('click', function (ev) {
      var ed = ev.target.closest('[data-edit]');
      var del = ev.target.closest('[data-del]');
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
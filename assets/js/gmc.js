/* ============================================================
   GMC KOZHIKODE — App logic (shared across all pages)
   ============================================================ */

function $(id){ return document.getElementById(id); }

var PAGES = {
  home:'index.html', hospital:'hospital.html', search:'search.html',
  notices:'notices.html', profile:'profile.html', emergency:'emergency.html',
  departments:'departments.html', department:'department.html',
  doctors:'doctors.html', doctor:'doctor.html',
  opd:'opd.html', navigation:'navigation.html',
  tests:'tests.html', test:'test.html',
  admissions:'admissions.html', academics:'academics.html',
  student:'student.html', notifications:'notifications.html',
  appointment:'appointment.html'
};

function go(id){ location.href = PAGES[id] || 'index.html'; }
function back(){ if(window.history.length > 1){ history.back(); } else { location.href = 'index.html'; } }
function qp(name){ return new URLSearchParams(window.location.search).get(name); }
function toast(msg){
  var el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(function(){ el.classList.remove('show'); }, 2300);
}

/* site-wide loading screen: fade out and remove */
function hideSplash(){
  var sp = document.getElementById('splash');
  if(!sp) return;
  sp.classList.add('hide');
  setTimeout(function(){ if(sp && sp.parentNode) sp.parentNode.removeChild(sp); }, 500);
}

/* the loading screen plays once per session, on the first site load only */
function initSplash(){
  var sp = document.getElementById('splash');
  if(!sp) return;
  var first = false;
  try{ first = sessionStorage.getItem('gmc_splash_once') !== '1'; }catch(e){}
  if(!first){ sp.style.display = 'none'; return; }
  try{ sessionStorage.setItem('gmc_splash_once', '1'); }catch(e){}
}

/* ---------- boot: injects bottom nav, emergency FAB, toast ---------- */
document.addEventListener('DOMContentLoaded', function(){
  bootShell();

  /* loading screen: show only on the first site load this session */
  initSplash();

  /* first-visit onboarding: until language is chosen, direct every page to Welcome */
  if(document.body.id !== 'page-welcome' && document.body.id !== 'page-language' && !getOnboard()){
    location.replace('welcome.html');
    return;
  }

  runPageInit();
  initData();
});

function getLang(){ try{ return localStorage.getItem('gmc_lang'); }catch(e){ return null; } }
function setLang(c){ try{ localStorage.setItem('gmc_lang', c); }catch(e){} }
function getOnboard(){ try{ return localStorage.getItem('gmc_onboard'); }catch(e){ return null; } }
function setOnboard(){ try{ localStorage.setItem('gmc_onboard', '1'); }catch(e){} }

/* injects the shared chrome (bottom nav, FAB) */
function bootShell(){
  /* bottom nav (only on main tab pages) */
  var nav = document.getElementById('bottomnav');
  if(nav){
    var tab = document.body.getAttribute('data-tab') || 'home';
    var items = [
      ['home','Home','<path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-10.5z"/>'],
      ['hospital','Hospital','<path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-5h6v5M9 12h.01M15 12h.01M12 12h.01"/>'],
      ['search','Search','<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'],
      ['notices','Notices','<path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 9h8M8 13h5"/>'],
      ['profile','Profile','<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>']
    ];
    var html = '';
    items.forEach(function(it){
      html += '<a class="bn-item' + (it[0] === tab ? ' on' : '') + '" href="' + PAGES[it[0]] + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + it[2] + '</svg>' +
        '<span class="bn-l">' + it[1] + '</span></a>';
    });
    nav.innerHTML = html;
  }

  /* emergency FAB */
  var fab = document.getElementById('bnfab');
  if(fab){
    fab.setAttribute('href', PAGES.emergency);
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/></svg>';
  }

  /* onboarding screens have no floating buttons */
  if(document.body.id === 'page-language' || document.body.id === 'page-welcome'){
    var fw = document.querySelector('.fabwrap');
    if(fw) fw.style.display = 'none';
  }

  if(document.body.id === 'page-emergency') initEmergency();
}

/* loads real data from the backend; when it arrives, re-renders the page in place */
function initData(){
  var start = Date.now();
  var HIDDEN = false;
  function finish(now){
    if(HIDDEN) return;
    HIDDEN = true;
    var wait = now ? 0 : (3000 - (Date.now() - start));
    if(wait > 0){ setTimeout(hideSplash, wait); } else { hideSplash(); }
  }
  setTimeout(finish, 3500);
  try{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/bootstrap', true);
    xhr.onload = function(){
      if(xhr.status === 200){
        try{
          var d = JSON.parse(xhr.responseText);
          var used = false;
          if(d.departments){ DEPTS = d.departments; used = true; }
          if(d.doctors){ DOCS = d.doctors; used = true; }
          if(d.notices){ NOTICES = d.notices.map(function(n){
            return {t:n.title, cat:n.category, c:n.cat_class, d:n.date, s:n.summary};
          }); used = true; }
          if(d.notifications){ NOTIFS = d.notifications.map(function(n){
            return {t:n.title, s:n.body, time:n.time, b:n.icon_bg, col:n.icon_col, unread:!!n.unread};
          }); used = true; }
          if(d.events){ EVENTS = d.events.map(function(e){
            return {t:e.title, cat:e.category, c:e.cat_class, d:e.date, venue:e.venue, time:e.time, s:e.summary, poster:e.poster || ''};
          }); used = true; }
          if(d.opd){ OPD = d.opd; used = true; }
          if(d.emergency){ EMERGENCY = d.emergency; used = true; }
          if(used) runPageInit();
        }catch(e){}
      }
      finish();
    };
    xhr.onerror = finish;
    xhr.ontimeout = finish;
    xhr.timeout = 3000;
    xhr.send();
  }catch(e){ finish(true); }
}

function initEmergency(){
  var btn = document.getElementById('emPhone');
  if(btn && EMERGENCY && EMERGENCY.phone && EMERGENCY.phone.indexOf('Placeholder') === -1){
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.6 2z"/></svg>' + EMERGENCY.phone;
    var hd = document.getElementById('emHelp');
    if(hd && EMERGENCY.helpdesk) hd.textContent = EMERGENCY.helpdesk;
  }
}

/* ---------- language selection ---------- */
function initLanguage(){
  var c = document.getElementById('langCards');
  if(!c) return;
  setTimeout(function(){ c.classList.add('show'); }, 1500);
}

function startOnboarding(){
  location.href = 'language.html';
}

function pickLang(code){
  setLang(code);
  setOnboard();
  location.href = 'index.html';
}

/* ---------- map: locate me on the Paadha map ---------- */
function mapLoc(){
  var st = document.getElementById('locStatus');
  window.open('https://maps.paadha.com/', '_blank', 'noopener');
  if(!st) return;
  st.innerHTML = 'Reading your location…';
  if(!window.navigator || !window.navigator.geolocation){
    st.innerHTML = 'Location is not supported on this device. Map opened in a new tab.';
    return;
  }
  window.navigator.geolocation.getCurrentPosition(
    function(pos){
      var lat = pos.coords.latitude.toFixed(5),
          lng = pos.coords.longitude.toFixed(5),
          acc = Math.round(pos.coords.accuracy || 0);
      st.innerHTML = '<b>You are here:</b> ' + lat + ', ' + lng + ' (within ' + acc + ' m). Map opened in a new tab.';
    },
    function(err){
      var msg = (err && err.code === 1) ? 'Location access was denied.' : 'Location is unavailable right now.';
      st.innerHTML = msg + ' Map opened in a new tab.';
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );
}

/* ---------- page-init switch ---------- */
function runPageInit(){
  var id = document.body.id;
  switch(id){
    case 'page-home':        initHome(); break;
    case 'page-language':    initLanguage(); break;
    case 'page-departments': renderDepts('All'); break;
    case 'page-department':  renderDeptDetail(); break;
    case 'page-doctors':     renderDocs('All Doctors'); break;
    case 'page-doctor':      renderDocProfile(); break;
    case 'page-opd':         renderOpd(); break;
    case 'page-notices':     renderNotices('All'); break;
    case 'page-events':      renderEvents(); break;
    case 'page-profile':     renderProfile(); break;
    case 'page-admissions':  renderAdmissions(); break;
    case 'page-notifications': renderNotifs(); break;
    case 'page-test':        renderTestDetail(); break;
    case 'page-appointment': initAppointment(); break;
  }
}

var OPD = null;      // set from /api/bootstrap; falls back to sample below
var EMERGENCY = null;

/* ============================================================
   HOME
   ============================================================ */
function initHome(){
  var el = $('greetHello'); if(el) el.textContent = 'Welcome to GMC Kozhikode';

  var html = '';
  NOTICES.slice(0, 3).forEach(function(n){
    html += '<div class="notice" onclick="go(\'notices\')"><div class="notice-top">' +
      '<span class="cat ' + n.c + '">' + n.cat + '</span><span class="n-date">' + n.d + '</span></div>' +
      '<h3>' + n.t + '</h3><div class="n-foot"><span class="readmore" onclick="event.stopPropagation();go(\'notices\')">Read more <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></div></div>';
  });
  if($('homeNotices')) $('homeNotices').innerHTML = html;
}

/* problem chip → recommended department */
function problem(dept, label){ openDept(dept, label); }

/* ============================================================
   DEPARTMENTS (list + filters) & DEPARTMENT DETAIL page
   ============================================================ */
function findDept(name){ return DEPTS.filter(function(d){ return d.name === name; })[0]; }

function deptBadgeClass(cat){
  if(cat === 'Super Speciality') return 'badge-super';
  if(cat === 'Diagnostic') return 'badge-diagnostic';
  if(cat === 'Surgical') return 'badge-surgical';
  return 'badge-clinical';
}

function deptCard(d, compact){
  var badge = deptBadgeClass(d.cat);
  var meta = compact
    ? '<div class="d-meta"><span class="dm">' + icv(ICONS.pin) + d.loc + '</span><span class="dm">' + icv(ICONS.cal) + 'OPD: Sample</span></div>'
    : '<div class="d-meta"><span class="dm">' + icv(ICONS.pin) + d.loc + '</span><span class="dm">' + icv(ICONS.cal) + d.opd + '</span></div>';
  return '<a class="dept-card" href="department.html?dept=' + encodeURIComponent(d.name) + '"><span class="badge-tag ' + badge + '">' + d.cat + '</span>' +
    '<div class="d-head"><div class="d-ic" style="background:var(--primary-light);color:var(--primary)"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/></svg></div>' +
    '<div><div class="d-name">' + d.name + '</div><div class="d-desc">' + d.desc + '</div></div></div>' +
    meta +
    '<div class="d-foot"><span class="view">View ' + icv(ICONS.chev) + '</span><span style="font-size:11px;color:var(--text-mild)">Sample data</span></div></a>';
}
function icv(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }

function renderDepts(cat){
  var list = cat === 'All' ? DEPTS : DEPTS.filter(function(d){ return d.cat === cat; });
  var html = '';
  list.forEach(function(d){ html += deptCard(d, false); });
  $('deptList').innerHTML = html || emptyState('No departments in this category yet');
}
function filterDept(cat, el){
  var chips = document.querySelectorAll('#deptFilters .fchip');
  for(var i = 0; i < chips.length; i++) chips[i].classList.remove('on');
  if(el) el.classList.add('on');
  renderDepts(cat);
}

function openDept(name, issue){ location.href = 'department.html?dept=' + encodeURIComponent(name) + (issue ? '&issue=' + encodeURIComponent(issue) : ''); }

function renderDeptDetail(){
  var name = qp('dept'), issue = qp('issue');
  var d = findDept(name);
  if(!d){ $('deptDetailBody').innerHTML = emptyState('Department not found (sample data)') + '<div class="sec"><a class="btn btn-ghost" href="departments.html">Browse departments</a></div>'; return; }
  var docs = DOCS.filter(function(x){ return x.dept === name; });
  var docHtml = '';
  docs.forEach(function(dr){ docHtml += docCard(dr); });
  var issueBanner = issue ? '<div style="display:inline-block;background:rgba(255,255,255,.22);padding:5px 13px;border-radius:20px;font-size:12px;font-weight:700;margin-top:12px;">Recommended for &ldquo;' + issue + '&rdquo;</div>' : '';
  $('deptDetailBody').innerHTML =
    '<div class="dept-header"><div class="dhi"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/></svg></div>' +
    '<h1>' + d.name + '</h1><p>' + d.desc + '</p>' + issueBanner + '</div>' +
    '<div style="margin-top:16px;">' +
    '<div class="infocard"><div class="ic-head">' + icv(ICONS.pin) + 'Location</div>' +
    '<div class="ic-row"><span class="k">Building</span><span class="v">' + d.loc + '</span></div>' +
    '<div class="ic-row"><span class="k">Floor</span><span class="v">Sample (Ground/1st)</span></div></div>' +
    '<div class="infocard"><div class="ic-head">' + icv(ICONS.cal) + 'OPD Timing</div>' +
    '<div class="ic-row"><span class="k">Official timing</span><span class="v">Sample placeholder</span></div>' +
    '<div class="ic-row"><span class="k">OPD days</span><span class="v">Mon–Sat</span></div></div>' +
    '<div class="infocard"><div class="ic-head">' + icv('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>') + 'Services</div>' +
    d.services.map(function(s){ return '<div class="ic-row"><span class="k">&bull;</span><span class="v" style="text-align:left">' + s + '</span></div>'; }).join('') + '</div>' +
    '<div class="sec" style="margin-top:18px"><h2>Doctors</h2></div>' +
    (docHtml || '<div class="notice"><p>Doctor details will be available soon (sample data).</p></div>') +
    '<div style="display:grid;gap:11px;margin-top:6px;">' +
    '<a class="btn btn-primary" href="opd.html">' + icv(ICONS.cal) + 'OPD Information</a>' +
    '<a class="btn btn-primary outline" href="navigation.html">' + icv(ICONS.pin) + 'Get Directions</a>' +
    '<button class="btn btn-ghost" onclick="toast(\'Contact — placeholder until official number connected.\')">' + icv('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.6 2z"/>') + 'Contact</button>' +
    '</div></div>';
}

/* ============================================================
   DOCTORS (directory + profile page)
   ============================================================ */
function renderDocs(cat){
  var list = (cat && cat !== 'All Doctors') ? DOCS.filter(function(d){ return d.dept === cat; }) : DOCS;
  var html = '';
  list.forEach(function(d){ html += docCard(d); });
  $('docList').innerHTML = html || emptyState('No doctors in this department yet');
}
function filterDocCat(cat, el){
  var chips = document.querySelectorAll('#docFilters .fchip');
  for(var i = 0; i < chips.length; i++) chips[i].classList.remove('on');
  if(el) el.classList.add('on');
  renderDocs(cat);
}
function filterDocs(q){
  q = (q || '').toLowerCase();
  var html = '';
  DOCS.filter(function(d){ return !q || d.name.toLowerCase().indexOf(q) > -1 || d.dept.toLowerCase().indexOf(q) > -1 || d.spec.toLowerCase().indexOf(q) > -1; })
    .forEach(function(d){ html += docCard(d); });
  $('docList').innerHTML = html || emptyState('No doctors found');
}
function docCard(d){
  return '<a class="doc" href="doctor.html?name=' + encodeURIComponent(d.name) + '&des=' + encodeURIComponent(d.des) + '&dept=' + encodeURIComponent(d.dept) + '&spec=' + encodeURIComponent(d.spec) + '">' +
    '<div class="doc-avatar"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg></div>' +
    '<div class="doc-t"><div class="doc-name">' + d.name + '</div><div class="doc-des">' + d.des + '</div><div class="doc-spec">' + d.dept + ' &middot; ' + d.spec + '</div></div>' +
    '<span class="doc-a">' + icv(ICONS.chev) + '</span></a>';
}
function renderDocProfile(){
  var name = qp('name'), des = qp('des'), dept = qp('dept'), spec = qp('spec');
  if(!name){ $('docProfileBody').innerHTML = emptyState('Doctor not found (sample data)') + '<div class="sec"><a class="btn btn-ghost" href="doctors.html">Browse doctors</a></div>'; return; }
  $('docProfileBody').innerHTML =
    '<div style="text-align:center;padding-top:12px;">' +
    '<div class="doc-avatar" style="width:92px;height:92px;margin:0 auto 14px;color:var(--primary)"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg></div>' +
    '<div style="font-size:20px;font-weight:800;">' + name + '</div>' +
    '<div style="font-size:14px;color:var(--teal);font-weight:700;margin-top:3px;">' + des + '</div>' +
    '<div style="font-size:13px;color:var(--text-mild);margin-top:3px;">' + dept + '</div>' +
    '<span class="cat cat-hosp" style="display:inline-block;margin-top:12px;background:var(--teal-light);color:var(--teal)">' + spec + '</span>' +
    '<div style="font-size:11px;color:var(--text-mild);margin-top:12px;">Sample placeholder data until official records are verified</div></div>' +
    '<div style="margin-top:18px;">' +
    '<div class="infocard"><div class="ic-head">' + icv(ICONS.cal) + 'OPD Schedule</div>' +
    '<div class="ic-row"><span class="k">Days</span><span class="v">Mon–Sat (sample)</span></div>' +
    '<div class="ic-row"><span class="k">Morning</span><span class="v">Sample timing</span></div>' +
    '<div class="ic-row"><span class="k">Afternoon</span><span class="v">Sample timing</span></div></div>' +
    '<div class="infocard"><div class="ic-head">' + icv(ICONS.pin) + 'Location</div>' +
    '<div class="ic-row"><span class="k">Department</span><span class="v">' + dept + '</span></div>' +
    '<div class="ic-row"><span class="k">Building</span><span class="v">Sample</span></div></div>' +
    '<div style="display:grid;gap:11px;">' +
    '<a class="btn btn-primary" href="opd.html">' + icv(ICONS.cal) + 'View OPD</a>' +
    '<a class="btn btn-primary outline" href="navigation.html">' + icv(ICONS.pin) + 'Get Directions</a></div></div>';
}

/* ============================================================
   OPD
   ============================================================ */
function renderOpd(){
  var rows = (OPD && OPD.length) ? OPD : OPD_FALLBACK();
  var mh = '', ah = '';
  rows.forEach(function(r){
    mh += opdRow(r.day, r.morning);
    ah += opdRow(r.day, r.afternoon || r.morning);
  });
  $('opdMorning').innerHTML = mh;
  $('opdAfternoon').innerHTML = ah;
}
function opdRow(day, info){
  var closed = /no opd|closed|unavailable/i.test(info || '');
  var badge = closed ? '<span class="db-av no">Closed</span>' : '<span class="db-av">Available</span>';
  return '<div class="db-row"><div class="db-day">' + day + '</div><div class="db-d">' + (info || 'Sample') + '</div>' + badge + '</div>';
}
function OPD_FALLBACK(){
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.map(function(d, i){
    return {day: d, morning: (i === 5 ? 'Limited OPD' : '<b>Sample</b> &bull; OPD'), afternoon: '<b>Sample</b> &bull; OPD'};
  });
}

/* ============================================================
   NOTICES
   ============================================================ */
function renderNotices(cat){
  var list = cat === 'All' ? NOTICES : NOTICES.filter(function(n){ return n.cat.toLowerCase().indexOf(cat.toLowerCase()) > -1; });
  var html = '';
  list.forEach(function(n){
    html += '<div class="notice" onclick="toast(\'Notice placeholder — connect official notices.\')"><div class="notice-top">' +
      '<span class="cat ' + n.c + '">' + n.cat + '</span><span class="n-date">' + n.d + '</span></div>' +
      '<h3>' + n.t + '</h3><p>' + n.s + '</p><div class="n-foot"><span class="readmore">Read More ' + icv(ICONS.chev) + '</span></div></div>';
  });
  $('noticeList').innerHTML = html || emptyState('No notices in this category');
}
function filterNotice(cat, el){
  var tabs = document.querySelectorAll('#noticeTabs .tabbar');
  for(var i = 0; i < tabs.length; i++) tabs[i].classList.remove('on');
  if(el) el.classList.add('on');
  renderNotices(cat);
}
function noticeCard(n){
  return '<div class="notice" onclick="go(\'notices\')"><div class="notice-top"><span class="cat ' + n.c + '">' + n.cat + '</span><span class="n-date">' + n.d + '</span></div><h3>' + n.t + '</h3><p>' + n.s + '</p></div>';
}

/* ---------- college events ---------- */
function renderEvents(){
  var el = $('eventsList');
  if(!el) return;
  var html = '';
  EVENTS.forEach(function(e, i){
    var poster = e.poster ? '<div class="ev-poster" onclick="shareEvent(' + i + ')"><img src="' + e.poster + '" alt="' + e.t + ' poster"></div>' : '';
    var share = '<button class="share-btn" type="button" onclick="shareEvent(' + i + ')">' + icv('M12 2a5 5 0 0 0-5 5c0 .6.1 1.1.3 1.6L3.9 11a5 5 0 1 0 0 6l2.4 2a5 5 0 1 0 2.2-2.6l2.4-2a5 5 0 0 0 1.1 0l2.4 2A5 5 0 1 0 17.6 13l3.4-2.4A5 5 0 1 0 12 2z') + 'Share</button>';
    html += '<div class="notice">' + poster +
      '<div class="notice-top">' +
      '<span class="cat ' + e.c + '">' + e.cat + '</span><span class="n-date">' + icv(ICONS.cal) + e.d + '</span></div>' +
      '<h3>' + e.t + '</h3><p>' + e.s + '</p>' +
      '<div class="n-foot"><span class="readmore">' + icv(ICONS.pin) + ' ' + e.venue + ' &bull; ' + e.time + '</span>' + share + '</div></div>';
  });
  el.innerHTML = html || emptyState('No events listed yet');
}

function shareEvent(i){
  var e = EVENTS[i];
  if(!e){ toast('Could not share this event.'); return; }
  var text = e.t + '\n' + e.d + ' \u2022 ' + e.time + ' \u2022 ' + e.venue + (e.s ? '\n' + e.s : '');
  var posterUrl = e.poster ? location.origin + e.poster : '';
  if(window.navigator.share){
    window.navigator.share({ title: e.t, text: text, url: posterUrl || (location.origin + '/events.html') })
      .catch(function(){});
  } else {
    var q = encodeURIComponent(text + '\n' + 'View on the GMC app: ' + (location.origin + '/events.html'));
    window.open('https://wa.me/?text=' + q, '_blank');
  }
}

/* ============================================================
   PROFILE
   ============================================================ */
function renderProfile(){
  var html = '';
  html += '<div class="group-label">My Account</div>'
    + rowlink('My Profile', 'Sign in to view', 'user', 'toast(\'My Profile — sign in to view\')')
    + '<div class="gap8"></div>'
    + rowlink('My Saved Departments', '', 'heart', 'toast(\'Saved departments — coming soon\')')
    + '<div class="gap8"></div>'
    + rowlink('My Appointments', 'No appointments', 'cal', 'toast(\'Appointments — coming soon\')');
  html += '<div class="group-label">Preferences</div>'
    + toggleRow('Notifications')
    + '<div class="gap8"></div>'
    + rowlink('Language', 'English', 'globe', 'location.href="language.html"')
    + '<div class="gap8"></div>'
    + '<div class="rowlink" onclick="this.querySelector(\'.toggle\').classList.toggle(\'on\');toast(\'Accessibility — coming soon\')"><div class="rl-ic" style="background:var(--teal-light);color:var(--teal)"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 12v4"/></svg></div><div class="rl-t">Accessibility</div><button class="toggle"></button></div>'
    + '<div class="gap8"></div>'
    + '<a class="rowlink" href="student.html"><div class="rl-ic" style="background:var(--primary-light);color:var(--primary)"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20M4 22V8l8-5 8 5v14M9 22v-6h6v6"/></svg></div><div class="rl-t">Student Corner</div><span class="rl-a">' + icv(ICONS.chev) + '</span></a>';
  html += '<div class="group-label">Support</div>'
    + rowlink('Admin Console', '', 'lock', 'location.href="/admin/"')
    + '<div class="gap8"></div>'
    + rowlink('Help & Support', '', 'help', 'toast(\'Help & Support — coming soon\')')
    + '<div class="gap8"></div>'
    + rowlink('About GMC Kozhikode', '', 'info', 'toast(\'About GMC Kozhikode — Government Medical College, Kozhikode, Kerala\')')
    + '<div class="gap8"></div>'
    + rowlink('Privacy Policy', '', 'lock', 'toast(\'Privacy Policy — coming soon\')')
    + '<div class="gap8"></div>'
    + rowlink('Terms & Conditions', '', 'doc', 'toast(\'Terms — coming soon\')');
  $('profileBody').innerHTML = html;
}
function rowlink(title, val, icon, action){
  var ics = {
    user: '<circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>',
    heart: '<path d="M20 8c0 4-8 12-8 12S4 12 4 8a5 5 0 0 1 9-3 5 5 0 0 1 7 3z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M9 15h6M12 12v6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5"/><path d="M12 17.5v.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    doc: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'
  };
  return '<div class="rowlink" onclick="' + action + '"><div class="rl-ic" style="background:var(--primary-light);color:var(--primary)"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ics[icon] || ics.info) + '</svg></div><div class="rl-t">' + title + '</div>' + (val ? '<span class="rl-v">' + val + '</span>' : '') + '<span class="rl-a">' + icv(ICONS.chev) + '</span></div>';
}
function toggleRow(title){
  return '<div class="rowlink" onclick="this.querySelector(\'.toggle\').classList.toggle(\'on\');toast(\'Notifications preference updated (demo)\')"><div class="rl-ic" style="background:var(--teal-light);color:var(--teal)"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></div><div class="rl-t">' + title + '</div><button class="toggle"></button></div>';
}

/* ============================================================
   ADMISSIONS
   ============================================================ */
var ADM = [
  {t:'UG Admissions', d:'MBBS (Bachelor of Medicine & Bachelor of Surgery)', o:'MBBS admissions are conducted centrally through the national entrance examination (NEET-UG). Eligibility, merit list and counselling are decided by the competent admission authority.'},
  {t:'PG Admissions', d:'MD / MS postgraduate courses', o:'Postgraduate (MD/MS) admissions follow national eligibility criteria (NEET-PG) with counselling by the competent authority.'},
  {t:'Super Speciality', d:'DM / MCh super speciality courses', o:'DM / MCh admissions follow the national super-speciality entrance (NEET-SS) and merit-based counselling.'},
  {t:'Nursing', d:'Nursing education programmes', o:'Nursing courses follow the eligibility and admission procedures issued by the university and the State.'},
  {t:'Allied Health', d:'Allied health sciences courses', o:'Allied health science courses follow their respective eligibility and admission guidelines.'}
];
function renderAdmissions(){
  var html = '<div class="sample-banner"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>No fake dates, fees or eligibility. Refer to the official admission authority.</div>';
  ADM.forEach(function(a){
    html += '<div class="dept-card" onclick="openAdm(\'' + a.t + '\')"><div class="d-head"><div class="d-ic" style="background:var(--primary-light);color:var(--primary)"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg></div><div><div class="d-name">' + a.t + '</div><div class="d-desc">' + a.d + '</div></div></div><div class="d-foot" style="margin-top:12px"><span class="view">View Details ' + icv(ICONS.chev) + '</span><span style="font-size:11px;color:var(--text-mild)">Sample</span></div></div>';
  });
  $('admList').innerHTML = html;
}
function openAdm(t){
  var a = ADM.filter(function(x){ return x.t === t; })[0] || {t:t, o:t + ' admissions — refer to the official admission authority.'};
  $('admList').innerHTML =
    '<div class="sample-banner"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>No fake dates, fees or eligibility. Refer to the official admission authority.</div>'
    + '<div class="sec" style="margin-top:4px"><h2>' + a.t + '</h2></div>'
    + '<div class="infocard"><div class="ic-head">' + icv('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/>') + 'Overview</div><div class="ic-row"><span class="k">Course</span><span class="v" style="text-align:left">' + a.o + '</span></div></div>'
    + '<div class="infocard"><div class="ic-head">' + icv('<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/>') + 'Important Information</div>'
    + '<div class="ic-row"><span class="k">Eligibility</span><span class="v">Official</span></div>'
    + '<div class="ic-row"><span class="k">Admission Process</span><span class="v">Official</span></div>'
    + '<div class="ic-row"><span class="k">Documents</span><span class="v">Official</span></div>'
    + '<div class="ic-row"><span class="k">Important Dates</span><span class="v">Official</span></div></div>'
    + '<div class="note-callout"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"/></svg>Eligibility, process, documents and dates for ' + a.t + ' will be published by the official admission authority. Data has been withheld to avoid misinformation.</div>'
    + '<button class="btn btn-ghost" onclick="renderAdmissions()">' + icv('<path d="M19 12H5M11 18l-6-6 6-6"/>') + 'Back to Admissions</button>';
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function renderNotifs(){
  var html = '';
  NOTIFS.forEach(function(n){
    html += '<div class="notif' + (n.unread ? ' unread' : '') + '" onclick="this.classList.remove(\'unread\')"><div class="ni-ic" style="background:' + n.b + ';color:' + n.col + '"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></div><div><div class="ni-t">' + n.t + (n.unread ? '<span class="cat cat-hosp">New</span>' : '') + '</div><div class="ni-s">' + n.s + '</div><div class="ni-time">' + n.time + '</div></div></div>';
  });
  $('notifList').innerHTML = html;
}

/* ============================================================
   TESTS (page + detail)
   ============================================================ */
function openTest(title, type, sample, prep){
  location.href = 'test.html?title=' + encodeURIComponent(title) + '&type=' + encodeURIComponent(type) + '&sample=' + encodeURIComponent(sample) + '&prep=' + encodeURIComponent(prep);
}
function renderTestDetail(){
  var title = qp('title'), type = qp('type') || 'Test', sample = qp('sample') || 'Sample', prep = qp('prep') || 'Refer to the hospital lab for instructions.';
  if(!title){ $('tdBody').innerHTML = emptyState('Test not found (sample data)') + '<div class="sec"><a class="btn btn-ghost" href="tests.html">Back to Tests</a></div>'; return; }
  $('tdTitle').textContent = title;
  $('tdBody').innerHTML =
    '<div class="sample-banner"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>Sample placeholder details. Verify at the hospital.</div>'
    + '<div class="sec" style="margin-top:4px"><h2>' + title + '</h2></div>'
    + '<div class="infocard"><div class="ic-head">' + icv('<circle cx="12" cy="12" r="9"/>') + 'Test Information</div>'
    + '<div class="ic-row"><span class="k">Category</span><span class="v">' + type + '</span></div>'
    + '<div class="ic-row"><span class="k">Sample</span><span class="v">' + sample + '</span></div></div>'
    + '<div class="infocard"><div class="ic-head">' + icv(ICONS.cal) + 'Preparation &amp; Collection</div><div class="ic-row"><span class="k">Instructions</span><span class="v" style="text-align:left">' + prep + '</span></div></div>'
    + '<div class="infocard"><div class="ic-head">' + icv('<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/>') + 'Reports</div>'
    + '<div class="ic-row"><span class="k">Collection</span><span class="v">Hospital counter</span></div>'
    + '<div class="ic-row"><span class="k">Online</span><span class="v">Not available yet</span></div></div>'
    + '<a class="btn btn-primary" href="navigation.html">' + icv(ICONS.pin) + 'Directions</a>';
}

/* ============================================================
   APPOINTMENTS (public)
   ============================================================ */
function initAppointment(){
  var sel = $('apDept');
  if(sel){
    sel.innerHTML = '<option value="">Select department</option>';
    if(DEPTS && DEPTS.length){
      DEPTS.forEach(function(d){
        var o = document.createElement('option');
        o.value = d.name; o.textContent = d.name;
        sel.appendChild(o);
      });
    }
  }
  var form = $('apForm');
  if(!form || form._submitBound) return;
  form._submitBound = true;
  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    try{
      var body = {
        name: ($('apName') || {}).value || '',
        phone: ($('apPhone') || {}).value || '',
        department: sel ? sel.value : '',
        preferred_date: ($('apDate') || {}).value || '',
        message: ($('apMsg') || {}).value || ''
      };
      if(!body.name || !body.phone){ toast('Please add your name and phone number'); return; }
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/appointments', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function(){
        if(xhr.status === 201){
          toast('Appointment request submitted. We will contact you.');
          form.reset();
        } else {
          var r = null; try{ r = JSON.parse(xhr.responseText); }catch(e){}
          toast((r && r.error) || 'Could not submit. Try again.');
        }
      };
      xhr.onerror = function(){
        toast('Server offline. Start the backend (python server/app.py).');
      };
      xhr.send(JSON.stringify(body));
    }catch(e){ toast('Could not submit request.'); }
  });
}
/* ============================================================
   SEARCH
   ============================================================ */
function doSearch(q){
  q = (q || '').trim();
  var home = $('searchHome'), res = $('searchResults');
  if(!q){ home.classList.remove('hidden'); res.classList.add('hidden'); return; }
  home.classList.add('hidden'); res.classList.remove('hidden');

  var lq = q.toLowerCase();
  var h = '<div class="group-label">Results</div>';
  var matched = false;

  if(lq === 'cardiology' || lq === 'cardio'){
    matched = true;
    var c = findDept('Cardiology');
    h += '<a class="dept-card" href="department.html?dept=Cardiology"><div class="d-head"><div class="d-ic" style="background:var(--danger-light);color:var(--danger)">' + icv(ICONS.heart) + '</div><div><div class="d-name">Cardiology</div><div class="d-desc">Heart &amp; cardiovascular care</div></div></div><div class="d-meta"><span class="dm">' + icv(ICONS.pin) + 'Main Hospital</span><span class="dm">' + icv(ICONS.cal) + 'OPD: Sample timing</span></div><div class="d-foot"><span class="view">View Department ' + icv(ICONS.chev) + '</span></div></a>';
  }
  Object.keys(PROBLEM_MAP).forEach(function(k){
    if(!matched && lq.indexOf(k) > -1){
      matched = true;
      var dn = PROBLEM_MAP[k];
      h += '<div class="group-label" style="margin-top:6px">Recommended for &ldquo;' + q + '&rdquo;</div>';
      var d = findDept(dn);
      if(d) h += deptCard(d, true);
    }
  });
  if(!matched){
    var found = DEPTS.filter(function(d){ return d.name.toLowerCase().indexOf(lq) > -1 || d.desc.toLowerCase().indexOf(lq) > -1 || d.cat.toLowerCase().indexOf(lq) > -1; });
    if(found.length){ found.forEach(function(d){ h += deptCard(d, true); }); }
    else h += emptyState('No results for "' + q + '". Try "chest pain", "breathing" or a department name.');
  }
  res.innerHTML = h;
}
function searchCat(cat){
  var home = $('searchHome'), res = $('searchResults');
  home.classList.add('hidden'); res.classList.remove('hidden');
  var labels = {departments:'Departments', doctors:'Doctors', services:'Services', tests:'Tests', notices:'Notices', facilities:'Hospital Facilities'};
  var h = '<div class="group-label">' + (labels[cat] || cat) + '</div>';
  if(cat === 'departments'){ DEPTS.forEach(function(d){ h += deptCard(d, true); }); }
  else if(cat === 'doctors'){ DOCS.forEach(function(d){ h += docCard(d); }); }
  else if(cat === 'tests'){
    h += '<a class="dept-card" href="tests.html"><div class="d-head"><div class="d-ic" style="background:var(--teal-light);color:var(--teal)">' + icv('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M8 14h8"/>') + '</div><div><div class="d-name">Tests &amp; Reports</div><div class="d-desc">Laboratory &amp; Radiology</div></div></div><div class="d-foot"><span class="view">Open ' + icv(ICONS.chev) + '</span></div></a>';
  }
  else if(cat === 'notices'){
    h = '<div class="group-label">Recent Notices</div>';
    NOTICES.slice(0, 3).forEach(function(n){ h += noticeCard(n); });
  }
  else if(cat === 'services'){
    h += '<div class="infoitem" onclick="go(\'opd\')"><div class="ii-ic" style="background:var(--teal-light);color:var(--teal)">' + icv(ICONS.cal) + '</div><div><div class="ii-t">OPD Schedule</div></div><span class="ii-a">' + icv(ICONS.chev) + '</span></div><div class="gap8"></div>';
    h += '<div class="infoitem" onclick="go(\'navigation\')"><div class="ii-ic" style="background:var(--primary-light);color:var(--primary)">' + icv(ICONS.pin) + '</div><div><div class="ii-t">Hospital Navigation</div></div><span class="ii-a">' + icv(ICONS.chev) + '</span></div><div class="gap8"></div>';
    h += '<div class="infoitem" onclick="go(\'tests\')"><div class="ii-ic" style="background:#F0EBFA;color:#6B4FA0">' + icv('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M8 14h8"/>') + '</div><div><div class="ii-t">Tests &amp; Reports</div></div><span class="ii-a">' + icv(ICONS.chev) + '</span></div>';
  }
  else if(cat === 'facilities'){
    h += '<div class="rowlink" onclick="go(\'navigation\')"><div class="rl-ic" style="background:var(--primary-light);color:var(--primary)">' + icv('<path d="M3 21h18M5 21V10l7-6 7 6v11"/>') + '</div><div class="rl-t">OPD Block</div><span class="rl-v">Departments &amp; clinics</span><span class="rl-a">' + icv(ICONS.chev) + '</span></div><div class="gap8"></div>';
    h += '<div class="rowlink" onclick="go(\'navigation\')"><div class="rl-ic" style="background:var(--teal-light);color:var(--teal)">' + icv(ICONS.pin) + '</div><div class="rl-t">Main Hospital</div><span class="rl-v">Emergency &amp; wards</span><span class="rl-a">' + icv(ICONS.chev) + '</span></div><div class="gap8"></div>';
    h += '<div class="rowlink" onclick="go(\'emergency\')"><div class="rl-ic" style="background:var(--danger-light);color:var(--danger)">' + icv(ICONS.heart) + '</div><div class="rl-t">Ambulance &amp; Emergency</div><span class="rl-v">24 × 7</span><span class="rl-a">' + icv(ICONS.chev) + '</span></div>';
  }
  $('searchResults').innerHTML = h;
}
function clearSearch(){
  var inp = $('searchInput'); if(inp) inp.value = '';
  $('searchHome').classList.remove('hidden');
  $('searchResults').classList.add('hidden');
}

/* ============================================================
   HOSPITAL NAVIGATION
   ============================================================ */
var NAV_RESULTS = [
  ['Cardiology','Main Hospital','Ground Floor','Room 3'],
  ['Emergency','Main Block','Ground Floor','Casualty Reception'],
  ['Laboratory','Main Block','Ground Floor','Lab Reception'],
  ['Pharmacy','OPD Block','Ground Floor','Pharmacy Counter'],
  ['Radiology','Radiology Wing','Ground Floor','Imaging Reception'],
  ['Blood Bank','Main Block','First Floor','Blood Bank Wing']
];
function doNavSearch(q){
  q = (q || '').toLowerCase();
  if(!q){ $('navCats').classList.remove('hidden'); $('navResults').classList.add('hidden'); return; }
  $('navCats').classList.add('hidden'); $('navResults').classList.remove('hidden');
  var found = NAV_RESULTS.filter(function(r){ return r[0].toLowerCase().indexOf(q) > -1; });
  if(found.length === 0 && (q === 'cardiology' || q === 'cardio' || q === 'heart' || q === 'chest')) found = [NAV_RESULTS[0]];
  var h = '<div class="group-label">Results</div>';
  found.slice(0, 4).forEach(function(r){
    h += '<div class="route"><div class="r-t">' + r[0].toUpperCase() + '</div><div class="r-steps">' +
      '<span class="rs">' + r[1] + '</span>' + icv(ICONS.chev) +
      '<span class="rs">' + r[2] + '</span>' + icv(ICONS.chev) +
      '<span class="rs">' + r[3] + '</span></div><div style="margin-top:12px"><button class="btn btn-primary btn-sm" onclick="toast(\'Directions — connect map API for live navigation\')">' + icv(ICONS.pin) + 'Get Directions</button></div></div>';
  });
  h += '<div class="note-callout" style="margin-top:14px">' + icv('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/>') + 'Routes are sample placeholders. Verify at hospital or connect a live map.</div>';
  $('navResults').innerHTML = found.length ? h : emptyState('No matching facility');
}
function navResult(title, sub, floor, point){
  var si = $('navSearch'); if(si) si.value = '';
  $('navCats').classList.add('hidden'); $('navResults').classList.remove('hidden');
  var steps = '<span class="rs">' + floor + '</span>' + icv(ICONS.chev) + '<span class="rs">' + point + '</span>';
  $('navResults').innerHTML =
    '<div class="group-label">' + sub + '</div>'
    + '<div class="mapbox" style="margin-bottom:14px;"><div class="map-pin"><svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg><div class="map-label">' + title + '</div></div><div class="map-caption">Map placeholder — connect live map</div></div>'
    + '<div class="route"><div class="r-t">' + title.toUpperCase() + '</div><div class="r-steps">' + steps + '</div><div style="margin-top:12px"><button class="btn btn-primary" onclick="toast(\'Directions — connect map API for live navigation\')">' + icv(ICONS.pin) + 'Get Directions</button></div></div>'
    + '<div class="note-callout" style="margin-top:14px">' + icv('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/>') + sub + ' location is placeholder data. Verify at hospital.</div>';
}

/* ============================================================
   UTIL
   ============================================================ */
function emptyState(msg){
  return '<div class="state"><div class="st-ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6M11 8v6"/></svg></div><h3>Nothing here yet</h3><p>' + msg + '</p></div>';
}
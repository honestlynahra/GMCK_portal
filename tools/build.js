// GMC KOZHIKODE — static site generator
// Each page is produced from a shared mobile shell + content block.
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..');
const CSS = 'assets/css/gmc.css';
const JS_DATA = 'assets/js/data.js';
const JS_APP = 'assets/js/gmc.js';

const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='5' fill='%231267B2'/><path d='M12 5l4 2.3v3c0 2.6-1.7 4.6-4 5.2-2.3-.6-4-2.6-4-5.2V7.3z' fill='none' stroke='white' stroke-width='1.4'/><path d='M9.8 11.5h4.4M12 9.5v4.4' stroke='white' stroke-width='1.4' stroke-linecap='round'/></svg>";

const FONT_LINK = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">';

function shell({ file, bodyId, tab, title, content }) {
  const bottomNav = tab
    ? '<nav class="bottomnav" id="bottomnav"></nav>'
    : '';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>${title} — GMC Kozhikode</title>
<meta name="description" content="One Home for GMC Kozhikode — healthcare, hospital services, academics, admissions and navigation for Government Medical College Kozhikode, Kerala.">
<link rel="icon" href="${FAVICON}">
${FONT_LINK}
<link rel="stylesheet" href="${CSS}">
</head>
<body id="${bodyId}"${tab ? ' data-tab="' + tab + '"' : ''}>
<div class="frame">
  <div id="splash">
    <div class="splash-logo">${SHIELD}</div>
    <div class="splash-title">GMC KOZHIKODE</div>
    <div class="splash-sub">Government Medical College, Kozhikode</div>
    <div class="splash-symbol">Healthcare &bull; Education &bull; Research</div>
    <div class="splash-loader"></div>
  </div>
  <main class="site-body" id="sitebody">${content}${PROTOTYPE_NOTICE}</main>
  ${bottomNav}
  <div class="fabwrap">
    <button class="bn-fab bn-fab-loc" id="bnmap" type="button" onclick="mapLoc()" title="Find my location" aria-label="Find my location"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5" fill="#fff"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></button>
    <a class="bn-fab-label bn-fab-label-loc" href="map.html">MAP</a>
    <a class="bn-fab" id="bnfab" href="emergency.html"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/></svg></a>
    <a class="bn-fab-label" href="emergency.html">EMERGENCY</a>
  </div>
  <div class="toast" id="toast"></div>
</div>
<script src="${JS_DATA}"></script>
<script src="${JS_APP}"></script>
</body>
</html>
`;
  return { file, html };
}

// small helpers reused across pages
const SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/></svg>';
const PROTOTYPE_NOTICE = '<footer class="site-footer"><div class="sf-title">Prototype Notice</div><p>This website is a student-developed prototype created for demonstration purposes. It is not an official website or communication channel of Government Medical College, Kozhikode. Official adoption and use are subject to approval by the institution.</p></footer>';
const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8c0 4-8 12-8 12S4 12 4 8a5 5 0 0 1 9-3 5 5 0 0 1 7 3z"/></svg>';
const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const CAL = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M9 15h6M12 12v6"/></svg>';
const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
const CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
const SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';
const BELL = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
const PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.6 2z"/></svg>';
const AMB = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2m14 12h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2M15 6v12M8 8v8"/></svg>';
const BLDG = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-6 7 6v11"/></svg>';
const CAP = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20M4 22V8l8-5 8 5v14M9 22v-6h6v6"/></svg>';
const TESTICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M8 14h8"/></svg>';
const MEGAPHONE = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>';

function appbarBack(title, sub, rightHTML) {
  return '<header class="appbar"><div class="appbar-row">' +
    '<a class="back" href="javascript:back()">' + BACK + '</a>' +
    '<div class="grow"><h1>' + title + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' +
    (rightHTML || '') + '</div></header>';
}

function emergencyCard() {
  return '<a class="emergency" href="emergency.html"><div class="em-icon">' + SHIELD + '</div>' +
    '<div><div class="em-t">Emergency &amp; Trauma</div><div class="em-s">24 × 7 Emergency Services</div></div>' +
    '<div class="em-a">' + CHEV + '</div></a>';
}

/* ============================================================
   HOME — index.html
   ============================================================ */
const home = shell({
  file: 'index.html',
  bodyId: 'page-home',
  tab: 'home',
  title: 'Home',
  content: `
    <div class="greet-block">
      <div class="greet-top">
        <span class="grow"></span>
        <a class="greet-admin" href="/admin/" title="Admin console">Admin login</a>
      </div>
      <div class="greet-title" id="greetHello">Welcome to GMC Kozhikode</div>
      <div class="greet-help">How can we help you?</div>
    </div>
    <a class="searchbar" href="search.html">
      ${SEARCH}
      <input placeholder="Search department, doctor or service" readonly>
    </a>
    <div class="spacer"></div>
    <div class="sec"><h2>Quick Services</h2></div>
    <div class="grid2">
      <a class="svc" href="doctors.html"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M8 2h8v6a4 4 0 0 1-8 0V2z"/><path d="M8 6h8M8 10c0-1 0-1 .5-2M16 10c0-1 0-1-.5-2"/></svg>'}</div><div class="svc-t">Doctor's Directory</div></a>
      <a class="svc" href="opd.html"><div class="svc-ic" style="background:var(--teal-light);color:var(--teal)">${CAL}</div><div class="svc-t">OPD Schedule</div></a>
      <a class="svc" href="departments.html"><div class="svc-ic" style="background:#F0EBFA;color:#6B4FA0">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/><path d="M3 3v3M21 3v3"/></svg>'}</div><div class="svc-t">Departments</div></a>
      <a class="svc" href="navigation.html"><div class="svc-ic" style="background:#FDF1E3;color:#B7791F">${PIN}</div><div class="svc-t">Hospital Navigation</div></a>
      <a class="svc" href="admissions.html"><div class="svc-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg>'}</div><div class="svc-t">Admissions</div></a>
      <a class="svc" href="events.html"><div class="svc-ic" style="background:#FDEAF4;color:#C2255C">${MEGAPHONE}</div><div class="svc-t">College Events</div></a>
    </div>
    <div class="sec"><h2>How can we help you?</h2></div>
    <div class="chips">
      <div class="chip-row">
        <button class="chip" onclick="problem('Cardiology','Heart / Chest')"><div class="chip-ic" style="background:var(--danger-light);color:var(--danger)">${HEART}</div><div class="chip-t">Heart / Chest</div></button>
        <button class="chip" onclick="problem('Pulmonology','Breathing')"><div class="chip-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6M9 4l6 8M15 4L9 12M6 8h5M6 14h5M18 8h0M18 14h0"/></svg>'}</div><div class="chip-t">Breathing</div></button>
      </div>
      <div class="chip-row">
        <button class="chip" onclick="problem('Neurology','Brain / Nerves')"><div class="chip-ic" style="background:#F0EBFA;color:#6B4FA0">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a3 3 0 0 0 3-2 5 5 0 0 1 5 8 5 5 0 0 1-5 8c0 6-6 6-6 0a5 5 0 0 1-5-8 5 5 0 0 1 5-8 3 3 0 0 0 3 2z"/></svg>'}</div><div class="chip-t">Brain / Nerves</div></button>
        <button class="chip" onclick="problem('Orthopaedics','Bone &amp; Joint')"><div class="chip-ic" style="background:var(--amber-light);color:var(--amber)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h6l3-6 3 6h4M8 14v3M16 14v3M12 12v0"/></svg>'}</div><div class="chip-t">Bone &amp; Joint</div></button>
      </div>
      <div class="chip-row">
        <button class="chip" onclick="problem('Ophthalmology','Eye')"><div class="chip-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/></svg>'}</div><div class="chip-t">Eye</div></button>
        <button class="chip" onclick="problem('ENT','Ear / Nose / Throat')"><div class="chip-ic" style="background:#FDEBEA;color:#D93025">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 4-2 5-2 8"/><path d="M12 8v4"/></svg>'}</div><div class="chip-t">Ear / Nose / Throat</div></button>
      </div>
      <div class="chip-row">
        <button class="chip" onclick="problem('Paediatrics','Child')"><div class="chip-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 6a3 3 0 0 1 3 3c0 1.5-.6 2.5-1.5 3.5L12 15l-1.5-2.5C9.6 11.5 9 10.5 9 9a3 3 0 0 1 3-3zM8 18h8"/></svg>'}</div><div class="chip-t">Child</div></button>
        <button class="chip" onclick="problem('Obstetrics &amp; Gynaecology','Pregnancy')"><div class="chip-ic" style="background:#FDEAF4;color:#C2255C">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s8-6 8-11a6.5 6.5 0 0 0-13-1 6.5 6.5 0 0 0-3 1c-.5.5-.5 1 0 1.5S5.5 11 6 12c0 2 2 4 4 6 1 1 1.5 2 2 3z"/></svg>'}</div><div class="chip-t">Pregnancy</div></button>
      </div>
      <div class="chip-row">
        <button class="chip" onclick="problem('Dentistry','Dental')"><div class="chip-ic" style="background:#F0EBFA;color:#6B4FA0">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.5C10.5 4 8 4 6.5 4 4 4 3 6 3 8.5c0 3 1 5 1.5 8 .3 2 1.5 2 2 0 .5-2 1-5.5 2-5.5s1.5 3.5 2 5.5c.5 2 1.7 2 2 0 .5-3 1.5-5 1.5-8C14 6 13 4 10.5 4 9 4 8 4 12 5.5z"/></svg>'}</div><div class="chip-t">Dental</div></button>
        <button class="chip" onclick="problem('Dermatology','Skin')"><div class="chip-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>'}</div><div class="chip-t">Skin</div></button>
      </div>
    </div>
    <div class="sec"><h2>Latest Notices</h2><a class="more teal" href="notices.html">View all</a></div>
    <div id="homeNotices"></div>
    <div class="sec"><h2>Hospital Information</h2></div>
    <a class="infoitem" href="javascript:toast('Visiting hours shown as sample. Verify at hospital.')"><div class="ii-ic" style="background:var(--primary-light);color:var(--primary)">${CLOCK}</div><div><div class="ii-t">Visiting Hours</div><div class="ii-s">Sample: 4:00 PM – 6:30 PM</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="navigation.html"><div class="ii-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9l3-2 3 2M14 14l3 2"/></svg>'}</div><div><div class="ii-t">Help Desk</div><div class="ii-s">Main entrance, Ground Floor</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="navigation.html"><div class="ii-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v6a4 4 0 0 1-8 0V2zM6 2v3M18 2v3"/><path d="M8 12v0M16 12v0M6 21h12"/></svg>'}</div><div><div class="ii-t">Pharmacy</div><div class="ii-s">Ground Floor, near OPD</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="navigation.html"><div class="ii-ic" style="background:var(--danger-light);color:var(--danger)">${HEART}</div><div><div class="ii-t">Blood Bank</div><div class="ii-s">Sample location: Main Block</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="emergency.html"><div class="ii-ic" style="background:var(--amber-light);color:var(--amber)">${AMB}</div><div><div class="ii-t">Ambulance</div><div class="ii-s">24 × 7 &bull; Emergency</div></div><span class="ii-a">${CHEV}</span></a>`
});

/* ============================================================
   HOSPITAL — hospital.html
   ============================================================ */
const hospital = shell({
  file: 'hospital.html',
  bodyId: 'page-hospital',
  tab: 'hospital',
  title: 'Hospital',
  content: `
    <header class="appbar"><div class="appbar-row">
      <div class="grow"><h1>Hospital</h1><div class="sub">Services, facilities &amp; information</div></div>
    </div></header>
    <div class="sec" style="margin-top:4px">${emergencyCard()}</div>
    <div class="grid2">
      <a class="svc" href="opd.html"><div class="svc-ic" style="background:var(--teal-light);color:var(--teal)">${CAL}</div><div class="svc-t">OPD Schedule</div></a>
      <a class="svc" href="departments.html"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/></svg>'}</div><div class="svc-t">Departments</div></a>
      <a class="svc" href="navigation.html"><div class="svc-ic" style="background:#F0EBFA;color:#6B4FA0">${PIN}</div><div class="svc-t">Navigation</div></a>
      <a class="svc" href="doctors.html"><div class="svc-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M8 2h8v6a4 4 0 0 1-8 0V2z"/><path d="M8 6h8"/></svg>'}</div><div class="svc-t">Doctor's Directory</div></a>
      <a class="svc" href="admissions.html"><div class="svc-ic" style="background:#FDF1E3;color:#B7791F">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg>'}</div><div class="svc-t">Admissions</div></a>
    </div>
    <div class="sec"><h2>Hospital Information</h2></div>
    <a class="infoitem" href="javascript:toast('Visiting hours shown as sample. Verify at hospital.')"><div class="ii-ic" style="background:var(--primary-light);color:var(--primary)">${CLOCK}</div><div><div class="ii-t">Visiting Hours</div><div class="ii-s">Sample: 4:00 PM – 6:30 PM</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="javascript:toast('Help Desk at Main entrance, Ground Floor.')"><div class="ii-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9l3-2 3 2M14 14l3 2"/></svg>'}</div><div><div class="ii-t">Help Desk</div><div class="ii-s">Main entrance, Ground Floor</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="javascript:toast('Pharmacy at Ground Floor, near OPD.')"><div class="ii-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v6a4 4 0 0 1-8 0V2zM6 2v3M18 2v3"/><path d="M8 12v0M16 12v0M6 21h12"/></svg>'}</div><div><div class="ii-t">Pharmacy</div><div class="ii-s">Ground Floor, near OPD</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="javascript:toast('Blood Bank — sample location, Main Block.')"><div class="ii-ic" style="background:var(--danger-light);color:var(--danger)">${HEART}</div><div><div class="ii-t">Blood Bank</div><div class="ii-s">Main Block</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="emergency.html"><div class="ii-ic" style="background:var(--amber-light);color:var(--amber)">${AMB}</div><div><div class="ii-t">Ambulance</div><div class="ii-s">24 × 7</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="academics.html"><div class="ii-ic" style="background:#F0EBFA;color:#6B4FA0">${CAP}</div><div><div class="ii-t">Academics</div><div class="ii-s">Courses, curriculum &amp; departments</div></div><span class="ii-a">${CHEV}</span></a>
    <div class="sec"><h2>About</h2></div>
    <div style="background:var(--card);border-radius:var(--radius);padding:16px;box-shadow:var(--shadow)">
      <div style="font-size:14px;font-weight:800;margin-bottom:6px;">Government Medical College, Kozhikode</div>
      <p style="font-size:13px;color:var(--text-soft);line-height:1.55;">A premier government medical institution in Kerala, providing healthcare, education and research. Hospital services and academic programmes are available across multiple blocks and departments.</p>
      <div style="font-size:11.5px;color:var(--text-mild);margin-top:10px;display:flex;align-items:center;gap:6px;">${PIN} Kozhikode, Kerala, India</div>
    </div>`
});

/* ============================================================
   SEARCH — search.html
   ============================================================ */
const search = shell({
  file: 'search.html',
  bodyId: 'page-search',
  tab: 'search',
  title: 'Search',
  content: `
    <header class="appbar"><div class="appbar-row">
      <div class="grow"><h1>Search</h1></div>
    </div></header>
    <div class="searchbar" style="margin-bottom:18px;">
      ${SEARCH}
      <input id="searchInput" placeholder="What are you looking for?" oninput="doSearch(this.value)">
      <svg onclick="clearSearch()" style="cursor:pointer" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A9BAE" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </div>
    <div id="searchHome">
      <div class="group-label">Search categories</div>
      <div class="infoitem" onclick="searchCat('departments')"><div class="ii-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/></svg>'}</div><div><div class="ii-t">Departments</div></div><span class="ii-a">${CHEV}</span></div>
      <div class="gap8"></div>
      <div class="infoitem" onclick="searchCat('doctors')"><div class="ii-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M8 2h8v6a4 4 0 0 1-8 0V2z"/><path d="M8 6h8"/></svg>'}</div><div><div class="ii-t">Doctors</div></div><span class="ii-a">${CHEV}</span></div>
      <div class="gap8"></div>
      <div class="infoitem" onclick="searchCat('services')"><div class="ii-ic" style="background:#F0EBFA;color:#6B4FA0">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1"/></svg>'}</div><div><div class="ii-t">Services</div></div><span class="ii-a">${CHEV}</span></div>
      <div class="gap8"></div>
      <div class="infoitem" onclick="searchCat('tests')"><div class="ii-ic" style="background:var(--danger-light);color:var(--danger)">${TESTICON}</div><div><div class="ii-t">Tests</div></div><span class="ii-a">${CHEV}</span></div>
      <div class="gap8"></div>
      <div class="infoitem" onclick="searchCat('notices')"><div class="ii-ic" style="background:var(--amber-light);color:var(--amber)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 9h8M8 13h5"/></svg>'}</div><div><div class="ii-t">Notices</div></div><span class="ii-a">${CHEV}</span></div>
      <div class="gap8"></div>
      <div class="infoitem" onclick="searchCat('facilities')"><div class="ii-ic" style="background:#E8F6EF;color:#1E7A4D">${BLDG}</div><div><div class="ii-t">Hospital Facilities</div></div><span class="ii-a">${CHEV}</span></div>
    </div>
    <div id="searchResults" class="hidden"></div>`
});

/* ============================================================
   NOTICES — notices.html
   ============================================================ */
const notices = shell({
  file: 'notices.html',
  bodyId: 'page-notices',
  tab: 'notices',
  title: 'Notices',
  content: `
    <header class="appbar"><div class="appbar-row">
      <div class="grow"><h1>Notices &amp; Announcements</h1></div>
      <a class="icobtn" href="notifications.html">${BELL}<span class="notif-dot"></span></a>
    </div></header>
    <div class="tabs-scroll" id="noticeTabs">
      <button class="tabbar on" onclick="filterNotice('All',this)">All</button>
      <button class="tabbar" onclick="filterNotice('Hospital',this)">Hospital</button>
      <button class="tabbar" onclick="filterNotice('Academic',this)">Academic</button>
      <button class="tabbar" onclick="filterNotice('Admission',this)">Admission</button>
      <button class="tabbar" onclick="filterNotice('Examination',this)">Examination</button>
    </div>
    <div id="noticeList" style="padding-top:4px;"></div>`
});

/* ============================================================
   PROFILE — profile.html
   ============================================================ */
const profile = shell({
  file: 'profile.html',
  bodyId: 'page-profile',
  tab: 'profile',
  title: 'Profile',
  content: `
    <div class="profile-head">
      <div class="profile-avatar"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg></div>
      <div><div class="ph-t">Guest User</div><div class="ph-s">Sign in for saved &amp; personalised services</div></div>
    </div>
    <div id="profileBody"></div>`
});

/* ============================================================
   EMERGENCY — emergency.html
   ============================================================ */
const emergency = shell({
  file: 'emergency.html',
  bodyId: 'page-emergency',
  title: 'Emergency',
  content: `
    <header class="appbar" style="background:var(--danger);color:#fff;border-radius:0 0 26px 26px;"><div class="appbar-row">
      <a class="back" href="javascript:back()" style="background:rgba(255,255,255,.18)">${BACK}</a>
      <div class="grow"><h1 style="color:#fff">Emergency</h1><div class="sub" style="color:rgba(255,255,255,.9)">24 × 7 Emergency &amp; Trauma</div></div>
    </div></header>
    <div class="sec" style="margin-top:18px;justify-content:center;">
      <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="#D93025" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/><path d="M12 8v5M9.5 10.5h5"/></svg>
    </div>
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:22px;font-weight:800;color:var(--danger)">Emergency &amp; Trauma</div>
      <div style="font-size:13.5px;color:var(--text-soft);margin-top:4px;">Available 24 hours a day, 7 days a week</div>
    </div>
    <div class="sample-banner"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>Contact numbers shown are placeholders. Please verify the official emergency contact number before relying on it.</div>
    <button class="btn btn-danger" id="emPhone" style="margin-bottom:14px" onclick="toast('Placeholder — verify official emergency number.')">${PHONE} Hospital Emergency Contact</button>
    <a class="btn btn-primary outline" style="margin-bottom:14px" href="navigation.html">${PIN} Get Directions</a>
    <div class="sec"><h2>Emergency Information</h2></div>
    <a class="infoitem" href="javascript:toast('Casualty / Emergency ward — Ground Floor, Main Block.')"><div class="ii-ic" style="background:var(--danger-light);color:var(--danger)">${HEART}</div><div><div class="ii-t">Casualty / Emergency Ward</div><div class="ii-s" id="emHelp">Ground Floor, Main Block</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="javascript:toast('Emergency OPD — accessible 24x7.')"><div class="ii-ic" style="background:var(--primary-light);color:var(--primary)">${CLOCK}</div><div><div class="ii-t">Emergency OPD</div><div class="ii-s">24 × 7</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="javascript:toast('Ambulance service — request via emergency.')"><div class="ii-ic" style="background:var(--amber-light);color:var(--amber)">${AMB}</div><div><div class="ii-t">Ambulance</div><div class="ii-s">Request through emergency</div></div><span class="ii-a">${CHEV}</span></a>`
});

/* ============================================================
   DEPARTMENTS — departments.html
   ============================================================ */
const departments = shell({
  file: 'departments.html',
  bodyId: 'page-departments',
  title: 'Departments',
  content: `
    ${appbarBack('Departments', null, '<div class="grow" style="display:none"></div>')}
    <div class="filter-row" id="deptFilters">
      <button class="fchip on" onclick="filterDept('All',this)">All</button>
      <button class="fchip" onclick="filterDept('Clinical',this)">Clinical</button>
      <button class="fchip" onclick="filterDept('Surgical',this)">Surgical</button>
      <button class="fchip" onclick="filterDept('Super Speciality',this)">Super Speciality</button>
      <button class="fchip" onclick="filterDept('Diagnostic',this)">Diagnostic</button>
      <button class="fchip" onclick="filterDept('Other',this)">Other</button>
    </div>
    <div id="deptList" style="padding-top:4px;"></div>`
});

/* ============================================================
   DEPARTMENT DETAIL — department.html
   ============================================================ */
const department = shell({
  file: 'department.html',
  bodyId: 'page-department',
  title: 'Department',
  content: `<div id="deptDetailBody"></div>`
});

/* ============================================================
   DOCTORS — doctors.html
   ============================================================ */
const doctors = shell({
  file: 'doctors.html',
  bodyId: 'page-doctors',
  title: 'Doctors',
  content: `
    ${appbarBack("Doctor's Directory", null, '<div class="grow" style="display:none"></div>')}
    <div style="padding:2px 18px 10px;">
      <div class="searchbar">
        ${SEARCH}
        <input placeholder="Search doctor" oninput="filterDocs(this.value)">
      </div>
    </div>
    <div class="filter-row" id="docFilters">
      <button class="fchip on" onclick="filterDocCat('All Doctors',this)">All Doctors</button>
      <button class="fchip" onclick="filterDocCat('Cardiology',this)">Cardiology</button>
      <button class="fchip" onclick="filterDocCat('Medicine',this)">Medicine</button>
      <button class="fchip" onclick="filterDocCat('Orthopaedics',this)">Orthopaedics</button>
      <button class="fchip" onclick="filterDocCat('Paediatrics',this)">Paediatrics</button>
    </div>
    <div id="docList" style="padding-top:4px;"></div>`
});

/* ============================================================
   DOCTOR PROFILE — doctor.html
   ============================================================ */
const doctor = shell({
  file: 'doctor.html',
  bodyId: 'page-doctor',
  title: 'Doctor',
  content: `
    ${appbarBack('Doctor Profile', null, '<div class="grow" style="display:none"></div>')}
    <div id="docProfileBody"></div>`
});

/* ============================================================
   APPOINTMENT — appointment.html
   ============================================================ */
const appointment = shell({
  file: 'appointment.html',
  bodyId: 'page-appointment',
  title: 'Book Appointment',
  content: `
    ${appbarBack('Book Appointment', 'Outpatient appointment request', '<div class="grow" style="display:none"></div>')}
    <div class="note-callout" style="margin-bottom:16px">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>'}This form sends your request to the hospital. You will be contacted for confirmation. Fields marked * are required.</div>
    <form id="apForm" autocomplete="off">
      <div class="field">
        <label class="field-label" for="apName">Full name *</label>
        <input class="field" id="apName" type="text" placeholder="Your name" value="">
      </div>
      <div class="field">
        <label class="field-label" for="apPhone">Phone number *</label>
        <input class="field" id="apPhone" type="tel" placeholder="Mobile number" value="">
      </div>
      <div class="field">
        <label class="field-label" for="apDept">Department</label>
        <select class="field" id="apDept"><option value="">Select department</option></select>
      </div>
      <div class="field">
        <label class="field-label" for="apDate">Preferred date</label>
        <input class="field" id="apDate" type="date" value="">
      </div>
      <div class="field">
        <label class="field-label" for="apMsg">Reason / message</label>
        <textarea class="field" id="apMsg" rows="3" placeholder="Briefly describe your visit"></textarea>
      </div>
      <button class="btn btn-primary" type="submit" style="margin-top:6px">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg>'}Submit appointment request</button>
    </form>`
});

/* ============================================================
   OPD — opd.html
   ============================================================ */
const opd = shell({
  file: 'opd.html',
  bodyId: 'page-opd',
  title: 'OPD',
  content: `
    ${appbarBack('OPD Information', 'Outpatient Department schedule', '<div class="grow" style="display:none"></div>')}
    <div style="display:flex;align-items:center;gap:10px;background:var(--card);border-radius:14px;padding:14px 16px;box-shadow:var(--shadow);cursor:pointer;margin-bottom:10px;" onclick="toast('Select a department (sample data shown)')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1267B2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 4l-8 8M20 4l-1-1M6 19l-3 3 3-3zM10 15l6-6M11 20l1-1M4 13l1-1M20 11l1-1"/></svg>
      <span style="font-size:14.5px;font-weight:700;flex:1">Cardiology</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A9BAE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
    </div>
    <div class="note-callout">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>'}Please verify today's schedule before visiting. Timings shown are sample placeholders.</div>
    <div class="sec" style="margin-top:4px"><h2>Morning OPD</h2></div>
    <div class="daybook" id="opdMorning"></div>
    <div class="sec"><h2>Afternoon OPD</h2></div>
    <div class="daybook" id="opdAfternoon"></div>
    <div class="sec"><h2>Doctor Availability</h2></div>
    <div class="daybook">
      <div class="db-row"><div class="db-day">Monday</div><div class="db-d"><b>Available</b> &bull; 4 doctors</div><span class="db-av">Today</span></div>
      <div class="db-row"><div class="db-day">Tuesday</div><div class="db-d"><b>Available</b> &bull; 4 doctors</div></div>
      <div class="db-row"><div class="db-day">Wednesday</div><div class="db-d"><b>Available</b> &bull; 5 doctors</div></div>
      <div class="db-row"><div class="db-day">Thursday</div><div class="db-d"><b>Available</b> &bull; 4 doctors</div></div>
      <div class="db-row"><div class="db-day">Friday</div><div class="db-d"><b>Available</b> &bull; 3 doctors</div></div>
      <div class="db-row"><div class="db-day">Saturday</div><div class="db-d"><b>Available</b> &bull; 2 doctors</div></div>
    </div>`
});

/* ============================================================
   NAVIGATION — navigation.html
   ============================================================ */
const navigation = shell({
  file: 'navigation.html',
  bodyId: 'page-navigation',
  title: 'Navigation',
  content: `
    ${appbarBack('Find Your Way', 'Hospital navigation', '<div class="grow" style="display:none"></div>')}
    <a href="map.html" style="display:flex;align-items:center;gap:12px;background:var(--card);border-radius:var(--radius);padding:14px 16px;box-shadow:var(--shadow);margin-bottom:16px;text-decoration:none;">
      <div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${PIN}</div>
      <div style="flex:1"><div class="svc-t">Interactive Hospital Map</div><div class="ii-s">Open the Paadha indoor map</div></div>
      <span style="color:var(--primary);font-size:22px;font-weight:800">&#8250;</span>
    </a>
    <div class="searchbar" style="margin-bottom:14px">
      ${SEARCH}
      <input id="navSearch" placeholder="Where do you want to go?" oninput="doNavSearch(this.value)">
    </div>
    <div id="navCats">
      <div class="group-label">Categories</div>
      <div class="grid2">
        <a class="svc" href="javascript:navResult('Emergency','Emergency &amp; Trauma', 'Ground Floor', '<b>Casualty Reception</b>')"><div class="svc-ic" style="background:var(--danger-light);color:var(--danger)">${SHIELD}</div><div class="svc-t">Emergency</div></a>
        <a class="svc" href="javascript:navResult('OPD','OPD Block','Ground / First Floor','<b>Registration</b>')"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${CAL}</div><div class="svc-t">OPD</div></a>
        <a class="svc" href="departments.html"><div class="svc-ic" style="background:#F0EBFA;color:#6B4FA0">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/></svg>'}</div><div class="svc-t">Departments</div></a>
        <a class="svc" href="javascript:navResult('Laboratory','Central Laboratory','Ground Floor','<b>Lab Reception</b>')"><div class="svc-ic" style="background:var(--teal-light);color:var(--teal)">${TESTICON}</div><div class="svc-t">Laboratory</div></a>
        <a class="svc" href="javascript:navResult('Radiology','Radiology / Imaging','Ground Floor','<b>X-Ray Reception</b>')"><div class="svc-ic" style="background:var(--amber-light);color:var(--amber)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 12h20M6 10v4M12 9v6"/></svg>'}</div><div class="svc-t">Radiology</div></a>
        <a class="svc" href="javascript:navResult('Pharmacy','Pharmacy','Ground Floor','<b>Pharmacy Counter</b>')"><div class="svc-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v6a4 4 0 0 1-8 0V2zM6 2v3M18 2v3"/><path d="M8 12v0M16 12v0M6 21h12"/></svg>'}</div><div class="svc-t">Pharmacy</div></a>
        <a class="svc" href="javascript:navResult('Blood Bank','Blood Bank','First Floor','<b>Blood Bank Wing</b>')"><div class="svc-ic" style="background:var(--danger-light);color:var(--danger)">${HEART}</div><div class="svc-t">Blood Bank</div></a>
        <a class="svc" href="javascript:navResult('Wards','In-Patient Wards','Various floors','<b>Nurse Station</b>')"><div class="svc-ic" style="background:#FDEAF4;color:#C2255C">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13M3 21h18M9 11h6M9 15h6"/></svg>'}</div><div class="svc-t">Wards</div></a>
        <a class="svc" href="javascript:navResult('Registration','Registration Counter','Ground Floor','<b>Main Entrance</b>')"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3-3 8 8M5 21l4-4"/></svg>'}</div><div class="svc-t">Registration</div></a>
        <a class="svc" href="javascript:navResult('Help Desk','Help Desk','Ground Floor','<b>Main Entrance</b>')"><div class="svc-ic" style="background:#F0EBFA;color:#6B4FA0">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9l3-2 3 2M14 14l3 2"/></svg>'}</div><div class="svc-t">Help Desk</div></a>
        <a class="svc" href="javascript:navResult('Parking','Parking','Basement / Open','<b>Main Gate</b>')"><div class="svc-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 14v-4a2 2 0 0 1 4 0v4M9 12h4"/></svg>'}</div><div class="svc-t">Parking</div></a>
        <a class="svc" href="javascript:navResult('Cafeteria','Cafeteria','Ground Floor','<b>OPD Block</b>')"><div class="svc-ic" style="background:var(--amber-light);color:var(--amber)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a3 3 0 0 1 0 6h-1M6 8v10a2 2 0 0 0 4 0V8M6 8h4"/></svg>'}</div><div class="svc-t">Cafeteria</div></a>
      </div>
    </div>
    <div id="navResults" class="hidden"></div>`
});

/* ============================================================
   MAP — map.html  (Paadha indoor map)
   ============================================================ */
const map = shell({
  file: 'map.html',
  bodyId: 'page-map',
  title: 'Map',
  content: `
    ${appbarBack('Hospital Map', 'Paadha indoor map', '<div class="grow" style="display:none"></div>')}
    <div class="sec" style="margin-top:6px">
      <div style="background:var(--card);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);text-align:center;">
        <div style="font-size:44px;line-height:1;margin-bottom:10px;">${PIN}</div>
        <div class="svc-t" style="font-size:16px;">GMC Kozhikode Indoor Map</div>
        <p style="font-size:13px;color:var(--text-soft);line-height:1.55;margin:8px 0 14px;">Interactive directions &amp; information for patients, visitors and staff, powered by <b>Paadha</b>. Opens in a new tab.</p>
        <button class="btn btn-primary" type="button" onclick="mapLoc()">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'}Locate me</button>
        <a class="btn btn-ghost" href="https://maps.paadha.com/" target="_blank" rel="noopener" style="margin-top:10px">Open map directly &#8599;</a>
        <div style="font-size:12px;color:var(--text-soft);margin-top:12px;min-height:16px;" id="locStatus">Tap <b>Locate me</b> to use this map with your current location</div>
      </div>
    </div>
    <div class="note-callout" style="margin-top:12px">${PIN} Tip: wait a few seconds after opening — the map loads its floor data in your browser.</div>`
});

/* ============================================================
   WELCOME — welcome.html  (first-visit onboarding entry)
   ============================================================ */
const welcome = shell({
  file: 'welcome.html',
  bodyId: 'page-welcome',
  title: 'Welcome',
  content: `
    <div class="welcome-bleed">
      <div class="welcome-fade"></div>
      <div class="welcome-inner">
        <img class="welcome-badge" src="assets/img/GMC-Kozhikode.webp" alt="GMC Kozhikode">
        <div class="welcome-eyebrow">GOVERNMENT MEDICAL COLLEGE</div>
        <div class="welcome-name">KOZHIKODE</div>
        <div class="welcome-tag">GMC KOZHIKODE</div>
        <div class="welcome-tagline">&ldquo;One Home for GMC Kozhikode&rdquo;</div>
        <div class="welcome-meta">Healthcare &bull; Education &bull; Research</div>
      </div>
      <button class="welcome-cta" type="button" onclick="startOnboarding()">Continue</button>
    </div>`
});

/* ============================================================
   LANGUAGE SELECTION — language.html
   ============================================================ */
const GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>';

const langpage = shell({
  file: 'language.html',
  bodyId: 'page-language',
  title: 'Language',
  content: `
    ${appbarBack('Choose Your Language', 'Select your preferred language to continue', '')}
    <div class="lang-body">
      <div id="langCards" class="lang-pick">
        <div class="lang-card" onclick="pickLang('en')">
          <div class="lang-ic">${GLOBE}</div>
          <div><div class="lang-t">English</div><div class="lang-s">Continue in English</div></div>
          <span class="lang-a">&#8250;</span>
        </div>
        <div class="lang-card" onclick="pickLang('ml')">
          <div class="lang-ic">${GLOBE}</div>
          <div><div class="lang-t">മലയാളം</div><div class="lang-s">Malayalam</div></div>
          <span class="lang-a">&#8250;</span>
        </div>
        <div class="lang-card" onclick="pickLang('hi')">
          <div class="lang-ic">${GLOBE}</div>
          <div><div class="lang-t">हिन्दी</div><div class="lang-s">Hindi</div></div>
          <span class="lang-a">&#8250;</span>
        </div>
      </div>
    </div>`
});

/* ============================================================
   TESTS — tests.html
   ============================================================ */
const tests = shell({
  file: 'tests.html',
  bodyId: 'page-tests',
  title: 'Tests',
  content: `
    ${appbarBack('Tests &amp; Reports', 'Laboratory &amp; Radiology', '<div class="grow" style="display:none"></div>')}
    <div class="sec" style="margin-top:4px"><h2>Laboratory</h2></div>
    <a class="infoitem" href="javascript:openTest('Complete Blood Count (CBC)','Laboratory','Venous blood','Collect on empty stomach. Sample collection at Central Laboratory, Ground Floor.')"><div class="ii-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9l3-2 3 2M14 14l3 2"/></svg>'}</div><div><div class="ii-t">Complete Blood Count (CBC)</div><div class="ii-s">Blood &bull; View test details</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="javascript:openTest('Blood Sugar (Fasting)','Laboratory','Venous blood','Fasting required (8–10 hours). Sample at Central Laboratory, Ground Floor.')"><div class="ii-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9h-9z"/></svg>'}</div><div><div class="ii-t">Blood Sugar (Fasting)</div><div class="ii-s">Blood &bull; Fasting test</div></div><span class="ii-a">${CHEV}</span></a>
    <a class="infoitem" href="javascript:openTest('Lipid Profile','Laboratory','Venous blood','Fasting required (10–12 hours). Sample collection, Ground Floor lab.')"><div class="ii-ic" style="background:var(--danger-light);color:var(--danger)">${HEART}</div><div><div class="ii-t">Lipid Profile</div><div class="ii-s">Blood &bull; Heart health</div></div><span class="ii-a">${CHEV}</span></a>
    <div class="sec"><h2>Sample Collection</h2></div>
    <div class="infocard"><div class="ic-head"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/><path d="M12 8v5M9.5 10.5h5"/></svg>Sample Collection Points</div>
      <div class="ic-row"><span class="k">Central Laboratory</span><span class="v">Ground Floor</span></div>
      <div class="ic-row"><span class="k">Collection Timing</span><span class="v">Sample (08:00–11:00)</span></div>
      <div class="ic-row"><span class="k">Fasting Tests</span><span class="v">Morning hours</span></div></div>
    <div class="infocard"><div class="ic-head">${CAL} Report Collection</div>
      <div class="ic-row"><span class="k">Report Counter</span><span class="v">Ground Floor</span></div>
      <div class="ic-row"><span class="k">Turnaround</span><span class="v">Same day (most)</span></div>
      <div class="ic-row"><span class="k">Online Reports</span><span class="v">Not available yet</span></div></div>
    <div class="sec"><h2>Radiology</h2></div>
    <div class="grid2">
      <a class="svc" href="javascript:openTest('X-Ray','Radiology','Imaging','Radiology Wing, Ground Floor. Report at Radiology counter.')"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 12h20M6 10v4M12 9v6"/></svg>'}</div><div class="svc-t">X-Ray</div></a>
      <a class="svc" href="javascript:openTest('CT Scan','Radiology','Imaging','CT Suite, Radiology Wing. Prior appointment required.')"><div class="svc-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>'}</div><div class="svc-t">CT Scan</div></a>
      <a class="svc" href="javascript:openTest('MRI','Radiology','Imaging','MRI Suite, Radiology Wing. Prior appointment required.')"><div class="svc-ic" style="background:#F0EBFA;color:#6B4FA0">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M4 11a2 2 0 0 1 4 0 2 2 0 0 0 4 0 2 2 0 0 1 4 0 2 2 0 0 1 3 1"/></svg>'}</div><div class="svc-t">MRI</div></a>
      <a class="svc" href="javascript:openTest('Ultrasound','Radiology','Imaging','USG Suite, Radiology Wing.')"><div class="svc-ic" style="background:var(--amber-light);color:var(--amber)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7v10M8 5v14M12 3v18M16 5v14M20 7v10"/></svg>'}</div><div class="svc-t">Ultrasound</div></a>
    </div>
    <div class="note-callout" style="margin-top:16px">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>'}Online report access is not integrated yet. Reports are available at the hospital counters.</div>`
});

/* ============================================================
   TEST DETAIL — test.html
   ============================================================ */
const testdetail = shell({
  file: 'test.html',
  bodyId: 'page-test',
  title: 'Test Details',
  content: `
    ${appbarBack('Test Details', null, '<div class="grow" style="display:none"></div>')}
    <h2 style="display:none" id="tdTitle"></h2>
    <div id="tdBody"></div>`
});

/* ============================================================
   ADMISSIONS — admissions.html
   ============================================================ */
const admissions = shell({
  file: 'admissions.html',
  bodyId: 'page-admissions',
  title: 'Admissions',
  content: `
    ${appbarBack('Admissions', null, '<div class="grow" style="display:none"></div>')}
    <div id="admList" style="padding-top:4px;"></div>`
});

/* ============================================================
   ACADEMICS — academics.html
   ============================================================ */
const academics = shell({
  file: 'academics.html',
  bodyId: 'page-academics',
  title: 'Academics',
  content: `
    ${appbarBack('Academics', null, '<div class="grow" style="display:none"></div>')}
    <div class="grid2" style="margin-top:12px;">
      <a class="svc" href="javascript:toast('Courses — available via official prospectus')"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'}</div><div class="svc-t">Courses</div></a>
      <a class="svc" href="javascript:toast('Curriculum — available via official materials')"><div class="svc-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21h15"/></svg>'}</div><div class="svc-t">Curriculum</div></a>
      <a class="svc" href="academiccal.html"><div class="svc-ic" style="background:#F0EBFA;color:#6B4FA0">${CAL}</div><div class="svc-t">Academic Calendar</div></a>
      <a class="svc" href="javascript:toast('Examinations — see notices')"><div class="svc-ic" style="background:var(--danger-light);color:var(--danger)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>'}</div><div class="svc-t">Examinations</div></a>
      <a class="svc" href="notices.html"><div class="svc-ic" style="background:var(--amber-light);color:var(--amber)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 9h8M8 13h5"/></svg>'}</div><div class="svc-t">Academic Notices</div></a>
      <a class="svc" href="departments.html"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13"/></svg>'}</div><div class="svc-t">Departments</div></a>
      <a class="svc" href="javascript:toast('Faculty — official list')"><div class="svc-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'}</div><div class="svc-t">Faculty</div></a>
      <a class="svc" href="javascript:toast('Research — official information')"><div class="svc-ic" style="background:#FDEAF4;color:#C2255C">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>'}</div><div class="svc-t">Research</div></a>
      <a class="svc" href="library.html"><div class="svc-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'}</div><div class="svc-t">Library</div></a>
    </div>`
});

/* ============================================================
   COLLEGE EVENTS — events.html
   ============================================================ */
const collegeevents = shell({
  file: 'events.html',
  bodyId: 'page-events',
  title: 'College Events',
  content: `
    ${appbarBack('College Events', null, '<div class="grow" style="display:none"></div>')}
    <div class="sample-banner" style="margin-top:12px">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>'}Placeholder events. Add official college event details via the admin console.</div>
    <div id="eventsList" style="padding-top:4px;"></div>`
});

/* ============================================================
   ACADEMIC CALENDAR — academiccal.html (bonus)
   ============================================================ */
const academiccal = shell({
  file: 'academiccal.html',
  bodyId: 'page-academiccal',
  title: 'Academic Calendar',
  content: `
    ${appbarBack('Academic Calendar', null, '<div class="grow" style="display:none"></div>')}
    <div class="sample-banner" style="margin-top:12px">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>'}Sample placeholder calendar. Add official academic dates when available.</div>
    <div class="daybook">
      <div class="db-row"><div class="db-day">Term 1</div><div class="db-d">Sample: June – October</div></div>
      <div class="db-row"><div class="db-day">Term 2</div><div class="db-d">Sample: November – April</div></div>
      <div class="db-row"><div class="db-day">Term Break</div><div class="db-d">Sample: December (tbc)</div></div>
    </div>`
});

/* ============================================================
   LIBRARY — library.html (bonus)
   ============================================================ */
const library = shell({
  file: 'library.html',
  bodyId: 'page-library',
  title: 'Library',
  content: `
    ${appbarBack('Library', null, '<div class="grow" style="display:none"></div>')}
    <div class="infoitem" onclick="toast('Library timing — sample')" style="margin-top:12px"><div class="ii-ic" style="background:var(--primary-light);color:var(--primary)">${CLOCK}</div><div><div class="ii-t">Library Hours</div><div class="ii-s">Sample: 8:00 AM – 8:00 PM</div></div><span class="ii-a">${CHEV}</span></div>
    <div class="infoitem" onclick="toast('Digital library / journals')"><div class="ii-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>'}</div><div><div class="ii-t">Digital Resources</div><div class="ii-s">Online journals &amp; e-books</div></div><span class="ii-a">${CHEV}</span></div>
    <div class="infoitem" onclick="toast('Issue / return desk')"><div class="ii-ic" style="background:var(--amber-light);color:var(--amber)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'}</div><div><div class="ii-t">Issue / Return</div><div class="ii-s">Membership required</div></div><span class="ii-a">${CHEV}</span></div>`
});

/* ============================================================
   STUDENT CORNER — student.html
   ============================================================ */
const student = shell({
  file: 'student.html',
  bodyId: 'page-student',
  title: 'Student Corner',
  content: `
    ${appbarBack('Student Corner', null, '<div class="grow" style="display:none"></div>')}
    <button class="btn btn-primary" style="margin-top:12px;margin-bottom:18px" onclick="toast('Student login not available yet (placeholder)')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Student Login</button>
    <div class="grid2">
      <a class="svc" href="javascript:toast('Timetable — sample')"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M9 4v3M15 4v3M8 14h3M13 14h3M8 18h3M13 18h2"/></svg>'}</div><div class="svc-t">Timetable</div></a>
      <a class="svc" href="academiccal.html"><div class="svc-ic" style="background:var(--teal-light);color:var(--teal)">${CAL}</div><div class="svc-t">Academic Calendar</div></a>
      <a class="svc" href="javascript:toast('Examinations — see notices')"><div class="svc-ic" style="background:var(--danger-light);color:var(--danger)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>'}</div><div class="svc-t">Examinations</div></a>
      <a class="svc" href="javascript:toast('Results — via official portal')"><div class="svc-ic" style="background:var(--amber-light);color:var(--amber)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg>'}</div><div class="svc-t">Results</div></a>
      <a class="svc" href="notices.html"><div class="svc-ic" style="background:#F0EBFA;color:#6B4FA0">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 9h8M8 13h5"/></svg>'}</div><div class="svc-t">Notices</div></a>
      <a class="svc" href="library.html"><div class="svc-ic" style="background:#E8F6EF;color:#1E7A4D">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'}</div><div class="svc-t">Library</div></a>
      <a class="svc" href="javascript:toast('Hostel — sample info')"><div class="svc-ic" style="background:#FDEAF4;color:#C2255C">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-4h6v4M9 13h6"/></svg>'}</div><div class="svc-t">Hostel</div></a>
      <a class="svc" href="javascript:toast('Scholarships — via official portal')"><div class="svc-ic" style="background:var(--primary-light);color:var(--primary)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M16 7H9a2.5 2.5 0 0 0 0 5h6a2.5 2.5 0 0 1 0 5H7"/></svg>'}</div><div class="svc-t">Scholarships</div></a>
      <a class="svc" href="javascript:toast('Downloads — sample')"><div class="svc-ic" style="background:var(--teal-light);color:var(--teal)">${'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>'}</div><div class="svc-t">Downloads</div></a>
    </div>`
});

/* ============================================================
   NOTIFICATIONS — notifications.html
   ============================================================ */
const notifications = shell({
  file: 'notifications.html',
  bodyId: 'page-notifications',
  title: 'Notifications',
  content: `
    ${appbarBack('Notifications', null, '<button class="icobtn" onclick="toast(\'All marked as read (demo)\')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v6h6"/><path d="M4 10a8 8 0 1 1 2 5M20 20v-6h-6"/></svg></button>')}
    <div id="notifList" style="padding-top:4px;"></div>`
});

/* ---------- write ---------- */
const pages = [home, hospital, search, notices, profile, emergency, departments, department, doctors, doctor, opd, appointment, navigation, map, welcome, langpage, tests, testdetail, admissions, academics, academiccal, library, student, notifications, collegeevents];

for (const p of pages) {
  const dest = path.join(OUT, p.file);
  fs.writeFileSync(dest, p.html);
  console.log('wrote', p.file, p.html.length, 'bytes');
}
console.log('Done —', pages.length, 'pages');
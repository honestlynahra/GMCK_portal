/* ============================================================
   GMC KOZHIKODE — Sample data (clearly marked as placeholder)
   Replace DEPTS, DOCS, NOTICES, NOTIFS with official data.
   ============================================================ */

var DEPTS = [
  {name:'Cardiology', desc:'Heart & cardiovascular care', cat:'Super Speciality', loc:'Main Hospital', opd:'Mon–Sat, sample',
   services:['ECG & ECHO','Cardiac OPD','Pre-op cardiac evaluation','Heart failure clinic']},
  {name:'Pulmonology', desc:'Lungs & respiratory care', cat:'Super Speciality', loc:'OPD Block', opd:'Mon–Sat, sample',
   services:['Pulmonary function test','Asthma & allergy clinic','Chest OPD','Sleep clinic']},
  {name:'Neurology', desc:'Brain, spine & nervous system', cat:'Super Speciality', loc:'Main Hospital', opd:'Sample timing',
   services:['Stroke unit','Epilepsy clinic','Neuro-OPD','EEG & EMG']},
  {name:'Orthopaedics', desc:'Bones, joints & trauma care', cat:'Surgical', loc:'Ortho Block', opd:'Mon–Sat, sample',
   services:['Fracture care','Joint replacement','Sports injury','Spine clinic']},
  {name:'Ophthalmology', desc:'Eye care & vision services', cat:'Clinical', loc:'OPD Block', opd:'Sample timing',
   services:['Cataract clinic','Retina clinic','Vision testing','Ocular medicines']},
  {name:'ENT', desc:'Ear, nose & throat care', cat:'Clinical', loc:'OPD Block', opd:'Sample timing',
   services:['Hearing tests','Voice clinic','Sinus care','Minor ENT procedures']},
  {name:'Paediatrics', desc:'Child health & care', cat:'Clinical', loc:'OPD Block', opd:'Sample timing',
   services:['Newborn care','Vaccination','Child development clinic','Paediatric OPD']},
  {name:'Obstetrics & Gynaecology', desc:'Pregnancy & womens health', cat:'Clinical', loc:'Maternity Block', opd:'Sample timing',
   services:['Antenatal clinic','Labour & delivery','Gynaecology OPD','Family planning']},
  {name:'Dentistry', desc:'Dental & oral health', cat:'Clinical', loc:'OPD Block', opd:'Sample timing',
   services:['General dentistry','Oral surgery','Root canal','Paediatric dentistry']},
  {name:'Dermatology', desc:'Skin, hair & nail care', cat:'Clinical', loc:'OPD Block', opd:'Sample timing',
   services:['Skin OPD','Allergy clinic','Cosmetic procedures','Dermatological surgery']},
  {name:'General Medicine', desc:'Adult internal medicine', cat:'Clinical', loc:'Main Hospital', opd:'Mon–Sat, sample',
   services:['Physician OPD','Diabetes clinic','Hypertension clinic','Fever clinic']},
  {name:'Radiology', desc:'Diagnostic imaging services', cat:'Diagnostic', loc:'Radiology Wing', opd:'Sample timing',
   services:['X-Ray','Ultrasound','CT scan','MRI']}
];

var DOCS = [
  {name:'Dr. [Sample Name]', des:'Professor & HOD', dept:'Cardiology', spec:'Interventional Cardiology'},
  {name:'Dr. [Sample Name]', des:'Associate Professor', dept:'Cardiology', spec:'Non-invasive Cardiology'},
  {name:'Dr. [Sample Name]', des:'Assistant Professor', dept:'Medicine', spec:'General & Internal Medicine'},
  {name:'Dr. [Sample Name]', des:'Professor', dept:'Orthopaedics', spec:'Joint Replacement & Trauma'},
  {name:'Dr. [Sample Name]', des:'Assistant Professor', dept:'Paediatrics', spec:'Neonatology'},
  {name:'Dr. [Sample Name]', des:'Consultant', dept:'Neurology', spec:'Stroke & Epilepsy'},
  {name:'Dr. [Sample Name]', des:'Associate Professor', dept:'Dermatology', spec:'Clinical Dermatology'}
];

var NOTICES = [
  {t:'OPD schedule update for the week', cat:'Hospital', c:'cat-hosp', d:'5 Sep 2026', s:'Sample notice text. Weekly OPD timings may be updated. Refer to the OPD desk.'},
  {t:'UG admission counselling schedule', cat:'Admission', c:'cat-adm', d:'4 Sep 2026', s:'Sample notice. Candidates should refer to the official admission portal for dates.'},
  {t:'Final year examination timetable', cat:'Examination', c:'cat-exam', d:'2 Sep 2026', s:'Sample notice. Examination schedule issued by the examination cell.'},
  {t:'Emergency preparedness drill announced', cat:'Hospital', c:'cat-emo', d:'30 Aug 2026', s:'Sample notice. Periodic emergency drill for hospital staff.'},
  {t:'Research colloquium registration open', cat:'Academics', c:'cat-acad', d:'28 Aug 2026', s:'Sample notice. Research colloquium for postgraduate students and faculty.'}
];

var NOTIFS = [
  {t:'OPD schedule update', s:'OPD timings updated for this week.', time:'2h ago', unread:true, b:'var(--primary-light)', col:'var(--primary)'},
  {t:'Hospital notice', s:'Main block maintenance notice.', time:'5h ago', unread:true, b:'var(--primary-light)', col:'var(--primary)'},
  {t:'Admission notice', s:'UG counselling schedule published.', time:'1d ago', unread:true, b:'var(--amber-light)', col:'var(--amber)'},
  {t:'Exam notification', s:'Timetable for final year released.', time:'2d ago', unread:false, b:'#F0EBFA', col:'#6B4FA0'},
  {t:'Emergency announcement', s:'Emergency drill scheduled this week.', time:'3d ago', unread:false, b:'var(--danger-light)', col:'var(--danger)'}
];

/* Problem-based (symptom) → department mapping */
var PROBLEM_MAP = {
  'chest pain':'Cardiology','chest':'Cardiology','heart':'Cardiology','cardiac':'Cardiology',
  'breathing problem':'Pulmonology','breathing':'Pulmonology','lung':'Pulmonology',
  'bone pain':'Orthopaedics','bone':'Orthopaedics','joint':'Orthopaedics','fracture':'Orthopaedics',
  'skin problem':'Dermatology','skin':'Dermatology','rash':'Dermatology',
  'headache':'Neurology','brain':'Neurology','nerve':'Neurology','seizure':'Neurology',
  'eye':'Ophthalmology','vision':'Ophthalmology',
  'ear':'ENT','nose':'ENT','throat':'ENT','ent':'ENT',
  'child':'Paediatrics','baby':'Paediatrics','vaccination':'Paediatrics',
  'pregnancy':'Obstetrics & Gynaecology','pregnant':'Obstetrics & Gynaecology',
  'dental':'Dentistry','tooth':'Dentistry'
};

/* Shared inline SVG path fragments for JS templates */
var ICONS = {
  shield:'<path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/>',
  heart:'<path d="M20 8c0 4-8 12-8 12S4 12 4 8a5 5 0 0 1 9-3 5 5 0 0 1 7 3z"/>',
  steth:'<path d="M8 21h8M12 17v4M8 2h8v6a4 4 0 0 1-8 0V2z"/><path d="M8 6h8"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M9 15h6M12 12v6"/>',
  pin:'<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  chev:'<path d="M9 6l6 6-6 6"/>'
};
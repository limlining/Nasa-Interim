(function() {
'use strict';
var $ = function(s,r) {return (r||document).querySelector(s)};
var esc = function(s) {return String(s).replace(/[&<>"']/g, function(c) {return {'&':'&amp;', '<':'&lt;', '>':'&gt;','"':'&quot;',"'":"&#39;"}[c]})};

// Storage setup
var KEY = 'interim.en.v1', mem = {};
function load() { try { var j = localStorage.getItem(KEY); return j ? JSON.parse(j) : mem; } catch(e) { return mem; } }
function save() { mem = {log: S.log, custom: S.custom}; try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch(e) {} }
var saved = load();

var S = {
  view: 'home',
  blackout: false,
  speed: 12,
  log: saved.log || [],
  custom: saved.custom || [],
  run: null,
  armClear: false
};

var HAZ = [
  ['H1', 'DISTANCE', 'Distance'],
  ['H2', 'ISOLATION', 'Isolation'],
  ['H3', 'CLOSED ENV', 'Closed environment'],
  ['H4', 'GRAVITY', 'Gravity'],
  ['H5', 'RADIATION', 'Radiation'],
  ['H6', 'CARDIO', 'Cardiovascular']
];

var ACTS = [
  {n:'Observe', d: 'Watch the numbers, touch nothing. Set your escalation line first.'},
  {n:'Self-treat', d: 'Use medication or a procedure yourself, with no help.'},
  {n:'Call crew', d: 'Get a crewmate on scene to assess and act with you.'},
  {n:'Emergency', d: 'Start the emergency protocol: med kit, oxygen, whole crew.'}
];

var DUR = 8, CAP = 20, SPEEDS = [12, 30];

function V(key, label, unit, start, ok, crit, dp, j, kind, max) {
  return {key:key, label:label, unit:unit, start:start, ok:ok, crit:crit, dp:dp||0, j:j||0, kind:kind||'', max:max==null?999:max};
}

// Built-in Scenarios (with added body highlights)
var SC = [
  {
    id:'s1', hz:0, title:'Chest pain + heart rate 112', met:'MET day 214, 03:42', delay:8, bodyHighlight:'chest',
    brief:'Ten minutes after treadmill training, a crushing pressure behind your sternum spreads to your left arm. You are sitting by the Node 2 wall.',
    vit: [V('hr', 'Heart rate', 'bpm', 112, [55,100], [45,110], 0, 1.4), V('spo2', 'SpO2', '%', 95, [97,100], [92,101], 0, .4, '', 100), V('bp', 'Blood pressure', 'mmHg', 148, [95,130], [85,160], 0, 1.5, 'bp'), V('pain', 'Chest pain /10', 'pts', 6, [0,3], [0,7], 0, .12, '', 10)],
    to: [[132,91,160,8], [120,94,152,6], [106,96,140,5], [94,98,128,3]], rate: [6.5, 3.8, 2.2, 1],
    out: ['You sit and wait. The pressure worsens.', 'You chew aspirin and stop moving.', 'A crewmate arrives and helps you put on ECG patches.', 'You hit emergency call. Crew arrives with med kit.'],
    ideal:3, ok:[],
    say:'Chest pain with a fast heart rate: do not wait for us. Treat it as a possible acute coronary event.',
    why:'This can turn into a dangerous arrhythmia within twenty minutes.',
    steps: [['Stop and sit steady', 'Stop all activity, secure your body, and do not move alone.'], ['Call your crew', 'Press the module call button and ask for the med kit.'], ['Oxygen + ECG', 'Give oxygen if SpO2 is below 97. Apply ECG patches and start recording.'], ['Chew aspirin as prescribed', 'Confirm no bleeding risk first, then chew aspirin.'], ['Report every two minutes', 'Heart rate, SpO2, blood pressure and pain score go into the log.']],
    esc:'Fainting, SpO2 below 92 or pain above 8: whole crew goes to emergency protocol.'
  },
  {
    id:'s2', hz:1, title:'Insomnia + low mood', met:'MET day 311, 22:10', delay:12, bodyHighlight:'head',
    brief:'Fourth night shift in a row without sleep, only three and a half hours last night.',
    vit: [V('sleep', 'Sleep last night', 'h', 3.5, [6,9], [4.5,10], 1, 0, '', 24), V('mood', 'Mood /10', 'pts', 3, [6,10], [4,10], 0, .1, '', 10), V('rhr', 'Resting HR', 'bpm', 88, [55,85], [45,100], 0, 1), V('pvt', 'Reaction time PVT', 'ms', 410, [200,300], [150,380], 0, 6)],
    to: [[3.5,2,92,440], [3.5,5,80,340], [3.5,6,78,330], [3.5,3,100,400]], rate: [3, 1, 1.2, 3.2],
    out: ['You decide to push through another night.', 'You dim lights, do breathing exercises, and go lights out.', 'You talk with a crewmate for fifteen minutes.', 'You trigger emergency protocol unnecessarily.'],
    ideal:1, ok:[2],
    say:'No physical danger signs. Handle it yourself first: fixed routine, dim lights, relaxation training.',
    why:'Sleep loss and low mood from isolation should be dealt with early, but this is not an emergency.',
    steps: [['Dim lights, screens off', 'Start an hour before bed and keep module lighting low.'], ['Ten minutes of breathing', 'Four seconds in, six out, following relaxation routine.'], ['Log sleep and mood', 'Record last night sleep hours and today mood score.'], ['Chat with a crewmate', 'No need to talk about being unwell. Just talk.']],
    esc:'Three nights in a row under four hours of sleep: call your crew.'
  },
  {
    id:'s3', hz:2, title:'High CO2 + headache', met:'MET day 156, 15:20', delay:10, bodyHighlight:'head',
    brief:'Assembling hardware in node module. Your head has hurt for an hour and cabin CO2 is elevated.',
    vit: [V('co2', 'Cabin CO2', 'mmHg', 5.2, [0,3], [0,5], 1, .08), V('hr', 'Heart rate', 'bpm', 84, [55,100], [45,115], 0, 1), V('spo2', 'SpO2', '%', 97, [96,100], [92,101], 0, .3, '', 100), V('head', 'Headache /10', 'pts', 5, [0,2], [0,6], 0, 1, '', 10)],
    to: [[6.8,98,96,7], [6.1,92,97,6], [3.2,76,98,2], [3.6,78,98,3]], rate: [5, 3.5, 1, 2.2],
    out: ['Reading keeps climbing.', 'Painkiller dulls part of headache, but source of CO2 is still there.', 'Crew checks CO2 scrubber and clears duct obstruction.', 'Everyone masks up and moves module.'],
    ideal:2, ok:[],
    say:'High CO2 is a cabin problem, not just yours. Call crew to check scrubber and ducts.',
    why:'Painkiller treats headache only. Source is still there.',
    steps: [['Leave this module', 'Move to a module with a low CO2 reading.'], ['Call your crew', 'Give them the reading and ask to check scrubber.'], ['Increase ventilation', 'Switch on fans and clear anything blocking ducts.'], ['Recheck every five minutes', 'Log CO2 and headache score.']],
    esc:'Reading above 6.0 or confusion: everyone masks up and goes to emergency protocol.'
  },
  {
    id:'s4', hz:3, title:'Dizzy on standing + low BP', met:'Landing day 3, 07:05', delay:8, bodyHighlight:'body',
    brief:'Third day on Martian surface. You get up from bunk, vision blacks out, and you steady yourself.',
    vit: [V('bp', 'Blood pressure', 'mmHg', 84, [95,130], [88,160], 0, 1.2, 'bp'), V('hr', 'Heart rate', 'bpm', 108, [55,100], [45,120], 0, 1.3), V('spo2', 'SpO2', '%', 97, [96,100], [92,101], 0, .3, '', 100), V('dz', 'Dizziness /10', 'pts', 6, [0,2], [0,6], 0, .1, '', 10)],
    to: [[76,120,96,8], [104,82,98,2], [102,84,98,2], [106,88,98,3]], rate: [5.5, .8, 1.4, 2.4],
    out: ['You stand and wait for it to pass.', 'You lie down with legs raised and drink 500 ml salty drink.', 'Crewmate helps you lie down and brings fluids.', 'Emergency protocol started unnecessarily.'],
    ideal:1, ok:[2],
    say:'Orthostatic low blood pressure is common when adapting to gravity. Lie down with legs up.',
    why:'Symptoms change with posture and ease when lying flat.',
    steps: [['Lie flat now, legs raised', 'Do not try to stand through it.'], ['Fluids with salt', 'Slowly drink 500 ml of salty drink.'], ['Compression gear', 'Wear lower-body compression gear if available.'], ['Get up in three steps', 'Lie, sit for a minute, stand for a minute.']],
    esc:'Still dizzy after ten minutes lying down: call crew.'
  },
  {
    id:'s5', hz:4, title:'Nausea + red skin after EVA', met:'MET day 187, 11:48', delay:12, bodyHighlight:'body',
    brief:'Forty minutes after returning inside from spacewalk, you feel nauseous and skin is red.',
    vit: [V('nau', 'Nausea /10', 'pts', 6, [0,2], [0,6], 0, .1, '', 10), V('ery', 'Skin redness', '% body', 8, [0,2], [0,6], 0, .15), V('hr', 'Heart rate', 'bpm', 96, [55,100], [45,115], 0, 1.2), V('dose', 'Dosimeter total', 'mSv', 62, [0,20], [0,50], 0, .3)],
    to: [[8,14,108,71], [5,10,98,68], [4,8,88,63], [3,7,86,63]], rate: [5, 3.2, 1.4, 2.1],
    out: ['You stay in module and watch.', 'You take anti-nausea pill and cool skin.', 'Crewmate takes you to storm shelter and logs dosimeter.', 'Emergency protocol started in storm shelter.'],
    ideal:2, ok:[3],
    say:'Elevated solar activity plus nausea after EVA: assume acute exposure. Go to storm shelter.',
    why:'Cumulative dose depends on where you stay. Move first, assess second.',
    steps: [['Enter storm shelter', 'Take dosimeter and close hatch.'], ['Call crew', 'Report when EVA ended and symptoms began.'], ['Read and log dosimeter', 'Read every ten minutes and write down value.'], ['Anti-nausea drug and fluids', 'Take prescribed anti-nausea drug and sip water.']],
    esc:'Persistent vomiting or rapidly rising dosimeter: all crew into shelter.'
  },
  {
    id:'s6', hz:5, title:'Palpitations + irregular heartbeat', met:'MET day 262, 19:30', delay:9, bodyHighlight:'chest',
    brief:'After dinner your chest feels like it skipped a beat. No chest pain, no fainting.',
    vit: [V('hr', 'Heart rate', 'bpm', 96, [55,90], [45,115], 0, 1.2), V('spo2', 'SpO2', '%', 98, [96,100], [92,101], 0, .3, '', 100), V('bp', 'Blood pressure', 'mmHg', 126, [95,130], [85,160], 0, 1.2, 'bp'), V('pac', 'Ectopic beats', '/min', 9, [0,5], [0,15], 0, .8)],
    to: [[82,98,122,4], [86,98,124,5], [92,98,128,7], [106,97,138,11]], rate: [.9, 1.2, 2.2, 3.6],
    out: ['You sit down, put on ECG patch, and set escalation line.', 'You slow breathing and stop coffee.', 'Crewmate rushes over and hovers, increasing anxiety.', 'Whole crew goes to emergency protocol unnecessarily.'],
    ideal:0, ok:[1],
    say:'No chest pain, no fainting, normal SpO2. Sit down, record ECG, cut caffeine.',
    why:'Isolated extra beats are common and mostly benign.',
    steps: [['Sit down and stay still', 'Relax shoulders and breathe slowly.'], ['ECG patch, record ten minutes', 'Save trace to send to ground.'], ['Stop caffeine', 'No more coffee or energy drinks.'], ['Write down escalation line', 'Decide when to escalate.']],
    esc:'Fainting, chest pain, HR staying above 130, or SpO2 below 92: call for help.'
  }
];

var DIR = {hr:1, spo2:-1, bp:-1, dis:1}, MAG = {hr:22, spo2:5, bp:16, dis:2.5};
var TPL = [
  {say:'Observe first: sit steady, record numbers, and set an escalation line.', steps:[['Sit steady', 'Put down what you are doing.'], ['Log every five minutes', 'Record vitals.'], ['Write escalation line', 'Decide in advance when to call help.']]},
  {say:'Handle it yourself first: rest, follow manual and recheck after ten minutes.', steps:[['Stop and rest', 'Put down what you are doing.'], ['Treat per manual', 'Use matching procedure.'], ['Recheck in ten minutes', 'If no improvement, escalate.']]},
  {say:'Call your crew in and work through it together.', steps:[['Call crew', 'Press module call button.'], ['Say three things', 'Symptoms, start time, current readings.'], ['Treat together', 'Log numbers every five minutes.']]},
  {say:'Start emergency protocol straight away.', steps:[['Hit emergency call', 'Ask for med kit, oxygen, ECG.'], ['Stabilise vitals', 'Give oxygen and apply ECG.'], ['Report every two minutes', 'Log vitals.']]}
];

function gen(f) {
  var vit = [V('hr', 'Heart rate', 'bpm', f.hr, [55,100], [45,110], 0, 1.4), V('spo2', 'SpO2', '%', f.spo2, [97,100], [92,101], 0, .4, '', 100), V('bp', 'Blood pressure', 'mmHg', f.sbp, [95,130], [85,160], 0, 1.5, 'bp'), V('dis', 'Discomfort /10', 'pts', f.dis, [0,3], [0,7], 0, .12, '', 10)];
  var keys = ['hr', 'spo2', 'bp', 'dis'];
  var good = vit.map(function(v) { var s = v.start, w = v.ok[1] - v.ok[0]; return s < v.ok[0] ? v.ok[0] + w * .1 : s > v.ok[1] ? v.ok[1] - w * .1 : s; });
  var bad = vit.map(function(v,i) { var s = v.start, d = s < v.ok[0] ? -1 : s > v.ok[1] ? 1 : DIR[keys[i]]; return Math.max(0, Math.min(v.max, s + d * MAG[keys[i]])); });
  var to = [], rate = [], out = [];
  for (var c = 0; c < 4; c++) {
    var gap = f.ideal - c;
    to.push(vit.map(function(v,i) { var s = v.start; return gap > 0 ? s + (bad[i] - s) * Math.min(1, gap / 2) : gap === 0 ? good[i] : s + (good[i] - s) * .7; }));
    rate.push(gap > 0 ? 1.5 + 1.6 * gap : gap === 0 ? 1 : 1.4 + .5 * (-gap));
    out.push(gap > 0 ? 'You chose too little. Your numbers keep moving the wrong way.' : gap === 0 ? 'Your response matched symptoms and numbers begin to fall.' : 'Numbers settle, but this step was heavier than needed.');
  }
  var t = TPL[f.ideal];
  return {id:f.id, hz:f.hz, custom:true, title:f.title, met:'Custom scenario', delay:f.delay, brief:f.brief||'Custom scenario.', vit:vit, to:to, rate:rate, out:out, ideal:f.ideal, ok:[], say:t.say, why:'This is the reference answer you set.', steps:t.steps, esc:'Any clear worsening of numbers: go up one level.'};
}

function allSc() { return SC.concat(S.custom.map(gen)); }
function findSc(id) { return allSc().filter(function(s){return s.id === id;})[0]; }
function firstSentence(s) { var i = s.indexOf('.'); return i > -1 ? s.slice(0, i + 1) : s; }

var VT = {match:'Matches ground', ok:'Acceptable', late:'Too slow', over:'Overreaction'};
var STL = {ok:'Normal', warn:'Caution', crit:'Danger'};

function judge(sc, c) {
  if (c === sc.ideal) return {v:'match', diff:0};
  if (sc.ok.indexOf(c) > -1) return {v:'ok', diff:0};
  var d = c - sc.ideal; return {v:d < 0 ? 'late' : 'over', diff:d};
}

function stat(v, x) {
  if (x >= v.ok[0] && x <= v.ok[1]) return 'ok';
  if (x < v.crit[0] || x > v.crit[1]) return 'crit';
  return 'warn';
}

function fmt(v, x) {
  if (v.kind === 'bp') { var s = Math.round(x); return s + '/' + Math.round(s * .62); }
  return x.toFixed(v.dp);
}

function mmss(m) {
  var s = Math.max(0, Math.round(m * 60));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function spark(h) {
  var mn = Math.min.apply(null, h), mx = Math.max.apply(null, h);
  if (mx - mn < 1e-6) { mn -= 1; mx += 1; }
  return h.map(function(y, i) {
    var px = h.length > 1 ? i / (h.length - 1) * 60 : 0;
    var py = 16 - (y - mn) / (mx - mn) * 14;
    return (i ? ' L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
  }).join('');
}

var T = {brief:{CHOOSE:'wait'}, wait:{REPLY:'result', END:'result'}, result:{}};

function startRun(sc) {
  S.run = {
    sc: sc, phase: 'brief', simT: 0, cur: null, first: null, changes: [],
    base: sc.vit.map(function(v){return v.start;}),
    vals: sc.vit.map(function(v){return v.start;}),
    hist: sc.vit.map(function(v){return [v.start];}),
    budget: 100, seg: null, blk: false, aided: false, ticks: {}, res: null,
    last: performance.now(), hT: 0
  };
  S.view = 'run';
  render();
  window.scrollTo(0, 0);
}

function setSeg(c) {
  var r = S.run;
  r.cur = c;
  r.seg = {t0: r.simT, from: r.base.slice(), to: r.sc.to[c], rate: r.sc.rate[c]};
}

function send(ev, arg) {
  var r = S.run; if (!r) return;
  var nx = T[r.phase][ev]; if (!nx) return;
  if (ev === 'CHOOSE') { r.first = arg; setSeg(arg); }
  if (nx === 'result') finish(arg || 'reply');
  r.phase = nx;
  render();
  var p = $('#phase'); if (p && nx === 'result') p.scrollIntoView({block:'start'});
}

function finish(reason) {
  var r = S.run, j = judge(r.sc, r.first);
  r.res = {reason: reason, j: j};
  S.log.unshift({
    id: Date.now(), ts: Date.now(), sid: r.sc.id, title: r.sc.title, hz: r.sc.hz,
    c: r.first, ideal: r.sc.ideal, v: j.v, diff: j.diff, blk: r.blk,
    budget: Math.round(r.budget), mins: +r.simT.toFixed(1), sw: r.changes.length,
    reason: reason, aided: r.aided
  });
  save();
}

function tick() {
  var r = S.run; if (!r || S.view !== 'run') return;
  var now = performance.now(), dt = Math.min(.5, (now - r.last) / 1000); r.last = now;
  if (r.phase === 'wait') {
    var dm = dt * S.speed / 60;
    r.simT += dm;
    var p = Math.min(1, (r.simT - r.seg.t0) / DUR), e = 1 - Math.pow(1 - p, 2);
    r.base = r.sc.vit.map(function(v, i) { return r.seg.from[i] + (r.seg.to[i] - r.seg.from[i]) * e; });
    r.budget = Math.max(0, r.budget - r.seg.rate * dm);
  }
  if (S.blackout) r.blk = true;
  if (r.phase === 'result') return;
  var rt = now / 1000;
  r.vals = r.sc.vit.map(function(v, i) {
    var x = r.base[i] + v.j * (Math.sin(rt * 7.1 + i * 1.7) * .6 + Math.sin(rt * 3.3 + i) * .4);
    return Math.max(0, Math.min(v.max, x));
  });
  if (now - r.hT > 250) {
    r.hT = now;
    r.hist.forEach(function(h, i) { h.push(r.vals[i]); if (h.length > 48) h.shift(); });
  }
  if (r.phase === 'wait') {
    if (r.budget <= 0) { send('END', 'collapse'); return; }
    if (!S.blackout && r.simT >= r.sc.delay) { send('REPLY'); return; }
    if (S.blackout && r.simT >= CAP) { send('END', 'timeout'); return; }
  }
  live();
}

setInterval(tick, 100);

function live() {
  var r = S.run; if (!r) return;
  r.sc.vit.forEach(function(v, i) {
    var el = $('#v' + i); if (!el) return;
    var x = +r.vals[i].toFixed(v.dp), s = stat(v, x), d = r.base[i] - v.start;
    var ar = Math.abs(d) >= Math.max(.5, Math.abs(v.start) * .015) ? (d > 0 ? ' ↑' : ' ↓') : '';
    el.dataset.s = s;
    $('b', el).textContent = fmt(v, r.vals[i]);
    $('.st', el).textContent = STL[s] + ar;
    $('path', el).setAttribute('d', spark(r.hist[i]));
  });
  if (r.phase === 'wait') {
    var cd = $('#cdText'); if (!cd) return;
    cd.textContent = S.blackout ? mmss(r.simT) : mmss(r.sc.delay - r.simT);
    $('#cdBar').style.width = (Math.min(1, r.simT / r.sc.delay) * 100) + '%';
    $('#bv').textContent = Math.round(r.budget);
    $('#bBar').style.width = r.budget + '%';
    $('#bBar').parentElement.dataset.s = r.budget > 60 ? 'ok' : r.budget > 30 ? 'warn' : 'crit';
    var al = $('#alert');
    if (al) al.hidden = !(r.cur < 3 && r.budget < 70 && r.seg.rate >= 2.5);
  }
}

function mean(a) { return a.length ? a.reduce(function(x, y) { return x + y; }, 0) / a.length : 0; }

function prof() {
  var L = S.log.filter(function(e) { return !e.aided; });
  if (L.length < 3) return null;
  var avg = mean(L.map(function(e) { return e.diff; }));
  var late = L.filter(function(e) { return e.v === 'late'; }).length;
  var over = L.filter(function(e) { return e.v === 'over'; }).length;
  var good = L.filter(function(e) { return e.v === 'match' || e.v === 'ok'; }).length;
  var type, title, text;
  if (avg <= -.4) {
    type = 'wait'; title = 'You tend to over-wait';
    text = 'When symptoms get worse, you more often choose to sit and watch. For fast-moving problems, escalate first.';
  } else if (avg >= .4) {
    type = 'over'; title = 'You tend to over-react';
    text = 'You reach for escalation quickly. Ask first: can rest and fluids come first?';
  } else if (late && over) {
    type = 'swing'; title = 'You swing early and late';
    text = 'Your judgement has no steady line. Write your escalation lines down.';
  } else {
    type = 'calib'; title = 'You are close to calibrated';
    text = 'Your choices mostly track ground advice. Try comms blackout to test your autonomy.';
  }
  var cnt = [0, 0, 0, 0]; L.forEach(function(e) { cnt[e.c]++; });
  var B = L.filter(function(e) { return e.blk; }), N = L.filter(function(e) { return !e.blk; });
  return {
    type: type, title: title, text: text, avg: avg, good: good, late: late, over: over,
    cnt: cnt, n: L.length,
    bAvg: B.length ? mean(B.map(function(e) { return e.diff; })) : null,
    nAvg: N.length ? mean(N.map(function(e) { return e.diff; })) : null,
    bn: B.length
  };
}

function sg(x) { return (x > 0 ? '+' : x < 0 ? '-' : '') + Math.abs(x).toFixed(1); }

function guideSteps(r) { return r.cur === r.sc.ideal ? r.sc.steps : TPL[r.cur].steps; }

function topHTML() {
  return '<header class="top"><div class="mark"><i></i><div><b>INTERIM</b><small>Comms-delay decision trainer</small></div></div>' +
    '<button class="sw" role="switch" aria-checked="' + S.blackout + '" data-a="blk"><span>Comms<br>blackout</span><span class="t"><i></i></span></button></header>' +
    '<div class="strip"><span>MET <b>day 214</b></span><span>Ground delay <b>8-12 min</b></span><span class="' + (S.blackout ? 'lost' : '') + '">Link <b>' + (S.blackout ? 'LOST' : 'OK') + '</b></span></div>' +
    (S.blackout ? '<div class="banner">Comms blackout is on: countdown is gone and ground advice will not arrive. Use offline manual.</div>' : '');
}

function homeHTML() {
  var all = allSc(), done = {}; S.log.forEach(function(e) { done[e.sid] = 1; });
  var n = all.filter(function(s) { return done[s.id]; }).length;
  return '<div class="h"><h2>Scenarios</h2><span class="cnt">' + n + '/' + all.length + ' done</span></div><ol class="slist">' +
    all.map(function(s, i) {
      var last = S.log.filter(function(e) { return e.sid === s.id; })[0];
      var h = HAZ[s.hz];
      return '<li><button class="row" data-a="open" data-v="' + s.id + '"><span class="id">S' + (i + 1) + '</span><span><span class="hz">' + h[0] + ' ' + h[1] + (s.custom ? ' custom' : '') + '</span><span class="ttl">' + esc(s.title) + '</span><span class="sub">' + esc(firstSentence(s.brief)) + '</span></span>' +
        '<span class="rt"><span class="badge" data-v="' + (last ? last.v : '') + '">' + (last ? VT[last.v] : 'Not done') + '</span><span class="dl">ground ' + s.delay + 'm</span></span></button></li>';
    }).join('') + '</ol><button class="addrow" data-a="new">+ New scenario</button>' +
    '<p class="how"><b>How it works:</b> Pick a scenario, assess symptoms, and choose an action. Clock starts and vitals move. Finish 3 scenarios for your profile.</p>' +
    '<p class="note">Training simulation. Medical parameters are for demonstration only.</p>';
}

function vitHTML() {
  var r = S.run;
  return r.sc.vit.map(function(v, i) {
    var x = +r.vals[i].toFixed(v.dp);
    return '<div class="v" id="v' + i + '" data-s="' + stat(v, x) + '"><div class="lab">' + esc(v.label) + '</div><div class="val"><b>' + fmt(v, r.vals[i]) + '</b><u>' + esc(v.unit) + '</u></div><div class="meta"><span class="st"></span><svg class="spark" viewBox="0 0 60 18" aria-hidden="true"><path d=""/></svg></div></div>';
  }).join('');
}

function briefHTML() {
  var r = S.run;
  var fl = r.sc.vit.map(function(v, i) {
    var x = +r.vals[i].toFixed(v.dp), s = stat(v, x);
    return s === 'ok' ? null : v.label + ' ' + fmt(v, r.vals[i]) + ' ' + v.unit + ' (' + STL[s] + ')';
  }).filter(Boolean);
  var ai = r.aided ? '<div class="rec"><b>Interim suggests: ' + ACTS[r.sc.ideal].n + '</b><p>' + esc(r.sc.why) + '</p></div>' : '<button class="lnk" data-a="aid">Ask Interim for a recommendation</button><p class="note" style="margin-top:0">Aided decisions are not scored in profile.</p>';
  return '<div class="h"><h2>Interim read-out</h2></div><div class="panel pad"><div class="lab">' + HAZ[r.sc.hz][0] + ' ' + HAZ[r.sc.hz][1] + '</div><p style="margin:4px 0 8px">Flagged: ' + (fl.length ? esc(fl.join(', ')) : 'nothing out of range') + '.</p>' + ai + '</div><div class="h"><h2>Your call</h2></div><ol class="choices">' +
    ACTS.map(function(a, i) {
      return '<li><button class="ch" data-a="choose" data-v="' + i + '"><span class="k">' + (i + 1) + '</span><span><span class="n">' + a.n + '</span><span class="d">' + a.d + '</span></span></button></li>';
    }).join('') +
    '</ol><p class="note">Once you choose, the clock starts.</p>';
}

function waitHTML() {
  var r = S.run, b = S.blackout;
  return '<div class="panel comm' + (b ? ' dead' : '') + '"><div class="lab">' + (b ? 'Ground reply link lost' : 'Ground reply') + '</div>' +
    '<div class="cdrow"><div class="cd" id="cdText">--:--</div><div class="cdl">' + (b ? 'waited<br>no reply is coming' : 'remaining') + '</div></div>' +
    '<div class="bar' + (b ? ' dead' : '') + '"><i id="cdBar"></i></div>' +
    '<div class="crow"><span>Current call <b>' + ACTS[r.cur].n + '</b></span><span class="cb"><button class="lnk" data-a="spd">Speed ' + S.speed + 'x</button>' + (b ? '' : '<button class="lnk" data-a="skip">Skip ></button>') + '</span></div></div>' +
    '<div class="panel bud"><div class="lab">Body budget<span class="bn"><b id="bv">100</b> / 100</span></div><div class="bar b" data-s="ok"><i id="bBar"></i></div></div>' +
    '<div class="esc" id="alert" hidden><b>Interim alert:</b> Body budget dropping. <button class="btn" data-a="swap" data-v="' + Math.min(3, r.cur + 1) + '" style="margin-top:8px;min-height:44px">Escalate to ' + ACTS[Math.min(3, r.cur + 1)].n + '</button></div>' +
    '<div class="h"><h2>Action Checklist</h2></div><ol class="steps">' + guideSteps(r).map(function(s, i) {
      return '<li><label class="step"><input type="checkbox" data-i="' + i + '"' + (r.ticks[i] ? ' checked' : '') + '><span><b>Step ' + (i + 1) + ': ' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></span></label></li>';
    }).join('') + '</ol>' +
    '<div class="h"><h2>Change your call</h2></div><div class="mini">' +
    ACTS.map(function(a, i) {
      return '<button data-a="swap" data-v="' + i + '"' + (i === r.cur ? ' disabled' : '') + '>' + a.n + '</button>';
    }).join('') + '</div>' +
    (b ? '<button class="btn ghost" data-a="end">End wait and log decision</button>' : '');
}

function resultHTML() {
  var r = S.run, sc = r.sc, res = r.res, j = res.j, blk = r.blk;
  var ref = blk ? 'The offline manual' : 'Ground';
  var vd = {
    match: ref + ' made the same call.',
    ok: 'Workable. ' + ref + ' would choose "' + ACTS[sc.ideal].n + '".',
    late: ref + ' would choose "' + ACTS[sc.ideal].n + '". You underestimated it.',
    over: ref + ' would choose "' + ACTS[sc.ideal].n + '". Step was heavier than needed.'
  };
  var why = res.reason === 'collapse' ? 'Body budget ran out.' : res.reason === 'timeout' ? 'Ground never replied.' : '';
  var chg = r.changes.length ? '<dt>Changes</dt><dd>' + r.changes.length + 'x</dd>' : '';
  var right = blk
    ? '<div class="nosig"><div class="lab">Ground GND</div><div class="big">NO SIGNAL</div><p>Ground never replied.</p></div>'
    : '<div><div class="lab">Ground advice GND</div><div class="big">' + ACTS[sc.ideal].n + '</div><p>' + esc(sc.say) + '</p><p>' + esc(sc.why) + '</p></div>';
  return '<div class="h"><h2>Compare</h2></div>' + (why ? '<p class="note" style="margin:-4px 0 8px;color:var(--crit)">' + why + '</p>' : '') +
    '<div class="cmp"><div><div class="lab">Your call</div><div class="big">' + ACTS[r.first].n + '</div><p>' + esc(sc.out[r.first]) + '</p><dl><dt>Budget left</dt><dd>' + Math.round(r.budget) + ' / 100</dd><dt>Elapsed</dt><dd>' + mmss(r.simT) + '</dd>' + chg + '</dl></div>' + right + '</div>' +
    '<div class="verdict" data-v="' + j.v + '">' + VT[j.v] + '<span>' + vd[j.v] + '</span></div>' +
    '<div class="h"><h2>Action Checklist</h2></div><ol class="steps">' +
    sc.steps.map(function(s, i) {
      return '<li><label class="step"><input type="checkbox"><span><b>Step ' + (i + 1) + ': ' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></span></label></li>';
    }).join('') + '</ol>' +
    '<p class="esc"><b>Escalation line:</b> ' + esc(sc.esc) + '</p>' +
    '<button class="btn" data-a="next">Next scenario</button><button class="btn ghost" data-a="exit">Back to scenarios</button>';
}

function runHTML() {
  var r = S.run, sc = r.sc, h = HAZ[sc.hz];
  var ph = r.phase === 'brief' ? briefHTML() : r.phase === 'wait' ? waitHTML() : resultHTML();
  return '<div class="runtop"><button class="lnk" data-a="exit">← ' + (r.phase === 'wait' ? 'Abandon' : 'Back') + '</button><span class="tag">' + h[0] + ' ' + h[1] + '</span></div>' +
    '<section class="scard"><div class="met">' + esc(sc.met) + ' · ground delay ' + sc.delay + ' min</div><h1>' + esc(sc.title) + '</h1><p>' + esc(sc.brief) + '</p></section>' +
    '<section class="vit" id="vit">' + vitHTML() + '</section><section id="phase">' + ph + '</section>';
}

function logHTML() {
  var L = S.log;
  var rows = L.length ? L.map(function(e) {
    var d = new Date(e.ts), t = d.toLocaleString('en-GB', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}), h = HAZ[e.hz] || HAZ[0];
    return '<li class="logrow"><div><time>' + t + ' · ' + h[1] + '</time><div class="t">' + esc(e.title) + (e.blk ? '<span class="pill red">BLACKOUT</span>' : '') + (e.demo ? '<span class="pill">DEMO</span>' : '') + (e.aided ? '<span class="pill">AIDED</span>' : '') + '</div>' +
      '<div class="s">You chose "' + ACTS[e.c].n + '", advised "' + ACTS[e.ideal].n + '" · ' + VT[e.v] + '</div></div>' +
      '<div class="r">budget<br>' + e.budget + '</div></li>';
  }).join('') : '<li class="note" style="padding:14px 0">Nothing logged yet. Run a scenario or load demo entries.</li>';
  return '<div class="h"><h2>Decision log</h2><span class="cnt">' + L.length + ' entries</span></div><ol class="slist">' + rows + '</ol>' +
    (L.length ? '<button class="btn ghost" data-a="clear">' + (S.armClear ? 'Tap again to confirm' : 'Clear log') + '</button>' : '');
}

function profHTML() {
  var p = prof(), n = S.log.filter(function(e) { return !e.aided; }).length;
  if (!p) return '<div class="h"><h2>Decision profile</h2></div><div class="panel pad"><p>Finish at least 3 scenarios to generate a profile. You have ' + n + ' so far.</p><div class="bar" style="margin-top:10px"><i style="width:' + (n / 3 * 100) + '%"></i></div></div>' +
    '<button class="btn ghost" data-a="demo">Load demo entries</button>';
  var pos = Math.max(-2, Math.min(2, p.avg)), pct = (pos + 2) / 4 * 100;
  return '<div class="h"><h2>Decision profile</h2><span class="cnt">from ' + p.n + ' decisions</span></div>' +
    '<div class="panel pad"><div class="lab">Your type</div><div class="ptype">' + p.title + '</div><p>' + p.text + '</p>' +
    '<div class="gauge" role="img" aria-label="Average bias ' + sg(p.avg) + ' levels"><i class="dot" style="left:' + pct + '%"></i></div><div class="gl"><span>- Over-waiting</span><span>Calibrated</span><span>Over-reacting +</span></div>' +
    '<div class="stats"><div><b>' + Math.round(p.good / p.n * 100) + '%</b><span>Matched ground</span></div><div><b>' + p.late + '</b><span>Too slow</span></div><div><b>' + p.over + '</b><span>Overreactions</span></div></div></div>';
}

function newHTML() {
  var o = HAZ.map(function(h, i) { return '<option value="' + i + '">' + h[0] + ' ' + h[2] + '</option>'; }).join('');
  var a = ACTS.map(function(x, i) { return '<option value="' + i + '"' + (i === 2 ? ' selected' : '') + '>' + x.n + '</option>'; }).join('');
  return '<div class="h"><h2>New scenario</h2></div><form class="f" id="nf">' +
    '<label><span class="lab">Title</span><input id="f-t" maxlength="60" placeholder="e.g. Abdominal pain + fever"></label>' +
    '<label><span class="lab">Symptoms</span><textarea id="f-b" maxlength="220" placeholder="What happened"></textarea></label>' +
    '<label><span class="lab">Hazard</span><select id="f-h">' + o + '</select></label>' +
    '<div class="two"><label><span class="lab">Heart rate bpm</span><input id="f-hr" type="number" value="108"></label><label><span class="lab">SpO2 %</span><input id="f-sp" type="number" value="95"></label></div>' +
    '<div class="two"><label><span class="lab">Systolic mmHg</span><input id="f-bp" type="number" value="110"></label><label><span class="lab">Discomfort /10</span><input id="f-d" type="number" value="5"></label></div>' +
    '<div class="two"><label><span class="lab">Ground delay (min)</span><input id="f-dl" type="number" value="10"></label><label><span class="lab">Ground would say</span><select id="f-i">' + a + '</select></label></div>' +
    '<button class="btn" type="submit">Create scenario</button><button class="btn ghost" type="button" data-a="cancel" style="margin-top:0">Cancel</button></form>';
}

function render() {
  var v = S.view;
  $('#app').innerHTML = topHTML() + (v === 'home' ? homeHTML() : v === 'log' ? logHTML() : v === 'profile' ? profHTML() : v === 'new' ? newHTML() : runHTML());
  var nav = $('#nav'); nav.hidden = (v === 'run' || v === 'new');
  nav.querySelectorAll('button').forEach(function(b) {
    if (b.dataset.v === v) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (v === 'run') live();
}

function num(id, lo, hi, d) {
  var x = parseFloat($(id).value); if (isNaN(x)) x = d; return Math.max(lo, Math.min(hi, x));
}

document.addEventListener('click', function(e) {
  var t = e.target.closest('[data-a]'); if (!t) return;
  var a = t.dataset.a, v = t.dataset.v;
  if (a === 'tab') { S.run = null; S.view = v; S.armClear = false; render(); window.scrollTo(0, 0); }
  else if (a === 'open') { startRun(findSc(v)); }
  else if (a === 'blk') { S.blackout = !S.blackout; render(); }
  else if (a === 'choose') { send('CHOOSE', +v); }
  else if (a === 'aid') { if (S.run && S.run.phase === 'brief') { S.run.aided = true; render(); } }
  else if (a === 'swap') { var r = S.run; if (r && r.phase === 'wait' && +v !== r.cur) { r.changes.push(+v); r.ticks = {}; setSeg(+v); render(); } }
  else if (a === 'spd') { S.speed = SPEEDS[(SPEEDS.indexOf(S.speed) + 1) % SPEEDS.length]; render(); }
  else if (a === 'skip') { if (S.run && S.run.phase === 'wait') S.run.simT = Math.max(S.run.simT, S.run.sc.delay); }
  else if (a === 'end') { send('END', 'manual'); }
  else if (a === 'exit') { S.run = null; S.view = 'home'; render(); window.scrollTo(0, 0); }
  else if (a === 'next') {
    var all = allSc(), i = all.indexOf(findSc(S.run.sc.id)), done = {};
    S.log.forEach(function(x) { done[x.sid] = 1; });
    var nx = null;
    for (var k = 1; k <= all.length; k++) {
      var c = all[(i + k) % all.length];
      if (!done[c.id]) { nx = c; break; }
    }
    if (nx) startRun(nx); else { S.run = null; S.view = 'profile'; render(); window.scrollTo(0, 0); }
  }
  else if (a === 'new') { S.view = 'new'; render(); window.scrollTo(0, 0); }
  else if (a === 'cancel') { S.view = 'home'; render(); }
  else if (a === 'clear') {
    if (S.armClear) { S.log = []; S.armClear = false; save(); render(); }
    else { S.armClear = true; render(); setTimeout(function() { if (S.armClear) { S.armClear = false; if (S.view === 'log') render(); } }, 3000); }
  }
  else if (a === 'demo') {
    var ids = [['s1', 0, 0, 34], ['s3', 1, 0, 61], ['s5', 0, 1, 28], ['s4', 3, 0, 88], ['s6', 0, 0, 90]];
    ids.forEach(function(d, idx) {
      var sc = findSc(d[0]), j = judge(sc, d[1]);
      S.log.push({
        id: Date.now() + idx, ts: Date.now() - (ids.length - idx) * 3600000, sid: sc.id, title: sc.title, hz: sc.hz,
        c: d[1], ideal: sc.ideal, v: j.v, diff: j.diff, blk: !!d[2], budget: d[3], mins: sc.delay, sw: 0, reason: 'reply', demo: true
      });
    });
    S.log.sort(function(x, y) { return y.ts - x.ts; }); save(); render();
  }
});

document.addEventListener('change', function(e) {
  var t = e.target;
  if (t.matches && t.matches('.step input[data-i]') && S.run && S.run.phase === 'wait') {
    S.run.ticks[t.dataset.i] = t.checked;
    if (t.checked) {
      // Reward astronaut by boosting budget when checking a step
      S.run.budget = Math.min(100, S.run.budget + 5);
      var bBar = $('#bBar'), bv = $('#bv');
      if (bBar) bBar.style.width = S.run.budget + '%';
      if (bv) bv.textContent = Math.round(S.run.budget);
    }
  }
});

document.addEventListener('submit', function(e) {
  if (e.target.id !== 'nf') return; e.preventDefault();
  var f = {
    id: 'c' + Date.now(), hz: +$('#f-h').value, title: $('#f-t').value.trim() || 'Custom scenario ' + (S.custom.length + 1),
    brief: $('#f-b').value.trim(), hr: num('#f-hr', 30, 200, 108), spo2: num('#f-sp', 60, 100, 95),
    sbp: num('#f-bp', 50, 220, 110), dis: num('#f-d', 0, 10, 5), delay: num('#f-dl', 8, 20, 10), ideal: +$('#f-i').value
  };
  S.custom.push(f); save(); S.view = 'home'; render(); window.scrollTo(0, 0);
});

render();
})();
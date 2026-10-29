/* Jobs page. Loads assets/data/jobs.json, adds search and filters, and shows the thank-you message after an application (?applied=1).
   To change the jobs, replace that JSON file. Do not edit this script for that. */
(function () {
  var list = document.getElementById('job-list');
  if (!list) { return; }
  var search = document.getElementById('job-search');
  var modeSel = document.getElementById('job-mode');
  var typeSel = document.getElementById('job-type');
  var count = document.getElementById('job-count');
  var empty = document.getElementById('job-empty');
  var noMatch = document.getElementById('job-nomatch');
  var failed = document.getElementById('job-failed');
  var filters = document.getElementById('job-filters');
  var jobs = [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text) { n.textContent = text; }
    return n;
  }

  function addList(parent, heading, items) {
    if (!items || !items.length) { return; }
    parent.appendChild(el('h4', null, heading));
    var ul = el('ul');
    items.forEach(function (t) { ul.appendChild(el('li', null, t)); });
    parent.appendChild(ul);
  }

  function fmtDate(s) {
    var d = new Date(s);
    if (isNaN(d.getTime())) { return ''; }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function card(j) {
    var d = el('details', 'job');
    var s = el('summary');
    s.appendChild(el('span', 'job-title', j.title));
    if (j.sample) { s.appendChild(el('span', 'tag sample', 'Sample listing')); }
    var meta = [j.location, j.mode, j.type, j.experience].filter(Boolean).join(' | ');
    s.appendChild(el('span', 'job-meta', meta));
    d.appendChild(s);

    var b = el('div', 'job-body');
    if (j.company) { b.appendChild(el('p', 'job-company', j.company)); }
    if (j.summary) { b.appendChild(el('p', null, j.summary)); }
    addList(b, 'Responsibilities', j.responsibilities);
    addList(b, 'Requirements', j.requirements);
    if (j.skills && j.skills.length) {
      var tags = el('div', 'tags');
      j.skills.forEach(function (k) { tags.appendChild(el('span', 'tag', k)); });
      b.appendChild(tags);
    }
    var foot = el('div', 'job-foot');
    var a = el('a', 'btn small', 'Apply for this role');
    a.href = 'apply.html?job=' + encodeURIComponent(j.id || '') + '&title=' + encodeURIComponent(j.title || '');
    foot.appendChild(a);
    var when = j.posted ? fmtDate(j.posted) : '';
    if (when) { foot.appendChild(el('span', 'note', 'Posted ' + when)); }
    b.appendChild(foot);
    d.appendChild(b);
    return d;
  }

  function fillSelect(sel, values) {
    values.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v; o.textContent = v;
      sel.appendChild(o);
    });
  }

  function uniq(key) {
    var out = [];
    jobs.forEach(function (j) { if (j[key] && out.indexOf(j[key]) === -1) { out.push(j[key]); } });
    return out;
  }

  function render() {
    var q = (search.value || '').toLowerCase().trim();
    var m = modeSel.value;
    var t = typeSel.value;
    var shown = jobs.filter(function (j) {
      if (m && j.mode !== m) { return false; }
      if (t && j.type !== t) { return false; }
      if (!q) { return true; }
      var hay = [j.title, j.location, j.company, (j.skills || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    list.textContent = '';
    shown.forEach(function (j) { list.appendChild(card(j)); });
    noMatch.hidden = shown.length !== 0;
    count.textContent = shown.length + (shown.length === 1 ? ' open role' : ' open roles');
  }

  function start(data) {
    jobs = (data && data.jobs ? data.jobs : []).filter(function (j) { return j && j.title && j.status !== 'closed'; });
    if (!jobs.length) {
      filters.hidden = true;
      empty.hidden = false;
      count.textContent = '';
      return;
    }
    fillSelect(modeSel, uniq('mode'));
    fillSelect(typeSel, uniq('type'));
    search.addEventListener('input', render);
    modeSel.addEventListener('change', render);
    typeSel.addEventListener('change', render);
    render();
  }

  fetch('assets/data/jobs.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) { throw new Error('bad'); } return r.json(); })
    .then(start)
    .catch(function () { filters.hidden = true; failed.hidden = false; });

  var p = new URLSearchParams(window.location.search);
  if (p.get('applied') === '1') {
    var box = document.getElementById('apply-status');
    if (box) {
      box.className = 'status ok';
      box.textContent = 'Thank you. Your application has been sent. Our team will contact you if your profile matches.';
    }
  }
})();

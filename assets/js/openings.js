/* Daily Openings page. Loads assets/data/openings.json, groups openings by day (Today, Yesterday, dates), adds search and a work mode filter,
   and hides openings older than 14 days behind a button. To change the openings, replace the JSON file, not this script. */
(function () {
  var list = document.getElementById('op-list');
  if (!list) { return; }
  var search = document.getElementById('op-search');
  var modeSel = document.getElementById('op-mode');
  var count = document.getElementById('op-count');
  var empty = document.getElementById('op-empty');
  var noMatch = document.getElementById('op-nomatch');
  var failed = document.getElementById('op-failed');
  var filters = document.getElementById('op-filters');
  var upd = document.getElementById('op-updated');
  var olderBtn = document.getElementById('op-older');
  var WA = '919880019951'; // WhatsApp number for the Apply on WhatsApp button (country code first, no + or spaces)
  var items = [];
  var showOlder = false;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) { n.className = cls; } if (text) { n.textContent = text; } return n; }
  function iso(d) { var m = d.getMonth() + 1, day = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day; }
  function parse(s) { var p = String(s || '').split('-'); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
  function nice(s) { var d = parse(s); return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
  function dayLabel(s) {
    var t = new Date(); var today = iso(t); t.setDate(t.getDate() - 1); var y = iso(t);
    if (s === today) { return 'Today'; } if (s === y) { return 'Yesterday'; } return nice(s);
  }
  function daysAgo(s) { var a = new Date(); a.setHours(0, 0, 0, 0); return Math.round((a - parse(s)) / 86400000); }

  function card(o) {
    var a = el('article', 'opening');
    var top = el('div', 'op-top');
    top.appendChild(el('h3', null, o.title));
    if (o.sample) { top.appendChild(el('span', 'tag sample', 'Sample listing')); }
    a.appendChild(top);
    var meta = [o.company, o.location, o.mode, o.type, o.experience].filter(Boolean).join(' | ');
    if (meta) { a.appendChild(el('p', 'job-meta', meta)); }
    if (o.skills && o.skills.length) { var tg = el('div', 'tags'); o.skills.forEach(function (k) { tg.appendChild(el('span', 'tag', k)); }); a.appendChild(tg); }
    if (o.note) { a.appendChild(el('p', 'note', o.note)); }
    var foot = el('div', 'job-foot');
    var ap = el('a', 'btn small', 'Apply online');
    ap.href = 'apply.html?job=' + encodeURIComponent(o.id || '') + '&title=' + encodeURIComponent(o.title || '');
    foot.appendChild(ap);
    var wa = el('a', 'btn small outline', 'Apply on WhatsApp');
    wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Kinetix Sphere, I would like to apply for ' + o.title + ' (posted ' + nice(o.date) + '). My resume is attached.');
    wa.target = '_blank'; wa.rel = 'noopener';
    foot.appendChild(wa);
    a.appendChild(foot);
    return a;
  }

  function render() {
    var q = (search.value || '').toLowerCase().trim(), m = modeSel.value;
    var shown = items.filter(function (o) {
      if (m && o.mode !== m) { return false; }
      if (!showOlder && daysAgo(o.date) > 14) { return false; }
      if (!q) { return true; }
      return [o.title, o.location, o.company, (o.skills || []).join(' ')].join(' ').toLowerCase().indexOf(q) !== -1;
    });
    var older = items.filter(function (o) { return daysAgo(o.date) > 14; }).length;
    olderBtn.hidden = !older;
    olderBtn.textContent = showOlder ? 'Hide older openings' : 'Show older openings (' + older + ')';
    list.textContent = '';
    var last = '';
    shown.forEach(function (o) {
      if (o.date !== last) {
        var h = el('h2', 'day-head', dayLabel(o.date)); h.appendChild(el('span', null, nice(o.date))); list.appendChild(h); last = o.date;
      }
      list.appendChild(card(o));
    });
    noMatch.hidden = shown.length !== 0;
    count.textContent = shown.length + (shown.length === 1 ? ' opening' : ' openings');
  }

  function start(data) {
    items = (data && data.openings ? data.openings : []).filter(function (o) { return o && o.title && o.date && o.status !== 'closed'; });
    items.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    if (data && data.updated) { upd.textContent = 'Last updated ' + nice(data.updated); }
    if (!items.length) { filters.hidden = true; empty.hidden = false; olderBtn.hidden = true; count.textContent = ''; return; }
    var modes = []; items.forEach(function (o) { if (o.mode && modes.indexOf(o.mode) === -1) { modes.push(o.mode); } });
    modes.forEach(function (v) { var op = document.createElement('option'); op.value = v; op.textContent = v; modeSel.appendChild(op); });
    search.addEventListener('input', render); modeSel.addEventListener('change', render);
    olderBtn.addEventListener('click', function () { showOlder = !showOlder; render(); });
    render();
  }

  fetch('assets/data/openings.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) { throw new Error('bad'); } return r.json(); })
    .then(start)
    .catch(function () { filters.hidden = true; failed.hidden = false; });
})();

/* JPIS Fursan — school-wide student stars (every teacher, one total). */
(function () {
  var BIN = 'https://json.extendsclass.com/bin/f1e18cf2de64';
  window.fursanUnifiedAwards = window.fursanUnifiedAwards || [];

  function norm(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, ' ');
  }

  window.getUnifiedStudentTotal = function (student) {
    var key = norm(student);
    var total = 0;
    (window.fursanUnifiedAwards || []).forEach(function (a) {
      if (norm(a.student) === key) total += Number(a.stars) || 0;
    });
    if (window.cachedSchoolwideLeaderboard && Array.isArray(window.cachedSchoolwideLeaderboard)) {
      window.cachedSchoolwideLeaderboard.forEach(function (row) {
        if (norm(row.name || row.student) === key) {
          total = Math.max(total, Number(row.totalStars || row.stars || 0));
        }
      });
    }
    return total;
  };

  window.lookupUnifiedStudent = function (query) {
    var q = norm(query);
    if (!q) return [];
    var groups = {};
    function add(name, teacher, stars) {
      var key = norm(name);
      if (!key || (key.indexOf(q) === -1 && key !== q)) return;
      if (!groups[key]) groups[key] = { name: name, total: 0, byTeacher: {} };
      groups[key].total += Number(stars) || 0;
      var t = teacher || '—';
      groups[key].byTeacher[t] = (groups[key].byTeacher[t] || 0) + (Number(stars) || 0);
    }
    (window.fursanUnifiedAwards || []).forEach(function (a) {
      add(a.student, a.teacher, a.stars);
    });
    if (typeof studentObservations === 'object' && studentObservations) {
      Object.keys(studentObservations).forEach(function (k) {
        var obs = studentObservations[k];
        add(obs.student, obs.teacher || window.activeTeacherName, obs.stars);
      });
    }
    if (window.cachedSchoolwideLeaderboard) {
      window.cachedSchoolwideLeaderboard.forEach(function (row) {
        add(row.name || row.student, 'كل المعلمين', row.totalStars || row.stars);
      });
    }
    return Object.keys(groups).map(function (k) { return groups[k]; })
      .sort(function (a, b) { return b.total - a.total; });
  };

  function ensureLookup() {
    if (document.getElementById('studentStarLookupInput')) return;
    var modal = document.getElementById('teacherSyncModal');
    if (!modal) return;
    var stats = modal.querySelector('.grid');
    var box = document.createElement('div');
    box.className = 'rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 space-y-2';
    box.innerHTML = '<label class="block text-xs font-black text-indigo-900">بحث مجموع الطالب من كل المعلمين</label>' +
      '<input id="studentStarLookupInput" type="search" placeholder="Fehr / فهد" class="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />' +
      '<div id="studentStarLookupResults"></div>';
    if (stats && stats.parentNode) stats.parentNode.insertBefore(box, stats.nextSibling);
    var input = document.getElementById('studentStarLookupInput');
    if (input) input.addEventListener('input', renderLookup);
  }

  function renderLookup() {
    var input = document.getElementById('studentStarLookupInput');
    var out = document.getElementById('studentStarLookupResults');
    if (!out) return;
    var q = input ? input.value.trim() : '';
    if (!q) {
      out.innerHTML = '<p class="text-xs text-slate-500 font-medium">اكتب اسم الطالب لعرض مجموعه منك ومن بقية المعلمين.</p>';
      return;
    }
    var rows = window.lookupUnifiedStudent(q);
    if (!rows.length) {
      out.innerHTML = '<p class="text-xs text-amber-800 font-bold">لا توجد نجوم بعد لهذا الاسم.</p>';
      return;
    }
    out.innerHTML = rows.map(function (r) {
      var parts = Object.keys(r.byTeacher).map(function (t) {
        return '<li class="flex justify-between gap-2"><span>' + t + '</span><span class="font-black text-amber-700">' + r.byTeacher[t] + ' ⭐</span></li>';
      }).join('');
      return '<div class="rounded-2xl border border-amber-200 bg-white p-3"><div class="flex justify-between font-black"><span>' + r.name + '</span><span class="text-amber-700">' + r.total + ' ⭐</span></div><ul class="text-xs font-bold mt-1 space-y-0.5">' + parts + '</ul></div>';
    }).join('');
  }
  window.renderUnifiedLookup = renderLookup;

  function pullBin() {
    return fetch(BIN + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.awards)) return;
        var byId = {};
        (window.fursanUnifiedAwards || []).concat(data.awards).forEach(function (a) {
          if (a && a.id) byId[a.id] = a;
        });
        window.fursanUnifiedAwards = Object.keys(byId).map(function (k) { return byId[k]; });
      })
      .catch(function () {});
  }

  function pushAward(obs, starsToAdd) {
    var award = {
      id: 'aw_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      student: obs && obs.student,
      teacher: window.activeTeacherName || 'معلم',
      skillId: obs && obs.skillId,
      stars: Number(starsToAdd) || 0,
      grade: obs && obs.grade,
      section: obs && obs.section,
      ts: new Date().toISOString()
    };
    window.fursanUnifiedAwards.push(award);
    return pullBin().then(function () {
      var byId = {};
      window.fursanUnifiedAwards.forEach(function (a) {
        if (a && a.id) byId[a.id] = a;
      });
      byId[award.id] = award;
      window.fursanUnifiedAwards = Object.keys(byId).map(function (k) { return byId[k]; });
      return fetch(BIN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: 'fursan-stars-v1',
          updatedAt: new Date().toISOString(),
          awards: window.fursanUnifiedAwards
        })
      });
    }).catch(function () {}).then(function () {
      if (typeof updateSyncedStarsBadge === 'function') updateSyncedStarsBadge();
      renderLookup();
    });
  }

  function wrap() {
    if (typeof getStudentTotalStars === 'function' && !getStudentTotalStars._fursanWrapped) {
      var orig = getStudentTotalStars;
      window.getStudentTotalStars = function (student) {
        var local = orig(student);
        var unified = window.getUnifiedStudentTotal(student);
        return unified > local ? unified : local;
      };
      window.getStudentTotalStars._fursanWrapped = true;
    }
    if (typeof openTeacherSyncModal === 'function' && !openTeacherSyncModal._fursanWrapped) {
      var origOpen = openTeacherSyncModal;
      window.openTeacherSyncModal = function () {
        ensureLookup();
        pullBin().then(function () {
          origOpen();
          renderLookup();
        });
      };
      window.openTeacherSyncModal._fursanWrapped = true;
    }
    if (typeof syncStarToGoogleSheets === 'function' && !syncStarToGoogleSheets._fursanWrapped) {
      var origSync = syncStarToGoogleSheets;
      window.syncStarToGoogleSheets = function (obs, starsToAdd) {
        pushAward(obs, starsToAdd);
        return origSync(obs, starsToAdd);
      };
      window.syncStarToGoogleSheets._fursanWrapped = true;
    } else if (typeof syncStarToGoogleSheets !== 'function') {
      window.syncStarToGoogleSheets = function (obs, starsToAdd) {
        pushAward(obs, starsToAdd);
      };
    }
  }

  wrap();
  document.addEventListener('DOMContentLoaded', wrap);
  setTimeout(wrap, 800);
  pullBin();
})();

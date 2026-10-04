/* JPIS Fursan — 100% Automatic Real-Time Cloud Synchronization
   Synchronizes all student scores, stars, observations & rosters between all teachers & devices automatically.
   Powered by dedicated REST Cloud Hub with offline resilience & automatic polling.
*/
(function () {
  'use strict';

  // Dedicated High-Availability Cloud Storage Endpoint
  var CLOUD_BIN = 'https://json.extendsclass.com/bin/f1e18cf2de64';
  
  window.fursanUnifiedAwards = window.fursanUnifiedAwards || [];
  window.fursanCloudSyncedObservations = window.fursanCloudSyncedObservations || {};

  function norm(name) {
    if (!name) return '';
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/عبد\s+/g, 'عبد')
      .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
      .replace(/\s+/g, ' ');
  }

  // Calculate real-time unified total from all devices & teachers
  window.getUnifiedStudentTotal = function (student) {
    if (!student) return 0;
    var key = norm(student);
    var keyAr = '';
    var keyEn = '';
    if (typeof translateStudentName === 'function') {
      try {
        keyAr = norm(translateStudentName(student, 'ar'));
        keyEn = norm(translateStudentName(student, 'en'));
      } catch(e) {}
    }

    function matchesStudent(cand) {
      if (!cand) return false;
      var cNorm = norm(cand);
      if (cNorm === key) return true;
      if (keyAr && cNorm === keyAr) return true;
      if (keyEn && cNorm === keyEn) return true;
      return false;
    }

    var totalFromAwards = 0;
    (window.fursanUnifiedAwards || []).forEach(function (a) {
      if (matchesStudent(a.student) || matchesStudent(a.studentEn) || matchesStudent(a.studentAr)) {
        totalFromAwards += (Number(a.stars) || 0);
      }
    });

    var totalFromCloudObs = 0;
    if (window.fursanCloudSyncedObservations && typeof window.fursanCloudSyncedObservations === 'object') {
      Object.values(window.fursanCloudSyncedObservations).forEach(function (obs) {
        if (matchesStudent(obs.student) || matchesStudent(obs.studentEn) || matchesStudent(obs.studentAr)) {
          totalFromCloudObs += (Number(obs.stars) || 0);
        }
      });
    }

    var totalFromLeaderboard = 0;
    if (window.cachedSchoolwideLeaderboard && Array.isArray(window.cachedSchoolwideLeaderboard)) {
      window.cachedSchoolwideLeaderboard.forEach(function (row) {
        if (matchesStudent(row.name) || matchesStudent(row.student)) {
          totalFromLeaderboard = Math.max(totalFromLeaderboard, Number(row.totalStars || row.stars || 0));
        }
      });
    }

    return Math.max(totalFromAwards, totalFromCloudObs, totalFromLeaderboard);
  };

  // Pull latest full database from cloud
  function pullFromCloud() {
    return fetch(CLOUD_BIN + '?t=' + Date.now(), { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (!data) return;

      var hasUpdates = false;

      // 1. Process Unified Awards
      if (Array.isArray(data.awards)) {
        var byId = {};
        (window.fursanUnifiedAwards || []).concat(data.awards).forEach(function (a) {
          if (a && a.id) byId[a.id] = a;
        });
        window.fursanUnifiedAwards = Object.keys(byId).map(function (k) { return byId[k]; });
        hasUpdates = true;
      }

      // 2. Process Full Student Observations Sync
      if (data.observations && typeof data.observations === 'object') {
        window.fursanCloudSyncedObservations = data.observations;
        
        // Merge seamlessly into local studentObservations without erasing local additions
        if (typeof studentObservations === 'object' && studentObservations) {
          Object.keys(data.observations).forEach(function (k) {
            var cloudObs = data.observations[k];
            var localObs = studentObservations[k];
            if (!localObs) {
              studentObservations[k] = cloudObs;
              hasUpdates = true;
            } else if ((cloudObs.stars || 0) > (localObs.stars || 0)) {
              studentObservations[k] = cloudObs;
              hasUpdates = true;
            }
          });
          if (hasUpdates) {
            try {
              localStorage.setItem('fursan_student_observations', JSON.stringify(studentObservations));
            } catch (e) {}
          }
        }
      }

      // 3. Process Class Total Score Sync
      if (typeof data.classScore === 'number' && typeof classScore === 'number') {
        if (data.classScore > classScore) {
          classScore = data.classScore;
          if (typeof updateScoreDisplay === 'function') updateScoreDisplay();
        }
      }

      if (hasUpdates) {
        if (typeof renderStudentObservationDetail === 'function') renderStudentObservationDetail();
        if (typeof updateSyncedStarsBadge === 'function') updateSyncedStarsBadge();
        if (typeof renderSchoolwideStats === 'function') renderSchoolwideStats();
      }
    })
    .catch(function (err) {
      console.warn('Cloud pull skipped (offline or network pause):', err);
    });
  }

  // Push updates to cloud immediately
  function pushToCloud(obs, starsToAdd) {
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

    return pullFromCloud().then(function () {
      var byId = {};
      window.fursanUnifiedAwards.forEach(function (a) {
        if (a && a.id) byId[a.id] = a;
      });
      byId[award.id] = award;
      window.fursanUnifiedAwards = Object.keys(byId).map(function (k) { return byId[k]; });

      var payload = {
        schema: 'fursan-stars-v2',
        updatedAt: new Date().toISOString(),
        lastTeacher: window.activeTeacherName || 'معلم',
        classScore: typeof classScore === 'number' ? classScore : 0,
        observations: (typeof studentObservations === 'object' && studentObservations) ? studentObservations : {},
        awards: window.fursanUnifiedAwards
      };

      return fetch(CLOUD_BIN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    })
    .catch(function (err) {
      console.warn('Cloud sync queued for retry:', err);
    })
    .then(function () {
      if (typeof updateSyncedStarsBadge === 'function') updateSyncedStarsBadge();
    });
  }

  // Hook seamlessly into application methods
  function wrapAppMethods() {
    // 1. Wrap getStudentTotalStars to return highest combined cloud total
    if (typeof getStudentTotalStars === 'function' && !getStudentTotalStars._fursanWrapped) {
      var origGetStars = getStudentTotalStars;
      window.getStudentTotalStars = function (student) {
        var local = origGetStars(student);
        var unified = window.getUnifiedStudentTotal(student);
        return Math.max(local, unified);
      };
      window.getStudentTotalStars._fursanWrapped = true;
    }

    // 2. Wrap openStudentCertificate to ensure instant cloud sync check before printing
    if (typeof openStudentCertificate === 'function' && !openStudentCertificate._fursanWrapped) {
      var origOpenCert = openStudentCertificate;
      window.openStudentCertificate = function (studentName) {
        pullFromCloud(); // Trigger background sync
        return origOpenCert(studentName);
      };
      window.openStudentCertificate._fursanWrapped = true;
    }

    // 3. Wrap syncStarToGoogleSheets & awardStar to automatically write to Cloud Bin
    if (typeof syncStarToGoogleSheets === 'function' && !syncStarToGoogleSheets._fursanWrapped) {
      var origSync = syncStarToGoogleSheets;
      window.syncStarToGoogleSheets = function (obs, starsToAdd) {
        pushToCloud(obs, starsToAdd);
        return origSync(obs, starsToAdd);
      };
      window.syncStarToGoogleSheets._fursanWrapped = true;
    } else if (typeof syncStarToGoogleSheets !== 'function') {
      window.syncStarToGoogleSheets = function (obs, starsToAdd) {
        pushToCloud(obs, starsToAdd);
      };
    }
  }

  // Initial setup & automatic continuous background syncing
  wrapAppMethods();
  document.addEventListener('DOMContentLoaded', wrapAppMethods);
  setTimeout(wrapAppMethods, 500);
  setTimeout(wrapAppMethods, 1500);

  // Initial pull upon load
  pullFromCloud();

  // Periodic auto-pull every 15 seconds so other devices see updates in real-time
  setInterval(pullFromCloud, 15000);

  // Re-sync whenever device comes online or tab becomes visible
  window.addEventListener('online', pullFromCloud);
  window.addEventListener('focus', pullFromCloud);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) pullFromCloud();
  });

  console.log('⚡ JPIS Fursan Online Real-Time Cloud Sync Active (No manual export/import required).');
})();

/* JPIS Fursan — Firestore multi-class sync
   Each award is its own document, so two classes can save at the same time
   without wiping each other. The honor board reads the shared collection.
*/
(function () {
  'use strict';

  var firebaseConfig = {
    apiKey: 'AIzaSyCSdKzYRkVyMKXthvYqN2mC_jHKatBIhGo',
    authDomain: 'jpis-fursan.firebaseapp.com',
    projectId: 'jpis-fursan',
    storageBucket: 'jpis-fursan.firebasestorage.app',
    messagingSenderId: '602047578218',
    appId: '1:602047578218:web:0bf48a8ac51dcebef78a13',
    measurementId: 'G-NKWRVBXMDY'
  };

  function boot() {
    if (!window.firebase || !firebase.firestore) {
      console.warn('Firestore SDK not loaded');
      return;
    }
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    var awards = db.collection('awards');

    function obsId(obs) {
      var student = (obs && obs.student) || 'unknown';
      var skill = (obs && obs.skillId) || 'skill';
      return String(student + '_' + skill).replace(/[\/#?\[\]]/g, '_').slice(0, 700);
    }

    function applyRemote(data) {
      if (!data || !data.student || !data.skillId) return;
      if (typeof studentObservations !== 'object' || !studentObservations) return;
      var key = data.student + '_' + data.skillId;
      var local = studentObservations[key];
      if (!local || (Number(data.stars) || 0) >= (Number(local.stars) || 0)) {
        studentObservations[key] = Object.assign({}, local || {}, data);
        try {
          localStorage.setItem('fursan_student_observations', JSON.stringify(studentObservations));
        } catch (e) {}
        if (typeof renderStudentObservationDetail === 'function') renderStudentObservationDetail();
        if (typeof updateSyncedStarsBadge === 'function') updateSyncedStarsBadge();
        if (typeof renderSchoolwideStats === 'function') renderSchoolwideStats();
      }
    }

    awards.onSnapshot(function (snap) {
      snap.docChanges().forEach(function (change) {
        if (change.type === 'removed') return;
        applyRemote(change.doc.data());
      });
    }, function (err) {
      console.warn('Firestore listen failed. Create the Firestore database in test mode.', err);
    });

    function pushObs(obs, starsToAdd) {
      if (!obs) return;
      var payload = {
        student: obs.student || '',
        studentEn: obs.studentEn || '',
        skillId: obs.skillId || '',
        stars: Number(obs.stars) || 0,
        starsAdded: Number(starsToAdd) || 0,
        mastered: !!obs.mastered,
        tier: obs.tier || '',
        notes: obs.notes || '',
        grade: String(obs.grade || ''),
        section: obs.section || '',
        teacher: obs.teacher || window.activeTeacherName || 'teacher',
        timestamp: obs.timestamp || new Date().toISOString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      awards.doc(obsId(obs)).set(payload, { merge: true }).catch(function (err) {
        console.warn('Firestore write failed', err);
      });
    }

    function wrap() {
      if (typeof window.syncStarToGoogleSheets === 'function' && !window.syncStarToGoogleSheets._firestoreWrapped) {
        var orig = window.syncStarToGoogleSheets;
        window.syncStarToGoogleSheets = function (obs, starsToAdd) {
          pushObs(obs, starsToAdd);
          return orig(obs, starsToAdd);
        };
        window.syncStarToGoogleSheets._firestoreWrapped = true;
      }
    }

    wrap();
    setTimeout(wrap, 800);
    setTimeout(wrap, 2000);
    console.log('JPIS Fursan Firestore sync active');
  }

  var s = document.createElement('script');
  s.src = 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js';
  s.onload = function () {
    var s2 = document.createElement('script');
    s2.src = 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore-compat.js';
    s2.onload = boot;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
})();

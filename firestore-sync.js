/* JPIS Fursan — Firestore multi-class sync
   One document per class + student + skill, so different classrooms
   can save at the same time without wiping each other.
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

    function safe(value) {
      return String(value || '').replace(/[\/#?\[\]]/g, '_').slice(0, 180);
    }

    function classKey(obs) {
      var grade = (obs && obs.grade) || window.currentGrade || '';
      var section = (obs && obs.section) || window.currentSection || '';
      var room = (obs && obs.classSection) || window.currentClassSection || 'all';
      return safe(grade) + '_' + safe(section) + '_' + safe(room);
    }

    function obsId(obs) {
      return (classKey(obs) + '__' + safe(obs && obs.student) + '__' + safe(obs && obs.skillId)).slice(0, 700);
    }

    function applyRemote(data) {
      if (!data || !data.student || !data.skillId) return;
      if (typeof studentObservations !== 'object' || !studentObservations) return;
      var key = data.student + '_' + data.skillId;
      var local = studentObservations[key];
      var sameClass = !local || !local.classKey || !data.classKey || local.classKey === data.classKey;
      if (!sameClass) return;
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
      console.warn('Firestore is not ready. Create the database in the Firebase console.', err);
    });

    function pushObs(obs, starsToAdd) {
      if (!obs || !obs.student) return;
      obs.classSection = obs.classSection || window.currentClassSection || '';
      obs.classKey = classKey(obs);
      var payload = {
        student: obs.student || '',
        studentEn: obs.studentEn || '',
        skillId: obs.skillId || '',
        stars: Number(obs.stars) || 0,
        starsAdded: Number(starsToAdd) || 0,
        mastered: !!obs.mastered,
        tier: obs.tier || '',
        notes: obs.notes || '',
        grade: String(obs.grade || window.currentGrade || ''),
        section: obs.section || window.currentSection || '',
        classSection: obs.classSection || '',
        classKey: obs.classKey,
        teacher: obs.teacher || window.activeTeacherName || 'teacher',
        timestamp: obs.timestamp || new Date().toISOString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      return awards.doc(obsId(obs)).set(payload, { merge: true }).catch(function (err) {
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
    window.fursanPushObservation = pushObs;
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

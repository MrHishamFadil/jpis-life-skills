/**
 * =========================================================================
 * JPIS Life Skills & Values Dashboard - Google Sheets Sync & Aggregator
 * مدرسة روائع المعرفة الدولية - نظام التجميع السحابي الموحد لنجوم المعلمين
 * =========================================================================
 * 
 * طريقة التثبيت في ٦٠ ثانية:
 * 1. افتح مجلد Google Drive:
 *    https://drive.google.com/drive/folders/1MGcFhDm92_8aWNC1-naIcl0mRxjzUwww?usp=sharing
 * 2. اضغط على «جديد New» -> «جداول بيانات Google (Google Sheets)».
 * 3. سمِّ الجدول: "JPIS Life Skills Stars Tracker".
 * 4. من القائمة العلوية اضغط على «التطبيقات الملحقة Extensions» -> «Apps Script».
 * 5. احذف أي كود موجود والصق هذا الكود كاملاً.
 * 6. اضغط على «نشر Deploy» (أعلى اليمين) -> «نشر جديد New deployment».
 * 7. اختر نوع النشر: «تطبيق ويب Web app».
 * 8. اضبط الخيارات:
 *    - تنفيذ التطبيق باسم (Execute as): أنا (Me)
 *    - من يملك حق الوصول (Who has access): أي شخص (Anyone)
 * 9. اضغط «نشر Deploy» ثم انسخ رابط تطبيق الويب (Web App URL).
 * 10. الصق الرابط في لوحة المهارات بنافذة «مركز تجميع نجوم المعلمين»!
 * =========================================================================
 */

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Live Log Sheet
  let logSheet = ss.getSheetByName("سجل_التقييمات_الحي");
  if (!logSheet) {
    logSheet = ss.insertSheet("سجل_التقييمات_الحي");
    logSheet.getRange(1, 1, 1, 8).setValues([[
      "التاريخ والوقت", "اسم المعلم", "الصف الدراسي", "اسم الطالب", "معرف الطالب", "المهارة الحياتية", "النجوم الممنوحة", "الملاحظات"
    ]]).setFontWeight("bold").setBackground("#4f46e5").setFontColor("#ffffff");
    logSheet.setFrozenRows(1);
    logSheet.setRightToLeft(true);
  }

  // 2. Summary Sheet
  let sumSheet = ss.getSheetByName("ملخص_النجوم_المجمع");
  if (!sumSheet) {
    sumSheet = ss.insertSheet("ملخص_النجوم_المجمع");
    sumSheet.getRange(1, 1, 1, 5).setValues([[
      "معرف الطالب", "اسم الطالب", "الصف", "إجمالي النجوم", "آخر تقييم"
    ]]).setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
    sumSheet.setFrozenRows(1);
    sumSheet.setRightToLeft(true);
  }
}

function doPost(e) {
  try {
    setupSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName("سجل_التقييمات_الحي");
    const sumSheet = ss.getSheetByName("ملخص_النجوم_المجمع");

    let data;
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    if (!data) {
      return createJsonResponse({ status: "error", message: "No data received" });
    }

    const timestamp = new Date();
    const teacher = data.teacher || "معلم غير محدد";
    const grade = data.grade || "الصف ٤";
    const studentName = data.student || data.studentName || "طالب";
    const studentId = data.studentId || data.student || studentName;
    const skillTitle = data.skillTitle || data.skillId || "مهارة سلوكية";
    const stars = parseInt(data.starsAwarded !== undefined ? data.starsAwarded : (data.stars || 1), 10);
    const notes = data.notes || "";

    // 1. Append to Live Log
    logSheet.appendRow([
      timestamp, teacher, grade, studentName, studentId, skillTitle, stars, notes
    ]);

    // 2. Update Summary Aggregator
    updateStudentSummary(sumSheet, studentId, studentName, grade, stars, timestamp);

    return createJsonResponse({
      status: "success",
      message: "Star recorded successfully",
      studentId: studentId,
      studentName: studentName,
      stars: stars
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

function updateStudentSummary(sumSheet, studentId, studentName, grade, addedStars, timestamp) {
  const data = sumSheet.getDataRange().getValues();
  let foundRow = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == studentId) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    const currentStars = parseInt(sumSheet.getRange(foundRow, 4).getValue(), 10) || 0;
    sumSheet.getRange(foundRow, 4).setValue(currentStars + addedStars);
    sumSheet.getRange(foundRow, 5).setValue(timestamp);
  } else {
    sumSheet.appendRow([studentId, studentName, grade, addedStars, timestamp]);
  }
}

function doGet(e) {
  try {
    setupSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sumSheet = ss.getSheetByName("ملخص_النجوم_المجمع");
    const logSheet = ss.getSheetByName("سجل_التقييمات_الحي");

    const sumData = sumSheet.getDataRange().getValues();
    const logData = logSheet.getDataRange().getValues();

    let totalStars = 0;
    const studentMap = {};
    const teachersSet = new Set();

    // Calculate totals from summary
    for (let i = 1; i < sumData.length; i++) {
      const sId = sumData[i][0];
      const sName = sumData[i][1];
      const sGrade = sumData[i][2];
      const stars = parseInt(sumData[i][3], 10) || 0;
      totalStars += stars;
      studentMap[sId] = { id: sId, name: sName, grade: sGrade, totalStars: stars };
    }

    // Collect active teachers count
    for (let i = 1; i < logData.length; i++) {
      const t = logData[i][1];
      if (t) teachersSet.add(t);
    }

    const leaderboard = Object.values(studentMap).sort((a, b) => b.totalStars - a.totalStars);

    return createJsonResponse({
      status: "success",
      totalSchoolwideStars: totalStars,
      evaluatedStudentsCount: Object.keys(studentMap).length,
      activeTeachersCount: Math.max(1, teachersSet.size),
      teachersList: Array.from(teachersSet),
      leaderboard: leaderboard.slice(0, 50),
      summary: {
        totalStars: totalStars,
        evaluatedStudentsCount: Object.keys(studentMap).length,
        activeTeachersCount: Math.max(1, teachersSet.size),
        masteredCount: leaderboard.filter(s => s.totalStars >= 3).length
      }
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

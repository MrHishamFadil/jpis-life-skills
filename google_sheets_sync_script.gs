/**
 * =========================================================================
 * JPIS Life Skills & Values Dashboard - Google Sheets Sync & Aggregator (v10.1)
 * مدرسة روائع المعرفة الدولية - نظام التجميع السحابي الموحد لنجوم المعلمين
 * =========================================================================
 * 
 * المجلد السحابي:
 * https://drive.google.com/drive/folders/1MGcFhDm92_8aWNC1-naIcl0mRxjzUwww
 * 
 * طريقة التثبيت في ٦٠ ثانية:
 * 1. افتح جدول البيانات المخصص للمشروع:
 *    https://docs.google.com/spreadsheets/d/1bOIP546NNzpyoMi-AXyPK5NvRJzucjHCPNv-cb8qyDY/edit
 * 2. من القائمة العلوية اضغط على «التطبيقات الملحقة Extensions» -> «Apps Script».
 * 3. احذف أي كود موجود والصق هذا الكود كاملاً واحفظ المشروع.
 * 4. اضغط على «نشر Deploy» (أعلى اليمين) -> «نشر جديد New deployment».
 * 5. اختر نوع النشر: «تطبيق ويب Web app».
 * 6. اضبط الخيارات:
 *    - الوصف: JPIS Life Skills Web App v10.1
 *    - تنفيذ التطبيق باسم (Execute as): أنا (Me)
 *    - من يملك حق الوصول (Who has access): أي شخص (Anyone)
 * 7. اضغط «نشر Deploy» ثم انسخ رابط تطبيق الويب (Web App URL).
 * 8. الصق الرابط في لوحة المهارات بنافذة «مركز تجميع نجوم المعلمين»!
 * =========================================================================
 */

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Executive Dashboard (لوحة_المتابعة)
  let dashSheet = ss.getSheetByName("لوحة_المتابعة");
  if (!dashSheet) {
    dashSheet = ss.insertSheet("لوحة_المتابعة", 0);
    dashSheet.getRange(1, 1, 1, 4).setValues([[
      "مؤشر الإنجاز المالي والتربوي", "القيمة الإجمالية", "تاريخ آخر تحديث", "ملاحظات النظام"
    ]]).setFontWeight("bold").setBackground("#1e1b4b").setFontColor("#ffffff");
    dashSheet.getRange(2, 1, 4, 2).setValues([
      ["إجمالي النجوم الممنوحة بالمدرسة", "=IFERROR(SUM(ملخص_النجوم_المجمع!D2:D), 0)"],
      ["إجمالي الطلاب المقيّمين", "=IFERROR(COUNTA(ملخص_النجوم_المجمع!A2:A), 0)"],
      ["إجمالي عمليات الرصد المسجلة", "=IFERROR(COUNTA(سجل_التقييمات_الحي!A2:A), 0)"],
      ["الطلاب المتقنون (٥ نجوم فأكثر)", "=IFERROR(COUNTIF(ملخص_النجوم_المجمع!D2:D, \">=5\"), 0)"]
    ]);
    dashSheet.setFrozenRows(1);
    dashSheet.setRightToLeft(true);
  }

  // 2. Live Log Sheet (سجل_التقييمات_الحي)
  let logSheet = ss.getSheetByName("سجل_التقييمات_الحي");
  if (!logSheet) {
    logSheet = ss.insertSheet("سجل_التقييمات_الحي");
    logSheet.getRange(1, 1, 1, 9).setValues([[
      "التاريخ والوقت", "اسم المعلم", "الصف الدراسي", "القسم", "اسم الطالب", "معرف الطالب", "المهارة الحياتية", "النجوم الممنوحة", "الملاحظات"
    ]]).setFontWeight("bold").setBackground("#4f46e5").setFontColor("#ffffff");
    logSheet.setFrozenRows(1);
    logSheet.setRightToLeft(true);
  }

  // 3. Summary Sheet (ملخص_النجوم_المجمع)
  let sumSheet = ss.getSheetByName("ملخص_النجوم_المجمع");
  if (!sumSheet) {
    sumSheet = ss.insertSheet("ملخص_النجوم_المجمع");
    sumSheet.getRange(1, 1, 1, 6).setValues([[
      "معرف الطالب", "اسم الطالب", "الصف", "القسم", "إجمالي النجوم", "آخر تقييم"
    ]]).setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
    sumSheet.setFrozenRows(1);
    sumSheet.setRightToLeft(true);
  }
}

/**
 * دالة تعقيم لمنع ثغرات حقن المعادلات (Spreadsheet Formula Injection)
 */
function sanitizeForSheet(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str; // تحييد المعادلة ببادئة علامة الاقتباس الفردية
  }
  return str;
}

function doPost(e) {
  // حماية التزامن لمنع تصادم عمليات الرصد المتزامنة من أكثر من معلم
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // الانتظار حتى 15 ثانية لإنهاء الطلبات المتزامنة
    setupSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName("سجل_التقييمات_الحي");
    const sumSheet = ss.getSheetByName("ملخص_النجوم_المجمع");

    let data;
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    if (!data) {
      return createJsonResponse({ status: "error", message: "No data received" });
    }

    const timestamp = new Date();
    const teacher = sanitizeForSheet(data.teacher || "معلم غير محدد");
    const grade = sanitizeForSheet(data.grade || "الصف ٤");
    const section = sanitizeForSheet(data.section || "بنين");
    const studentName = sanitizeForSheet(data.student || data.studentName || "طالب");
    // استخدام معرف مركب يمنع تصادم الطلاب أصحاب الأسماء المتشابهة بين الصفوف
    const studentId = sanitizeForSheet(data.studentId || (studentName + "_" + grade + "_" + section));
    const skillTitle = sanitizeForSheet(data.skillTitle || data.skillId || "مهارة سلوكية");
    const stars = parseInt(data.starsAwarded !== undefined ? data.starsAwarded : (data.stars || 1), 10) || 0;
    const notes = sanitizeForSheet(data.notes || "");

    // 1. التوثيق في سجل التقييمات اللحظي
    logSheet.appendRow([
      timestamp, teacher, grade, section, studentName, studentId, skillTitle, stars, notes
    ]);

    // 2. تحديث جدول الملخص التراكمي للطلاب
    updateStudentSummary(sumSheet, studentId, studentName, grade, section, stars, timestamp);

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
  } finally {
    lock.releaseLock();
  }
}

function updateStudentSummary(sumSheet, studentId, studentName, grade, section, addedStars, timestamp) {
  const data = sumSheet.getDataRange().getValues();
  let foundRow = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(studentId)) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    const currentStars = parseInt(sumSheet.getRange(foundRow, 5).getValue(), 10) || 0;
    sumSheet.getRange(foundRow, 5).setValue(currentStars + addedStars);
    sumSheet.getRange(foundRow, 6).setValue(timestamp);
  } else {
    sumSheet.appendRow([studentId, studentName, grade, section, addedStars, timestamp]);
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

    // حساب الإجماليات من الملخص التراكمي
    for (let i = 1; i < sumData.length; i++) {
      const sId = sumData[i][0];
      const sName = sumData[i][1];
      const sGrade = sumData[i][2];
      const sSection = sumData[i][3];
      const stars = parseInt(sumData[i][4], 10) || 0;
      totalStars += stars;
      studentMap[sId] = {
        id: sId,
        name: sName,
        student: sName,
        grade: sGrade,
        section: sSection,
        stars: stars,
        totalStars: stars
      };
    }

    // رصد المعلمين النشطين من سجل الحركات
    for (let i = 1; i < logData.length; i++) {
      const t = logData[i][1];
      if (t && t !== "اسم المعلم") teachersSet.add(t);
    }

    const leaderboard = Object.values(studentMap).sort((a, b) => b.totalStars - a.totalStars);

    return createJsonResponse({
      status: "success",
      totalSchoolwideStars: totalStars,
      totalStars: totalStars,
      evaluatedStudentsCount: Object.keys(studentMap).length,
      activeTeachersCount: Math.max(1, teachersSet.size),
      teachersList: Array.from(teachersSet),
      leaderboard: leaderboard.slice(0, 50),
      summary: {
        totalStars: totalStars,
        evaluatedStudentsCount: Object.keys(studentMap).length,
        activeTeachersCount: Math.max(1, teachersSet.size),
        masteredCount: leaderboard.filter(s => s.totalStars >= 5).length
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

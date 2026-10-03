# JPIS Life Skills Interactive Dashboard - Project Acceptance Contract

**Document Version:** 1.0  
**Project:** JPIS Life Skills & Islamic Values Interactive Observation & Assessment System  
**Organization:** Jeddah Private International School (JPIS) / مدارس جدة الخاصة العالمية  
**Owner / Author:** أ. هشام عبد الفضيل (Mr. Hisham Abdulfadil)  
**Standard Compliance:** AG Master Project Standards v2.0 & AG Dashboard Quality Standard v2.0  

---

## 1. Stakeholders, Target Audience & Roles

| Role | Primary User / Persona | Core Objectives & Workflows |
|---|---|---|
| **Classroom Teacher** | Mr. Hisham Abdulfadil & Grade/Subject Teachers | Real-time observation recording, 1-click star awards, tier mastery logging (`tier1`, `tier2`, `tier3`), offline quick tracking during class periods. |
| **Student / Squads** | JPIS Students (Grades 1–6 / Fursan Squads) | Visual progress tracking, positive gamified reinforcement, squad collective milestones, Arabic voice narration of behavioral rubrics. |
| **School Administration** | Mr. Mohammed AlZahrany & Academic Supervisors | Cross-cohort life skills analytics, teacher participation auditing, multi-teacher aggregated spreadsheets, behavioral intervention indicators. |

---

## 2. Delivery & Portability Contract

### Dual-Contract Architecture (Parity Guaranteed)
1. **Offline Deliverable (Zero-Network Standalone HTML)**:
   - Self-contained file (`index.html` / `JPIS_Students_LifeSkills_Interactive_Dashboard_v10.html`).
   - Double-click `file://` execution with **zero external CDN dependencies** (no unbundled fonts, no external Tailwind CDN runtime, no external audio/icon fetches).
   - Audio synthesized via native Web Speech API (`SpeechSynthesis`) with client-side fallback chime synthesizers via Web Audio API (`AudioContext`).
   - Local fallback storage using `localStorage` with quota protection and graceful degradation if disabled.

2. **Hosted Production Deliverable (GitHub Pages)**:
   - Repository: `https://github.com/MrHishamFadil/jpis-life-skills`
   - Live URL: `https://mrhishamfadil.github.io/jpis-life-skills/`
   - Direct HTTPS routes, zero mixed-content warnings, verified asset links, automated GitHub Actions deployment.

3. **Multi-Teacher Cloud Synchronization (Google Workspace)**:
   - Google Apps Script Web App endpoint (`google_sheets_sync_script.gs`).
   - 3-sheet live tracking: `لوحة_المتابعة`, `سجل_التقييمات_الحي`, `ملخص_النجوم_المجمع`.
   - Asynchronous non-blocking background queue with retry logic and offline queueing (`star-sync.js`).

---

## 3. UI Foundation Standard

- **Strict UI Foundation:** **Plain Semantic HTML5 + Compiled Utility CSS Tokens + Native ES6 Vanilla Components**.
- **No Competing Libraries:** Strictly prohibit mixing Bootstrap, Material Design, React/Vue frameworks, or Tailwind Play CDN. All styles are compiled into an embedded high-performance `<style>` token architecture.
- **Iconography Foundation:** Embedded inline SVG icons (Lucide / Feather SVG paths) with explicit `aria-hidden="true"` and zero network font dependencies.

---

## 4. Business Logic & Educational Integrity Guarantees

1. **Preservation of Core Data Models**:
   - Complete preservation of all 20 Islamic and behavioral life skills in `SKILLS_DATA` (e.g., الاستئذان وقرع الباب, السكينة في الممرات, إكرام المصحف, أدب دورات المياه, حفظ النعمة, حذاء المسجد, etc.).
   - Preservation of 3-tier rubrics (`tier1`: الأساسيات, `tier2`: الممارسة الواعية, `tier3`: المبادرة والقدوة).
   - Preservation of Student roster, Fursan squads, and student-level observation maps.
2. **Deterministic Calculations & Formula Injection Defense**:
   - Zero, absent, exempt, and unattempted are distinctly represented; no `NaN`, `undefined`, or division by zero in KPI cards.
   - Independent verification oracles for star sums and squad percentages.
   - CSV / Excel exports sanitize all formula injection trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with leading single quotes.

---

## 5. Accessibility & Bilingual Standards (WCAG 2.2 AA)

- Full keyboard navigability (Tab, Shift+Tab, Enter, Space, Escape for modals).
- Minimum touch target: **44 × 44 CSS px** for all actionable buttons, star toggles, and filters.
- Native bilingual directionality (`dir="rtl"` default, `lang="ar"`, with dynamic LTR/English toggle and `<bdi>` isolation for English names/emails/scores).
- Contrast ratio: Minimum **4.5:1** for regular text, **3:1** for large text and interactive card boundaries.

---

## 6. Verification & Release Gates

Release status will be evaluated under the AG Master Project Standard:
- `BLOCKED`: Any broken observation calculation, failed offline execution, CDN dependency, or secret exposure.
- `READY FOR TESTED SCOPE`: Verified offline `file://`, verified GitHub Pages build, passes WCAG 2.2 AA audit, secret scanner clean.

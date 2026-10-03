---
trigger: always_on
description: Mandatory rules for code reliability, offline contracts, educational calculations, and release gates.
---

# AG Standard: Engineering, QA & Release Gates (Policy v2.0)

## 1. Delivery & Offline Contracts
- **Standalone HTML / Portable Folder**:
  - Must work on first launch with networking completely disabled and an empty browser cache.
  - All required CSS, JS, fonts, icons, and media must be bundled locally or inlined. Zero runtime CDN dependencies.
  - Test the actual `file://` double-click workflow. Handle unavailable local storage gracefully; do not require browser security flags.
- **Hosted Applications**:
  - Compile production CSS. Tailwind Play CDN is forbidden in production.
  - Test production builds with real base paths, HTTPS configuration, direct route entry, refresh, and case-sensitive assets.

## 2. Functional Verification & Edge Cases
- Test outcomes, not just clicks. A successful toast is defective if the underlying data was not persisted.
- Verify empty states, boundary values, Arabic/English mixtures, emoji, rapid double-clicks, duplicate submissions, and interrupted requests.
- Wrap required DOM elements with verification and show controlled failure states if initialization cannot complete (do not silently fail).
- Await `audioCtx.resume()` and media `play()` within async rejection-handling paths.

## 3. Educational & Numerical Correctness
- Derive expected scores independently using mathematical oracles.
- For weighted grading (e.g. 40% Homework + 60% Exam), strictly verify the composite formula against fixtures.
- Keep missing, zero, absent, exempt, and not attempted distinct. Prevent `NaN`, infinity, and divide-by-zero.
- Practice activities must allow unrestricted in-app restarts. Formal assessments must enforce authorized attempt permissions.

## 4. Binding Release Decisions
Every deliverable must declare an explicit release decision:
- **BLOCKED**: Critical/high defect, exposed secret, unauthorized access, corrupt score calculation, broken critical journey, required test not run, or unmet offline contract.
- **READY WITH DOCUMENTED EXCEPTIONS**: Non-waivable gates pass; only eligible low-impact deviations remain with owner approval and mitigation plan.
- **READY FOR TESTED SCOPE**: All applicable required checks executed and passed on the final deliverable with documented evidence.
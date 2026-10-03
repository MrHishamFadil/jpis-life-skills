---
trigger: always_on
description: Mandatory rules for WCAG 2.2 AA accessibility, data privacy, and frontend security controls.
---

# AG Standard: Security & Accessibility (Policy v2.0)

## 1. Accessibility Acceptance (WCAG 2.2 Level AA)
- Target full **WCAG 2.2 AA** conformance across all supported screen sizes (320px reflow to 1920px).
- **Keyboard Navigation**: Complete all workflows using only a keyboard. Ensure logical focus order, visible focus rings, and no keyboard traps.
- **Modal Dialogs**: Enforce name, role, initial focus, tab containment, keyboard close (Escape), inert background, and focus restoration to the triggering element.
- **Contrast Ratios**: Normal text ≥ 4.5:1; large text (≥18pt or 14pt bold) ≥ 3:1; non-text UI controls and states ≥ 3:1 in both light and dark themes.
- **Text Resizing**: Support text zoom to 200% without loss of content or functionality.
- **Accessible Alternatives**: Meaningful images and charts must have descriptive text alternatives or data tables; decorative images must use `alt=""`. Never convey information through color alone.

## 2. Security & Student Data Protection
- **XSS Defenses**: Use safe text insertion (`textContent` or framework text nodes). For rich HTML, require a strict allowlist sanitizer. Prohibit `eval()`, `new Function()`, `document.write()`, and string-based timers in application code.
- **Credential Protection**: Never store API keys, secrets, or privileged credentials in source code, HTML, client bundles, or repository history.
- **Browser Persistence**: Default storage to non-identifying preferences. Never store passwords, session tokens, or identifiable student records in `localStorage` or `sessionStorage`.
- **Authorization**: For hosted services, enforce authorization on every server request. Test cross-student, cross-class, and cross-school data boundaries.
- **Export Sanitization**: Neutralize spreadsheet formula injection (`=`, `+`, `-`, `@`) in CSV/Excel exports.
- **Headers & Embedding**: Verify HTTPS, restrictive CSP, framing rules (`frame-ancestors`), and opener isolation (`rel="noopener"`).
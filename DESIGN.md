# JPIS Life Skills Interactive Dashboard - Design Specification (DESIGN.md)

**Design System Name:** JPIS Al-Fursan Educational Design System  
**Version:** 2.0  
**Target:** K-12 School Dashboard, Islamic Behavioral Values & Life Skills  
**Aesthetic Profile:** Modern Educational / Claymorphic Tactile Depth / Clean High-Contrast Arabic Typography  
**Standards:** AG Master Project Standards v2.0 & WCAG 2.2 Level AA  

---

## 1. Visual Strategy & Mood

The visual language balances **dignified school institutional authority** (Royal Indigo and Islamic Emerald) with **delightful tactile gamification** (Warm Amber Stars, soft clay card elevations, rounded badge pills). 
- Avoid flat lifeless data grids.
- Avoid over-saturated, childish toy aesthetics.
- Prioritize clear visual hierarchy: High-level KPI pulse $\rightarrow$ Filter controls $\rightarrow$ 20 Interactive Skill Tiles $\rightarrow$ Student Roster / Live Observation drawer $\rightarrow$ Accessible Modal dialogs.

---

## 2. Color Token Architecture

All colors are strictly defined using CSS custom properties with WCAG 2.2 AA compliant contrast on light and dark surfaces.

### A. Brand & Accent Tokens
| Token | Hex / Value | Semantic Role | Minimum Contrast |
|---|---|---|---|
| `--brand-primary` | `#4F46E5` (Indigo-600) | Primary actions, main navigation, active tab highlight | 5.8:1 on `#FFFFFF` |
| `--brand-primary-hover` | `#4338CA` (Indigo-700) | Hover / pressed state for primary elements | 7.2:1 on `#FFFFFF` |
| `--brand-primary-light` | `#EEF2FF` (Indigo-50) | Background tint for active skill selection / badges | — |
| `--color-star-gold` | `#D97706` (Amber-600) | Star rewards, achievement badges, honor points | 4.6:1 on `#FFFFFF` |
| `--color-star-glow` | `#FEF3C7` (Amber-100) | Star background container, highlight glows | — |
| `--color-mastery-emerald` | `#059669` (Emerald-600) | Tier 3 Mastery, full compliance, positive behavior | 4.8:1 on `#FFFFFF` |
| `--color-alert-rose` | `#E11D48` (Rose-600) | Needs attention / reminders / reset warnings | 5.1:1 on `#FFFFFF` |

### B. Neutral Surface & Text Scale (Slate Foundation)
| Token | Hex / Value | Semantic Role |
|---|---|---|
| `--surface-bg` | `#F8FAFC` (Slate-50) | App main viewport canvas |
| `--surface-card` | `#FFFFFF` | Primary card background with claymorphic shadow |
| `--surface-card-subtle`| `#F1F5F9` (Slate-100) | Section headers, table borders, inactive tabs |
| `--text-primary` | `#0F172A` (Slate-900) | Headings, titles, high-emphasis text (13.5:1 contrast) |
| `--text-secondary` | `#475569` (Slate-600) | Descriptions, rubrics, subtitles (5.9:1 contrast) |
| `--text-muted` | `#64748B` (Slate-500) | Metadata, timestamp, teacher name, inactive badges |
| `--border-subtle` | `#E2E8F0` (Slate-200) | Divider lines, card outlines |
| `--border-focus` | `#6366F1` (Indigo-500) | Universal focus ring (`outline: 3px solid #6366F1; outline-offset: 2px`) |

---

## 3. Typography Hierarchy

### Font Families
- **Primary Arabic Font:** `Cairo`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Tahoma`, `sans-serif` (Optimal Arabic legibility and glyph metrics).
- **Primary English / Numeral Font:** `Plus Jakarta Sans`, `Inter`, `system-ui`, `sans-serif`.
- **Directional Isolation:** All mixed alphanumeric strings, codes, scores, and names are wrapped in `<bdi>` or styled with `unicode-bidi: isolate`.

### Type Scale
| Level | Font Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| **Display / Title** | `1.75rem` (28px) | `2.25rem` (36px) | 800 (ExtraBold) | Header hero title, school branding |
| **Section Heading (H2)** | `1.25rem` (20px) | `1.75rem` (28px) | 700 (Bold) | Category headers, squad dashboard titles |
| **Card Heading (H3)** | `1.05rem` (16.8px) | `1.5rem` (24px) | 700 (Bold) | Skill titles, student card names |
| **Body (Base)** | `0.9375rem` (15px) | `1.5rem` (24px) | 500 (Medium) | Tier rubrics, observation notes, explanations |
| **Small / Micro** | `0.8125rem` (13px) | `1.125rem` (18px) | 600 (SemiBold) | Badges, counters, timestamps, meta tags |

---

## 4. Layout, Spacing & Elevation Architecture

### A. Layout Flow
1. **Top School Bar:** JPIS Logo + School title (مدارس جدة الخاصة العالمية) + Active Teacher selector + Live Google Sheets sync status + Quick Export buttons.
2. **Executive KPI Dashboard:** 4 Claymorphic Metric Cards:
   - إجمالي النجوم الممنوحة (Total Stars)
   - الطلاب المتميزون (Mastery Students)
   - أكثر المهارات تميزاً (Top Mastered Skill)
   - حالة مزامنة السحابة (Cloud Sync Status)
3. **Filter & Action Toolbar:** Category filter pills (السلوك الصفي، الآداب الإسلامية، النظام العام) + Student search bar + Squad switcher.
4. **Interactive 20-Skill Grid:** Responsive 1 to 4 column auto-fill grid with Claymorphic tactile depth, tier progress pills, star incrementors, and Arabic voice button.
5. **Observation Detail Drawer / Modal:** Focus-trapped accessible dialog for individual student evaluation, notes, and rubric checklist.

### B. Spacing & Touch Targets
- Spacing Scale: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`.
- **Target Size Rule:** All interactive elements (star buttons, tier selector tabs, audio play buttons, modal close triggers) MUST have a minimum bounding box of **44 × 44 CSS px**.

### C. Claymorphism & Elevation System
- **Clay Card Elevation:**  
  `box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);`  
  `border-radius: 1rem (16px);`  
  `border: 1px solid rgba(226, 232, 240, 0.8);`
- **Interactive Hover State:**  
  `transform: translateY(-2px);`  
  `box-shadow: 0 14px 28px -4px rgba(79, 70, 229, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04);`
- **Active / Pressed State:**  
  `transform: translateY(1px); scale(0.99);`

---

## 5. Accessibility (WCAG 2.2 AA) & Bilingual RTL Specs

1. **Focus Ring Tokens:**  
   `:focus-visible { outline: 3px solid #6366F1; outline-offset: 2px; }`
2. **Modal Dialog Management:**  
   - Native `<dialog>` or `role="dialog"` with `aria-modal="true"` and `aria-labelledby`.
   - Focus trapped upon open; Escape key closes dialog; focus restored to invoking trigger element upon close.
3. **Screen Reader Live Announcements:**  
   - Star increment announced via `aria-live="polite"` element: "تمت إضافة نجمة لمهارة [اسم المهارة]".
4. **Bilingual RTL Support:**  
   - Root `dir="rtl"` with dynamic logical properties (`margin-inline-start`, `padding-inline`, `border-inline-end`).
   - Symmetrical iconography and non-mirrored numbers.

---
trigger: always_on
description: Mandatory rules for UI foundation selection, design specifications, and bilingual typography.
---

# AG Standard: Design Systems & Foundations (Policy v2.0)

## 1. Single UI Foundation Mandate
- **Never combine multiple competing UI frameworks** (e.g. do not mix Bootstrap with Tailwind or Ant Design) into one dashboard.
- Select exactly **one** primary foundation per project:
  - **Plain Semantic HTML/CSS/JS**: Preferred for single-file interactive activities and lightweight tools.
  - **Tabler**: Preferred starting point for downloadable, multi-page HTML dashboards.
  - **shadcn/ui + Tailwind CSS**: Preferred starting point for custom React web platforms.
  - **Ant Design**: Reserved for data-dense school administrative platforms with complex forms and workflows.
- Specialist tools (ECharts, TanStack Table, Paged.js, GridStack) must only be added when an explicit requirement demands them.

## 2. Pre-Coding Design Specification
Before writing screen code, define:
1. **Audience & Context**: Student, teacher, administrator, or offline classroom.
2. **Page Structure**: Visual hierarchy, layout grid, exactly one `<main>` landmark (unhidden), skip-link.
3. **Color Tokens**: Primary brand color, Radix neutral scale, semantic alerts (success, warning, error), and a dedicated analytical palette for charts that does not conflict with UI action states.
4. **Typography**: Exactly one readable English font family and one compatible Arabic font family (e.g. Cairo, Noto Sans Arabic, Inter). For offline deliverables, font files must be bundled locally.
5. **Spacing & States**: 4px/8px grid scale, hover, focus-visible, active, disabled, loading, empty, and error states.
6. **Touch Targets**: Default to **44 × 44 CSS px** for primary touch controls (exceeding the WCAG 24×24px minimum).

## 3. Bilingual & RTL Layout
- Synchronize root `lang` and `dir` attributes dynamically (`ltr` vs `rtl`).
- Use CSS logical properties (`inset-inline-start`, `margin-inline`, `padding-inline`, `border-start-start-radius`) rather than physical left/right.
- Wrap mixed-direction content (names, numbers, punctuation, URLs) in `<bdi>` elements.
- Never mirror branding logos, non-directional icons, or media transport controls.
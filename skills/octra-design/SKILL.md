---
name: octra-design-skill
description: Default design system for Octra UIs. Integrates Synteq UI 2.2.0 - clean, viewport-locked dashboard interfaces with zero external dependencies, offline-first Google Sans Code font, line-separator architecture (no cards), responsive sidebar with single toggle, inline SVG icons, dual-theme support, advanced data tables, axis-labelled charts, tree, stepper and code blocks. Use when building operator dashboards, explorer surfaces, cloud resource UIs, admin panels, or any text-first data-dense interface.
---

## Framework Identity

- **Name:** Synteq UI
- **Version:** 2.2.0
- **Location in project:** `skills/octra-design/css/` + `skills/octra-design/js/`
- **Single CSS entry point:** `css/synteq-ui.css` — imports in order: `fonts.css` → `tokens.css` → `theme-dark.css` + `theme-light.css` → `base.css` → 18 component files (`icons`, `shell`, `sidebar`, `topbar`, `content`, `data`, `controls`, `forms`, `overlays`, `feedback`, `tables`, `charts`, `tree`, `stepper`, `code`, `framework`, `motion`)
- **Single JS entry point:** `js/synteq-ui.js` — exposes the `SynteqUI` global; auto-inits theme, dock, scroll-spy, toast, command palette, tables, tree, stepper, code blocks and data helpers
- **Font:** Google Sans Code, self-hosted at `fonts/*.ttf` (Regular, Medium, SemiBold), loaded exclusively via `css/fonts.css`
- **Zero external network requests** — fully offline-capable once files are on disk

---

## Six Non-Negotiable Rules

Every implementation MUST honor all eight. Violating any one of them breaks the design system.

1. Body MUST never scroll — set `height: 100dvh; overflow: hidden` on both `html` and `body`. The only element that produces a scrollbar is `.sq-content.sq-scroll`.
2. Font MUST be Google Sans Code loaded from `fonts/` via the `fonts.css` import — NEVER link to Google Fonts or any CDN.
3. MUST use only `--sq-*` CSS custom properties for any value that maps to a design token (color, spacing, radius, type size, motion). Never write raw hex, px, or rem values in component CSS.
4. MUST NOT use cards, `box-shadow`, or tonal backgrounds to separate content areas. Visual hierarchy comes exclusively from `.sq-section` top-border hairlines.
5. MUST have exactly ONE navigation dock toggle button — the topbar control with `data-sq-sidebar-toggle`. It hides/shows the sticky bottom dock, swaps its icon between menu and close, and keeps `aria-label`/`aria-expanded` in sync; the default state is open, so the default glyph is close; never add a second close button.
6. MUST use `aria-label` on every icon-only interactive element (buttons, links, icon controls).
7. One section MUST fill exactly one screen: vertical padding belongs to `.sq-section`, never to `.sq-content`, and the section content is centred on both axes.
8. The active dock item MUST colour both icon and label with `--sq-brand`; dock toggles MUST be idempotent so repeated init calls never double-bind.

---

## HTML Shell Template

Minimum boilerplate for any new page. Adjust the `<title>`, breadcrumb copy, and nav items; keep everything else as-is.

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark" class="theme-dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>My Dashboard — Synteq UI</title>
  <link rel="stylesheet" href="css/synteq-ui.css" />
</head>
<body>

<div class="sq-app" id="app">

<!-- STICKY BOTTOM NAVIGATION DOCK -->
  <aside class="sq-aside" aria-label="Primary navigation" id="sidebar">

    <a href="#" class="sq-aside__brand" aria-label="App home">
      <span class="sq-aside__brand-mark" aria-hidden="true">
        <!-- 12×12 inline SVG logo mark -->
      </span>
      AppName
    </a>

    <nav class="sq-nav" aria-label="Primary navigation links">
      <a href="#" class="sq-nav__item sq-nav__item--active" aria-current="page">
        <svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true"><!-- icon path --></svg>
        Nav Item
      </a>
      <a href="#" class="sq-nav__item">
        <svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true"><!-- icon path --></svg>
        Another Item
      </a>
    </nav>

    <div class="sq-aside__footer">
      <span class="sq-dot" aria-label="Online"></span>
      <a href="#" class="sq-user" aria-label="Account: User Name">
        <span class="sq-avatar" aria-hidden="true">UN</span>
        <span class="sq-user__info">
          <span class="sq-user__name">User Name</span>
          <span class="sq-user__email">user@example.com</span>
        </span>
      </a>
    </div>
  </aside>

  <!-- TOPBAR — the ONE sidebar toggle lives here -->
  <header class="sq-topbar" role="banner">
    <button class="sq-sidebar-toggle"
            data-sq-sidebar-toggle
            aria-label="Toggle navigation"
            aria-expanded="true"
            aria-controls="sidebar">
      <svg class="sq-icon sq-icon--18 icon-menu" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <div class="sq-topbar__left">
      <span class="sq-topbar__title">Page Title</span>
    </div>

    <div class="sq-topbar__right">
      <button class="sq-iconbtn sq-theme-toggle" data-sq-toggle-theme aria-label="Toggle theme">
        <svg class="sq-icon sq-icon--16 sq-icon--moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </header>

  <!-- MAIN — only this element scrolls -->
  <main class="sq-main" aria-label="Main content">
    <div class="sq-content sq-scroll" id="main-content">

      <!-- sections go here -->

    </div>
  </main>

</div>

<script src="js/synteq-ui.js"></script>
</body>
</html>
```

---

## Quick Component Reference

Copy-paste blueprints. All snippets are self-contained and work inside `.sq-content.sq-scroll`.

### Sidebar nav item (active + default)

```html
<!-- Active item (current page) -->
<a href="#" class="sq-nav__item sq-nav__item--active" aria-current="page">
  <svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true"><!-- path --></svg>
  Instances
  <span class="sq-nav__badge">4</span>
</a>

<!-- Default item -->
<a href="#" class="sq-nav__item">
  <svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true"><!-- path --></svg>
  Networks
</a>
```

### Section with head

```html
<div class="sq-section">
  <div class="sq-section__head">
    <span class="sq-section__title">
      <svg class="sq-icon sq-icon--14" viewBox="0 0 24 24" aria-hidden="true"><!-- path --></svg>
      Section Title
    </span>
    <span class="sq-section__meta">updated 5s ago</span>
  </div>
  <!-- section content -->
</div>
```

### Stat strip (3 stats)

```html
<div class="sq-stat-strip">
  <div class="sq-stat">
    <span class="sq-stat__label">vCPU</span>
    <div class="sq-stat__value">4 <span class="sq-unit">cores</span></div>
  </div>
  <div class="sq-stat">
    <span class="sq-stat__label">RAM</span>
    <div class="sq-stat__value">8 <span class="sq-unit">GB</span></div>
  </div>
  <div class="sq-stat">
    <span class="sq-stat__label">Storage</span>
    <div class="sq-stat__value">160 <span class="sq-unit">GB SSD</span></div>
  </div>
</div>
```

### KV list (3 rows)

```html
<div class="sq-kv">
  <div class="sq-kv__row">
    <span class="sq-kv__label">Hostname</span>
    <span class="sq-kv__value sq-mono">octra</span>
  </div>
  <div class="sq-kv__row">
    <span class="sq-kv__label">OS</span>
    <span class="sq-kv__value">Ubuntu 24.04 LTS</span>
  </div>
  <div class="sq-kv__row">
    <span class="sq-kv__label">Region</span>
    <span class="sq-kv__value">AMS1 — Amsterdam</span>
  </div>
</div>
```

Each row gets a `1px` top border automatically. No extra CSS needed.

### Gauge

`data-sq-gauge` on the outer element drives `initGauges()` on load. Provide `role="progressbar"` + aria attributes for accessibility.

```html
<div class="sq-gauge" data-sq-gauge="72"
     role="progressbar" aria-label="CPU usage"
     aria-valuenow="72" aria-valuemin="0" aria-valuemax="100">
  <div class="sq-gauge__head">
    <span class="sq-gauge__label">CPU</span>
    <span class="sq-gauge__value">72<span class="sq-gauge__max"> / 100%</span></span>
  </div>
  <div class="sq-gauge__track">
    <div class="sq-gauge__fill"></div>
  </div>
</div>
```

To override auto-coloring with brand tint (e.g. bandwidth):

```html
<div class="sq-gauge__track">
  <div class="sq-gauge__fill sq-gauge__fill--brand"></div>
</div>
```

### Segmented button bar

```html
<div class="sq-seg" role="group" aria-label="Instance actions">
  <button class="sq-seg__btn" aria-label="Open console">
    <svg class="sq-icon sq-icon--14" viewBox="0 0 24 24" aria-hidden="true"><!-- path --></svg>
    Console
  </button>
  <button class="sq-seg__btn" aria-label="Power options">Power</button>
  <button class="sq-seg__btn" aria-label="Reboot instance">Reboot</button>
</div>
```

### Button variants

```html
<button class="sq-btn">Default</button>
<button class="sq-btn sq-btn--primary">Primary</button>
<button class="sq-btn sq-btn--brand">Brand</button>
<button class="sq-btn sq-btn--ghost">Ghost</button>
<button class="sq-btn sq-btn--block">Full width</button>

<!-- Tonal status actions: tinted background (16%), status-coloured label -->
<button class="sq-btn sq-btn--info">Info</button>
<button class="sq-btn sq-btn--warn">Warning</button>   <!-- alias: --warning -->
<button class="sq-btn sq-btn--danger">Danger</button>

<!-- Icon-only button — aria-label required -->
<button class="sq-btn sq-iconbtn" aria-label="Options">
  <svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true"><!-- path --></svg>
</button>
```

`--info` / `--warn` / `--danger` are tonal: they never fill the whole surface, so
they stay distinguishable from `--primary` (inverted surface) and `--brand`
(solid accent). Labels use `--sq-status-ink-mix` (60% status hue + text colour)
so they clear WCAG AA in both themes.

### Badge variants

```html
<span class="sq-badge">Default</span>
<span class="sq-badge sq-badge--info">Info</span>
<span class="sq-badge sq-badge--ok">Running</span>
<span class="sq-badge sq-badge--warn">Degraded</span>
<span class="sq-badge sq-badge--err">Error</span>
<span class="sq-badge sq-badge--brand">New</span>
```

### Status: one signal per state, never both

- **dot + text** - `<span class="sq-status"><span class="sq-dot"></span> Running</span>`
- **badge + text** - `<span class="sq-badge sq-badge--ok">Running</span>`

Nesting a `.sq-dot` inside a `.sq-badge` says the same thing twice and is
deprecated: the badge colour already carries the state.

### Bar chart (JS-rendered)

HTML declares the container; JS populates it. Set `--sq-bars-cols` to match your sample count.

```html
<div class="sq-bars" id="net-bars"
     role="img" aria-label="Network I/O chart"
     style="--sq-bars-cols: 24;"></div>
```

```js
// samples: Array of [inPct, outPct], each value 0–100
SynteqUI.renderBars(document.getElementById('net-bars'), [
  [12, 4], [18, 6], [35, 10], [52, 16], [44, 14], [38, 12],
  [30, 8], [34, 10], [42, 13], [48, 15], [52, 16], [45, 14]
]);
```

### Sparkline (JS-rendered)

```html
<svg class="sq-spark" id="cpu-spark"
     viewBox="0 0 200 40" preserveAspectRatio="none"
     role="img" aria-label="CPU usage trend"></svg>
```

```js
// raw values — auto-scaled to fit the viewBox
SynteqUI.renderSparkline(
  document.getElementById('cpu-spark'),
  [18, 22, 31, 40, 36, 34, 38, 35, 33, 34, 29, 36, 42, 38, 34]
);
```

Add `.sq-spark--out` to the `<svg>` to use the outbound (red) color palette instead of the default inbound (green).

Add `.sq-spark--tall` (56 px) or set `--sq-spark-h` for a custom height. Fewer than
two values clears the path and sets `data-sq-spark-empty="true"`.

### Data table

```html
<div class="sq-table-wrap">
  <table class="sq-table">
    <thead>
      <tr><th scope="col">Peer</th><th scope="col" class="sq-table__num">Lag</th><th scope="col">Source</th></tr>
    </thead>
    <tbody>
      <tr>
        <td class="sq-table__mono">oct3SUwRsi…v2v4Bm</td>
        <td class="sq-table__num">8</td>
        <td class="sq-table__mute">epoch_root</td>
      </tr>
      <tr class="is-stale"><td>…</td><td class="sq-table__num">—</td><td>cached</td></tr>
    </tbody>
  </table>
</div>
```

Cell modifiers: `__num` (right, mono), `__mono`, `__mute`, row/cell `is-stale`,
`.sq-table--fixed` for equal columns. Wrap in `.sq-table-wrap` when rows can overflow.

### Log viewer

```html
<div class="sq-log sq-log--scroll sq-log--bordered" role="log" aria-label="Log tail">
  <div class="sq-log__row">
    <span class="sq-log__ts">14:33:05</span>
    <span class="sq-log__level">INFO</span>
    <span class="sq-log__comp">consensus</span>
    <span class="sq-log__msg">event = post_finalize_root_verified epoch = 1756254</span>
  </div>
  <div class="sq-log__row sq-log__row--warn">
    <span class="sq-log__ts">14:33:07</span>
    <span class="sq-log__level sq-log__level--warn">WARN</span>
    <span class="sq-log__comp">p2p</span>
    <span class="sq-log__msg">event = frame_budget_rejected reason = frame_count_budget</span>
  </div>
</div>
```

`--scroll` caps the height (`--sq-log-h`, default 420 px), `--bordered` adds the
hairlines, `--row--warn/--error` colour the rail. Component hidden `≤720px`,
timestamp hidden `≤420px`.

---

## Overlay Components

### Tabs

```html
<div class="sq-tabs" data-sq-tabs role="tablist" aria-label="Settings tabs">
  <div class="sq-tabs__list">
    <button class="sq-tabs__tab" role="tab" aria-selected="true" 
            aria-controls="panel-general" id="tab-general">
      General
    </button>
    <button class="sq-tabs__tab" role="tab" aria-selected="false" 
            aria-controls="panel-security" id="tab-security">
      Security
    </button>
    <button class="sq-tabs__tab" role="tab" aria-selected="false" 
            aria-controls="panel-billing" id="tab-billing">
      Billing
    </button>
  </div>

  <div class="sq-tabs__panel" role="tabpanel" id="panel-general" 
       aria-labelledby="tab-general" aria-hidden="false">
    <p>General settings panel content.</p>
  </div>

  <div class="sq-tabs__panel" role="tabpanel" id="panel-security" 
       aria-labelledby="tab-security" aria-hidden="true">
    <p>Security settings panel content.</p>
  </div>

  <div class="sq-tabs__panel" role="tabpanel" id="panel-billing" 
       aria-labelledby="tab-billing" aria-hidden="true">
    <p>Billing settings panel content.</p>
  </div>
</div>
```

Tabs auto-init with roving tabindex (arrow keys navigate). Use `data-sq-tabs` to enable JS behavior.

### Accordion

```html
<div class="sq-accordion">
  <details class="sq-accordion__item" open>
    <summary class="sq-accordion__trigger">What is Synteq UI?</summary>
    <div class="sq-accordion__content">
      <p>Synteq UI is a viewport-locked, offline-first dashboard framework.</p>
    </div>
  </details>

  <details class="sq-accordion__item">
    <summary class="sq-accordion__trigger">How do I get started?</summary>
    <div class="sq-accordion__content">
      <p>Link to synteq-ui.css and synteq-ui.js in your HTML.</p>
    </div>
  </details>
</div>
```

Uses native `<details>` for progressive enhancement. Multiple items can be open simultaneously.

### Menu dropdown

```html
<div style="position: relative;">
  <button class="sq-btn" data-sq-menu-trigger="actions-menu" 
          aria-haspopup="menu" aria-expanded="false">
    Actions
  </button>
  <div class="sq-menu sq-menu--bottom" id="actions-menu" role="menu" hidden>
    <button class="sq-menu__item" role="menuitem">
      <svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true">
        <!-- icon path -->
      </svg>
      Edit
    </button>
    <button class="sq-menu__item" role="menuitem">Refresh</button>
    <hr class="sq-menu__separator" />
    <button class="sq-menu__item" role="menuitem">Delete</button>
  </div>
</div>
```

JS runtime wires `data-sq-menu-trigger`. Position variants: `sq-menu--top`, `sq-menu--bottom`, `sq-menu--left`, `sq-menu--right`. Auto-dismiss on click outside or Escape.

### Popover

```html
<div style="position: relative;">
  <button class="sq-btn" data-sq-popover-trigger="help-popover" 
          aria-haspopup="dialog">
    Help
  </button>
  <div class="sq-popover" id="help-popover" role="dialog" hidden>
    Click tabs to navigate. Use arrow keys for keyboard navigation.
  </div>
</div>
```

Rich variant with title:

```html
<div class="sq-popover sq-popover--rich" id="info-popover" role="dialog" hidden>
  <div class="sq-popover__title">Instance Details</div>
  <p>4 vCPU, 8 GB RAM, 160 GB SSD<br>Region: US East</p>
</div>
```

JS runtime wires `data-sq-popover-trigger`. Auto-dismiss on click outside or Escape.

### Dialog (Modal)

```html
<dialog class="sq-dialog" id="demo-dialog">
  <div class="sq-dialog__header">
    <h2 class="sq-dialog__title">Dialog Title</h2>
    <button class="sq-dialog__close" onclick="this.closest('dialog').close()" 
            aria-label="Close dialog">
      <svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
  <div class="sq-dialog__body">
    <p>Dialog content goes here.</p>
  </div>
  <div class="sq-dialog__footer">
    <button class="sq-btn sq-btn--ghost" onclick="this.closest('dialog').close()">
      Cancel
    </button>
    <button class="sq-btn sq-btn--primary" onclick="this.closest('dialog').close()">
      Save Changes
    </button>
  </div>
</dialog>

<!-- Trigger -->
<button class="sq-btn" onclick="document.getElementById('demo-dialog').showModal()">
  Open Dialog
</button>
```

Size variants: `sq-dialog--sm`, `sq-dialog--lg`. Uses native `<dialog>` element. Backdrop click closes modal.

**Centring:** `.sq-dialog` sets `margin: auto` (with `max-height` + `overflow-y: auto`) because the framework reset zeroes the UA `dialog { margin: auto }`. Without it every modal is pinned to the top-left corner. Never override the dialog `margin` with `0`.

**Command palettes** (`<form method="dialog" class="sq-command">` + `data-sq-search-input`
+ `data-sq-command="#section"` rows) are wired by the runtime: input filters the
rows, **Enter activates the first visible row** (implicit form submission is
cancelled so the palette does not close silently), and the filter is reset when
the dialog closes.

### Toast notification

```js
// Default toast
SynteqUI.toast('Operation completed');

// With options
SynteqUI.toast('File saved successfully', {
  kind: 'ok',        // 'info' | 'ok' | 'warn' | 'err'
  duration: 4000,    // ms (default 4000)
  dismissible: true  // show close button
});
```

Markup triggers carry the kind as an attribute:

```html
<button class="sq-btn sq-btn--primary" data-sq-toast="Deployment completed" data-sq-toast-kind="ok">
  Success toast
</button>
<button class="sq-btn sq-btn--warn" data-sq-toast="Memory above 85%" data-sq-toast-kind="warn">
  Warning toast
</button>
```

Toasts stack in the bottom-right corner and auto-dismiss. Kinds add an icon plus a
left accent rail (`--info` uses `--sq-status-info`).

---

## Feedback Components

### Alert / Banner

```html
<div class="sq-alert sq-alert--info" role="alert">
  <svg class="sq-icon sq-icon--16 sq-alert__icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
  <div class="sq-alert__content">
    <div class="sq-alert__title">Update Available</div>
    <div class="sq-alert__message">Version 2.1.0 is ready to install.</div>
  </div>
  <button class="sq-alert__dismiss" aria-label="Dismiss alert">
    <svg class="sq-icon sq-icon--14" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>
```

Variants: `sq-alert--info`, `sq-alert--ok`, `sq-alert--warn`, `sq-alert--err`. Left border rail matches kind color.

### Progress bar

```html
<div class="sq-progress" role="progressbar" aria-valuenow="65" 
     aria-valuemin="0" aria-valuemax="100">
  <div class="sq-progress__head">
    <span class="sq-progress__label">Upload progress</span>
    <span class="sq-progress__value">65%</span>
  </div>
  <div class="sq-progress__track">
    <div class="sq-progress__fill" style="width: 65%;"></div>
  </div>
</div>
```

Color variants: `sq-progress__fill--ok`, `sq-progress__fill--warn`, `sq-progress__fill--err`.

Indeterminate (loading state):

```html
<div class="sq-progress__track">
  <div class="sq-progress__fill sq-progress__fill--indeterminate"></div>
</div>
```

### Animated UI

Buttons and copy triggers get the press transition and a lightweight ripple
automatically (pointer clicks from the cursor, keyboard activation from the
centre). No markup is required; the ripple is skipped under reduced motion.

Header loading line — add one empty element to the topbar (optional; the runtime
injects it if missing), then toggle it:

```html
<header class="sq-topbar">
  ...
  <div class="sq-topbar__loader" aria-hidden="true"></div>
</header>
```

```js
SynteqUI.setLoading(true);        // first .sq-topbar
SynteqUI.setLoading(false);
SynteqUI.setLoading(true, el);    // any specific .sq-topbar
```

The line is additive to `.sq-spinner`: page-level work uses the baseline line,
local controls keep the circle spinner. Both stay animated when
`prefers-reduced-motion: reduce` is active, at a slower rate.

### Breadcrumb

```html
<nav class="sq-breadcrumb" aria-label="Breadcrumb">
  <a href="#" class="sq-breadcrumb__item">Home</a>
  <span class="sq-breadcrumb__separator">/</span>
  <a href="#" class="sq-breadcrumb__item">Settings</a>
  <span class="sq-breadcrumb__separator">/</span>
  <span class="sq-breadcrumb__item" aria-current="page">Security</span>
</nav>
```

Current page item is not clickable. Use any separator character.

### Empty state

```html
<div class="sq-empty">
  <svg class="sq-empty__icon" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
  <div class="sq-empty__title">No instances found</div>
  <div class="sq-empty__message">
    Get started by creating your first instance. It only takes a minute.
  </div>
  <div class="sq-empty__action">
    <button class="sq-btn sq-btn--primary">Create Instance</button>
  </div>
</div>
```

### Skeleton (loading placeholder)

```html
<!-- Text line -->
<span class="sq-skeleton sq-skeleton--text">&nbsp;</span>

<!-- Title -->
<span class="sq-skeleton sq-skeleton--title">&nbsp;</span>

<!-- Circle (avatar) -->
<span class="sq-skeleton sq-skeleton--circle">&nbsp;</span>

<!-- Button -->
<span class="sq-skeleton sq-skeleton--btn">&nbsp;</span>

<!-- Custom size -->
<span class="sq-skeleton" style="height: 14px; width: 72%;">&nbsp;</span>
```

Shimmer animation auto-plays. Use `&nbsp;` for non-empty content.

### Spinner

```html
<span class="sq-spinner" role="status" aria-label="Loading"></span>
<span class="sq-spinner sq-spinner--sm" role="status" aria-label="Loading"></span>
<span class="sq-spinner sq-spinner--lg" role="status" aria-label="Loading"></span>
```

### Tag / Chip (dismissible badge)

```html
<span class="sq-tag">
  Default
</span>

<span class="sq-tag sq-tag--brand">
  Featured
</span>

<span class="sq-tag sq-tag--ok">
  Active
  <button class="sq-tag__dismiss" aria-label="Remove tag">
    <svg class="sq-icon sq-icon--12" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</span>
```

Variants: `sq-tag--brand`, `sq-tag--ok`, `sq-tag--warn`, `sq-tag--err`. Pill-shaped with optional dismiss button.

---

## Form Components

### Text input with field wrapper

```html
<div class="sq-field">
  <label for="username" class="sq-field__label sq-field__label--required">Username</label>
  <input type="text" id="username" class="sq-input" placeholder="Enter username" 
         aria-required="true" aria-describedby="username-hint">
  <span id="username-hint" class="sq-field__hint">Must be 3-20 characters, alphanumeric only</span>
</div>
```

Invalid state (shows error, hides hint):

```html
<div class="sq-field sq-field--invalid">
  <label for="email" class="sq-field__label">Email</label>
  <input type="email" id="email" class="sq-input" aria-invalid="true" 
         aria-describedby="email-error">
  <span id="email-error" class="sq-field__error">Please enter a valid email address</span>
</div>
```

### Textarea

```html
<div class="sq-field">
  <label for="notes" class="sq-field__label">Notes</label>
  <textarea id="notes" class="sq-textarea" rows="4" placeholder="Enter notes..."></textarea>
</div>
```

### Select dropdown

```html
<div class="sq-field">
  <label for="region" class="sq-field__label">Region</label>
  <select id="region" class="sq-select">
    <option value="">Select a region</option>
    <option value="us-east">US East</option>
    <option value="us-west">US West</option>
    <option value="eu-central">EU Central</option>
  </select>
</div>
```

### Checkbox

```html
<label class="sq-checkbox-label">
  <input type="checkbox" class="sq-checkbox">
  I agree to the terms and conditions
</label>
```

### Radio group

```html
<div class="sq-field">
  <span class="sq-field__label">Instance size</span>
  <div class="sq-radio-group" role="radiogroup" aria-label="Instance size">
    <label class="sq-radio-label">
      <input type="radio" name="size" value="small" class="sq-radio">
      Small (2 vCPU, 4 GB)
    </label>
    <label class="sq-radio-label">
      <input type="radio" name="size" value="medium" class="sq-radio" checked>
      Medium (4 vCPU, 8 GB)
    </label>
    <label class="sq-radio-label">
      <input type="radio" name="size" value="large" class="sq-radio">
      Large (8 vCPU, 16 GB)
    </label>
  </div>
</div>
```

### Switch (toggle)

```html
<label class="sq-switch-label">
  <input type="checkbox" class="sq-switch" role="switch" aria-checked="false">
  Enable auto-renewal
</label>
```

### Input group (prefix/suffix)

```html
<div class="sq-field">
  <label for="amount" class="sq-field__label">Amount</label>
  <div class="sq-input-group">
    <span class="sq-input-group__affix">$</span>
    <input type="number" id="amount" class="sq-input" placeholder="0.00">
    <span class="sq-input-group__affix">USD</span>
  </div>
</div>
```

### Range slider

```html
<div class="sq-range-label">
  <div class="sq-range-label__head">
    <span class="sq-range-label__name">CPU Limit</span>
    <span class="sq-range-label__value">75%</span>
  </div>
  <input type="range" class="sq-range" min="0" max="100" value="75" 
         aria-label="CPU limit percentage">
</div>
```

**States:** All form controls support `:disabled`, `:focus-visible`, and `[aria-invalid="true"]`. Disabled controls get 40-50% opacity and `cursor: not-allowed`. Invalid controls show a red border, and keep a single red focus ring while focused (never a red border *plus* a brand ring). Each control draws exactly one focus indicator: fields, selects, checkbox, radio and switch use a `2px` brand ring; an input group uses its own `:focus-within` border and the inner input draws no ring.

**Touch targets:** Under `@media (pointer: coarse)`, checkbox/radio/switch sizes increase to meet 44×44 px minimum.

---

## Advanced Data Components

### Sortable, selectable, paginated table

```html
<div class="sq-table-toolbar">
  <div class="sq-table-toolbar__start">
    <span class="sq-table-toolbar__title">Instances</span>
    <span class="sq-table-toolbar__meta" data-sq-table-count>0 rows</span>
  </div>
  <div class="sq-table-toolbar__end">
    <label class="sq-table-toolbar__filter">
      <svg class="sq-icon sq-icon--14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="search" data-sq-table-filter placeholder="Filter rows..." aria-label="Filter rows" />
    </label>
  </div>
</div>

<div class="sq-table-wrap">
  <table class="sq-table sq-table--sticky sq-table--compact" data-sq-table data-sq-page-size="6">
    <thead>
      <tr>
        <th class="sq-table__check"><input type="checkbox" class="sq-checkbox" data-sq-select-all aria-label="Select all rows" /></th>
        <th>
          <button class="sq-table__sort" data-sq-sort="text">
            Instance
            <svg class="sq-icon sq-icon--12" viewBox="0 0 24 24" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
        </th>
        <th class="sq-table__num"><button class="sq-table__sort" data-sq-sort="number">CPU %</button></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="sq-table__check"><input type="checkbox" class="sq-checkbox" data-sq-row-select aria-label="Select octra-01" /></td>
        <td class="sq-table__mono">octra-01</td>
        <td class="sq-table__num">42</td>
      </tr>
    </tbody>
  </table>
</div>

<nav class="sq-pagination" data-sq-table-pagination aria-label="Table pagination"></nav>
```

`data-sq-table` is the only required hook — `initTables()` (part of `init()`) finds the toolbar, filter, counter and pagination inside the enclosing `[data-sq-table-scope]` or `.sq-section`. Sorting sets `aria-sort`; selection emits `sq:rowselection`; paging emits `sq:pagechange`. Call `SynteqUI.initTables()` again after injecting rows.

### Line / area chart (JS-rendered)

```html
<div class="sq-chart">
  <div class="sq-chart__head">
    <span class="sq-chart__title">Request rate</span>
    <span class="sq-chart__meta">last 12 intervals</span>
  </div>
  <div class="sq-chart__body">
    <svg class="sq-chart__svg" id="chart-line" viewBox="0 0 640 168" role="img"
         aria-label="Request rate and error rate"></svg>
  </div>
  <div class="sq-chart__legend" data-sq-chart-legend></div>
</div>
```

```js
SynteqUI.renderLineChart(document.getElementById('chart-line'), [
  { name: 'Requests', values: [120, 148, 132, 176, 210, 198, 242, 268, 251, 289, 312, 334] },
  { name: 'Errors',   values: [8, 12, 6, 18, 14, 22, 11, 26, 19, 15, 24, 17] }
], { labels: ['T-11', 'T-10', 'T-9', 'T-8', 'T-7', 'T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'now'], yTicks: 4 });
```

Axes, gridlines, tick labels, the legend and the hover tooltip (with crosshair) are generated. Chart height comes from `--sq-chart-h` (default `168px`). Always keep `role="img"` plus an `aria-label` on the `<svg>`.

### Stacked bars (JS-rendered)

```html
<div class="sq-chart">
  <div class="sq-chart__head"><span class="sq-chart__title">Traffic by class</span></div>
  <div class="sq-chart__body">
    <div class="sq-chart__cols" id="chart-stacked" role="img" aria-label="Stacked traffic"></div>
  </div>
  <div class="sq-chart__xlabels" data-sq-chart-labels></div>
  <div class="sq-chart__legend" data-sq-chart-legend></div>
</div>
```

```js
SynteqUI.renderStackedBars(document.getElementById('chart-stacked'), [
  { name: 'Read',  values: [42, 48, 51, 44, 58, 62, 57, 66] },
  { name: 'Write', values: [18, 22, 19, 26, 24, 31, 28, 34] },
  { name: 'Admin', values: [6, 4, 8, 5, 7, 6, 9, 5] }
], { labels: ['09:00', '09:05', '09:10', '09:15', '09:20', '09:25', '09:30', '09:35'] });
```

Series 1 is always at the baseline; hovering a column dims siblings and opens the tooltip.

---

## Navigation & Content Components

### Tree (expand / collapse, max 3 levels)

```html
<div class="sq-tree" data-sq-tree>
  <div class="sq-tree__item">
    <div class="sq-tree__row">
      <button class="sq-tree__toggle" aria-expanded="true" aria-label="Collapse us-east-1">
        <svg class="sq-icon sq-icon--14" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <span class="sq-tree__label">us-east-1</span>
      <span class="sq-tree__meta">3 nodes</span>
    </div>
    <div class="sq-tree__group">
      <div class="sq-tree__item">
        <div class="sq-tree__row">
          <span class="sq-tree__spacer" aria-hidden="true"></span>
          <span class="sq-tree__label sq-tree__label--mono">octra-01</span>
          <span class="sq-tree__meta">running</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

`aria-expanded` on the toggle drives the rotated caret *and* group visibility. Leaf rows use `.sq-tree__spacer` so labels stay aligned. Keyboard: `ArrowUp`/`ArrowDown` move between visible nodes, `ArrowRight` expands or enters, `ArrowLeft` collapses or goes to the parent, `Home`/`End` jump to the edges. Only three nesting levels are supported — deeper trees log a console warning.

### Stepper / timeline

```html
<div class="sq-stepper" data-sq-stepper data-sq-step="2">
  <div class="sq-stepper__item">
    <span class="sq-stepper__marker" aria-hidden="true">
      <svg class="sq-icon sq-icon--12" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
    <div class="sq-stepper__body">
      <div class="sq-stepper__title">Provision instance</div>
      <div class="sq-stepper__desc">Compute, network and volume created.</div>
      <div class="sq-stepper__meta">00:42</div>
    </div>
  </div>
  <!-- additional items: number or check glyph in the marker -->
</div>
```

```js
SynteqUI.setStep(stepperEl, 3);   // 0-based; earlier items become is-complete
stepperEl.addEventListener('sq:stepchange', function (e) { console.log(e.detail.index); });
```

States applied by `setStep()`: `is-complete`, `is-active` (gets `aria-current="step"`), `is-pending`. Add `is-error` manually for a failed step. `.sq-stepper--horizontal` switches to a row layout that folds back to vertical below 720px.

### Code block (line numbers + copy)

```html
<div class="sq-code" data-sq-code data-sq-line-numbers>
  <div class="sq-code__head">
    <span class="sq-code__title">install.sh</span>
    <div class="sq-code__actions">
      <button class="sq-code__copy" data-sq-code-copy="Copied" aria-label="Copy code">Copy</button>
    </div>
  </div>
  <div class="sq-code__body">
    <pre class="sq-code__pre"><code>npm install
npx synteq build --theme dark</code></pre>
  </div>
</div>
```

The gutter (`.sq-code__lines`) is generated from the `<pre>` text, so never hand-write line numbers. `data-sq-line-numbers="false"` opts out. The code area never wraps — it scrolls horizontally — which keeps the gutter aligned. Use `.sq-code--plain` for a canvas surface and `.sq-code--scroll` for a bounded height (`--sq-code-h`).

---

## JS API Reference

All methods are on the `SynteqUI` global, available after `synteq-ui.js` loads.

| Method | Signature | Notes |
|---|---|---|
| `setTheme` | `setTheme(theme: 'dark' \| 'light') → string` | Sets `data-theme` on `<html>`, persists to `localStorage` key `sq-theme` |
| `getTheme` | `getTheme() → 'dark' \| 'light'` | Reads current `data-theme` attribute |
| `toggleTheme` | `toggleTheme() → string` | Flips between dark and light |
| `renderGauge` | `renderGauge(fillEl, pct, opts?)` | `pct` is 0–100. `opts.kind`: `'auto'` (default, thresholds), `'brand'` (quorum/bandwidth), `'neutral'` (no state colour). Also updates `aria-valuenow` on the progressbar parent. |
| `renderBars` | `renderBars(stageEl, samples, opts?)` | Each sample is `[inPct, outPct]`, 0–100. `opts.minCols` pads short series with empty columns; `opts.stepSec` labels tooltips as `T-30s`. Clears and rebuilds the container. Sets `data-sq-bars-empty` when there is no data. |
| `renderSparkline` | `renderSparkline(svgEl, values)` | Raw values, auto-scaled into the SVG `viewBox` (default `0 0 200 40`). Fewer than 2 values clears the path and sets `data-sq-spark-empty`. Series is remembered and redrawn on resize. |
| `renderLineChart` | `renderLineChart(svgEl, series, opts?)` | `series` = `[{ name, values: [] }]`. `opts`: `labels`, `yTicks`, `xTickEvery`, `min`, `max`, `unit`, `decimals`, `format`, `area`. Draws axes, gridlines and tick labels, fills `[data-sq-chart-legend]`, and shows a hover tooltip + crosshair. Redraws on resize. |
| `renderStackedBars` | `renderStackedBars(colsEl, series, opts?)` | `series` = `[{ name, values: [] }]`; elements are summed per column. `opts`: `labels`, `max`, `minCols`, `unit`, `format`. Fills `[data-sq-chart-labels]` and `[data-sq-chart-legend]`; hover dims siblings and opens the tooltip. |
| `initTables` | `initTables()` | Wires every `[data-sq-table]`: sorting, selection (shift-click ranges), filtering, pagination. Idempotent — call after injecting rows. |
| `sortTable` | `sortTable(tableEl, colIndex, direction, opts?) → boolean` | `direction` = `'ascending' \| 'descending'`; `opts.type` = `'text' \| 'number' \| 'date'`. Updates `aria-sort` and re-renders the current page. |
| `initTree` | `initTree()` | Wires every `[data-sq-tree]`: toggle clicks, roving keyboard navigation and `aria-expanded` syncing. Warns when a tree is deeper than 3 levels. |
| `setStep` | `setStep(stepperEl, index) → number` | Marks items before `index` `is-complete`, `index` `is-active` (with `aria-current="step"`), the rest `is-pending`. Emits `sq:stepchange`. |
| `initStepper` | `initStepper()` | Applies `data-sq-step` (default `0`) to every `[data-sq-stepper]`. |
| `initCodeBlocks` | `initCodeBlocks()` | Generates the line-number gutter and wires `[data-sq-code-copy]` for every `[data-sq-code]`. |
| `scrollToSection` | `scrollToSection(id, opts?) → boolean` | Scrolls `.sq-content` to `#id`; `opts.behavior` = `'smooth' \| 'auto'`. Hash deep links (`/#logs`) and `hashchange` are handled automatically. |
| `tip` | `tip(anchorEl, message, opts?) → Element` | Transient anchored label (the copy handler shows "Copied" through it). `opts.kind` = `'info' \| 'ok' \| 'warn' \| 'err'`, `opts.duration` default 1500 ms. Fixed-positioned, viewport-clamped, `role="status"`, one at a time. |
| `replayAnimation` | `replayAnimation(el, opts?) → Animation \| null` | Restarts a mount animation on demand (used by "Replay animation" demos). `opts.preset` = `'fade-up' \| 'fade' \| 'zoom-in'`, `opts.duration` (default 280 ms), `opts.force` ignores reduced-motion. Cancels running animations first and drives the effect through the Web Animations API, so it works even though `base.css` shortens CSS animations to `0.001ms` under `prefers-reduced-motion` — in that case it plays a 120 ms opacity-only cross-fade (no movement). |
| `setLoading` | `setLoading(active, target?) → boolean` | Toggles `.is-loading` and `aria-busy` on a `.sq-topbar` (first one by default). The header line then animates via `.sq-topbar__loader`. |
| `prefersReducedMotion` | `prefersReducedMotion() → boolean` | Reports the live `prefers-reduced-motion: reduce` state; use it to show an honest "reduced motion" hint in demos. |
| `initSparklines` | `initSparklines()` | Renders every `.sq-spark` from its stored series or `data-sq-spark="1,2,3"`. Called automatically on `DOMContentLoaded`. |
| `initNavDock` | `initNavDock()` | Adds drag-to-scroll and the `More` drop-up when dock destinations overflow. Called automatically on `DOMContentLoaded`. |
| `initGauges` | `initGauges()` | Processes all `[data-sq-gauge]` elements in the DOM. Called automatically on `DOMContentLoaded`. |
| `sidebarToggle` | `sidebarToggle()` | Toggles open/closed based on current state and viewport width |
| `sidebarOpen` | `sidebarOpen()` | Shows the sticky bottom dock and updates toggle accessibility state. |
| `sidebarClose` | `sidebarClose()` | Hides the sticky bottom dock and updates toggle accessibility state. |

---

## Sidebar Toggle Wiring (single button rule)

**There is exactly one sidebar toggle in the entire page.** It lives in `.sq-topbar` and carries `data-sq-sidebar-toggle`. The JS runtime wires it automatically — no manual event listener needed.

```html
<!-- In .sq-topbar — the ONLY toggle. Do not add another anywhere. -->
<button class="sq-sidebar-toggle"
        data-sq-sidebar-toggle
        aria-label="Toggle navigation"
        aria-expanded="true"
        aria-controls="sidebar">
  <svg class="sq-icon sq-icon--18 icon-menu" viewBox="0 0 24 24" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
</button>
```

**All viewports:** toggle adds/removes `.nav-collapsed` on `.sq-app#app`. The dock slides away and the content area expands without introducing page scroll.

The dock remains sticky at the bottom on mobile. Do **not** add group labels
(`.sq-nav__group-label`) inside the dock — the horizontal strip only renders
icon + label items. When destinations overflow the strip:

- the strip becomes drag-scrollable (mouse/pen) and accepts horizontal wheel input;
- a `More` button (with a drop-up listing every off-screen item) is injected automatically by `SynteqUI.initNavDock()`;
- the active item is scrolled into view whenever the scroll-spy changes.

**Automatic close triggers (no code required):**
- Pressing `Escape` closes the `More` drop-up (the dock itself stays visible)
- Clicking a navigation item smooth-scrolls to its target section while the dock remains available

The sidebar itself has **no close button**. Do not add one — it creates a two-toggle situation that conflicts with sidebar state management.

Dock visibility preference is persisted under `localStorage` key `sq-sidebar`.

---

## Theme Switching

Set initial theme on `<html>`:

```html
<html data-theme="dark">   <!-- or data-theme="light" -->
```

Switch at runtime:

```js
SynteqUI.setTheme('light');   // explicit
SynteqUI.toggleTheme();       // flip
SynteqUI.getTheme();          // → 'dark' | 'light'
```

Wire any button automatically — no JS needed:

```html
<button data-sq-toggle-theme aria-label="Toggle theme">...</button>
```

The JS runtime detects `prefers-color-scheme` on first load if no saved preference exists, then writes the result to `localStorage` key `sq-theme`. Subsequent loads restore from localStorage.

---

## Icon Usage

All icons are inline SVG sourced from a 24×24 viewBox (Lucide or equivalent stroke-icon set). Always include `aria-hidden="true"` on decorative icons. Icon-only interactive elements need an `aria-label` on the button/link, not on the SVG.

```html
<!-- Decorative icon inside a labeled button -->
<button class="sq-iconbtn" aria-label="Copy to clipboard">
  <svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true">
    <!-- Lucide copy icon paths -->
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
</button>
```

**Size classes** (apply alongside `sq-icon`):

| Class | Rendered size |
|---|---|
| `sq-icon--14` | 14 × 14 px |
| `sq-icon--16` | 16 × 16 px |
| `sq-icon--18` | 18 × 18 px |
| `sq-icon--20` | 20 × 20 px |

**Tint classes** (optional, stack with size class):

| Class | Color |
|---|---|
| `sq-icon--mute` | Subtle/muted text color |
| `sq-icon--brand` | Brand accent |
| `sq-icon--info` | Blue / informational |
| `sq-icon--ok` | Green / success |
| `sq-icon--warn` | Amber / warning |
| `sq-icon--err` | Red / error |

Base class `sq-icon` is always required. Example with size and tint:

```html
<svg class="sq-icon sq-icon--16 sq-icon--ok" viewBox="0 0 24 24" aria-hidden="true">
  <polyline points="20 6 9 17 4 12"/>
</svg>
```

---

## Common Mistakes to Avoid

1. **Adding a second sidebar close button.** The framework manages sidebar state through a single `data-sq-sidebar-toggle` button. A second close button (e.g. inside `.sq-aside`) creates two competing state sources and breaks the desktop/mobile toggle logic.

2. **Using `min-height: 100%` or `overflow: auto` on `body`/`html`.** Synteq UI's viewport lock requires `height: 100dvh; overflow: hidden` on both. Any deviation reintroduces a page scrollbar and breaks the shell grid.

3. **Hard-coding color or spacing values in component styles.** Writing `color: #fff` or `padding: 16px` bypasses the token system. Theme switching and future token updates will silently break those elements. Always use `var(--sq-text-strong)` and `var(--sq-space-4)`.

4. **Wrapping content in card elements with `box-shadow` or tonal backgrounds.** Synteq UI's flat surface model means every surface is the same canvas color. Visual grouping comes from `.sq-section` hairlines only. Introducing elevation or tonal wrappers breaks visual consistency.

5. **Linking to Google Fonts CDN for Google Sans Code.** The font is self-hosted in `fonts/`. A CDN link introduces an external network request, breaks offline-first operation, and loads a different version of the typeface than the one the design was built against.

6. **Rendering a sparkline without a `viewBox`.** `renderSparkline` draws in viewBox units (default `0 0 200 40`). Keep a `viewBox` on the `<svg>` (any size works) instead of relying on rendered pixel dimensions — that is what keeps the path inside the chart at every breakpoint. Call `SynteqUI.initSparklines()` after dynamic content changes so new charts (and resized ones) are redrawn.

7. **Hiding elements with `.hidden = true` on a component that sets its own `display`.** `.sq-btn`, `.sq-menu` and friends declare `display: flex/inline-flex`, which beats the UA `[hidden]` rule. `base.css` now ships `[hidden] { display: none !important; }`; if you add a component with a `display` rule, rely on that reset instead of writing another `[hidden]` override.

8. **Giving a field two focus indicators.** The global `:focus-visible` outline in `base.css` is the ring everything else uses. Text fields, selects and checkboxes draw their own brand ring, so never add `border-color` *and* an outline on the same focus state — that is the double-border bug. Keep one indicator per control.

9. **Overriding `.sq-dialog { margin }`.** The modal is centred by `margin: auto` (the UA rule is zeroed by the framework reset). Setting `margin: 0` or a custom value drags the dialog to the top-left corner.


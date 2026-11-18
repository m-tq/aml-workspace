# Synteq UI

> Integration note: this directory vendors Synteq UI 2.2.0 as the default
> design system for the aml-workspace. Use the local `css/`, `js/`, `fonts/`
> and `examples/` assets directly; do not reimplement or load them from a CDN.

A clean, viewport-locked dashboard framework built on six hard rules:

1. **No page scrollbar** — the shell matches the screen exactly; only in-content regions scroll
2. **Responsive on any screen** — fluid type, clamp-based layout, centred sections, sticky bottom navigation dock that centre-aligns, drag-scrolls and exposes a `More` drop-up when it overflows
3. **Simple & lightweight** — lean token set, flat surfaces, zero dependencies
4. **No cards or wrappers** — visual hierarchy comes from hairline line separators only
5. **Lightweight motion** — press + ripple feedback, header line loading, subtle fade-up mounts, smooth gauge fills, pulse indicators; ambient motion auto-disabled with `prefers-reduced-motion`
6. **Inline icons** — every label carries an SVG icon for instant context recognition

---

## File Map

```
synteq-ui/
├── css/
│   ├── tokens.css            — fluid type scale, 4px spacing, radii, motion, layout shell vars, form tokens
│   ├── theme-dark.css        — dark palette (default)
│   ├── theme-light.css       — light palette
│   ├── base.css              — viewport lock, in-content scroll, reset, a11y, typography utils
│   ├── fonts.css             — self-hosted Google Sans Code @font-face
│   ├── synteq-ui.css         — master @import (single <link> for consumers)
│   └── components/
│       ├── icons.css         — inline SVG icon sizing (12–20px) & tint helpers
│       ├── shell.css         — viewport-locked app grid with bottom dock
│       ├── sidebar.css       — sticky bottom navigation dock
│       ├── topbar.css        — breadcrumb, search trigger, icon buttons, scroll state, loading line
│       ├── content.css       — sections, hairline separators, layout grids, stat strip
│       ├── data.css          — stat blocks, KV rows, slim gauges, sparkline, bar chart, data table, log viewer, legend
│       ├── controls.css      — buttons, segmented bar, input, badges, kbd pill, avatar
│       ├── forms.css         — field wrapper, text inputs, textarea, select, checkbox, radio, switch, input group, range
│       ├── overlays.css      — tabs, accordion, menu, popover, dialog, toast
│       ├── feedback.css      — alert, progress, spinner, breadcrumb, empty state, skeleton, tag
│       ├── tables.css        — toolbar, sortable headers, row selection, pagination, sticky head
│       ├── charts.css        — line/area chart, stacked bars, hover tooltip, chart legend
│       ├── tree.css          — expand/collapse hierarchy (3 levels)
│       ├── stepper.css       — vertical progress indicator / timeline
│       ├── code.css          — syntax-free code surface with gutter & copy
│       ├── framework.css     — density control, forced-colors, touch targets
│       └── motion.css        — button ripple, fade-up, stagger, soft pulse, hover lift
├── js/
│   └── synteq-ui.js          — runtime: theme, dock, scroll-spy, gauges, charts, tables, tree,
│                               stepper, code blocks, toast, command palette
├── fonts/                    — Google Sans Code (Regular, Medium, SemiBold)
└── examples/
    ├── dashboard.html        — production-style VPS detail dashboard
    └── components.html       — interactive component explorer (single source of truth)
```

---

## Quick Start

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="css/synteq-ui.css" />
</head>
<body>

  <div class="sq-app">
    <aside class="sq-aside">...</aside>
    <header class="sq-topbar">...</header>
    <main class="sq-main">
      <div class="sq-content sq-scroll">
        <!-- your sections here -->
      </div>
    </main>
  </div>

  <script src="js/synteq-ui.js"></script>
</body>
</html>
```

The `sq-app` grid locks to the viewport. `sq-content.sq-scroll` is the only element that produces a scrollbar. Navigation is a sticky bottom dock on desktop and mobile; the topbar toggle hides it without changing document scroll.

---

## UI Invariants

These are enforced by the framework CSS/JS, not by each app:

- The shell is viewport-locked. `body` never scrolls; only an in-content
  region or a data table may scroll.
- `.sq-content` has no vertical padding. Vertical spacing belongs to
  `.sq-section`, which fills exactly one screen and centres its content on
  both axes.
- The dock toggle hides the dock (opacity, visibility and pointer events) and
  collapses its grid row, so the content grows into the freed space. Its icon
  swaps between menu and close, and its `aria-label`/`aria-expanded` follow the
  state. Toggle bindings are idempotent across repeated `SynteqUI.init()` calls.
- The active dock item colours both its icon and its label with the brand
  colour.
## Browser Support

Synteq UI targets modern browsers with CSS custom properties, CSS Grid, and native `<dialog>` support:

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome / Edge** | 90+ | Full support |
| **Firefox** | 88+ | Full support |
| **Safari** | 15.4+ | Full support (including iOS Safari) |
| **Opera** | 76+ | Full support |

### Required Features

- **CSS Custom Properties** — all theming and tokens
- **CSS Grid** — viewport-locked app shell layout
- **`<dialog>` element** — modal dialogs
- **`<details>` / `<summary>`** — accordion component
- **`color-mix()`** — tonal badge/alert backgrounds (degrades gracefully)
- **`dvh` units** — viewport height with mobile address bar compensation (falls back to `vh`)
- **`clamp()`** — fluid type scale and responsive spacing

### Progressive Enhancement

- **`prefers-reduced-motion`** — ambient animations auto-disable when user prefers reduced motion; loading spinners, header line loading and indeterminate progress stay active
- **`prefers-color-scheme`** — detects system theme preference on first load
- **`forced-colors`** — automatic Windows High Contrast Mode support
- **JavaScript optional** — static content renders without JS; interactive features (tabs, menus, toasts) require `synteq-ui.js`

### Not Supported

- Internet Explorer 11 and below
- Legacy Edge (pre-Chromium)
- Safari < 15.4 (lacks `<dialog>` support)

All examples tested on Chrome 120+, Firefox 121+, Safari 17+, and Edge 120+.

---

## Navigation Dock

- Items are **icon + label only** — the dock never renders group labels such as
  “Workspace” or “Account”. Remove `.sq-nav__group-label` from navigation markup
  (the class is hidden by CSS for backwards compatibility).
- While destinations fit, the strip is centred with CSS `safe center` (never
  clipped on the left). As soon as they overflow:
  - the strip can be **dragged** (mouse/pen) and accepts horizontal wheel input;
  - the runtime injects a **`More` drop-up** that lists every off-screen
    destination (`SynteqUI.initNavDock()` runs automatically);
  - the active item is scrolled into view when the scroll-spy changes.
- Nothing extra to wire: `initNavDock()` and the scroll-spy are part of the
  default runtime initialisation.

### Section links & deep links

Nav items use `href="#section-id"`, so the runtime can both scroll and keep the
URL shareable:

```html
<a href="#logs" class="sq-nav__item">Logs</a>
```

- Clicking a nav item scrolls the section into view, updates the active state
  **and** writes the hash with `history.replaceState` (no jump, shareable URL).
- Loading `/#logs` scrolls to that section once the page settles; `hashchange`
  is honoured as well.
- Programmatic scroll (e.g. after an async render changed the layout):

```js
SynteqUI.scrollToSection('logs');            // or '#logs'
SynteqUI.scrollToSection('logs', { behavior: 'auto' });
```

→ Returns `false` when the id does not exist.

---

## Copy to clipboard

Add `data-sq-copy` to any button or link — the runtime handles it by delegation,
so buttons created *after* page load work too:

```html
<button class="sq-btn sq-btn--icon" aria-label="Copy address"
        data-sq-copy="oct3oMBjs5Jx…">⧉</button>
```

- Empty `data-sq-copy=""` copies the text of the button's **previous sibling**
  (handy for label/value pairs).
- The attribute value is read at click time, so you can keep it in sync with
  live data without re-binding.
- Feedback: a **"Copied" tip** appears above the button, `.sq-copy--ok` tints it
  green for 1.8 s and `aria-label` flips to the confirmation text. Customise the
  wording per button with `data-sq-copy-label="Address copied"`; a failed copy
  shows `Copy failed` in the error tint instead.
- On insecure origins (`http://` without a secure context) it falls back to a
  hidden textarea + `execCommand('copy')` instead of failing silently.

---

## Click feedback

Every control (`.sq-btn`, `.sq-iconbtn`, `.sq-seg__btn`, `.sq-search`, the
sidebar/theme toggle, the dock's `More` button and anything with `data-sq-copy`)
gets the same press treatment: a 1 px push, a 0.985 inward scale, an 8 %
`currentColor` wash and a lightweight ripple. No elevation and no ripple
library — the ripple is one runtime-injected span.

For your own actions, show the same transient label the copy handler uses:

```js
SynteqUI.tip(button, 'Refreshed');                    // ok tint, 1.5 s
SynteqUI.tip(button, 'Auto-refresh paused', { kind: 'warn' });
SynteqUI.tip(button, 'Request failed', { kind: 'err', duration: 2500 });
```

The tip is fixed-positioned above the anchor (below when there is no room),
clamped to the viewport, `role="status"` for assistive tech, and only one exists
at a time — rapid clicks replace it instead of stacking.

---

## Theme

Set `data-theme="dark"` or `data-theme="light"` on `<html>`. Switches at runtime:

```js
SynteqUI.setTheme('light');
SynteqUI.toggleTheme();
SynteqUI.getTheme(); // → 'dark' | 'light'
```

Add `data-sq-toggle-theme` to any button for automatic wiring.  
Theme preference is persisted in `localStorage` under key `sq-theme`.

---

## Sections & Line Separators

Synteq UI has no cards. Content is organized into `.sq-section` blocks separated by a single `1px` top border. Every section fills the space between the topbar and the dock and **centres its content vertically**, while the section column is **centred horizontally** at `--sq-content-max` (default `1200px`).

```html
<div class="sq-section">
  <div class="sq-section__head">
    <span class="sq-section__title">Resource Usage</span>
    <span class="sq-section__meta">updated 5s ago</span>
  </div>
  <!-- content -->
</div>
```

Add `.sq-section--top` to opt out of vertical centring, or `.sq-section--compact`
to drop the full-viewport minimum height. Nested sections (for example inside a
live preview) never inherit the viewport height.

For inline stat separation, use the stat strip (vertical hairlines between items):

```html
<div class="sq-stat-strip">
  <div class="sq-stat">
    <span class="sq-stat__label">vCPU</span>
    <div class="sq-stat__value">4 <span class="sq-unit">cores</span></div>
  </div>
  <div class="sq-stat">...</div>
</div>
```

---

## Gauges

Add `data-sq-gauge="72"` to the track element and `.sq-gauge__fill` inside it. `initGauges()` runs automatically on DOMContentLoaded.

```html
<div class="sq-gauge" data-sq-gauge="72"
     role="progressbar" aria-label="CPU" aria-valuenow="72"
     aria-valuemin="0" aria-valuemax="100">
  <div class="sq-gauge__head">
    <span class="sq-gauge__label">CPU</span>
    <span class="sq-gauge__value">72<span class="sq-gauge__max"> / 100%</span></span>
  </div>
  <div class="sq-gauge__track">
    <div class="sq-gauge__fill"></div>
  </div>
</div>
```

Update imperatively:

```js
const fill = document.querySelector('.sq-gauge__fill');
SynteqUI.renderGauge(fill, 88);                       // auto-colors: ok / warn / err
SynteqUI.renderGauge(fill, 100, { kind: 'brand' });   // quorum / bandwidth gauge
SynteqUI.renderGauge(fill, 42,  { kind: 'neutral' }); // no state colour
```

Color thresholds: `< 75%` → green, `75–89%` → amber, `≥ 90%` → red.

`kind` options:

| Value | Fill colour | Use for |
|---|---|---|
| `auto` (default) | ok / warn / err by threshold | CPU, memory, disk |
| `brand` | `--sq-brand` | quorum progress, bandwidth |
| `neutral` | `--sq-text-strong` | secondary/comparison bars |

---

## Bar Chart (Network I/O)

```js
// samples: Array of [inPct, outPct] — each 0–100
SynteqUI.renderBars(document.getElementById('net-bars'), [
  [12, 4], [18, 6], [35, 10], [52, 16], ...
], { minCols: 24, stepSec: 5 });
```

| Option | Default | Purpose |
|---|---|---|
| `minCols` | `0` | Pad the series with empty leading columns so a short series still renders slim bars instead of a few fat ones |
| `stepSec` | `null` | Seconds per sample; turns the tooltip into `T-30s ↓ 3.2% ↑ 1.1%` |

If an `[inPct, outPct]` pair totals more than 100, the chart expands its scale
for the whole series so the tallest column still fits; normal pairs keep their
absolute 0–100 height.

```html
<div class="sq-bars" id="net-bars"
     role="img" aria-label="Network I/O chart"
     style="--sq-bars-cols:24;"></div>
```

When the series is empty the container gets `data-sq-bars-empty="true"` (styled at 35 % opacity) so you can show a "collecting samples…" hint next to it.

---

## Sparkline

```js
SynteqUI.renderSparkline(
  document.getElementById('cpu-spark'),
  [18, 22, 31, 40, 36, 34, 38, 35, 33, 34] // raw values, auto-scaled
);
```

```html
<svg class="sq-spark" id="cpu-spark"
     viewBox="0 0 200 40" preserveAspectRatio="none"
     role="img" aria-label="CPU trend"></svg>
```

Add `.sq-spark--out` to use the outbound (red) color palette.
`.sq-spark--tall` raises the chart to 56 px (or set `--sq-spark-h` on any
instance). When fewer than two samples are available the runtime clears the path
and sets `data-sq-spark-empty="true"` instead of leaving stale data on screen.

The sparkline is drawn in **viewBox units** (the `<svg viewBox>` above, defaulting to
`0 0 200 40`), so the same path scales to any rendered width without overflowing.
The series is remembered and redrawn on resize; `SynteqUI.initSparklines()` renders
every `.sq-spark` automatically, including `<svg class="sq-spark" data-sq-spark="12,18,9,22">`.

---

## Line & Area Chart

Axis-labelled line/area chart drawn in element pixel units, so tick labels stay
crisp at any width and the chart redraws (debounced) on resize.

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
], {
  labels: ['T-11', 'T-10', 'T-9', 'T-8', 'T-7', 'T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'now'],
  yTicks: 4,          // requested gridline count (rounded to a "nice" step)
  decimals: 0,        // or format: v => v.toFixed(1)
  unit: '',           // appended to every tick + tooltip value
  area: true,         // false for pure lines
  min: 0, max: 400,   // pin the domain instead of auto-scaling
  xTickEvery: 2       // density of x labels
});
```

The hover tooltip (`.sq-chart__tip`) is created on demand inside
`.sq-chart__body`: move the pointer over the plot and it snaps to the nearest
sample, draws a dashed crosshair and lists every series with its swatch and
value. Chart height is controlled by `--sq-chart-h` (default `168px`, `128px`
under 520px).

| Class | Purpose |
|---|---|
| `.sq-chart` | Column frame: head, body, legend |
| `.sq-chart__svg` | Line/area canvas (`height: var(--sq-chart-h)`) |
| `.sq-chart__grid` / `__axis` / `__tick` | Gridlines, value axis, tick labels (generated) |
| `.sq-chart__area` / `__line` / `__dot` | Series primitives (generated) |
| `.sq-chart__s1…s4` | Series tints: brand, tel-out, warning, subtle |
| `.sq-chart__cursor` | Dashed hover crosshair (generated) |
| `.sq-chart__tip` | Hover tooltip (generated) |
| `.sq-chart__legend` | Legend row; add `data-sq-chart-legend` to auto-fill it |

---

## Stacked Bars

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
], { labels: ['09:00', '09:05', '09:10', '09:15', '09:20', '09:25', '09:30', '09:35'], unit: ' req/s' });
```

Columns share a single scale (the largest stack), segments are appended in
series order and the CSS renders them bottom-up, so series 1 always sits on the
baseline. Hovering a column dims its siblings and shows the tooltip with the
label and every series value. Pass `max` to pin the scale, or `minCols` to pad
short series with empty columns.

---

## Data Table

Slim, text-first tables for peer lists, ledger rows, log summaries — hairline rows
only, tabular numbers, no zebra striping.

```html
<div class="sq-table-wrap">
  <table class="sq-table">
    <thead>
      <tr>
        <th scope="col">Peer</th>
        <th scope="col" class="sq-table__num">Head epoch</th>
        <th scope="col" class="sq-table__num">Lag</th>
        <th scope="col">Source</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="sq-table__mono">oct3SUwRsi…v2v4Bm</td>
        <td class="sq-table__num">1,756,258</td>
        <td class="sq-table__num">8</td>
        <td class="sq-table__mute">epoch_root</td>
      </tr>
      <tr class="is-stale">…</tr>
    </tbody>
  </table>
</div>
```

| Class | Purpose |
|---|---|
| `.sq-table-wrap` | Horizontal scroll container with a thin scrollbar (long addresses / wide tables) |
| `.sq-table` | `border-collapse`, `--sq-text-sm`, tabular numbers, hover row |
| `.sq-table__num` | Right-aligned mono cell (counts, epochs, bytes) |
| `.sq-table__mono` | Mono cell, default alignment (hashes, addresses) |
| `.sq-table__mute` | Quiet metadata cell |
| `tr.is-stale` / `td.is-stale` | Dims cached/stale rows without hiding them |
| `.sq-table--fixed` | `table-layout: fixed` for equal-width columns |

Cells never wrap (`white-space: nowrap`) — truncate long values in the cell with
`.sq-mono` + your own `text-overflow` or keep the table inside `.sq-table-wrap`.

### Advanced table features

The table module layers sorting, selection, filtering and pagination on top of
the base `.sq-table`. One runtime call (`initTables()`, already part of the
default `init()`) wires everything found in the enclosing
`[data-sq-table-scope]` or `.sq-section`.

```html
<div class="sq-table-toolbar">
  <div class="sq-table-toolbar__start">
    <span class="sq-table-toolbar__title">Instances</span>
    <span class="sq-table-toolbar__meta" data-sq-table-count>0 rows</span>
  </div>
  <div class="sq-table-toolbar__end">
    <label class="sq-table-toolbar__filter">
      <svg class="sq-icon sq-icon--14" viewBox="0 0 24 24" aria-hidden="true"><!-- search --></svg>
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

| Hook | Purpose |
|---|---|
| `data-sq-table` | Marks the table for the runtime; the only required attribute |
| `data-sq-page-size` | Rows per page (omit for a single, unfiltered page) |
| `data-sq-sort="text\|number\|date"` | Comparator for that column's button |
| `data-sq-select-all` / `data-sq-row-select` | Select-all + per-row checkboxes (shift-click selects a range) |
| `data-sq-table-filter` | Live text filter over the row contents |
| `data-sq-table-count` | Element that receives `n rows` / `n of m selected` |
| `data-sq-table-pagination` | Container the runtime fills with page buttons |
| `data-sq-empty-label` | Copy for the generated "no matching rows" row |

Sorting writes `aria-sort="ascending|descending"` on the header cell and removes
it from the others, so screen readers announce the active column. Selection
emits `sq:rowselection` and paging emits `sq:pagechange` — both bubble, so a
single listener on the section is enough:

```js
document.addEventListener('sq:rowselection', function (e) {
  console.log(e.detail.count, e.detail.rows);
});

SynteqUI.initTables();          // re-scan after adding rows dynamically
SynteqUI.sortTable(tableEl, 3, 'descending');   // programmatic sort
```

Density modifiers: `.sq-table--compact` (tighter vertical padding) and
`.sq-table--dense` (smaller type + padding). Add `.sq-table--sticky` to pin the
header inside a scrolling `.sq-table-wrap`.

---

## Log Viewer

Mono rows with level accents, built for streaming tails.

```html
<div class="sq-log sq-log--scroll sq-log--bordered" role="log" aria-label="Node log tail">
  <div class="sq-log__row">
    <span class="sq-log__ts">14:33:05</span>
    <span class="sq-log__level">INFO</span>
    <span class="sq-log__comp">consensus</span>
    <span class="sq-log__msg">component = consensus event = post_finalize_root_verified epoch = 1756254</span>
  </div>
  <div class="sq-log__row sq-log__row--warn">
    <span class="sq-log__ts">14:33:07</span>
    <span class="sq-log__level sq-log__level--warn">WARN</span>
    <span class="sq-log__comp">p2p</span>
    <span class="sq-log__msg">event = frame_budget_rejected reason = frame_count_budget</span>
  </div>
</div>
```

| Class | Purpose |
|---|---|
| `.sq-log` | Flex column, mono 11 px, 1.55 line-height |
| `.sq-log--scroll` | `max-height: var(--sq-log-h, 420px)` + thin scrollbar + `overscroll-behavior: contain` |
| `.sq-log--bordered` | Hairline top + bottom separators |
| `.sq-log__row` | One line: ts · level · component · message, 2 px transparent left rail |
| `.sq-log__row--warn` / `--error` | Amber / red left rail (error also tints the row) |
| `.sq-log__level--warn` / `--error` / `--fatal` | Level text colour |
| `.sq-log__empty` | Centered placeholder for "waiting for log stream…" |

On `≤720px` the component column is hidden; on `≤420px` the timestamp is hidden as
well, so the message keeps full width on phones.

---

## Tree

Expand/collapse hierarchy, three levels maximum. Indentation is produced by
nesting the groups — each level owns its own hairline rail, so no depth maths is
needed. `aria-expanded` on the toggle is the single source of truth.

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

| Class / hook | Purpose |
|---|---|
| `data-sq-tree` | Enables the runtime (click + keyboard handling) |
| `.sq-tree__item` | One node: a row plus an optional `.sq-tree__group` |
| `.sq-tree__row` | Toggle · label · meta on one line |
| `.sq-tree__toggle` | Caret button; rotate is driven by `aria-expanded` |
| `.sq-tree__spacer` | Keeps leaf labels aligned with sibling toggles |
| `.sq-tree__group` | Nested children; hidden when the parent is collapsed |
| `.sq-tree__label--mono` | Mono treatment for resource ids |

Keyboard model (focus lives on the toggles): `ArrowDown` / `ArrowUp` move
between visible nodes, `ArrowRight` expands or enters the first child,
`ArrowLeft` collapses or jumps to the parent, `Home` / `End` jump to the edges.
A tree deeper than three levels still renders, but `initTree()` logs a warning —
the design system only supports three.

---

## Stepper / Timeline

Vertical progress indicator for multi-step flows and deployment timelines.

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
  <!-- more items -->
</div>
```

| Class | Purpose |
|---|---|
| `.sq-stepper` | Column container; `data-sq-stepper` + `data-sq-step` drive the state |
| `.sq-stepper__item` | Grid row: marker column + body; owns the connecting rail |
| `.sq-stepper__marker` | Circle marker (number, check icon or anything inline) |
| `.sq-stepper__title` / `__desc` / `__meta` | Body slots |
| `is-complete` / `is-active` / `is-pending` / `is-error` | Applied by `setStep()`; `is-error` is manual |
| `.sq-stepper--horizontal` | Row layout that folds back to vertical below 720px |

```js
SynteqUI.setStep(stepperEl, 3);          // 0-based; marks 0–2 complete
stepperEl.addEventListener('sq:stepchange', function (e) {
  console.log(e.detail.index);
});
```

The active item receives `aria-current="step"`, so assistive technology can
announce the current position without extra markup.

---

## Code Block

Syntax-free code surface with an optional header bar, a runtime-generated
line-number gutter and a copy button.

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

| Class / hook | Purpose |
|---|---|
| `data-sq-code` | Enables the runtime (gutter + copy wiring) |
| `data-sq-line-numbers="false"` | Opt out of the gutter |
| `.sq-code__head` | Optional bar with title and actions |
| `.sq-code__body` | Flex row: gutter (generated) + `<pre>` |
| `.sq-code__pre` | `white-space: pre`, horizontal scroll, no wrapping |
| `[data-sq-code-copy]` | Copy trigger; the attribute value is the confirmation label |
| `.sq-code--plain` / `.sq-code--scroll` | Canvas surface / bounded height (`--sq-code-h`) |
| `.sq-code--plain` caption | `.sq-code__caption` for a footnote under the block |

Line numbers are generated from the `<pre>` text on init, and the code copy
button reuses the same clipboard helper and "Copied" tip as `[data-sq-copy]`.
The gutter is hidden below 520px so code keeps the full width on phones.

---

## Controls

```html
<!-- Button variants -->
<button class="sq-btn">Default</button>
<button class="sq-btn sq-btn--primary">Primary</button>
<button class="sq-btn sq-btn--brand">Brand</button>
<button class="sq-btn sq-btn--info">Info</button>
<button class="sq-btn sq-btn--warn">Warning</button>
<button class="sq-btn sq-btn--danger">Danger</button>
<button class="sq-btn sq-btn--ghost">Ghost</button>
<button class="sq-btn sq-btn--icon" aria-label="Options">...</button>
<button class="sq-btn sq-btn--block">Full width</button>

<!-- Segmented bar -->
<div class="sq-seg" role="group" aria-label="Actions">
  <button class="sq-seg__btn">Console</button>
  <button class="sq-seg__btn">Power</button>
  <button class="sq-seg__btn">Reboot</button>
</div>

<!-- Badges -->
<span class="sq-badge sq-badge--info">Info</span>
<span class="sq-badge sq-badge--ok">Running</span>
<span class="sq-badge sq-badge--warn">Degraded</span>
<span class="sq-badge sq-badge--err">Error</span>
<span class="sq-badge sq-badge--brand">New</span>

<!-- Keyboard pill -->
<kbd class="sq-kbd">⌘K</kbd>
```

### Semantic variants

`info` and `warn` (alias `warning`) exist everywhere a state colour is accepted,
so one status never has to borrow another's hue:

| Component | Info | Warning |
|---|---|---|
| Button | `.sq-btn--info` | `.sq-btn--warn` / `.sq-btn--warning` |
| Badge | `.sq-badge--info` | `.sq-badge--warn` |
| Tag | `.sq-tag--info` | `.sq-tag--warn` |
| Alert | `.sq-alert--info` | `.sq-alert--warn` |
| Toast | `kind: 'info'` | `kind: 'warn'` |
| Tip | `.sq-tip--info` | `.sq-tip--warn` |
| Progress fill | `.sq-progress__fill--info` | `.sq-progress__fill--warn` |
| Gauge fill | `.sq-gauge__fill--info` | `.sq-gauge__fill--warn` |
| Status dot | `.sq-dot--info` | `.sq-dot--warn` |
| Icon tint | `.sq-icon--info` | `.sq-icon--warn` |
| Log row / level | `--info` | `--warn` |

Tonal variants (button / badge / tag / log level) paint the status hue at
`--sq-status-ink-mix` (60%) over the text colour, which is what keeps every
combination above WCAG AA in both themes.

### Focus treatment

Each control draws exactly **one** focus indicator:

- text fields, textarea, select → 2px brand ring (`outline`, 1px offset)
- checkbox, radio, switch, range → 2px brand ring (2px offset)
- input group → the group border turns brand (`:focus-within`), the inner input draws nothing
- everything else (buttons, links, nav items) → the global `:focus-visible` outline from `base.css`

Invalid fields keep the error signal by turning the *ring* red instead of adding a
second red border underneath it.

---

## Animated UI

Interaction motion is deliberately small: a press transition, a currentColor
ripple, and loading indicators that never block the page.

### Click ripple

Every `.sq-btn`, `.sq-iconbtn`, `.sq-seg__btn`, `.sq-search`, sidebar/theme
toggle, dock `More` button and `[data-sq-copy]` trigger gets the press
treatment plus a lightweight ripple. Pointer clicks start at the cursor;
keyboard activation starts at the centre. The ripple is skipped when
`prefers-reduced-motion: reduce` is active.

### Header loading line

Add one empty line element to the topbar (or let `setLoading` create it), then
toggle it from the runtime:

```html
<header class="sq-topbar">
  ...
  <div class="sq-topbar__loader" aria-hidden="true"></div>
</header>
```

```js
SynteqUI.setLoading(true);                 // app header
SynteqUI.setLoading(false);                // stop
SynteqUI.setLoading(true, previewTopbar);  // any .sq-topbar element
```

The line sits on the header baseline and is additive to `.sq-spinner`: use it
for page-level work, keep the circle spinner for local controls.

Mount animation fires automatically on `.sq-stagger` children.  
For scroll-triggered stagger, add `data-sq-stagger` to the container — the JS runtime observes it and adds `.sq-stagger` on entry.

```html
<div data-sq-stagger>
  <!-- each child fades up in sequence -->
  <div>...</div>
  <div>...</div>
</div>
```

Skeleton shimmer for loading states:
```html
<span class="sq-skeleton" style="width:120px;height:14px;display:block;">&nbsp;</span>
```

### Replaying an animation

CSS animations cannot simply be re-triggered once they finished, and under
`prefers-reduced-motion: reduce` the global guard in `base.css` shortens every
animation to `0.001ms` — a class toggle then looks like "nothing happened".
Use the runtime helper instead:

```js
// fade-up (default), 280ms
SynteqUI.replayAnimation(document.getElementById('anim-target'));

// other presets / durations
SynteqUI.replayAnimation(el, { preset: 'zoom-in', duration: 420 });
SynteqUI.replayAnimation(el, { preset: 'fade-up', force: true }); // ignore reduced motion
```

`replayAnimation` cancels any running animation on the element and drives the
effect through the Web Animations API (WAAPI), so it always restarts. When the
user prefers reduced motion it drops the movement and plays a 120ms opacity-only
cross-fade instead of silently doing nothing — a replay is a user-initiated
action, so it should still be visible. Query the state with
`SynteqUI.prefersReducedMotion()` when you want to explain that in the UI.

All *ambient* motion (mount, stagger, shimmer, pulse) is still suppressed when
`prefers-reduced-motion: reduce` is active (set in `base.css`). Essential loading
indicators (`.sq-spinner`, `.sq-progress__fill--indeterminate`, `.sq-topbar__loader`)
stay animated at a slower rate so a loading state never looks frozen.

---

## Key-Value Rows

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
</div>
```

Each row gets a `1px` top border automatically. No manual rules needed.

---

## Icons

All icons are inline SVG with `aria-hidden="true"`. Size and tint via utility classes:

```html
<svg class="sq-icon sq-icon--16 sq-icon--mute" viewBox="0 0 24 24" aria-hidden="true">
  <!-- Lucide or any 24×24 stroke icon path -->
</svg>
```

| Class | Size |
|---|---|
| `sq-icon--14` | 14 × 14 px |
| `sq-icon--16` | 16 × 16 px |
| `sq-icon--18` | 18 × 18 px |
| `sq-icon--20` | 20 × 20 px |

Tint helpers: `sq-icon--mute`, `sq-icon--brand`, `sq-icon--info`, `sq-icon--ok`, `sq-icon--warn`, `sq-icon--err`.

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `> 1080px` | Centred content column, all dock destinations visible |
| `≤ 1080px` | Dock items narrow; drag-to-scroll + `More` drop-up activate |
| `≤ 900px` | `.sq-grid--auto` collapses to one column |
| `≤ 860px` | Dock brand/footer compact, 72px nav items, 44px+ touch targets |
| `≤ 720px` | Two/three column grids collapse to a single column |
| `≤ 520px` | Stat strip tightens, dock compresses (48px brand / 64px items) |
| `≤ 420px` | Topbar/bottomnav heights compress, breadcrumb separators hidden |
| `≤ 380px` | Breadcrumb hidden, dock brand 42px / items 58px |
| `landscape height ≤ 480px` | Dock compresses to 52px and items become horizontal |

---

## Design Evolution

| | Legacy | Current |
|---|---|---|
| Surface hierarchy | 5-tier tonal elevation (canvas → raised → strong → muted → hover) | Flat — single canvas surface |
| Visual separation | Tonal background shift on cards | `1px` hairline separators only |
| Navigation | Fixed left sidebar | Sticky bottom dock with hide/show toggle |
| Page scroll | `min-height: 100%` | `height: 100dvh; overflow: hidden` — zero page scroll |
| Gauge | 86-tick discrete bar | Continuous smooth fill bar |
| Network chart | 48-bar stacked histogram (112px tall) | 2 chart modules — dual-segment bars (72px) plus axis-labelled line/area and stacked columns |
| Tables | Static table | Sortable, selectable, filterable, paginated |
| Motion | Transition-only | Fade-up mount + stagger + shimmer + IntersectionObserver |


---

## Accessibility

- All interactive elements support `:focus-visible`; each control paints **one** ring only (2px brand for fields/checkboxes, 2px `--sq-text-strong` for everything else)
- Gauge tracks carry `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Icon-only buttons require explicit `aria-label`
- Status dots use `aria-label` on the parent element
- `prefers-reduced-motion` is honored globally; ambient motion is removed while essential loading indicators stay slowly animated, and `SynteqUI.replayAnimation()` degrades to an opacity-only cross-fade instead of doing nothing
- Color tokens maintain ≥ 4.5:1 contrast ratio (WCAG 2.2 AA) in both themes — tonal status surfaces (buttons, badges, tags, log levels) resolve their label colour through `--sq-status-ink-mix`, so a status hue is never painted raw on a light background
- `[hidden] { display: none !important; }` is part of the reset, so runtime filters really hide elements

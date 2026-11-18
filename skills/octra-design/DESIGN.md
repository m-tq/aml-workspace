# Synteq UI — Design System Reference

> **Audience:** Humans and AI agents building with or extending the framework.
> This document is the authoritative reference for architecture, tokens, components, and rules.

---

## 1. Mission

Synteq UI is a **viewport-locked, offline-first, text-first** dashboard UI framework. It is purpose-built for operator dashboards — dense information displays where every pixel matters and page loading patterns must never interrupt the operator's view.

### Six Hard Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | **No body scroll** | The shell matches the screen exactly. Only designated in-content regions scroll. |
| 2 | **Responsive on any screen** | Fluid type scale (`clamp`), adaptive content grid, and a sticky hideable bottom dock work from phone to ultra-wide. |
| 3 | **Simple & lightweight** | Minimal token set, flat surfaces, zero external runtime dependencies. |
| 4 | **No cards** | Visual separation comes from `1px` hairline separators only — never from background color shifts or box shadows that create card-like wrappers. |
| 5 | **Lightweight motion** | Press + ripple feedback, header line loading, subtle fade-up mounts, smooth gauge fills, pulse indicators. Ambient motion is auto-disabled via `prefers-reduced-motion`; essential loading indicators keep moving. |
| 6 | **Inline icons** | Every interactive label carries an inline SVG icon for instant context recognition. No icon fonts, no external icon CDNs. |

---

## 2. Architecture

### Flat Surface Model

Synteq UI uses a single flat canvas instead of a multi-tier tonal elevation model. There is a **single canvas surface** (`--sq-canvas`). Nothing sits "above" or "below" it in a tonal sense.

**Visual hierarchy is expressed through:**
- Typography weight (`--sq-fw-regular` → `--sq-fw-semibold`) and size (`--sq-text-xs` → `--sq-text-3xl`)
- Hairline `1px` separators (`--sq-line`, `--sq-line-strong`, `--sq-line-accent`)
- Subtle hover/inset surface states (`--sq-hover`, `--sq-inset`) for interactive affordance only — never as permanent background shifts to imply depth

**Never expressed through:**
- Card-style `background` blocks
- `box-shadow` elevation layers
- Tonal surface tiers (raised / strong / muted hierarchy)

### Design Evolution

| | Legacy | Current |
|---|---|---|
| Surface hierarchy | 5-tier tonal elevation | Single flat canvas |
| Visual separation | Tonal card backgrounds | `1px` hairline separators only |
| Navigation | Fixed left sidebar | Sticky bottom dock with icon labels and hide/show motion |
| Page scroll | `min-height: 100%` | `height: 100dvh; overflow: hidden` — only `.sq-content` scrolls |
| Gauge | 86-tick discrete bar | Continuous smooth fill bar |
| Network chart | 48-bar histogram (112px) | Dual-segment bars (72px) + axis-labelled line/area and stacked columns |
| Tables | Static markup | Sortable, selectable, filterable, paginated module |
| Motion | Transition-only | Press + ripple, header line loading, fade-up mount + stagger + shimmer + IntersectionObserver |


---

## 3. Token Reference

### 3.1 Typography

| Token | Value | Notes |
|-------|-------|-------|
| `--sq-font-sans` | `'Google Sans Code', 'DM Sans', system-ui, -apple-system, sans-serif` | Primary UI font — self-hosted |
| `--sq-font-mono` | `'Google Sans Code', 'JetBrains Mono', ui-monospace, monospace` | Used for numeric values, hostnames, kbd pills |

#### Type Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--sq-text-xs` | `11px` | Section titles, labels, badges, legend |
| `--sq-text-sm` | `12px` | Secondary metadata, button text, kbd |
| `--sq-text-md` | `13px` | Body text, nav items, KV rows (base size) |
| `--sq-text-lg` | `15px` | Sidebar brand name |
| `--sq-text-xl` | `18px` | Mid-emphasis values; stat fallback at `≤520px` |
| `--sq-text-2xl` | `clamp(22px, 2.4vw, 28px)` | Stat block primary values |
| `--sq-text-3xl` | `clamp(26px, 3.2vw, 34px)` | Hero metrics, large stat displays |

#### Font Weights & Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--sq-fw-regular` | `400` | Body text, subtle labels |
| `--sq-fw-medium` | `500` | Stat values, button text, active menu items |
| `--sq-fw-semibold` | `600` | Section titles, brand name |
| `--sq-leading-tight` | `1.2` | Large type (`2xl`, `3xl`) |
| `--sq-leading-base` | `1.5` | Body text |

---

### 3.2 Spacing

4px base grid. Nine steps.

| Token | Value |
|-------|-------|
| `--sq-space-1` | `4px` |
| `--sq-space-2` | `8px` |
| `--sq-space-3` | `12px` |
| `--sq-space-4` | `16px` |
| `--sq-space-5` | `20px` |
| `--sq-space-6` | `24px` |
| `--sq-space-7` | `32px` |
| `--sq-space-8` | `40px` |
| `--sq-space-9` | `56px` |

---

### 3.3 Radius

Two tiers only — Synteq UI favors near-flat surfaces.

| Token | Value | Applied To |
|-------|-------|-----------|
| `--sq-radius-micro` | `2px` | Badges, status dots, chart bar caps, avatar, kbd pills |
| `--sq-radius-control` | `5px` | Buttons, inputs, segmented bar, nav items, sidebar toggle |

---

### 3.4 Motion

Single easing curve. Four duration steps.

| Token | Value | Usage |
|-------|-------|-------|
| `--sq-ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | All transitions and animations |
| `--sq-dur-instant` | `120ms` | Hover color/bg swaps, base element transitions |
| `--sq-dur-fast` | `180ms` | Topbar scroll shadow, icon swaps, scrim fade |
| `--sq-dur-normal` | `280ms` | Mount animations, sidebar grid transition, theme switch |
| `--sq-dur-slow` | `420ms` | Gauge fill bar, data-driving transitions |

---

### 3.5 Layout Shell

| Token | Value | Controls |
|-------|-------|---------|
| `--sq-aside-w` | `clamp(204px, 17vw, 240px)` | Legacy sizing token; current dock uses full available width |
| `--sq-topbar-h` | `52px` | Topbar row height; reduces to `48px` at `≤420px` and in short landscape |
| `--sq-bottomnav-h` | `60px` | Sticky bottom dock height; compresses to `52px` in short landscape |
| `--sq-content-max` | `1200px` | Max width of the centred content column (every `.sq-section`) |
| `--sq-nav-item-w` | `80px` | Minimum dock item width — drives the drag/More overflow threshold |
| `--sq-line-h` | `1px` | Standard hairline separator weight |
| `--sq-line-h-strong` | `1px` | Emphasized separator (same physical weight, different color) |

---

### 3.6 Color Tokens

Color tokens are defined in `theme-dark.css` (default) and `theme-light.css`. They are **never** in `tokens.css`.

Switch themes via `data-theme="dark"` or `data-theme="light"` on `<html>`.

#### Surface & Text

| Token | Dark | Light | Role |
|-------|------|-------|------|
| `--sq-canvas` | `#0a0b0b` | `#f4f6f6` | Main app background |
| `--sq-sidebar` | `#070808` | `#ffffff` | Sidebar / nav background |
| `--sq-hover` | `#161919` | `#e8ecec` | Interactive hover / active surface state |
| `--sq-inset` | `#101212` | `#eef1f1` | Inset rows, text inputs, gauge track background |
| `--sq-text` | `#d6dada` | `#2f3434` | Body text, labels |
| `--sq-text-strong` | `#f4f6f6` | `#0d1010` | High-emphasis: values, hostnames, active state |
| `--sq-text-subtle` | `#7a8080` | `#6a7272` | Metadata, units, timestamps, muted labels |
| `--sq-text-on-accent` | `#06120f` | `#ffffff` | Text placed on brand/accent surfaces |
| `--sq-text-on-solid` | `#08110e` | `#08110e` | Ink for **solid** accent/status fills (tip pills, brand button, brand mark, checked controls). Dark in both themes because the fills are light-to-mid tone |

#### Line Separators

| Token | Dark | Light | Role |
|-------|------|-------|------|
| `--sq-line` | `#1c2020` | `#e1e5e5` | Default hairline (section borders, KV rows, sidebar edge) |
| `--sq-line-strong` | `#2b3030` | `#cfd4d4` | Emphasized separator (`.sq-rule--strong`, scrollbar thumb) |
| `--sq-line-accent` | `#1f3a30` | `#b9d9cf` | Brand-tinted separator (accent-edge rules) |

#### Brand & Status

| Token | Dark | Light | Role |
|-------|------|-------|------|
| `--sq-brand` | `#00e599` | `#059669` | Primary accent — active icons, brand button, sparkline |
| `--sq-status-info` | `#38bdf8` | `#0284c7` | Informational / pending / neutral notice |
| `--sq-status-running` | `#34d399` | `#16a34a` | Running / healthy / delta up |
| `--sq-status-warning` | `#fbbf24` | `#d97706` | Degraded / warning |
| `--sq-status-error` | `#f87171` | `#dc2626` | Error / stopped / delta down |

#### Status Ink

| Token | Value | Role |
|-------|-------|------|
| `--sq-status-ink-mix` | `60%` | Share of the status hue blended into `--sq-text-strong` when a status colour is used as **text** on a tinted surface (tonal buttons, badges, tags, log levels). 100% (raw hue) only clears WCAG AA on the dark theme; 60% clears it on both. |

Tonal variant backgrounds stay at `14–16%` of the status colour, so the fill is
never loud enough to compete with the primary/brand button.

#### Telemetry & Chart

| Token | Dark | Light | Role |
|-------|------|-------|------|
| `--sq-tel-in` | `#34d399` | `#16a34a` | Inbound traffic / receive series |
| `--sq-tel-out` | `#fb7185` | `#e11d48` | Outbound traffic / transmit series |
| `--sq-track` | `#1a1d1d` | `#e2e6e6` | Gauge empty track background |
| `--sq-glyph` | `#9aa0a0` | `#5a6363` | Theme-toggle icon color |

---

## 4. File Map

```
synteq-ui/
├── css/
│   ├── fonts.css                 — @font-face declarations for self-hosted Google Sans Code
│   ├── tokens.css                — all structural tokens: type, spacing, radius, motion, layout shell
│   ├── theme-dark.css            — dark palette color tokens (default theme)
│   ├── theme-light.css           — light palette color tokens
│   ├── base.css                  — viewport lock, scroll reset, focus ring, element reset, typography utils
│   ├── synteq-ui.css             — master @import bundle (single <link> for consumers)
│   └── components/
│       ├── icons.css             — inline SVG icon sizing (.sq-icon, 12–20px) and tint modifiers
│       ├── shell.css             — viewport-locked grid (.sq-app), dock collapse, content scroll region
│       ├── sidebar.css           — sticky bottom dock, nav items, brand and account controls
│       ├── topbar.css            — topbar layout, sidebar toggle, breadcrumb, search, icon buttons, loading line
│       ├── content.css           — section separators, section head, layout grids (.sq-grid), stat strip
│       ├── data.css              — stat blocks, KV rows, slim gauges, sparklines, bar chart, legend, status dots
│       ├── controls.css          — buttons (all variants incl. info/warn), segmented bar, badges, kbd pill, avatar
│       ├── forms.css             — field wrapper, inputs, textarea, select, checkbox, radio, switch, range
│       ├── overlays.css          — tabs, accordion, menu, popover, dialog (centred), command palette, toast
│       ├── feedback.css          — alert, progress, spinner, breadcrumb, empty state, skeleton, tag
│       ├── tables.css            — toolbar, sortable headers, row selection, pagination, sticky head
│       ├── charts.css            — line/area chart, stacked bars, hover tooltip, chart legend
│       ├── tree.css              — expand/collapse hierarchy (three levels)
│       ├── stepper.css           — vertical progress indicator / timeline
│       ├── code.css              — syntax-free code surface with gutter and copy button
│       ├── framework.css         — density control, forced-colors, touch targets
│       └── motion.css            — button ripple, fade-up animation, stagger children, soft pulse, hover lift
├── js/
│   └── synteq-ui.js              — zero-dependency runtime: theme, dock, scroll-spy, toast, command palette,
│                                   tables, tree, stepper, code blocks, data helpers
├── fonts/
│   ├── GoogleSansCode-Regular.ttf    — weight 400 (SIL OFL)
│   ├── GoogleSansCode-Medium.ttf     — weight 500 (SIL OFL)
│   └── GoogleSansCode-SemiBold.ttf   — weight 600 (SIL OFL)
└── examples/
    ├── dashboard.html            — full demo: VPS detail dashboard
    └── components.html           — component explorer (single source of truth for every component)
```

---

## 5. Component Anatomy

### 5.1 App Shell

The shell is a CSS Grid that locks to the viewport. It never allows body scroll.

```
.sq-app
├── .sq-aside          ← grid-area: aside
├── .sq-topbar         ← grid-area: topbar
└── .sq-main           ← grid-area: main
    └── .sq-content    ← the only scrollable surface
```

| Class | Purpose |
|-------|---------|
| `.sq-app` | Root grid container. `height: 100dvh; overflow: hidden`. Dock and content occupy dedicated grid rows. |
| `.sq-app.nav-collapsed` | Sets dock row to zero and slides navigation away with a CSS grid transition. |
| `.sq-aside` | Sticky bottom dock. `min-width: 0`, `overflow: visible` so the More drop-up can escape upward. |
| `.sq-topbar` | Header row. Hairline `border-bottom`. Gains `.is-scrolled` box-shadow when content scrolls past 4px. |
| `.sq-main` | Remaining canvas. `overflow: hidden`, `display: flex`. Never scrolls itself. |
| `.sq-content` | **The only default vertical scroll region**. Padded, flex column with `gap: --sq-space-7` between sections. |

---

### 5.2 Sidebar Nav

| Class | Purpose |
|-------|---------|
| `.sq-aside__brand` | Top bar — aligns to topbar height. Contains brand mark and product name. |
| `.sq-aside__brand-mark` | 20×20 brand icon square (brand color background, `--sq-radius-micro`). |
| `.sq-nav` | Horizontal dock navigation. `flex: 1`, safe-centred while items fit, drag-scrollable / wheel-scrollable once they overflow. |
| `.sq-nav__group-label` | **Not rendered in the dock** (`display: none`). Use icon + label items only. |
| `.sq-nav__item` | Navigation link. `min-width: var(--sq-nav-item-w)`, min height 44px. `border-radius: --sq-radius-control`. |
| `.sq-nav__item--active` | Active page state. Colour-only treatment: `--sq-brand` text and icon, `--sq-fw-semibold`, no pill, underline or inset bar. |
| `.sq-nav__badge` | Absolute counter badge in the item's top-right corner, tabular nums, `--sq-text-subtle`. |
| `.sq-nav__more` | Injected by the runtime when items overflow. Opens the drop-up. Hidden (and removed from the tab order) otherwise. |
| `.sq-nav__menu` | Drop-up panel anchored above the dock, listing every off-screen destination. `.sq-nav__menu-item` mirrors the item styling. |
| `.sq-aside__footer` | Trailing user row. `border-left: 1px solid --sq-line`. Contains `.sq-avatar`, username, status dot. |

---

### 5.3 Topbar

| Class | Purpose |
|-------|---------|
| `.sq-sidebar-toggle` | **The one and only sidebar toggle button** — lives in `.sq-topbar`. Wire with `data-sq-sidebar-toggle`. Contains `.icon-menu` and `.icon-close` (CSS swaps them). |
| `.sq-topbar__left` | Left cluster: toggle + breadcrumb + page title. `flex: 1`, `min-width: 0`. |
| `.sq-topbar__crumb` | Breadcrumb link. `--sq-text-sm`, `--sq-text-subtle`. Hidden at `≤380px`. |
| `.sq-topbar__sep` | Breadcrumb separator glyph (e.g. `/`). `opacity: 0.35`. Hidden at `≤380px`. |
| `.sq-topbar__title` | Current page name. `--sq-text-md`, `--sq-fw-medium`, `--sq-text-strong`. Ellipsis overflow. |
| `.sq-topbar__right` | Right cluster: search trigger, icon buttons. `flex-shrink: 0`. |
| `.sq-search` | Command palette / search trigger button. `--sq-inset` background, `--sq-radius-control`, `height: 32px`. |
| `.sq-iconbtn` | Generic icon-only button (32×32). `--sq-radius-control`. **Always requires `aria-label`**. |
| `.sq-theme-toggle` | Theme toggle variant of `.sq-iconbtn`. Wire with `data-sq-toggle-theme`. CSS swaps `.sq-icon--sun` and `.sq-icon--moon` by `data-theme` attribute. |

---

### 5.4 Sections & Separators

The **only** structural separator in Synteq UI is the `border-top` on `.sq-section`.

| Class | Purpose |
|-------|---------|
| `.sq-section` | Content block. `border-top: 1px solid --sq-line`. `padding-top: --sq-space-6`. |
| `.sq-section:first-child` | Removes `border-top` and `padding-top` — no separator before the first block. |
| `.sq-section__head` | Flex row: section title (left) + meta/action (right). **No `border-bottom`** — intentional. |
| `.sq-section__title` | Label text. `--sq-text-xs`, `--sq-fw-semibold`, uppercase, `--sq-text-subtle`. |
| `.sq-section__meta` | Trailing info (e.g. "updated 5s ago"). `--sq-text-xs`, `--sq-text-subtle`, tabular nums. |
| `.sq-rule` | Explicit opt-in `<hr>` separator. Not auto-applied anywhere. |
| `.sq-rule--strong` | `.sq-rule` with `--sq-line-strong` color. |
| `.sq-rule--dashed` | `.sq-rule` with `border-top-style: dashed`. |

Layout helpers inside sections:

| Class | Columns |
|-------|---------|
| `.sq-grid` | Base grid with `gap: --sq-space-5` |
| `.sq-grid--2` | `repeat(2, 1fr)` → collapses to `1fr` at `≤720px` |
| `.sq-grid--3` | `repeat(3, 1fr)` → collapses to `1fr` at `≤720px` |
| `.sq-grid--auto` | `1.4fr 1fr` (content + sidebar panel) → collapses at `≤720px` |
| `.sq-stat-strip` | Flex-wrap row of stat blocks. Gap only — no vertical dividers. |

---

### 5.5 Data Visualization

All data components are text-first. No canvas, no third-party charting library.

#### Stat Block

| Class | Purpose |
|-------|---------|
| `.sq-stat` | Flex column wrapper. `gap: --sq-space-1`. |
| `.sq-stat__label` | Metric name. `--sq-text-xs`, uppercase, `--sq-text-subtle`. |
| `.sq-stat__value` | Primary number. `--sq-text-2xl`, `--sq-fw-medium`, `--sq-text-strong`, tabular nums. |
| `.sq-unit` | Unit suffix inside `.sq-stat__value`. `--sq-text-md`, `--sq-text-subtle`, `--sq-fw-regular`. |
| `.sq-stat__delta` | Change indicator. `.sq-stat__delta--up` → green. `.sq-stat__delta--down` → red. |

#### Key-Value Rows

| Class | Purpose |
|-------|---------|
| `.sq-kv` | Flex column container. No outer border. |
| `.sq-kv__row` | One property row. `border-top: 1px solid --sq-line`. First child gets no border. |
| `.sq-kv__label` | Property name. `--sq-text-subtle`. |
| `.sq-kv__value` | Property value. `--sq-text-strong`, tabular nums, right-aligned. |

#### Slim Gauge

| Class | Purpose |
|-------|---------|
| `.sq-gauge` | Flex column container. Pair with `data-sq-gauge="0–100"` for auto-init. Add `role="progressbar"` with ARIA attrs. |
| `.sq-gauge__track` | `6px` tall track bar. Background: `--sq-track`. `overflow: hidden`. |
| `.sq-gauge__fill` | Absolute fill bar. Width driven by JS (`SynteqUI.renderGauge`). Transitions via `--sq-dur-slow`. |
| `.sq-gauge__fill--ok` | Green fill (`< 75%`, auto-applied by JS). |
| `.sq-gauge__fill--warn` | Amber fill (`75–89%`). |
| `.sq-gauge__fill--err` | Red fill (`≥ 90%`). |
| `.sq-gauge__fill--brand` | Brand-color fill — request it explicitly: `renderGauge(fill, 100, { kind: 'brand' })`. |
| `.sq-gauge__fill` + `{ kind: 'neutral' }` | No state colour (inherits `--sq-text-strong`). |

#### Bar Chart

| Class | Purpose |
|-------|---------|
| `.sq-bars` | Grid container. Column count driven by `--sq-bars-cols` CSS var. Height 72px. |
| `.sq-bars__col` | One time-sample column. `flex-direction: column-reverse`, top radius, clipped so both series touch seamlessly. |
| `.sq-bars__seg` | One data segment within a column. No radius of its own, so series join without a seam. |
| `.sq-bars__seg--in` | Inbound segment. Color: `--sq-tel-in`. |
| `.sq-bars__seg--out` | Outbound segment. Color: `--sq-tel-out`, `opacity: 0.55` (full on hover). |
| `.sq-bars__col--pad` | Empty leading column injected by `renderBars({ minCols })`; holds the geometry, carries no data. |
| `.sq-bars[data-sq-bars-empty]` | Set when the series is empty (styled at 35 % opacity) so the caller can show a hint. |

#### Sparkline

| Class | Purpose |
|-------|---------|
| `.sq-spark` | SVG element wrapper. `display: block`, `height: 40px`. |
| `.sq-spark__line` | `<polyline>` path. `stroke: --sq-brand`, `stroke-width: 1.5`. |
| `.sq-spark__area` | `<polygon>` fill. `fill: --sq-brand`, `opacity: 0.12`. |
| `.sq-spark__dot` | `<circle>` at latest data point. |
| `.sq-spark--tall` | `--sq-spark-h: 56px` (default 40px). Override the height on any instance with `style="--sq-spark-h:64px"`. |
| `.sq-spark[data-sq-spark-empty]` | Set by `renderSparkline()` when fewer than 2 samples exist; the path is cleared so stale data never lingers. |
| `.sq-spark--out` | Modifier: switches all colors to `--sq-tel-out` palette. |

#### Status Dot

| Class | Colour | Use for |
|---|---|---|
| `.sq-dot` | `--sq-status-running` (default) | online / healthy |
| `.sq-dot--ok` | `--sq-status-running` | explicit healthy alias |
| `.sq-dot--warn` | `--sq-status-warning` | degraded, syncing |
| `.sq-dot--err` | `--sq-status-error` | down, failing |
| `.sq-dot--idle` | `--sq-text-subtle` | unknown, connecting |
| `.sq-dot--stopped` | `--sq-status-error` | legacy alias for `--err` |
| `.sq-dot--reboot` | `--sq-status-warning` + pulse | restarting |

**One signal per state - dot + text OR badge + text, never both.** A state is
rendered either as a dot with a label (`.sq-status` = `.sq-dot*` + text) or as a
coloured badge with the label (`.sq-badge--ok|warn|err`). Do not nest a `.sq-dot`
inside a `.sq-badge`: the dot and the badge tint say the same thing twice and the
5 px dot reads as a stray pixel. Existing markup that did this still renders
(`.sq-badge .sq-dot` shrinks to 5 px), but it is deprecated.

#### Data Table

| Class | Purpose |
|---|---|
| `.sq-table-wrap` | Horizontal scroll wrapper with a thin scrollbar. Use it whenever rows can exceed the content width. |
| `.sq-table` | `border-collapse`, `--sq-text-sm`, tabular numbers. `th` = uppercase micro label with a bottom hairline; `td` = hairline top border; rows hover with `--sq-hover`. |
| `.sq-table__num` | Right-aligned mono cell (counts, epochs, byte values). |
| `.sq-table__mono` | Mono cell, default alignment (addresses, hashes). |
| `.sq-table__mute` | Quiet metadata cell. |
| `.sq-table tr.is-stale` / `td.is-stale` | Dim a cached/stale row without hiding it. |
| `.sq-table--fixed` | `table-layout: fixed` for equal-width columns. |

Tables are text-first: no zebra striping, no header background, no outer border —
only the hairlines the framework already uses.

#### Log Viewer

| Class | Purpose |
|---|---|
| `.sq-log` | Flex column, mono 11 px / 1.55. |
| `.sq-log--scroll` | `max-height: var(--sq-log-h, 420px)`, thin scrollbar, `overscroll-behavior: contain`. |
| `.sq-log--bordered` | Hairline top and bottom separators. |
| `.sq-log__row` | One line: timestamp · level · component · message, with a 2 px transparent left rail. |
| `.sq-log__row--warn` / `--error` | Amber / red left rail; the error row also tints the background. |
| `.sq-log__ts` | Mono timestamp, `--sq-text-subtle`, tabular nums. |
| `.sq-log__level` + `--warn` / `--error` / `--fatal` | Fixed-width level label; colour follows severity. |
| `.sq-log__comp` | Brand-coloured component tag, truncated with ellipsis. |
| `.sq-log__msg` | Message body, `overflow-wrap: anywhere` so long frames never overflow. |
| `.sq-log__empty` | Centered "waiting for stream" placeholder (sans-serif, `--sq-text-xs`). |

Responsive: component tag hidden at `≤720px`, timestamp hidden at `≤420px`.

---

### 5.6 Form Controls

Synteq UI restyles native HTML form elements to match the flat-surface model. All controls use `--sq-inset` background, `--sq-radius-control` (or `--sq-radius-micro` for checkboxes), and transparent borders that turn brand-colored on focus.

#### Field Wrapper

| Class | Purpose |
|-------|---------|
| `.sq-field` | Flex column container. `gap: var(--sq-field-gap)`. Groups label + input + hint/error. |
| `.sq-field__label` | Label text. `--sq-text-sm`, `--sq-fw-medium`, `--sq-text-strong`. |
| `.sq-field__label--required` | Adds red asterisk via `::after`. |
| `.sq-field__hint` | Helper text below input. `--sq-text-xs`, `--sq-text-subtle`. Always visible unless field is invalid. |
| `.sq-field__error` | Error message. `--sq-text-xs`, `--sq-status-error`. Hidden by default, shown when `.sq-field--invalid` applied. |
| `.sq-field--invalid` | State class. Shows error, adds red border to input. Wire with `[aria-invalid="true"]` on the input. |

#### Text Inputs

| Class | Element | Notes |
|-------|---------|-------|
| `.sq-input` | `<input type="text|email|password|number|tel|url">` | Height `--sq-input-h` (32px). Transparent border → brand on focus. Red border when `[aria-invalid="true"]`. |
| `.sq-textarea` | `<textarea>` | Min-height 2.5× input height. Vertical resize allowed. Same focus/invalid states as input. |
| `.sq-select` | `<select>` | Native dropdown with custom SVG arrow (data-uri). Arrow color switches per theme. Same states as input. |

#### Checkbox & Radio

| Class | Element | Notes |
|-------|---------|-------|
| `.sq-checkbox` | `<input type="checkbox">` | 16×16 px (20×20 on touch). `appearance: none`, custom checkmark via `::after` when `:checked`. Background → brand when checked. |
| `.sq-checkbox-label` | `<label>` wrapper | Flex row, gap, cursor pointer. Dims when checkbox disabled. |
| `.sq-radio` | `<input type="radio">` | Circular variant. 6×6 px inner dot via `::after` when `:checked`. |
| `.sq-radio-label` | `<label>` wrapper | Same pattern as checkbox-label. |
| `.sq-radio-group` | Container for radio set | Flex column, gap. Add `role="radiogroup"` + `aria-label`. |

#### Switch

| Class | Element | Notes |
|-------|---------|-------|
| `.sq-switch` | `<input type="checkbox">` styled as toggle | 36×20 px track (44×24 on touch). Sliding dot via `::after`, translateX(16px) when checked. Brand bg when checked. Add `role="switch"` + `aria-checked`. |
| `.sq-switch-label` | `<label>` wrapper | Flex row, gap, pointer. |

#### Input Group

| Class | Purpose |
|-------|---------|
| `.sq-input-group` | Flex row wrapper. Single outer border + `--sq-inset` background. Focus-within → brand border. |
| `.sq-input-group .sq-input` | Input inside group. No border, transparent bg, flex:1. |
| `.sq-input-group__affix` | Prefix or suffix text/icon. Hairline separator between segments. First-child gets right border, others get left border. |

#### Range Slider

| Class | Purpose |
|-------|---------|
| `.sq-range` | `<input type="range">`. Track height 6px, `--sq-track` bg, pill radius. Custom thumb: 16×16 circle, `--sq-brand`, hover scale 1.15×. Vendor prefixes for `::-webkit-slider-thumb` and `::-moz-range-thumb`. |
| `.sq-range-label` | Wrapper with label + value display above slider. |
| `.sq-range-label__head` | Flex row, space-between. Label left, value right. |
| `.sq-range-label__value` | Tabular nums, `--sq-text-strong`, medium weight. |

**States (all controls):**
- `:disabled` → 40-50% opacity, `cursor: not-allowed`
- `:focus-visible` → **one** indicator only:
  - text input / textarea / select → `2px solid var(--sq-brand)` outline, `outline-offset: 1px`; the 1px field border stays transparent
  - checkbox / radio / switch → `2px solid var(--sq-brand)` outline, `outline-offset: 2px` (the border keeps carrying checked / invalid state)
  - input group → the group border turns brand via `:focus-within`; the inner input draws no ring
- `[aria-invalid="true"]` → `--sq-status-error` border; when focused, the ring turns error-red instead of adding a second red border
- `[readonly]` → dimmed, no interaction

**Touch targets:** `@media (pointer: coarse)` increases checkbox/radio to 20×20, switch to 44×24 to meet WCAG 2.2 AA minimum (44×44 effective tap area with label).

---

### 5.7 Buttons

#### Buttons

| Class | Appearance |
|-------|-----------|
| `.sq-btn` | Base: `--sq-inset` background, `--sq-text`, `height: 32px`, `--sq-radius-control`. |
| `.sq-btn--ghost` | Transparent background, `--sq-text-subtle`. |
| `.sq-btn--primary` | `--sq-text-strong` background, inverted text. High-emphasis action. |
| `.sq-btn--brand` | `--sq-brand` background, `--sq-text-on-solid` ink. |
| `.sq-btn--info` | Tonal blue background (`16%`), status-ink label. Informational action. |
| `.sq-btn--warn` (alias `.sq-btn--warning`) | Tonal amber background (`16%`), status-ink label. "Proceed with care". |
| `.sq-btn--danger` | Tonal red background (`16%`), status-ink label. Destructive action. |
| `.sq-btn--icon` | Square variant: `width: 32px`, `padding: 0`. **Requires `aria-label`**. |
| `.sq-btn--block` | `width: 100%`. Use inside `.sq-btn__stack` for a vertical action group. |
| `.sq-copy--ok` | Clipboard confirmation state added by the runtime for 1.8 s (green tint). |
| `.sq-tip` | Transient anchored label (`SynteqUI.tip(el, msg)`): inverted surface, `--sq-radius-micro`, `--sq-text-xs`, `pointer-events: none`, `z-index: 60`. |
| `.sq-tip--info` / `--ok` / `--warn` / `--err` | Tinted variants of the tip (solid status fill + `--sq-text-on-solid` ink). |
| `.sq-tip.is-out` | Fade-out state applied before the runtime removes the node. |

#### Segmented Bar

| Class | Purpose |
|-------|---------|
| `.sq-seg` | Flex container. `--sq-inset` background, `--sq-radius-control`. Add `role="group"` + `aria-label`. |
| `.sq-seg__btn` | One segment. Hairline right border between siblings. |
| `.sq-seg__btn--active` | Active segment. `--sq-hover` background, `--sq-fw-medium`. |
| `.sq-seg__btn--icon` | Icon-only segment variant: narrower padding. |

#### Other Controls

| Class | Purpose |
|-------|---------|
| `.sq-input` | Text input. `--sq-inset` background, `--sq-radius-control`, `height: 32px`. |
| `.sq-badge` | Status chip. `--sq-radius-micro`. Modifiers: `--brand`, `--info`, `--ok`, `--warn`, `--err`. |
| `.sq-kbd` | Keyboard shortcut pill. Mono font, `--sq-radius-micro`, `height: 18px`. |
| `.sq-avatar` | User monogram square. `26×26px`, `--sq-radius-micro`, brand tint background. |

---

### 5.8 Animated UI

Ambient animations use `--sq-ease`; spinners use `linear` and indeterminate progress uses a standard cubic curve. Ambient motion is suppressed by `prefers-reduced-motion` in `base.css`; spinners, the header loading line, and indeterminate progress stay animated at a slower rate because they are essential state indicators.

| Class / Attribute | Behavior |
|-------------------|---------|
| `.sq-ripple` | Runtime-injected `currentColor` ripple on pointer/keyboard activation of buttons and copy triggers. Removed on `animationend`. |
| `.sq-topbar__loader` | Two-pixel indeterminate line on the header baseline. Shows when the topbar has `.is-loading` or `aria-busy="true"`. |
| `SynteqUI.setLoading(active, target?)` | Toggles the header loader and `aria-busy`; targets the first `.sq-topbar` by default. |
| `.sq-fade-up` | Single element mount: fade in + `6px` upward drift over `--sq-dur-normal`. |
| `.sq-stagger` | Parent: each child gets `sq-fade-up` with 60ms incremental delays (up to child 6+). |
| `data-sq-stagger` | Triggers `.sq-stagger` via IntersectionObserver when element enters the viewport (JS-managed). |
| `.sq-live` | Soft pulse (opacity `1→0.5→1`) on a `2s` loop. Used for live data indicators. |
| `.sq-skeleton` | Shimmer placeholder for async content. Linear gradient sweep animation. |
| `.sq-row-hover` | Hover lift utility. Transitions `background-color` at `--sq-dur-fast`. |
| `SynteqUI.replayAnimation(el, opts)` | On-demand replay of a mount animation. Uses WAAPI (`preset`: `fade-up` \| `fade` \| `zoom-in`, default 280ms), cancels any running animation first, and honours `opts.force`. |

**Reduced motion and replays.** `base.css` shortens every CSS animation to
`0.001ms` under `prefers-reduced-motion: reduce`. A class-toggle "replay" then
produces no visible effect, which reads as a broken demo. `replayAnimation()`
therefore keeps the *response*: it drops the movement and plays a 120ms
opacity-only cross-fade, because a replay is explicitly requested by the user.
Ambient motion stays suppressed.

---

### 5.9 Icons

Icons are **inline SVG only** — no icon font, no `<img>`. Every icon SVG must use `aria-hidden="true"` (the parent button/label provides the accessible name).

```html
<svg class="sq-icon sq-icon--16" viewBox="0 0 24 24" aria-hidden="true">
  <!-- 24×24 stroke icon path (Lucide-compatible) -->
</svg>
```

#### Size Modifiers

| Class | Size |
|-------|------|
| `.sq-icon--12` | `12 × 12px` |
| `.sq-icon--14` | `14 × 14px` |
| `.sq-icon--16` | `16 × 16px` |
| `.sq-icon--18` | `18 × 18px` |
| `.sq-icon--20` | `20 × 20px` |

#### Tint Modifiers

| Class | Color Token |
|-------|------------|
| `.sq-icon--mute` | `--sq-text-subtle` |
| `.sq-icon--brand` | `--sq-brand` |
| `.sq-icon--ok` | `--sq-status-running` |
| `.sq-icon--warn` | `--sq-status-warning` |
| `.sq-icon--err` | `--sq-status-error` |

All icons inherit `stroke: currentColor` — tint is set by parent element color or a modifier class. `.sq-ico-label` is a flex wrapper for icon + text pairs.

---

### 5.10 Advanced Table

The table module is behaviour, not chrome: `tables.css` adds hairline-separated
toolbar and pagination rails around the existing `.sq-table`, never a frame.

```
.sq-table-toolbar
 ├── .sq-table-toolbar__start → __title + __meta[data-sq-table-count]
 └── .sq-table-toolbar__end   → __filter + actions
.sq-table-wrap
 └── table.sq-table.sq-table--sticky
      ├── thead th[aria-sort] > button.sq-table__sort
      ├── th.sq-table__check > [data-sq-select-all]
      └── tbody tr.is-selected
           └── td.sq-table__check > [data-sq-row-select]
nav.sq-pagination
 ├── .sq-pagination__info
 └── .sq-pagination__pages > button.sq-pagination__btn[aria-current]
```

| Concern | Rule |
|---|---|
| Sorting | Header cells carry `aria-sort`; the caret rotates 180° on `descending`. Only one column is sorted at a time. |
| Selection | `tr.is-selected` tints the row with `color-mix(brand 7%)`; the select-all checkbox uses the native `indeterminate` state. |
| Pagination | Page buttons are windowed to 5 with `…` gaps; the current page uses a brand border, never a filled background. |
| Filtering | Case-insensitive substring match over the row text; an empty result renders one generated row with `.sq-table__empty`. |
| Separation | Toolbar `border-bottom` + pagination `border-top`, both `--sq-line`. No shadows, no tonal fills. |
| Density | `--compact` trims vertical padding, `--dense` also drops the type one step. |

### 5.11 Chart Extensions

Two modules share one frame (`.sq-chart`) and one tooltip (`.sq-chart__tip`).

| Layer | Element | Notes |
|---|---|---|
| Frame | `.sq-chart` → `__head`, `__body`, `__legend` | Column flex; head uses `--sq-text-md` title + `--sq-text-xs` meta |
| Line/area | `svg.sq-chart__svg` | `viewBox` equals the element's pixel box, so 1 unit = 1 px and tick text never scales |
| Grid | `.sq-chart__grid` (lines), `__axis` (value axis), `__tick` (labels) | Grid uses `--sq-line`, axis `--sq-line-strong` |
| Series | `.sq-chart__area`, `__line`, `__dot` + `__s1…s4` | Tints: brand → tel-out → warning → subtle |
| Hover | `.sq-chart__cursor` + `.sq-chart__tip` | Crosshair is a dashed 1px line; the tooltip is `canvas` + `--sq-line-strong` border |
| Stacked | `.sq-chart__cols` → `.sq-chart__col` → `.sq-chart__seg` | `column-reverse` keeps series 1 on the baseline; the grid template comes from `--sq-chart-cols` |

Height is a single variable (`--sq-chart-h`, `168px`; `--sq-chart-h-sm`, `128px`
below 520px) so a chart and a stacked column block line up on the same row.

### 5.12 Tree

```
.sq-tree
 └── .sq-tree__item
      ├── .sq-tree__row  → .sq-tree__toggle | __spacer + __label + __meta
      └── .sq-tree__group (nested .sq-tree__item …)
```

- Indentation comes from nesting; each `.sq-tree__group` owns a `border-left` rail
  (`--sq-line`, `--sq-line-strong` from the second level down) plus
  `margin-left: --sq-space-5`.
- The caret is a 14px chevron rotated 90° while `aria-expanded="true"`; leaf rows
  reuse the same slot with `.sq-tree__spacer` to keep labels aligned.
- Third-level labels drop to `--sq-text-sm` / `--sq-text-subtle`. Three levels is
  the supported maximum; `initTree()` warns beyond that.
- `.sq-tree__meta` is pushed right with `margin-left: auto` and hides below 520px.

### 5.13 Stepper / Timeline

```
.sq-stepper[data-sq-step]
 └── .sq-stepper__item (grid: 24px marker column + body)
      ├── .sq-stepper__marker        → number, check glyph or icon
      ├── ::after                    → connecting rail (hidden on last item)
      └── .sq-stepper__body → __title, __desc, __meta
```

| State | Marker | Rail |
|---|---|---|
| `is-complete` | `--sq-status-running` border + glyph | green (`--sq-status-running`) |
| `is-active` | 2px `--sq-brand` border, `aria-current="step"` | `--sq-line` |
| `is-pending` | dashed `--sq-line-strong` border | `--sq-line` |
| `is-error` | `--sq-status-error` border | neutral |

`.sq-stepper--horizontal` turns the items into equal-width columns with a
horizontal rail between markers, and folds back to the vertical layout below
720px — the rail is repositioned, not duplicated.

### 5.14 Code Block

```
.sq-code[data-sq-code]
 ├── .sq-code__head → __title + __actions > button.sq-code__copy
 └── .sq-code__body
      ├── .sq-code__lines   (generated, aria-hidden)
      └── pre.sq-code__pre > code
```

- Gutter and code share `font-family`, `font-size` and `line-height`
  (`--sq-code-leading`, default `1.65`), which is what keeps numbers aligned.
  Both use the same vertical padding.
- `white-space: pre` on the `<pre>` guarantees one text line per number; the
  block scrolls horizontally instead of wrapping.
- The gutter sits on `--sq-inset` with a trailing hairline and is hidden below
  520px, where width is more valuable than numbering.
- `.sq-code--plain` swaps the surface to `--sq-canvas`; `.sq-code--scroll` bounds
  the height through `--sq-code-h` (default `320px`).

---

## 6. Responsive Breakpoints

| Breakpoint | What changes |
|------------|-------------|
| `> 1080px` | Full-width content column (centred, max `--sq-content-max`) with the sticky bottom dock; all destinations fit. |
| `≤ 1080px` | Dock items narrow to `78px`; overflow activates drag-scroll + the `More` drop-up. |
| `≤ 860px` | Compact brand/account affordances, 72px nav items, 44px+ touch targets, wider drop-up trigger. |
| `≤ 720px` | `.sq-grid--2`, `.sq-grid--3` collapse to a single column; `.sq-grid--auto` already collapsed at `900px`; **`.sq-stat-strip` becomes a 2-column grid** (values wrap instead of overflowing); explorer previews tighten. |
| `≤ 600px` | Topbar search text (`.sq-search__text`) and `.sq-kbd` pill are hidden — search becomes icon-only. Topbar padding reduces. |
| `≤ 520px` | `.sq-stat__value` reduces to `--sq-text-xl`. `.sq-stat-strip` gap tightens. Dock brand/items compress (48px brand, 64px items). |
| `≤ 420px` | `--sq-topbar-h` reduces to `48px`. Content padding and section gap compress. |
| `≤ 380px` | Topbar breadcrumb (`.sq-topbar__crumb`) and separator (`.sq-topbar__sep`) are hidden; dock brand 42px, items 58px. |
| `height ≤ 480px` + landscape | `--sq-bottomnav-h` compresses to `52px`, dock items become icon+label rows, and sections stop forcing a full-screen height. |

---

## 7. Navigation Dock Toggle Behavior

There is **one toggle button** in the entire UI: `.sq-sidebar-toggle` inside `.sq-topbar`. It controls the bottom dock and updates `aria-expanded`.

Wire it with the attribute `data-sq-sidebar-toggle`. The JS runtime attaches the click handler automatically on `DOMContentLoaded`.

### All Viewports — Hide/Show Mode

- Toggling sets/removes `.nav-collapsed` on `.sq-app` and updates `aria-expanded`.
- The bottom dock row transitions to zero; the dock slides down with opacity transition.
- State is persisted under `sq-sidebar` (`"open"` / `"closed"`) and restored on load.
- Navigation anchors smooth-scroll inside `.sq-content`; scroll-spy keeps `aria-current` and active state synchronized.
- When the dock overflows, the strip is drag-scrollable and a `More` drop-up lists off-screen destinations. `Escape` closes the drop-up (it does not hide the dock).

### Icon Swap

The toggle button contains two icon elements:

```html
<button class="sq-sidebar-toggle" data-sq-sidebar-toggle aria-label="Toggle sidebar">
  <svg class="sq-icon sq-icon--18 icon-menu" ...></svg>
  <svg class="sq-icon sq-icon--18 icon-close" ...></svg>
</button>
```

CSS rules swap their `display` based on `.nav-collapsed`. The open state shows the close glyph and the collapsed state shows the menu glyph.

---

## 8. Theme Extension Guide

Synteq UI ships with two themes: dark (default) and light. Both are defined entirely through CSS custom properties (`--sq-*` tokens). You can extend or override these themes without modifying framework files.

### Overriding Theme Tokens

Create a custom stylesheet **after** `synteq-ui.css`:

```html
<link rel="stylesheet" href="css/synteq-ui.css" />
<link rel="stylesheet" href="custom-theme.css" />
```

In `custom-theme.css`, override tokens at the `:root` level or scope them to `[data-theme]`:

```css
/* Override for all themes */
:root {
  --sq-brand: #3b82f6;       /* Change brand color globally */
  --sq-radius-control: 8px;  /* Increase border radius */
}

/* Dark theme overrides */
[data-theme="dark"] {
  --sq-canvas: #0a0a0a;
  --sq-text-strong: #f5f5f5;
}

/* Light theme overrides */
[data-theme="light"] {
  --sq-brand: #2563eb;
  --sq-canvas: #fafafa;
}
```

### Creating a Third Theme

Add a new `[data-theme="mytheme"]` block:

```css
[data-theme="mytheme"] {
  /* Color tokens */
  --sq-canvas: #1a1a2e;
  --sq-sidebar: #16213e;
  --sq-text-strong: #eef1ff;
  --sq-text: #c5cae9;
  --sq-text-subtle: #9fa8da;
  --sq-text-on-accent: #ffffff;
  --sq-brand: #5c6bc0;
  --sq-line: rgba(255, 255, 255, 0.08);
  --sq-line-strong: rgba(255, 255, 255, 0.14);
  --sq-hover: rgba(255, 255, 255, 0.06);
  --sq-inset: rgba(255, 255, 255, 0.04);
  --sq-track: rgba(255, 255, 255, 0.08);
  
  /* Status colors */
  --sq-status-running: #66bb6a;
  --sq-status-warning: #ffa726;
  --sq-status-error: #ef5350;
  --sq-status-stopped: #78909c;
}
```

Activate via JS:

```js
SynteqUI.setTheme('mytheme');
```

Or set `data-theme="mytheme"` on `<html>` in your markup.

### Extending with New Tokens

Add domain-specific tokens in your custom stylesheet:

```css
:root {
  --app-header-h: 64px;
  --app-sidebar-collapsed: 48px;
  --app-accent-blue: #3b82f6;
}
```

Reference them in component styles:

```css
.app-custom-panel {
  height: var(--app-header-h);
  background: var(--sq-canvas);
  border-left: 3px solid var(--app-accent-blue);
}
```

### Token Groups Reference

Core token groups you can override:

| Group | Example Tokens | Notes |
|-------|---------------|-------|
| **Typography** | `--sq-font-sans`, `--sq-text-md`, `--sq-fw-medium` | Type scale, weights, line heights |
| **Spacing** | `--sq-space-4`, `--sq-space-8` | 4px base grid, 9 steps |
| **Radius** | `--sq-radius-micro`, `--sq-radius-control`, `--sq-radius-pill` | 3 border radius values |
| **Color (Surface)** | `--sq-canvas`, `--sq-sidebar`, `--sq-hover`, `--sq-inset` | Background surfaces |
| **Color (Text)** | `--sq-text-strong`, `--sq-text`, `--sq-text-subtle` | Text hierarchy |
| **Color (Line)** | `--sq-line`, `--sq-line-strong` | Borders and separators |
| **Color (Status)** | `--sq-status-running`, `--sq-status-warning`, `--sq-status-error` | Semantic colors |
| **Motion** | `--sq-dur-instant`, `--sq-dur-fast`, `--sq-ease` | Timing and easing |

### Forced Colors Mode (High Contrast)

The framework includes automatic support for Windows High Contrast Mode via `@media (forced-colors: active)`. System colors are applied to interactive elements. No override needed unless you have specific forced-colors requirements.

### Best Practices

1. **Never modify framework files directly.** Use a separate custom stylesheet that loads after `synteq-ui.css`.
2. **Test both themes.** If you override a token, verify it works in dark and light mode.
3. **Maintain contrast ratios.** Keep text-to-background contrast at ≥ 4.5:1 (WCAG AA). Use a contrast checker.
4. **Scope overrides to themes.** Use `[data-theme="dark"]` / `[data-theme="light"]` instead of global `:root` overrides when colors differ between themes.
5. **Document custom tokens.** If you add new tokens, document them in your project's style guide.

---

## 9. Dos and Don'ts

| | Rule |
|---|------|
| ✅ DO | Use `--sq-*` tokens for every color, size, spacing, and timing value. Never write raw hex, `px`, or `ms` values directly in component styles. |
| ✅ DO | Use `.sq-section` `border-top` as the only separator between content blocks. One rule, one place. |
| ✅ DO | Apply `sq-scroll` and `overflow-y: auto` exclusively on `.sq-content` (or other explicitly designated scroll regions). Never on `body`, `html`, `.sq-main`, or `.sq-app`. |
| ✅ DO | Add `aria-label` to every icon-only button (`.sq-iconbtn`, `.sq-btn--icon`, `.sq-sidebar-toggle`). |
| ✅ DO | Load fonts from `fonts/` only — they are self-hosted. Reference them via `fonts.css` which is already imported by `synteq-ui.css`. |
| ✅ DO | Add `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` on every `.sq-gauge` track element. |
| ✅ DO | Use `data-sq-stagger` on containers whose children should animate in on scroll entry. Let JS handle the IntersectionObserver — do not manually add `.sq-stagger` in HTML. |
| ✅ DO | Set `data-theme` on `<html>` — not on `<body>` or inner elements — to apply theme tokens to the full document. |
| ❌ DO NOT | Add a second sidebar toggle button inside `.sq-aside`. There is exactly one toggle, in the topbar. |
| ❌ DO NOT | Add `border`, `box-shadow`, or a distinct `background-color` to create card-like wrappers around content. Use `.sq-section` separators instead. |
| ❌ DO NOT | Add `border-bottom` to `.sq-section__head`. The separator above the section is sufficient — a second rule directly below the header creates a double-line artifact. |
| ❌ DO NOT | Use external font CDNs (Google Fonts, Bunny Fonts, etc.). The Google Sans Code files are included under SIL OFL in `fonts/`. |
| ❌ DO NOT | Override `--sq-aside-w` to create a wider sidebar — it is already at its maximum (`240px`). If you need more navigation space, rely on the dock overflow behaviour (drag-scroll + More drop-up) instead of adding group labels. |
| ❌ DO NOT | Directly set `body.style.overflow = 'hidden'` in your own JS except through the sidebar API — the base CSS already locks `overflow: hidden` on `html` and `body`. The sidebar runtime does set this transiently on mobile to prevent scroll bleed during drawer-open; do not fight it. |

---

## 10. Accessibility

Synteq UI targets **WCAG 2.2 Level AA**. Full validation requires manual testing with assistive technologies.

### Focus Management

- `:focus-visible` is applied globally in `base.css` with a `2px solid --sq-text-strong` outline and `outline-offset: 2px`.
- `:focus` (mouse click) is suppressed — outline only appears on keyboard navigation.
- Focus `border-radius` matches `--sq-radius-micro` to avoid sharp clipping artifacts.
- **Form controls replace that global ring with their own**, so a field never shows two coloured edges: `2px solid --sq-brand` (offset `1px` for fields/selects, `2px` for checkbox/radio/switch). An input group uses `:focus-within` on the wrapper and its inner input suppresses the ring. Invalid + focused fields turn the ring red instead of stacking a red border under a brand ring.
- Modal centring relies on `margin: auto` on `.sq-dialog`; the reset zeroes the UA value, and `margin: 0` would pin dialogs to the top-left corner.

### Color Contrast

All theme color pairs are verified at ≥ 4.5:1 against their respective backgrounds:

| Pair | Theme | Target Ratio |
|------|-------|-------------|
| `--sq-text` on `--sq-canvas` | Both | ≥ 4.5:1 (AA) |
| `--sq-text-strong` on `--sq-canvas` | Both | ≥ 7:1 (AAA) |
| `--sq-text-subtle` on `--sq-canvas` | Both | ≥ 4.5:1 (dark `#7a8080`, light `#666e6e`) |
| `--sq-brand` on `--sq-canvas` | Dark | ≥ 4.5:1 |
| `--sq-brand` on `--sq-canvas` | Light | ≥ 4.5:1 (tuned to `#059669`) |
| Tonal status labels (button / badge / tag / log level) | Both | ≥ 4.5:1 — resolved through `--sq-status-ink-mix` (`60%`), see §3.6 |
| `--sq-text-on-solid` on status fills (tips) | Both | ≥ 4.68:1 (`--err` uses `--sq-text-on-accent`, 4.83:1 in light) |
| `--sq-text-on-solid` on `--sq-brand` (brand button / mark) | Both | 5.08:1 (light) / 11.55:1 (dark) |

### Interactive Element Roles

- Gauge track elements: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`. The JS `renderGauge()` function updates `aria-valuenow` automatically on each call.
- Bar chart containers: `role="img"`, `aria-label="[chart description]"`.
- Sparkline SVGs: `role="img"`, `aria-label="[metric] trend"`.
- Line/area chart SVGs and stacked-column containers: `role="img"` with an `aria-label` that names the series and the window they cover.
- Sortable table headers: `aria-sort="ascending|descending"` is written by `sortTable()`; only one header carries it at a time.
- Row selection: `aria-label="Select <row name>"` on every `[data-sq-row-select]` checkbox, plus an `aria-label` on the select-all box. Shift-click selects a range and fires `sq:rowselection`.
- Tree toggles: `aria-expanded` is the single source of truth; every toggle needs an `aria-label` ("Collapse us-east-1"). Leaf rows use an `aria-hidden` spacer instead of an inert button.
- Stepper: the current item receives `aria-current="step"`; markers hold a glyph or number and are `aria-hidden` because the title carries the meaning.
- Code block gutter: `.sq-code__lines` is `aria-hidden="true"` so the copy reads as plain text.
- Segmented bars: `role="group"`, `aria-label="[group name]"` on the `.sq-seg` wrapper.
- All icon-only interactive elements (`.sq-iconbtn`, `.sq-btn--icon`, `.sq-sidebar-toggle`): explicit `aria-label`.
- Decorative icons: `aria-hidden="true"` on every `<svg>`.

### Reduced Motion

`base.css` contains a global `@media (prefers-reduced-motion: reduce)` rule that forces:

```css
animation-duration: 0.001ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.001ms !important;
scroll-behavior: auto !important;
```

This applies to all elements, including gauge fills, sparklines, skeleton shimmers, and stagger animations. Essential loading indicators are exempt: `.sq-spinner`, `.sq-progress__fill--indeterminate`, and `.sq-topbar__loader` keep an `infinite` animation at a slower duration, because a frozen loading state communicates a broken interface rather than calm.

The JS runtime also checks `prefersReduced()` before attaching the IntersectionObserver for `.sq-stagger` — if reduced motion is active, the observer is never created and no mount animations fire.

**Exception — explicit replays.** Because that rule also shortens a
*user-requested* replay to `0.001ms` (it looks like the button is broken),
`SynteqUI.replayAnimation()` drives the effect through the Web Animations API and
swaps the movement for a `120ms` opacity-only cross-fade while reduced motion is
active. Ambient motion stays fully suppressed; only an action the user just asked
for still produces a visible response.

### Screen Reader Utilities

`.sq-sr-only` provides a standards-compliant visually-hidden class for supplemental screen-reader text:

```html
<button class="sq-btn sq-btn--icon" aria-label="Copy IP">
  <svg class="sq-icon sq-icon--16" aria-hidden="true">...</svg>
</button>
```

Use `aria-label` on the button directly (preferred) or `.sq-sr-only` text inside it as an alternative.

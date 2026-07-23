---
name: LiftTracker
description: A focused workout logging PWA for intermediate lifters.
colors:
  ink-blue: "#2563eb"
  ink-blue-hover: "#1d4ed8"
  ink-blue-dark: "#60a5fa"
  ink-blue-faint: "#eff6ff"
  fuchsia-signal: "#d946ef"
  surface-light: "#ffffff"
  surface-dark: "#1e293b"
  bg-deep: "#0f172a"
  text-primary: "#111827"
  text-on-dark: "#f1f5f9"
  text-muted: "#6b7280"
  border: "#e5e7eb"
  border-dark: "#475569"
  gradient-from: "#667eea"
  gradient-to: "#764ba2"
  gradient-from-dark: "#1e293b"
  gradient-to-dark: "#0f172a"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.ink-blue}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.ink-blue-hover}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  input-field:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

# Design System: LiftTracker

## 1. Overview

**Creative North Star: "The Iron Ledger"**

LiftTracker is a tool, not a product. Every interface decision serves one purpose: let a lifter log their sets with minimum friction, then get out of the way. The visual language takes cues from high-density professional tools — Linear, Raycast — where the data is the hero and decoration is a cost.

The system is anchored by a confident ink-blue as the single authoritative action color. Typography is the native system font stack: crisp, immediately legible, no network request. Cards sit on a neutral periwinkle-to-slate gradient that acts as a physical surface — the app is always elevated above it. Layout density is calibrated for a sweaty thumb between sets: large tap targets, clear hierarchy, no visual noise. Uppercase tracked labels give the interface the feel of a physical log entry — precise, professional, built for practitioners.

This system explicitly rejects the Garmin/TrainingPeaks aesthetic (nested menus, redundant charts, overwhelming options density), the neon bodybuilder look (aggressive gradients, chrome accents, spectacle over function), and the Strava social model (achievements, feeds, and community scaffolding as primary UI).

**Key Characteristics:**
- System typography — no loading fonts, no flash of unstyled content
- Ink-blue is the single authoritative action color; fuchsia appears only for personal records
- Uppercase tracked bold labels — field entries in a log book
- Cards lift off the gradient surface via soft shadows at rest, amplified on interaction
- 44px minimum touch targets throughout; designed for one-handed use between heavy sets

## 2. Colors: The Ledger Palette

A restrained two-role palette. Ink-blue carries all actions; fuchsia is a rare signal for achievement.

### Primary
- **Ink Blue** (`#2563eb`): All primary actions — buttons, active navigation indicators, links, focus rings. The single authoritative action color in light mode.
- **Ink Blue Hover** (`#1d4ed8`): Pressed and hover state for primary actions.
- **Ink Blue (dark mode)** (`#60a5fa`): Primary actions in dark mode. Lightened to maintain contrast on dark surfaces.
- **Ink Blue Faint** (`#eff6ff`): Subtle primary background — active nav pill, progressive overload suggestion cards.

### Secondary
- **Fuchsia Signal** (`#d946ef`): Personal record moments, PR badges, achievement markers. Used on fewer than 5% of any given screen. Its rarity is the point; it must feel exceptional when it appears.

### Neutral
- **Surface Light** (`#ffffff`): Card and panel backgrounds in light mode.
- **Surface Dark** (`#1e293b`): Card and panel backgrounds in dark mode (Tailwind `slate-800`).
- **Background Deep** (`#0f172a`): Deepest dark surface — page background under cards in dark mode (Tailwind `slate-900`).
- **Text Primary** (`#111827`): Body and headline text in light mode.
- **Text On Dark** (`#f1f5f9`): Body and headline text in dark mode.
- **Text Muted** (`#6b7280`): Secondary labels, captions, inactive navigation items.
- **Border** (`#e5e7eb`): Strokes and dividers in light mode.
- **Border Dark** (`#475569`): Strokes and dividers in dark mode.
- **Gradient From** (`#667eea`): App surface gradient start — periwinkle.
- **Gradient To** (`#764ba2`): App surface gradient end — grape.
- **Gradient From Dark** (`#1e293b`): Dark mode gradient start.
- **Gradient To Dark** (`#0f172a`): Dark mode gradient end.

### Named Rules
**The One Signal Rule.** Fuchsia is prohibited everywhere except personal record moments. If you're considering fuchsia for a status, a tag, a button, or a highlight — the answer is no. Use ink-blue or a neutral.

**The Gradient Is a Surface, Not a Brand.** The body gradient (`#667eea → #764ba2`) functions as a physical tabletop that cards rest on. It is not a hero background, not a brand color, and must not be extracted for use in components, icons, or text.

## 3. Typography

**Display/Body Font:** System UI stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

No web fonts. The native stack renders at full fidelity instantly, with no layout shift and no dependency on a font CDN. On iOS (the primary platform) this is SF Pro — among the best legible small-scale typefaces in existence.

**Character:** Utilitarian and precise. The type system creates hierarchy through weight and size contrast alone — no decorative typefaces, no editorial mixing. Labels are UPPERCASE TRACKED to read as physical form fields.

### Hierarchy
- **Display** (700 weight, 1.5rem / 24px, -0.01em tracking): Page titles, program names, workout names. Used once per screen.
- **Headline** (600 weight, 1.125rem / 18px): Section headings, exercise names within the workout runner.
- **Body** (400 weight, 0.875rem / 14px, 1.5 line-height): Set records, notes, descriptive text. The workhorse of the interface.
- **Label** (700 weight, 0.75rem / 12px, 0.05em tracking, UPPERCASE): Form field labels, stat captions, section separators. Always uppercase. Never body-copy length.

### Named Rules
**The System Font Rule.** No web fonts, ever. Loading a font file during a gym session on 4G is prohibited. If a design requires a custom typeface to work, it's the wrong design.

**The All-Caps Label Rule.** Section labels and field labels are always uppercase with `letter-spacing: 0.05em`. Sentence-case labels soften the log-book precision that defines the aesthetic.

## 4. Elevation

The aspiration is flat-by-default: surfaces are flat at rest, shadows appear only as a response to state. In practice, the `.card` class carries a soft ambient shadow at rest (`shadow-soft`) so cards remain distinct from the gradient body — a compromise required by the gradient surface. Hover and active states amplify the shadow to signal interactivity.

Dark mode uses tonal elevation (slate-800 over slate-900) rather than shadows, which wash out on dark surfaces.

### Shadow Vocabulary
- **Ambient** (`0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)`): Cards at rest. Soft, diffuse, barely visible. Provides ground-plane separation from the gradient surface.
- **Lifted** (`0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)`): Cards on hover. Amplified; signals interactivity.
- **Primary Button** (`0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)`): Primary CTA buttons at rest.
- **Glow** (`0 0 20px rgba(59,130,246,0.5)`): Focus ring supplement for interactive elements that need extra emphasis. Used sparingly.

### Named Rules
**The Flat-by-Default Rule.** No element that is not a floating card or a CTA button should carry a shadow at rest. Shadows are a state response, not a style choice.

## 5. Components

### Buttons

Buttons feel confident and slightly weighted — they lift on interaction via a `translateY(-2px)` shift.

- **Shape:** Generously rounded (12px radius — `rounded-xl`)
- **Primary:** Ink-blue background (`#2563eb`), white text, 12px 24px padding, 600 weight. Carries a subtle shadow to signal primacy.
- **Hover:** Ink-blue-hover (`#1d4ed8`), shadow amplified, lifts 2px upward.
- **Secondary:** White background, ink-blue text, 2px ink-blue-light border. Matches primary sizing.
- **Ghost:** Transparent background, ink-blue text. Used for destructive or low-priority actions.
- **Dark mode:** Primary uses `#2563eb` base; secondary uses `slate-700` background, `#93c5fd` text, `#475569` border.

### Cards

Cards are the primary content container — they are log pages.

- **Corner Style:** 16px radius (`rounded-2xl`) — generous rounding that reads as tactile
- **Background:** `#ffffff` light / `#1e293b` dark
- **Shadow Strategy:** Ambient shadow at rest (see Elevation); lifts on hover
- **Border:** None — shadow provides ground-plane separation
- **Internal Padding:** 20px (`p-5`)

**The One-Level Rule.** Cards do not nest inside other cards. If content inside a card needs containment, use a section divider, a muted background (`bg-gray-50`), or a border-top — not another card.

### Inputs / Fields

Form inputs across the workout runner (weight, reps, RPE fields).

- **Style:** 2px solid border (`#e5e7eb` light / `#475569` dark), white/dark background, 12px radius
- **Focus:** Border goes transparent; replaced by a 2px ink-blue ring (`box-shadow: 0 0 0 2px #3b82f6`). No outline. In dark mode, ring uses `#60a5fa`.
- **Label:** Always uppercase, 12px, 700 weight, tracked — the All-Caps Label Rule applies
- **Number Inputs:** Numeric keyboard optimized. `type="number"` with explicit `step` for weight (0.5kg or 2.5lb increments).
- **Disabled:** Reduced opacity; `cursor: not-allowed`

### Navigation

Bottom tab bar — the primary navigation surface, designed for thumb reach.

- **Style:** White/slate-800 background at 95% opacity with `backdrop-blur-lg`. Top border (0.5 opacity) creates separation from content. `shadow-2xl`.
- **Height:** 64px (`h-16`) — generous for gym conditions
- **Active state:** Ink-blue icon and label (`font-bold`), `bg-primary-50` pill behind icon, 4px ink-blue indicator bar at top of tab (rounded-bottom)
- **Inactive state:** `text-gray-500` / `text-gray-400`, `font-medium`, `stroke-1.5` icon weight
- **Label:** 12px, sentence-case (exception to the All-Caps Label Rule — tab labels are navigation, not field labels)
- **Icons:** Lucide React, 24×24px, `stroke-2` when active / `stroke-1.5` when inactive

### Set Logger (Signature Component)

The set logging panel is the most-used surface in the app. Three numeric inputs side by side (Weight / Reps / RPE), with a progressive overload hint below.

- **Layout:** 3-column grid, 12px gap, inside a card
- **Hint Card:** When a suggestion is available — `bg-blue-50` background, `border border-blue-200`, 12px radius, Lightbulb icon in `text-blue-600`. A small "Apply" pill button in ink-blue.
- **The hint must feel like a nudge, not a nag.** It appears below the inputs, never interrupting them. If no suggestion, the space collapses — no empty placeholder.

## 6. Do's and Don'ts

### Do:
- **Do** use ink-blue (`#2563eb`) for every primary interactive element — buttons, links, focus rings, active states. One action color. One.
- **Do** use uppercase tracked labels (0.05em) for every form field label and stat caption. It signals precision.
- **Do** size tap targets to a minimum of 44×44px. Users are between heavy sets; their hands are not steady.
- **Do** use `backdrop-blur-lg` on the navigation bar. It is the one place in the UI where blur is structural, not decorative.
- **Do** use `translateY(-2px)` on button hover/active — the physical lift signal is intentional and should be consistent.
- **Do** apply dark mode equivalents for every component via `dark:` prefixes. Dark mode is a primary use case (dim gym lighting).
- **Do** collapse empty states gracefully. If there is no suggestion, no previous workout, no data — remove the space rather than showing a placeholder.

### Don't:
- **Don't** use fuchsia (`#d946ef`) anywhere except personal record moments. Not for tags, not for highlights, not for status indicators.
- **Don't** nest cards inside cards. "The One-Level Rule" is absolute.
- **Don't** add a `border-left` stripe greater than 1px as a colored accent on any card, callout, or list item. Use a full border, background tint, or nothing.
- **Don't** use gradient text (`background-clip: text`). All text is a solid color.
- **Don't** use glassmorphism (blurred semi-transparent cards) as a decorative pattern. The nav bar blur is structural and the only permitted instance.
- **Don't** replicate Garmin Connect density: nested sub-menus, redundant chart-over-chart stacking, or settings panels with more than 6 options visible at once.
- **Don't** add social or community scaffolding to any surface — no share buttons, no "compare with friends" patterns, no achievement feed. This is a private log.
- **Don't** use a neon-on-dark color scheme: no `#00ff00`, no electric purple, no chrome gradients. The dark mode palette is slate-navy, not a gaming aesthetic.
- **Don't** add decorative motion (bouncing, elastic, or continuous pulse animations). Feedback animations only: `fadeIn` (0.5s), `slideUp` / `slideDown` (0.3s ease-out) for panel entrances. State transitions: 0.2s ease.

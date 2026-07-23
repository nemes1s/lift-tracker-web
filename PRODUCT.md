# Product

## Register

product

## Users

Intermediate lifters, phone in hand between sets in the gym. They know their lifts, follow structured programs, and open the app 3–5 times per week during active sessions. Context: loud environment, one free hand, limited attention. The job to be done is quick, accurate set logging — not exploration or discovery.

## Product Purpose

A PWA for tracking weightlifting workouts offline-first. Users follow multi-week periodized programs; the app selects the right exercises for the current week, tracks progressive overload across sessions, and stores everything locally with no backend dependency. Success looks like: user opens app → taps through sets → closes app in under 30 seconds per exercise.

## Brand Personality

Focused, precise, unobtrusive. References: Linear (information density without clutter), Raycast (fast, keyboard/tap-driven, zero decoration). The app should feel like a sharp tool, not a motivational poster.

## Anti-references

- **Garmin Connect / TrainingPeaks** — too many nested menus, charts, and options. Overwhelming to navigate mid-workout.
- **Neon-on-black bodybuilder aesthetic** — aggressive gradients, over-designed. Signals the wrong audience.
- **Strava / social fitness apps** — community feeds, sharing, achievements front-and-center. This app is a private log, not a social network.

## Design Principles

1. **Speed over completeness.** The active workout path must be reachable in one tap. Every additional tap during a session is friction.
2. **Trust the user.** Intermediate lifters don't need tooltips explaining "reps." Show numbers and let them act.
3. **Progressive disclosure.** Surface the current session; bury program management, stats, and settings behind navigation.
4. **Offline-first confidence.** No spinners, no "syncing…" states. The UI must feel authoritative about local data.
5. **Precision without decoration.** Charts and data are functional, not decorative. Every visual element earns its place.

## Accessibility & Inclusion

WCAG AA. Large touch targets are essential — users interact with sweaty hands, between heavy sets, often one-handed. Minimum 44×44px tap targets. Adequate color contrast in both light and dark mode (dark mode is a primary use case for dim gyms).

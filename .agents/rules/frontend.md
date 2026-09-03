# Frontend & UI Guidelines for CivicEye

These path-scoped rules apply to all code under `src/`:

## 1. Iconography Standards
- **Vector Icons Only**: Use vector icons exclusively from `lucide-react`.
- **Zero Emojis**: Do not use raw emojis for UI controls, buttons, navigation, status indicators, or system tags.

## 2. Component Design & Structure
- Reusable UI elements belong in `src/components/common/`.
- Page-specific blocks belong in `src/components/<feature>/` or colocated with pages.
- Every interactive element must have accessible semantics (`aria-label`, button types, semantic HTML).

## 3. Data Discipline
- In Phase 1, strictly avoid hardcoded mock incidents or fake API responses.
- Render clean semantic placeholders and informative `EmptyState` cards until live Firebase / Gemini / FastAPI integrations are connected.

---
name: Workout Pages Redesign
overview: Redesign the workout section to match the established design system (Bebas Neue + Outfit fonts, warm color palette, consistent spacing, and refined interactions) while maintaining all existing functionality.
todos:
  - id: phase-1-dashboard
    content: Redesign workout dashboard page and 6 components
    status: completed
  - id: phase-2-create
    content: Update create workflow (page + 3 components)
    status: completed
    dependencies:
      - phase-1-dashboard
  - id: phase-3-active
    content: Update active workout view (page + 5 components)
    status: completed
    dependencies:
      - phase-2-create
  - id: phase-4-completed
    content: Update completed workout summary (page + 2 components)
    status: completed
    dependencies:
      - phase-3-active
---

# Workout Pages Redesign

This plan updates the workout dashboard, create workflow, active workout view, and completed workout summary to align with the design system established in the landing page, navbar, and footer.

## Design Principles to Apply

- **Typography**: Use `font-display` (Bebas Neue) for page headings, Outfit for body text
- **Animation**: Staggered `animate-fade-in-up` on page load
- **Cards**: Refined borders, warmer shadows, consistent padding
- **Buttons**: Match landing page style (no scale on hover, refined transitions)
- **Empty states**: More thoughtful messaging and visual treatment

---

## Phase 1: Workout Dashboard

Update the main workout page and its components.**Files:**

- [`src/app/workout/page.tsx`](src/app/workout/page.tsx) - Add page header with display font, refine layout spacing, use global animation
- [`src/app/workout/_components/stat-card.tsx`](src/app/workout/_components/stat-card.tsx) - Use display font for values, refined card styling
- [`src/app/workout/_components/muscle-group-card.tsx`](src/app/workout/_components/muscle-group-card.tsx) - Better visual hierarchy, refined progress indicators
- [`src/app/workout/_components/create-workout-button.tsx`](src/app/workout/_components/create-workout-button.tsx) - Match landing page button style
- [`src/app/workout/_components/workout-history-card.tsx`](src/app/workout/_components/workout-history-card.tsx) - Refined list items, better hover states
- [`src/app/workout/_components/workout-history-calendar.tsx`](src/app/workout/_components/workout-history-calendar.tsx) - Minor styling refinements
- [`src/app/workout/loading.tsx`](src/app/workout/loading.tsx) - Match new layout structure

---

## Phase 2: Create Workout Flow

Update template selection and AI generation.**Files:**

- [`src/app/workout/create/page.tsx`](src/app/workout/create/page.tsx) - Display font for header, refined tabs, better template list styling
- [`src/app/workout/create/_components/generate-ai-workout-dialog.tsx`](src/app/workout/create/_components/generate-ai-workout-dialog.tsx) - Refined card and dialog styling
- [`src/app/workout/create/_components/segmented-button-group.tsx`](src/app/workout/create/_components/segmented-button-group.tsx) - Improved tab styling
- [`src/app/workout/create/loading.tsx`](src/app/workout/create/loading.tsx) - Match new layout

---

## Phase 3: Active Workout View

Update the workout logging interface.**Files:**

- [`src/app/workout/[...workoutId]/page.tsx`](src/app/workout/[...workoutId]/page.tsx) - Add fade animation
- [`src/app/workout/[...workoutId]/_components/workout-header.tsx`](src/app/workout/[...workoutId]/_components/workout-header.tsx) - Display font for title
- [`src/app/workout/[...workoutId]/_components/exercise-list.tsx`](src/app/workout/[...workoutId]/_components/exercise-list.tsx) - Better visual grouping for exercises
- [`src/app/workout/[...workoutId]/_components/set-row.tsx`](src/app/workout/[...workoutId]/_components/set-row.tsx) - Refined input styling
- [`src/app/workout/[...workoutId]/_components/exercise-button-group.tsx`](src/app/workout/[...workoutId]/_components/exercise-button-group.tsx) - Match button styles
- [`src/app/workout/[...workoutId]/_components/workout-button-group.tsx`](src/app/workout/[...workoutId]/_components/workout-button-group.tsx) - Match button styles, refined dialogs
- [`src/app/workout/[...workoutId]/loading.tsx`](src/app/workout/[...workoutId]/loading.tsx) - Match new layout

---

## Phase 4: Completed Workout Summary

Update the post-workout review screen.**Files:**

- [`src/app/workout/completed/[...workoutId]/page.tsx`](src/app/workout/completed/[...workoutId]/page.tsx) - Add animation, refine layout
- [`src/app/workout/completed/[...workoutId]/_components/rate-workout.tsx`](src/app/workout/completed/[...workoutId]/_components/rate-workout.tsx) - Display font for header, refined sentiment buttons
- [`src/app/workout/completed/[...workoutId]/_components/workout-breakdown.tsx`](src/app/workout/completed/[...workoutId]/_components/workout-breakdown.tsx) - Refined cards, better PR card styling, display font for stats

---

## Summary of Key Changes

| Element | Before | After ||---------|--------|-------|| Page headers | `text-2xl` generic | `font-display text-4xl` uppercase || Stat values | `text-3xl font-bold` | `font-display text-5xl` || Cards | Default styling | Warmer shadows, refined borders || Buttons | Inline animation classes | Global animation, consistent hover |
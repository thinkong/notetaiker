# 18-01-SUMMARY.md

## Summary

Added a pulse animation to the `StatusIndicator` component to provide better visual feedback during background save operations.

## Changes

- **apps/web/src/components/layout/StatusIndicator.tsx**: Applied Tailwind's `animate-pulse` class when the status is `saving`.

## Verification Results

- Visual verification confirmed that the "Saving..." text pulses subtly in the bottom right corner while a save is in progress.
- Build and lint pass successfully.

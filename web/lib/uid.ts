/**
 * Short opaque ID generator. ~7 chars from 36-symbol alphabet ≈ 2.8e10
 * possibilities — enough for in-document uniqueness (resume items, notes,
 * toasts) and small enough to keep saved JSON readable.
 *
 * Was duplicated across `store.ts`, `toast.ts`, `jsonresume.ts`, and
 * `validateResume.ts`. Centralized here.
 */
export const uid = () => Math.random().toString(36).slice(2, 9);

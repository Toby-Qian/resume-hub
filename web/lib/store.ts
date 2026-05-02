"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Resume, SectionKey, emptyResume, ResumeNote } from "./schema";
import { sampleEN, sampleZH } from "./samples";
import { uid } from "./uid";

export type TemplateId =
  | "modern" | "classic" | "minimal"
  | "elegant" | "compact" | "timeline"
  | "cn-formal" | "cn-creative"
  | "en-academic"
  | "academic-classic" | "academic-modern" | "academic-pub"
  | "academic-minimal"
  // New rich templates
  | "infographic" | "magazine" | "dark-card";

export interface ThemeTokens {
  accent: string;          // primary color
  fontSans: string;
  fontSerif: string;
  density: "compact" | "comfy" | "spacious";
  fontScale: number;       // 0.9 ~ 1.15
  /** List bullet style applied to all `<ul>` inside .paper. */
  bulletStyle: "disc" | "none" | "dash" | "square" | "circle";
  /** Hex colour for the bullet marker. When undefined, the marker
   *  inherits the accent colour (back-compat for older saved resumes). */
  bulletColor?: string;
  /** Body line-height (CSS unitless). 1.2 ~ 2.0. */
  lineHeight: number;
  /** Override the section heading divider style globally. `solid` (default)
   *  keeps whatever each template originally rendered. Anything else swaps
   *  in via a `.paper.divider-X` class hook + !important — see globals.css. */
  divider?: "solid" | "dashed" | "dotted" | "double" | "none";
}

export const defaultTheme: ThemeTokens = {
  accent: "#2563eb",
  fontSans: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  fontSerif: "'Source Serif Pro', 'Source Han Serif SC', serif",
  density: "comfy",
  fontScale: 1,
  bulletStyle: "disc",
  lineHeight: 1.55,
};

export type UILang = "zh" | "en";

export type PageSize = "A4" | "Letter";
/** Page margin in millimetres (0–30). Was a string preset in earlier
 *  versions ("none" | "narrow" | "normal" | "wide") — see normalizeMargin. */
export type PageMargin = number;

export interface PageSetup {
  size: PageSize;
  margin: PageMargin;
  showPageNumbers: boolean;
  /** When true, footer carries "Name · email" line on every printed page. */
  showFooter: boolean;
  /** Manually appended blank pages on top of whatever the content needs.
   *  Lets the user reserve a second/third page for free-form floating
   *  elements (text boxes, images, shapes) even when the resume body
   *  doesn't naturally overflow. */
  extraPages: number;
}

export const defaultPageSetup: PageSetup = {
  size: "A4",
  margin: 0,
  showPageNumbers: false,
  showFooter: false,
  extraPages: 0,
};

/** Map legacy string values for `pageSetup.margin` to mm.                    */
export function normalizeMargin(m: any): number {
  if (typeof m === "number") return Math.max(0, Math.min(30, m));
  if (m === "wide") return 20;
  if (m === "normal") return 15;
  if (m === "narrow") return 10;
  return 0; // "none" / unknown
}

const HISTORY_LIMIT = 80;
/** Cap on user-saved named snapshots. Each snapshot holds a full Resume copy
 *  in localStorage — at ~30KB per snapshot, 12 leaves ample headroom under
 *  the typical 5MB quota even with the rest of the persisted state. The
 *  oldest snapshot is dropped silently when the user crosses the cap. */
const SNAPSHOT_LIMIT = 12;

/** A user-named restore point. Stored in localStorage alongside the rest of
 *  the persisted state. Distinct from `past`/`future` undo history: snapshots
 *  survive reloads, can be named, and don't get pushed/popped automatically. */
export interface Snapshot {
  id: string;
  name: string;        // user-supplied; falls back to a timestamp
  createdAt: number;   // Date.now()
  resume: Resume;
}

/** Default order in which sections appear. The store may persist a custom
 *  order — but new section keys added in later versions are appended on top
 *  of whatever the user had, so legacy state never loses a section.        */
export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "work", "education", "projects", "skills",
  "publications", "talks", "teaching",
  "awards", "languages",
];

interface State {
  resume: Resume;
  template: TemplateId;
  theme: ThemeTokens;
  lang: UILang;
  pageSetup: PageSetup;
  setPageSetup: (p: Partial<PageSetup>) => void;
  /** Sections the user has chosen to hide from the rendered resume.
   *  Implemented by zeroing the corresponding array before passing to
   *  the template, so the template's existing `length > 0` guards
   *  hide the section automatically. */
  hiddenSections: SectionKey[];
  toggleSectionVisibility: (k: SectionKey) => void;
  /** User-chosen section order. Templates that opt into the helper
   *  `useOrderedSections()` will render sections in this order; any keys
   *  missing from this array fall back to DEFAULT_SECTION_ORDER. New section
   *  types added in future versions are auto-appended to preserve ordering. */
  sectionOrder: SectionKey[];
  setSectionOrder: (order: SectionKey[]) => void;
  reorderSection: (fromKey: SectionKey, toKey: SectionKey) => void;
  /** When true the preview hides all editing affordances (drag handles,
   *  dashed-underline hover hints on `<E>` fields, drop indicators…) so the
   *  paper looks exactly like the printed PDF. Persisted so the user's
   *  preferred review/edit mode survives reloads. */
  previewMode: boolean;
  togglePreviewMode: () => void;
  past: Resume[];
  future: Resume[];
  /** When true, subsequent mutations do NOT push new history entries.
   *  Use beginBatch()/endBatch() around drag+resize operations so each
   *  continuous gesture counts as a single undo step. */
  _batch: boolean;
  setResume: (r: Resume) => void;
  update: <K extends keyof Resume>(key: K, value: Resume[K]) => void;
  addItem: (section: SectionKey) => void;
  removeItem: (section: SectionKey, id: string) => void;
  duplicateItem: (section: SectionKey, id: string) => void;
  reorderItem: (section: SectionKey, fromId: string, toId: string) => void;
  addNote: () => void;
  addImageNote: (src: string) => void;
  updateNote: (id: string, patch: Partial<ResumeNote>) => void;
  removeNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  reorderNote: (id: string, dir: "front" | "back") => void;
  addShapeNote: (shape: "line" | "rect" | "circle") => void;
  /** Multi-selection model. `selectedNoteId` is the *primary* (last-clicked)
   *  selection — kept around for legacy single-select call sites. The full
   *  set lives in `selectedNoteIds`. */
  selectedNoteId: string | null;
  selectedNoteIds: string[];
  selectNote: (id: string | null) => void;
  selectNotes: (ids: string[]) => void;
  toggleNoteSelection: (id: string) => void;
  alignNotes: (kind: "left" | "right" | "top" | "bottom" | "centerH" | "centerV") => void;
  distributeNotes: (axis: "h" | "v") => void;
  /** Move every selected note by (dx, dy). Used for group drag. */
  nudgeSelection: (dx: number, dy: number) => void;
  setTemplate: (t: TemplateId) => void;
  setTheme: (t: Partial<ThemeTokens>) => void;
  setLang: (l: UILang) => void;
  loadSample: (l: UILang) => void;
  reset: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  beginBatch: () => void;
  endBatch: () => void;
  /** Named restore points the user can save/load. Persisted to localStorage.
   *  See {@link Snapshot} and SNAPSHOT_LIMIT. */
  snapshots: Snapshot[];
  saveSnapshot: (name?: string) => void;
  restoreSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;
  renameSnapshot: (id: string, name: string) => void;
}


const blankItem = (s: SectionKey): any => {
  const id = uid();
  switch (s) {
    case "work": return { id, company: "", position: "", location: "", startDate: "", endDate: "", highlights: [""] };
    case "education": return { id, institution: "", area: "", studyType: "", startDate: "", endDate: "", score: "", courses: [] };
    case "projects": return { id, name: "", description: "", url: "", startDate: "", endDate: "", highlights: [""], keywords: [] };
    case "skills": return { id, name: "", level: "", keywords: [] };
    case "awards": return { id, title: "", date: "", awarder: "", summary: "" };
    case "languages": return { id, language: "", fluency: "" };
    case "publications": return { id, title: "", authors: "", venue: "", date: "", doi: "", url: "", summary: "" };
    case "talks": return { id, title: "", venue: "", date: "", location: "", url: "" };
    case "teaching": return { id, course: "", institution: "", role: "", startDate: "", endDate: "", summary: "" };
  }
};

export const useStore = create<State>()(
  persist(
    (set, get) => {
      /** Mutate resume + auto-record history (unless inside a batch). */
      const mutate = (next: Resume) => {
        const s = get();
        if (s._batch) {
          set({ resume: next });
          return;
        }
        // Skip pointless snapshots when value is referentially equal.
        if (next === s.resume) return;
        const past = s.past.length >= HISTORY_LIMIT
          ? [...s.past.slice(s.past.length - HISTORY_LIMIT + 1), s.resume]
          : [...s.past, s.resume];
        set({ resume: next, past, future: [] });
      };

      return {
        resume: sampleZH,
        template: "cn-formal",
        theme: defaultTheme,
        lang: "zh",
        pageSetup: defaultPageSetup,
        setPageSetup: (p) => set({ pageSetup: { ...get().pageSetup, ...p } }),
        hiddenSections: [],
        toggleSectionVisibility: (k) => {
          const cur = get().hiddenSections;
          set({
            hiddenSections: cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k],
          });
        },
        sectionOrder: [...DEFAULT_SECTION_ORDER],
        setSectionOrder: (order) => set({ sectionOrder: order.slice() }),
        previewMode: false,
        togglePreviewMode: () => set({ previewMode: !get().previewMode }),
        reorderSection: (fromKey, toKey) => {
          if (fromKey === toKey) return;
          const cur = get().sectionOrder.slice();
          const fromIdx = cur.indexOf(fromKey);
          const toIdx = cur.indexOf(toKey);
          if (fromIdx < 0 || toIdx < 0) return;
          const [item] = cur.splice(fromIdx, 1);
          cur.splice(toIdx, 0, item);
          set({ sectionOrder: cur });
        },
        past: [],
        future: [],
        _batch: false,
        selectedNoteId: null,
        selectedNoteIds: [],
        selectNote: (id) =>
          set({
            selectedNoteId: id,
            selectedNoteIds: id ? [id] : [],
          }),
        selectNotes: (ids) =>
          set({
            selectedNoteIds: ids,
            selectedNoteId: ids.length ? ids[ids.length - 1] : null,
          }),
        toggleNoteSelection: (id) => {
          const cur = get().selectedNoteIds;
          const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
          set({
            selectedNoteIds: next,
            selectedNoteId: next.length ? next[next.length - 1] : null,
          });
        },
        addShapeNote: (shape) => {
          const r = get().resume;
          const notes = r.notes || [];
          const offset = (notes.length % 8) * 18;
          const base = { id: uid(), kind: "shape" as const, text: "", shape, x: 80 + offset, y: 80 + offset };
          let note: ResumeNote;
          if (shape === "line") {
            note = { ...base, width: 240, height: 2, bg: "#111827" };
          } else if (shape === "circle") {
            note = { ...base, width: 80, height: 80, borderColor: "#2563eb", borderWidth: 2, bg: "transparent" };
          } else {
            note = { ...base, width: 160, height: 100, borderColor: "#2563eb", borderWidth: 2, bg: "transparent" };
          }
          mutate({ ...r, notes: [...notes, note] });
          set({ selectedNoteId: note.id, selectedNoteIds: [note.id] });
        },
        alignNotes: (kind) => {
          const r = get().resume;
          const ids = get().selectedNoteIds;
          if (ids.length < 2) return;
          const notes = r.notes || [];
          const sel = notes.filter((n) => ids.includes(n.id) && !n.locked);
          if (sel.length < 2) return;
          // Compute the union bounding box once.
          const heightOf = (n: ResumeNote) => n.height ?? (n.kind === "image" ? n.width : 40);
          const minLeft   = Math.min(...sel.map((n) => n.x));
          const maxRight  = Math.max(...sel.map((n) => n.x + n.width));
          const minTop    = Math.min(...sel.map((n) => n.y));
          const maxBottom = Math.max(...sel.map((n) => n.y + heightOf(n)));
          const cx = (minLeft + maxRight) / 2;
          const cy = (minTop + maxBottom) / 2;
          const updated = notes.map((n) => {
            if (!ids.includes(n.id) || n.locked) return n;
            const h = heightOf(n);
            switch (kind) {
              case "left":    return { ...n, x: Math.round(minLeft) };
              case "right":   return { ...n, x: Math.round(maxRight - n.width) };
              case "top":     return { ...n, y: Math.round(minTop) };
              case "bottom":  return { ...n, y: Math.round(maxBottom - h) };
              case "centerH": return { ...n, x: Math.round(cx - n.width / 2) };
              case "centerV": return { ...n, y: Math.round(cy - h / 2) };
            }
            return n;
          });
          mutate({ ...r, notes: updated });
        },
        distributeNotes: (axis) => {
          const r = get().resume;
          const ids = get().selectedNoteIds;
          if (ids.length < 3) return;
          const notes = r.notes || [];
          const sel = notes.filter((n) => ids.includes(n.id) && !n.locked);
          if (sel.length < 3) return;
          const heightOf = (n: ResumeNote) => n.height ?? (n.kind === "image" ? n.width : 40);
          // Sort by their current edge along the chosen axis.
          const sorted = [...sel].sort((a, b) =>
            axis === "h" ? (a.x + a.width / 2) - (b.x + b.width / 2)
                         : (a.y + heightOf(a) / 2) - (b.y + heightOf(b) / 2)
          );
          const first = sorted[0];
          const last = sorted[sorted.length - 1];
          const firstCenter = axis === "h" ? first.x + first.width / 2 : first.y + heightOf(first) / 2;
          const lastCenter  = axis === "h" ? last.x + last.width / 2  : last.y + heightOf(last) / 2;
          const step = (lastCenter - firstCenter) / (sorted.length - 1);
          const targetById: Record<string, number> = {};
          sorted.forEach((n, i) => {
            const center = firstCenter + step * i;
            targetById[n.id] = axis === "h"
              ? Math.round(center - n.width / 2)
              : Math.round(center - heightOf(n) / 2);
          });
          const updated = notes.map((n) => {
            if (!(n.id in targetById)) return n;
            return axis === "h" ? { ...n, x: targetById[n.id] } : { ...n, y: targetById[n.id] };
          });
          mutate({ ...r, notes: updated });
        },
        nudgeSelection: (dx, dy) => {
          if (dx === 0 && dy === 0) return;
          const r = get().resume;
          const ids = get().selectedNoteIds;
          if (ids.length === 0) return;
          const updated = (r.notes || []).map((n) =>
            ids.includes(n.id) && !n.locked
              ? { ...n, x: Math.max(0, n.x + dx), y: Math.max(0, n.y + dy) }
              : n
          );
          mutate({ ...r, notes: updated });
        },

        setResume: (r) => mutate(r),
        update: (key, value) => mutate({ ...get().resume, [key]: value } as Resume),
        ...(() => {
          // Section CRUD shares the same shape: read the union-typed array,
          // operate on it as `IdItem[]`, write it back. We can't avoid one
          // localized cast at the read boundary because TS can't unify the
          // union of element types into a single concrete one — but we get
          // typed `.id` access inside the closure, and 4 separate `as any[]`
          // casts collapse into a single helper.
          type IdItem = { id: string };
          const getList = (section: SectionKey): IdItem[] =>
            ((get().resume[section] as unknown as IdItem[]) || []).slice();
          const writeList = (section: SectionKey, list: IdItem[]) =>
            mutate({ ...get().resume, [section]: list } as Resume);
          return {
            addItem: (section: SectionKey) =>
              writeList(section, [...getList(section), blankItem(section) as IdItem]),
            removeItem: (section: SectionKey, id: string) =>
              writeList(section, getList(section).filter((x) => x.id !== id)),
            duplicateItem: (section: SectionKey, id: string) => {
              const list = getList(section);
              const idx = list.findIndex((x) => x.id === id);
              if (idx < 0) return;
              // Deep-ish clone — arrays of primitives (highlights/keywords/
              // courses) need their own copy so editing the dup doesn't
              // mutate the source.
              const src = list[idx] as Record<string, unknown>;
              const copy: Record<string, unknown> = { ...src, id: uid() };
              for (const k of Object.keys(copy)) {
                if (Array.isArray(copy[k])) copy[k] = (copy[k] as unknown[]).slice();
              }
              list.splice(idx + 1, 0, copy as IdItem);
              writeList(section, list);
            },
            reorderItem: (section: SectionKey, fromId: string, toId: string) => {
              if (fromId === toId) return;
              const list = getList(section);
              const fromIdx = list.findIndex((x) => x.id === fromId);
              const toIdx = list.findIndex((x) => x.id === toId);
              if (fromIdx < 0 || toIdx < 0) return;
              const [item] = list.splice(fromIdx, 1);
              list.splice(toIdx, 0, item);
              writeList(section, list);
            },
          };
        })(),

        addNote: () => {
          const r = get().resume;
          const notes = r.notes || [];
          const offset = (notes.length % 8) * 18;
          const note: ResumeNote = { id: uid(), kind: "text", text: "", x: 80 + offset, y: 80 + offset, width: 240, fontSize: 14 };
          mutate({ ...r, notes: [...notes, note] });
        },
        addImageNote: (src) => {
          const r = get().resume;
          const notes = r.notes || [];
          const offset = (notes.length % 8) * 18;
          const note: ResumeNote = { id: uid(), kind: "image", text: "", src, x: 80 + offset, y: 80 + offset, width: 180, height: 180 };
          mutate({ ...r, notes: [...notes, note] });
        },
        updateNote: (id, patch) => {
          const r = get().resume;
          mutate({ ...r, notes: (r.notes || []).map((n) => (n.id === id ? { ...n, ...patch } : n)) });
        },
        removeNote: (id) => {
          const r = get().resume;
          const remaining = get().selectedNoteIds.filter((x) => x !== id);
          set({
            selectedNoteIds: remaining,
            selectedNoteId: remaining.length ? remaining[remaining.length - 1] : null,
          });
          mutate({ ...r, notes: (r.notes || []).filter((n) => n.id !== id) });
        },
        duplicateNote: (id) => {
          const r = get().resume;
          const src = (r.notes || []).find((n) => n.id === id);
          if (!src) return;
          const copy: ResumeNote = { ...src, id: uid(), x: src.x + 24, y: src.y + 24 };
          mutate({ ...r, notes: [...(r.notes || []), copy] });
          set({ selectedNoteId: copy.id, selectedNoteIds: [copy.id] });
        },
        reorderNote: (id, dir) => {
          const r = get().resume;
          const list = r.notes || [];
          const idx = list.findIndex((n) => n.id === id);
          if (idx < 0) return;
          const next = list.slice();
          const [item] = next.splice(idx, 1);
          if (dir === "front") next.push(item);
          else next.unshift(item);
          mutate({ ...r, notes: next });
        },

        setTemplate: (t) => set({ template: t }),     // not in history (UI state)
        setTheme: (t) => set({ theme: { ...get().theme, ...t } }), // ditto
        setLang: (l) => set({ lang: l }),
        loadSample: (l) => mutate(l === "zh" ? sampleZH : sampleEN),
        reset: () => mutate(emptyResume()),

        undo: () => {
          const s = get();
          if (s.past.length === 0) return;
          const prev = s.past[s.past.length - 1];
          set({
            resume: prev,
            past: s.past.slice(0, -1),
            future: [s.resume, ...s.future].slice(0, HISTORY_LIMIT),
          });
        },
        redo: () => {
          const s = get();
          if (s.future.length === 0) return;
          const next = s.future[0];
          set({
            resume: next,
            past: [...s.past, s.resume].slice(-HISTORY_LIMIT),
            future: s.future.slice(1),
          });
        },
        canUndo: () => get().past.length > 0,
        canRedo: () => get().future.length > 0,

        snapshots: [],
        saveSnapshot: (name) => {
          const s = get();
          const trimmed = (name ?? "").trim();
          const fallback = new Date().toLocaleString();
          const snap: Snapshot = {
            id: uid(),
            name: trimmed || fallback,
            createdAt: Date.now(),
            // Snapshots are persisted alongside main state — JSON-clone so
            // future mutations to the live resume don't bleed into them.
            resume: JSON.parse(JSON.stringify(s.resume)),
          };
          // Newest first; drop oldest beyond the cap.
          const next = [snap, ...s.snapshots].slice(0, SNAPSHOT_LIMIT);
          set({ snapshots: next });
        },
        restoreSnapshot: (id) => {
          const snap = get().snapshots.find((x) => x.id === id);
          if (!snap) return;
          // Route through `mutate` so undo can roll back the restore.
          mutate(JSON.parse(JSON.stringify(snap.resume)));
        },
        deleteSnapshot: (id) =>
          set({ snapshots: get().snapshots.filter((x) => x.id !== id) }),
        renameSnapshot: (id, name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          set({
            snapshots: get().snapshots.map((x) =>
              x.id === id ? { ...x, name: trimmed } : x
            ),
          });
        },

        beginBatch: () => {
          const s = get();
          if (s._batch) return;
          // Seed one history entry for the whole gesture, then suppress.
          const past = s.past.length >= HISTORY_LIMIT
            ? [...s.past.slice(s.past.length - HISTORY_LIMIT + 1), s.resume]
            : [...s.past, s.resume];
          set({ past, future: [], _batch: true });
        },
        endBatch: () => set({ _batch: false }),
      };
    },
    {
      name: "proj4-resume",
      // Don't persist history to localStorage — too heavy, and a fresh page
      // load resetting undo is fine UX.
      partialize: (s) => ({
        resume: s.resume,
        template: s.template,
        theme: s.theme,
        lang: s.lang,
        pageSetup: s.pageSetup,
        hiddenSections: s.hiddenSections,
        sectionOrder: s.sectionOrder,
        previewMode: s.previewMode,
        snapshots: s.snapshots,
      }) as any,
      // Migrate persisted state for users who had the now-removed
      // "academic-cn" template selected. Falls back to cn-formal which is
      // the closest-feel Chinese-friendly layout.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as any;
        if (p.template === "academic-cn") p.template = "cn-formal";
        // Backfill new optional academic sections so legacy resumes don't
        // crash code paths that assume an array.
        if (p.resume) {
          p.resume.publications = p.resume.publications ?? [];
          p.resume.talks = p.resume.talks ?? [];
          p.resume.teaching = p.resume.teaching ?? [];
        }
        // Backfill / extend persisted sectionOrder so users coming from an
        // older version don't lose any section, and any newly-introduced
        // section keys are appended automatically.
        const existing: SectionKey[] = Array.isArray(p.sectionOrder) ? p.sectionOrder : [];
        const filtered = existing.filter((k) => DEFAULT_SECTION_ORDER.includes(k));
        const missing = DEFAULT_SECTION_ORDER.filter((k) => !filtered.includes(k));
        p.sectionOrder = [...filtered, ...missing];
        // Older saves don't have snapshots — start with an empty list.
        if (!Array.isArray(p.snapshots)) p.snapshots = [];
        return { ...current, ...p };
      },
    }
  )
);

"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Resume, SectionKey, emptyResume, ResumeNote } from "./schema";
import { sampleEN, sampleZH } from "./samples";

export type TemplateId =
  | "modern" | "classic" | "minimal"
  | "elegant" | "compact" | "timeline"
  | "cn-formal" | "cn-creative"
  | "en-academic"
  | "academic-classic" | "academic-modern" | "academic-pub"
  | "academic-minimal" | "academic-cn";

export interface ThemeTokens {
  accent: string;          // primary color
  fontSans: string;
  fontSerif: string;
  density: "compact" | "comfy" | "spacious";
  fontScale: number;       // 0.9 ~ 1.15
}

export const defaultTheme: ThemeTokens = {
  accent: "#2563eb",
  fontSans: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  fontSerif: "'Source Serif Pro', 'Source Han Serif SC', serif",
  density: "comfy",
  fontScale: 1,
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
}

export const defaultPageSetup: PageSetup = {
  size: "A4",
  margin: 0,
  showPageNumbers: false,
  showFooter: false,
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
}

const uid = () => Math.random().toString(36).slice(2, 9);

const blankItem = (s: SectionKey): any => {
  const id = uid();
  switch (s) {
    case "work": return { id, company: "", position: "", location: "", startDate: "", endDate: "", highlights: [""] };
    case "education": return { id, institution: "", area: "", studyType: "", startDate: "", endDate: "", score: "", courses: [] };
    case "projects": return { id, name: "", description: "", url: "", startDate: "", endDate: "", highlights: [""], keywords: [] };
    case "skills": return { id, name: "", level: "", keywords: [] };
    case "awards": return { id, title: "", date: "", awarder: "", summary: "" };
    case "languages": return { id, language: "", fluency: "" };
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
        addItem: (section) =>
          mutate({ ...get().resume, [section]: [...(get().resume[section] as any[]), blankItem(section)] } as Resume),
        removeItem: (section, id) =>
          mutate({ ...get().resume, [section]: (get().resume[section] as any[]).filter((x) => x.id !== id) } as Resume),
        reorderItem: (section, fromId, toId) => {
          if (fromId === toId) return;
          const list = (get().resume[section] as any[]).slice();
          const fromIdx = list.findIndex((x) => x.id === fromId);
          const toIdx = list.findIndex((x) => x.id === toId);
          if (fromIdx < 0 || toIdx < 0) return;
          const [item] = list.splice(fromIdx, 1);
          list.splice(toIdx, 0, item);
          mutate({ ...get().resume, [section]: list } as Resume);
        },

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
      }) as any,
    }
  )
);

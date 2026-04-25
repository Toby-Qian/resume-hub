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
  selectedNoteId: string | null;
  selectNote: (id: string | null) => void;
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
        selectNote: (id) => set({ selectedNoteId: id }),

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
          if (get().selectedNoteId === id) set({ selectedNoteId: null });
          mutate({ ...r, notes: (r.notes || []).filter((n) => n.id !== id) });
        },
        duplicateNote: (id) => {
          const r = get().resume;
          const src = (r.notes || []).find((n) => n.id === id);
          if (!src) return;
          const copy: ResumeNote = { ...src, id: uid(), x: src.x + 24, y: src.y + 24 };
          mutate({ ...r, notes: [...(r.notes || []), copy] });
          set({ selectedNoteId: copy.id });
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

"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Resume, SectionKey, emptyResume } from "./schema";
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

interface State {
  resume: Resume;
  template: TemplateId;
  theme: ThemeTokens;
  lang: UILang;
  setResume: (r: Resume) => void;
  update: <K extends keyof Resume>(key: K, value: Resume[K]) => void;
  addItem: (section: SectionKey) => void;
  removeItem: (section: SectionKey, id: string) => void;
  addNote: () => void;
  updateNote: (id: string, patch: Partial<import("./schema").ResumeNote>) => void;
  removeNote: (id: string) => void;
  setTemplate: (t: TemplateId) => void;
  setTheme: (t: Partial<ThemeTokens>) => void;
  setLang: (l: UILang) => void;
  loadSample: (l: UILang) => void;
  reset: () => void;
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
    (set, get) => ({
      resume: sampleZH,
      template: "cn-formal",
      theme: defaultTheme,
      lang: "zh",
      setResume: (r) => set({ resume: r }),
      update: (key, value) => set({ resume: { ...get().resume, [key]: value } }),
      addItem: (section) =>
        set({ resume: { ...get().resume, [section]: [...(get().resume[section] as any[]), blankItem(section)] } as Resume }),
      removeItem: (section, id) =>
        set({ resume: { ...get().resume, [section]: (get().resume[section] as any[]).filter((x) => x.id !== id) } as Resume }),
      addNote: () => {
        const r = get().resume;
        const notes = r.notes || [];
        // Stagger each new note so they don't stack on top of each other.
        const offset = (notes.length % 8) * 18;
        const note = { id: uid(), text: "", x: 80 + offset, y: 80 + offset, width: 240, fontSize: 14 };
        set({ resume: { ...r, notes: [...notes, note] } });
      },
      updateNote: (id, patch) => {
        const r = get().resume;
        set({ resume: { ...r, notes: (r.notes || []).map((n) => (n.id === id ? { ...n, ...patch } : n)) } });
      },
      removeNote: (id) => {
        const r = get().resume;
        set({ resume: { ...r, notes: (r.notes || []).filter((n) => n.id !== id) } });
      },
      setTemplate: (t) => set({ template: t }),
      setTheme: (t) => set({ theme: { ...get().theme, ...t } }),
      setLang: (l) => set({ lang: l }),
      loadSample: (l) => set({ resume: l === "zh" ? sampleZH : sampleEN }),
      reset: () => set({ resume: emptyResume() }),
    }),
    { name: "proj4-resume" }
  )
);

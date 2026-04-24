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
      setTemplate: (t) => set({ template: t }),
      setTheme: (t) => set({ theme: { ...get().theme, ...t } }),
      setLang: (l) => set({ lang: l }),
      loadSample: (l) => set({ resume: l === "zh" ? sampleZH : sampleEN }),
      reset: () => set({ resume: emptyResume() }),
    }),
    { name: "proj4-resume" }
  )
);

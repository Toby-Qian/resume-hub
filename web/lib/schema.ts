// Minimal subset of JSON Resume schema (https://jsonresume.org/schema/).
// Kept flat and practical so the form UI stays simple.

export interface ResumeBasics {
  name: string;
  label: string;          // headline / job title
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  avatar?: string;        // data URL or http(s)
}

export interface ResumeWork {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;        // "Present" allowed
  highlights: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  area: string;
  studyType: string;      // Bachelor / Master / PhD / etc.
  startDate: string;
  endDate: string;
  score?: string;         // GPA or rank
  courses?: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
  keywords?: string[];
}

export interface ResumeSkill {
  id: string;
  name: string;
  level: string;          // Beginner / Intermediate / Advanced / Expert
  keywords: string[];
}

export interface ResumeAward {
  id: string;
  title: string;
  date: string;
  awarder: string;
  summary?: string;
}

export interface ResumeLanguage {
  id: string;
  language: string;
  fluency: string;
}

export interface Resume {
  basics: ResumeBasics;
  work: ResumeWork[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkill[];
  awards: ResumeAward[];
  languages: ResumeLanguage[];
}

export const emptyResume = (): Resume => ({
  basics: { name: "", label: "", email: "", phone: "", location: "", website: "", summary: "" },
  work: [], education: [], projects: [], skills: [], awards: [], languages: [],
});

export type SectionKey = "work" | "education" | "projects" | "skills" | "awards" | "languages";

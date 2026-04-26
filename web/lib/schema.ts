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
  showAvatar?: boolean;   // toggle whether templates render the photo
  avatarShape?: "circle" | "rounded" | "square" | "portrait"; // portrait = 3:4 passport
  avatarSize?: number;    // width in px; height = width (portrait = width * 4/3)
  avatarOffsetX?: number; // drag offset relative to template's natural slot (px)
  avatarOffsetY?: number;
  // Free-drag offsets for non-avatar text blocks. Keyed by a template-defined
  // slot name ("header", "summary", "contact", ...). Values are pixel offsets
  // applied via CSS transform so flow is undisturbed.
  blockOffsets?: Record<string, { x?: number; y?: number }>;
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

/** Academic publication. Distinct from `projects` so academic templates can
 *  render proper citation lists (numbered, with venue/authors/DOI). Falls
 *  back to `projects` in academic templates when this array is empty. */
export interface ResumePublication {
  id: string;
  title: string;
  authors?: string;       // free text — "A. Doe, B. Smith, C. Lee"
  venue?: string;         // journal / conference name
  date?: string;          // YYYY-MM
  doi?: string;
  url?: string;
  summary?: string;
  breakBefore?: boolean;
}

export interface ResumeTalk {
  id: string;
  title: string;
  venue?: string;         // conference / event / institution
  date?: string;
  location?: string;
  url?: string;
  breakBefore?: boolean;
}

export interface ResumeTeaching {
  id: string;
  course: string;
  institution?: string;
  role?: string;          // Lecturer / TA / Guest lecturer ...
  startDate?: string;
  endDate?: string;
  summary?: string;
  breakBefore?: boolean;
}

/** Free-floating text box the user can drop anywhere on the paper for layout
 *  freedom beyond the template's fixed sections. Coordinates are relative to
 *  the .paper top-left, in px at 96dpi A4 scale. */
export interface ResumeNote {
  id: string;
  kind?: "text" | "image" | "shape";  // default "text"
  text: string;
  src?: string;             // data URL, only when kind === "image"
  /** Decorative shape geometry. Only used when kind === "shape". */
  shape?: "line" | "rect" | "circle";
  borderColor?: string;     // hex (shapes / outline-only blocks)
  borderWidth?: number;     // px, default 1
  x: number;
  y: number;
  width: number;            // px
  height?: number;          // px (images / shapes), text auto-grows
  fontSize?: number;        // px, default 14
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;           // hex
  bg?: string;              // hex / transparent
  align?: "left" | "center" | "right";
  /** When true, the note ignores drag/resize/keyboard nudges — it only
   *  responds to selection and to the lock toggle itself. */
  locked?: boolean;
}

export interface Resume {
  basics: ResumeBasics;
  work: ResumeWork[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkill[];
  awards: ResumeAward[];
  languages: ResumeLanguage[];
  /** Optional academic-flavoured sections. Older saved resumes don't have
   *  these; templates that read them must treat undefined as `[]`. */
  publications?: ResumePublication[];
  talks?: ResumeTalk[];
  teaching?: ResumeTeaching[];
  notes?: ResumeNote[];
}

export const emptyResume = (): Resume => ({
  basics: { name: "", label: "", email: "", phone: "", location: "", website: "", summary: "" },
  work: [], education: [], projects: [], skills: [], awards: [], languages: [],
  publications: [], talks: [], teaching: [], notes: [],
});

export type SectionKey =
  | "work" | "education" | "projects" | "skills" | "awards" | "languages"
  | "publications" | "talks" | "teaching";

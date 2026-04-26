"use client";
import { useRef, useEffect } from "react";
import type { Resume } from "@/lib/schema";
import { useStore } from "@/lib/store";

export interface TemplateProps {
  resume: Resume;
}

/**
 * Localised section titles for templates. Templates should NEVER hard-code
 * English/Chinese section headings — call `useSectionLabels()` and pluck the
 * key. The map covers both the standard JSON Resume sections and the extra
 * academic-flavoured headings (publications, grants, teaching…).
 *
 * The two languages share the same key shape so a template can stay in one
 * style (e.g. an academic CV that says "Publications & Research") without the
 * call site caring about the user's UI language.
 */
const SECTION_LABELS: { zh: Record<string, string>; en: Record<string, string> } = {
  zh: {
    cv: "个人简历",
    summary: "个人简介", about: "关于我", contact: "联系方式",
    experience: "工作经历", workShort: "工作", appointments: "学术任职",
    education: "教育背景", educationShort: "教育",
    projects: "项目经历", projectsShort: "项目",
    publications: "论文与研究", publicationsOnly: "论文",
    skills: "技能", technicalSkills: "技术能力", skillsShort: "技能",
    awards: "荣誉奖项", honorsAndAwards: "荣誉与奖项", honorsAndGrants: "荣誉与基金",
    awardsShort: "荣誉",
    languages: "语言", languagesShort: "语言",
    teaching: "教学经历", talks: "学术报告", grants: "基金/资助", certifications: "证书",
    interests: "兴趣爱好", references: "推荐人",
    coursework: "主修课程",
  },
  en: {
    cv: "Curriculum Vitae",
    summary: "Summary", about: "About", contact: "Contact",
    experience: "Experience", workShort: "Work", appointments: "Academic Appointments",
    education: "Education", educationShort: "Edu",
    projects: "Projects", projectsShort: "Projects",
    publications: "Publications & Research", publicationsOnly: "Publications",
    skills: "Skills", technicalSkills: "Technical Skills", skillsShort: "Skills",
    awards: "Awards", honorsAndAwards: "Honors & Awards", honorsAndGrants: "Honors & Grants",
    awardsShort: "Awards",
    languages: "Languages", languagesShort: "Lang",
    teaching: "Teaching", talks: "Invited Talks", grants: "Grants & Funding", certifications: "Certifications",
    interests: "Interests", references: "References",
    coursework: "Coursework",
  },
};

export type SectionLabels = {
  cv: string; summary: string; about: string; contact: string;
  experience: string; workShort: string; appointments: string;
  education: string; educationShort: string;
  projects: string; projectsShort: string;
  publications: string; publicationsOnly: string;
  skills: string; technicalSkills: string; skillsShort: string;
  awards: string; honorsAndAwards: string; honorsAndGrants: string; awardsShort: string;
  languages: string; languagesShort: string;
  teaching: string; talks: string; grants: string; certifications: string;
  interests: string; references: string;
  coursework: string;
};

/** Reactive — re-renders when the user toggles language at the top bar. */
export function useSectionLabels(): SectionLabels {
  const lang = useStore((s) => s.lang);
  return SECTION_LABELS[lang] as SectionLabels;
}

export const fmtDate = (s?: string) => s || "";
export const range = (a?: string, b?: string) =>
  [fmtDate(a), fmtDate(b)].filter(Boolean).join(" — ");

/** Produces CSS classes for an individual resume item div.
 *  Always adds `resume-item` (so CSS break-inside: avoid applies),
 *  and conditionally adds `page-break-before` when the item has breakBefore=true. */
export const itemCls = (item: any, extra = "") =>
  `resume-item ${item?.breakBefore ? "page-break-before" : ""} ${extra}`.trim();

/** Render the avatar only when user has both uploaded/pasted one AND enabled the toggle. */
export function Avatar({
  basics,
  size = 88,
  rounded = "full",
  style,
  className = "",
}: {
  basics: {
    avatar?: string;
    showAvatar?: boolean;
    name?: string;
    avatarShape?: "circle" | "rounded" | "square" | "portrait";
    avatarSize?: number;
    avatarOffsetX?: number;
    avatarOffsetY?: number;
  };
  size?: number;
  rounded?: "full" | "md" | "sm" | "none";
  style?: React.CSSProperties;
  className?: string;
}) {
  const dragging = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  if (!basics.showAvatar || !basics.avatar) return null;
  // User-set shape / size override the template's default preference.
  const explicit = basics.avatarShape;
  const w = basics.avatarSize ?? size;
  const h = explicit === "portrait" ? Math.round((w * 4) / 3) : w;
  const roundCls = explicit
    ? (explicit === "circle" ? "rounded-full"
        : explicit === "rounded" ? "rounded-lg"
        : /* square | portrait */ "")
    : (rounded === "full" ? "rounded-full"
        : rounded === "md" ? "rounded-md"
        : rounded === "sm" ? "rounded-sm" : "");
  const ox = basics.avatarOffsetX || 0;
  const oy = basics.avatarOffsetY || 0;

  // Drag to reposition. We push Xpx/Ypx offsets into the store; the rendered
  // image uses a CSS transform so the template's layout flow isn't disturbed
  // (avatar can visually wander anywhere the user wants, text stays in place).
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const st = useStore.getState();
    st.beginBatch();
    dragging.current = {
      sx: e.clientX, sy: e.clientY,
      ox: st.resume.basics.avatarOffsetX || 0,
      oy: st.resume.basics.avatarOffsetY || 0,
    };
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const { resume, update } = useStore.getState();
      update("basics", {
        ...resume.basics,
        avatarOffsetX: Math.round(dragging.current.ox + (ev.clientX - dragging.current.sx)),
        avatarOffsetY: Math.round(dragging.current.oy + (ev.clientY - dragging.current.sy)),
      });
    };
    const onUp = () => {
      dragging.current = null;
      useStore.getState().endBatch();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={basics.avatar}
      alt={basics.name || "avatar"}
      draggable={false}
      onMouseDown={onMouseDown}
      title="拖动以调整位置 / drag to reposition"
      className={`object-cover shrink-0 select-none ${roundCls} ${className}`}
      style={{
        width: w, height: h,
        transform: `translate(${ox}px, ${oy}px)`,
        cursor: "grab",
        ...style,
      }}
    />
  );
}

/**
 * Section: if items inside have `breakBefore`, the auto-generated CSS class
 * `page-break-before` on the item will push it to a new page. Templates
 * typically don't need to pass `breakBefore` on Section itself — but it is
 * available for explicit "this entire section on a new page" use.
 */
export function Section({ title, children, accent = false, breakBefore = false }: { title: string; children: React.ReactNode; accent?: boolean; breakBefore?: boolean }) {
  return (
    <section
      className={`resume-section ${breakBefore ? "page-break-before" : ""}`}
      style={{ marginBottom: "var(--gap)" }}
    >
      <h2
        className="font-semibold tracking-wide uppercase text-[0.82em] mb-2 pb-1 border-b"
        style={{ color: accent ? "var(--resume-accent)" : "#111827", borderColor: "#e5e7eb" }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/** Wrapper for individual entries (one job, one project) so a page break never
 *  splits a single item. Also used to mark per-item breakBefore. */
export function Item({ children, breakBefore = false, className = "" }: { children: React.ReactNode; breakBefore?: boolean; className?: string }) {
  return (
    <div className={`resume-item ${breakBefore ? "page-break-before" : ""} ${className}`}>
      {children}
    </div>
  );
}

// ---------- Inline click-to-edit ("E") ------------------------------------
// Immutable set-by-path for dotted paths like "basics.name", "work.0.company",
// "work.1.highlights.2". Numeric segments index into arrays.
function setByPath(obj: any, path: string, value: any): any {
  const parts = path.split(".");
  const clone = (v: any) => (Array.isArray(v) ? v.slice() : { ...v });
  const root = clone(obj);
  let cur: any = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const next = cur[k] ?? (Number.isFinite(+parts[i + 1]) ? [] : {});
    cur[k] = clone(next);
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
  return root;
}

/**
 * Click any `<E>` text in the preview to edit in place. On blur we commit the
 * new value back to the zustand store via a dotted path. Enter commits, Shift
 * Enter inserts a newline. Visual: dashed underline on hover, yellow focus ring.
 *
 * We intentionally set `contentEditable` imperatively via ref + effect so React
 * never re-renders the DOM subtree while the user is typing (which would move
 * the caret to the start on every keystroke).
 */
export function E({
  path,
  children,
  as: Tag = "span",
  className = "",
  multiline = false,
}: {
  path: string;
  children?: React.ReactNode;
  as?: any;
  className?: string;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const editing = useRef(false);
  const text = typeof children === "string" ? children
    : Array.isArray(children) ? children.filter(c => typeof c === "string").join("") : (children ?? "");
  useEffect(() => {
    if (!ref.current) return;
    // Don't overwrite the DOM while the user is actively editing.
    if (editing.current) return;
    const desired = typeof text === "string" ? text : String(text ?? "");
    if (ref.current.textContent !== desired) ref.current.textContent = desired;
  }, [text]);
  const commit = () => {
    const node = ref.current;
    if (!node) return;
    const value = node.textContent ?? "";
    const { resume, setResume } = useStore.getState();
    setResume(setByPath(resume, path, value));
  };
  const onFocus = () => { editing.current = true; };
  const onBlur = () => { editing.current = false; commit(); };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
    if (e.key === "Escape") {
      editing.current = false;
      if (ref.current) ref.current.textContent = typeof text === "string" ? text : String(text ?? "");
      (e.currentTarget as HTMLElement).blur();
    }
  };
  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-edit-path={path}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={`editable-field ${className}`}
    />
  );
}

// ---------- Draggable text block ------------------------------------------
/**
 * Wrap any block in `<Draggable name="header">...` to let the user drag it
 * around. Offset is persisted under `basics.blockOffsets[name]`. A small
 * handle (⋮⋮) appears on hover so text inside stays clickable/editable.
 */
export function Draggable({
  name,
  children,
  className = "",
  as: Tag = "div",
}: {
  name: string;
  children: React.ReactNode;
  className?: string;
  as?: any;
}) {
  const dragging = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const basics = useStore((s) => s.resume.basics);
  const off = (basics.blockOffsets && basics.blockOffsets[name]) || { x: 0, y: 0 };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const st = useStore.getState();
    st.beginBatch();
    const cur = (st.resume.basics.blockOffsets && st.resume.basics.blockOffsets[name]) || { x: 0, y: 0 };
    dragging.current = { sx: e.clientX, sy: e.clientY, ox: cur.x || 0, oy: cur.y || 0 };
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const { resume, update } = useStore.getState();
      const bo = { ...(resume.basics.blockOffsets || {}) };
      bo[name] = {
        x: Math.round(dragging.current.ox + (ev.clientX - dragging.current.sx)),
        y: Math.round(dragging.current.oy + (ev.clientY - dragging.current.sy)),
      };
      update("basics", { ...resume.basics, blockOffsets: bo });
    };
    const onUp = () => {
      dragging.current = null;
      useStore.getState().endBatch();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <Tag
      className={`draggable-block group relative ${className}`}
      style={{ transform: `translate(${off.x || 0}px, ${off.y || 0}px)` }}
    >
      <button
        type="button"
        onMouseDown={onMouseDown}
        title="拖动此区块 / drag this block"
        className="drag-handle"
        aria-label="drag block"
      >⋮⋮</button>
      {children}
    </Tag>
  );
}

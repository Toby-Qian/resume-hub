"use client";
import * as React from "react";
import { useRef, useEffect } from "react";
import type { Resume, SectionKey } from "@/lib/schema";
import { useStore, DEFAULT_SECTION_ORDER } from "@/lib/store";

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

/**
 * Render section blocks in the order the user picked in the StylePanel.
 *
 * `renderers` is a map from `SectionKey` → JSX (or null when empty). Templates
 * pass *all* of their movable sections through this helper; the avatar/header/
 * summary stays where the template put it because those aren't true sections.
 *
 * Any keys missing from the user's persisted `sectionOrder` (e.g. brand-new
 * section types added in a later version) are appended at the end.
 */
export function useOrderedSections(
  renderers: Partial<Record<SectionKey, React.ReactNode>>
): React.ReactNode[] {
  const order = useStore((s) => s.sectionOrder);
  const seen = new Set<SectionKey>();
  const out: React.ReactNode[] = [];
  const push = (k: SectionKey) => {
    if (seen.has(k)) return;
    seen.add(k);
    const node = renderers[k];
    if (node) out.push(
      // Each section is wrapped in `Draggable` so the user can also nudge an
      // individual section freely via its own drag handle (offset persisted
      // under `basics.blockOffsets["section:<key>"]`). The reorder DnD
      // (StylePanel / Editor) controls which section appears in which slot;
      // this lets the user fine-tune the slot's position on the page.
      <Draggable key={k} name={`section:${k}`}>{node}</Draggable>
    );
  };
  for (const k of order) push(k);
  // Append any keys the user's order forgot (forward-compat).
  for (const k of DEFAULT_SECTION_ORDER) push(k);
  // And any keys the renderers map has that aren't in the default list.
  for (const k of Object.keys(renderers) as SectionKey[]) push(k);
  return out;
}

export const fmtDate = (s?: string) => s || "";
export const range = (a?: string, b?: string) =>
  [fmtDate(a), fmtDate(b)].filter(Boolean).join(" — ");

/**
 * Inline-editable date range. Each end is its own click-to-edit `<E>` so the
 * user can adjust dates directly in the preview without leaving for the
 * editor. Renders as "YYYY-MM — YYYY-MM" when both ends are set; falls back
 * to a single end when only one is present; renders an empty editable span
 * when neither is set so users still discover that dates exist here.
 *
 * Use instead of `range()` whenever the date string comes from a known item
 * in the resume data — pass the dotted paths so commits route to the right
 * field.
 */
export function DateRange({
  startPath, endPath, start, end, sep = " — ", className = "",
}: {
  startPath: string;
  endPath: string;
  start?: string;
  end?: string;
  sep?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      <E path={startPath}>{start || ""}</E>
      {(start && end) ? sep : (start || end ? "" : sep)}
      <E path={endPath}>{end || ""}</E>
    </span>
  );
}

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
export function Section({ title, children, accent = false, breakBefore = false, titleKey }: { title: React.ReactNode; children: React.ReactNode; accent?: boolean; breakBefore?: boolean; titleKey?: string }) {
  return (
    <section
      className={`resume-section ${breakBefore ? "page-break-before" : ""}`}
      style={{ marginBottom: "var(--gap)" }}
    >
      <h2
        className="font-semibold tracking-wide uppercase text-[0.82em] mb-2 pb-1 border-b"
        style={{ color: accent ? "var(--resume-accent)" : "#111827", borderColor: "#e5e7eb" }}
      >
        {titleKey ? <EditableLabel k={titleKey} fallback={title} /> : title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/**
 * Render a section heading or other small label that the user can click to
 * customise. Persists under `customLabels[k]`. When the saved value is empty
 * we render `fallback` (the localised default) — both visually and inside the
 * editable field, so users see what they're overriding.
 */
export function EditableLabel({ k, fallback, className = "" }: { k: string; fallback: React.ReactNode; className?: string }) {
  const saved = useStore((s) => (s.resume.customLabels || {})[k]);
  const text = (typeof saved === "string" && saved.length > 0) ? saved : (typeof fallback === "string" ? fallback : "");
  return <E path={`customLabels.${k}`} className={className}>{text}</E>;
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
      // Lock X — vertical-only drag. Horizontal drift broke layout/ATS feel,
      // so blocks only move up/down now.
      bo[name] = {
        x: 0,
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

  const moved = (off.y || 0) !== 0;
  const onReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { resume, update } = useStore.getState();
    const bo = { ...(resume.basics.blockOffsets || {}) };
    delete bo[name];
    update("basics", { ...resume.basics, blockOffsets: bo });
  };
  return (
    <Tag
      className={`draggable-block group relative ${className}`}
      style={{ transform: `translateY(${off.y || 0}px)` }}
    >
      {moved && (
        <button
          type="button"
          onClick={onReset}
          title="复位 / reset position"
          aria-label="reset position"
          className="drag-reset"
        >↺</button>
      )}
      <button
        type="button"
        onMouseDown={onMouseDown}
        title="上下拖动此区块 / drag block vertically"
        className="drag-handle"
        aria-label="drag block"
      >⋮⋮</button>
      {children}
    </Tag>
  );
}

// ---------- Basics shorthand --------------------------------------------
/**
 * Shorthand for `<E path="basics.X">{b.X}</E>` — that pattern repeated ~95
 * times across 16 templates. The keys allowed here are exactly the string
 * fields on `ResumeBasics` so misuse fails at compile time.
 */
type BasicsStringField = "name" | "label" | "email" | "phone" | "location" | "website" | "summary";
export function EB({
  b,
  field,
  multiline,
  className,
}: {
  b: import("@/lib/schema").ResumeBasics;
  field: BasicsStringField;
  multiline?: boolean;
  className?: string;
}) {
  return (
    <E path={`basics.${field}`} multiline={multiline} className={className}>
      {b[field] || ""}
    </E>
  );
}

// ---------- Contact icon (editable emoji) ---------------------------------
/**
 * Editable contact emoji with sane defaults. Replaces the repetitive
 *   <ContactIcon b={b} kind="email" />
 * pattern that was duplicated 28× across templates.
 */
const CONTACT_ICON_DEFAULTS = { email: "✉", phone: "☎", location: "📍", website: "🔗" } as const;
export function ContactIcon({
  b,
  kind,
}: {
  b: import("@/lib/schema").ResumeBasics;
  kind: keyof typeof CONTACT_ICON_DEFAULTS;
}) {
  return (
    <E path={`basics.icons.${kind}`}>
      {(b.icons && b.icons[kind]) || CONTACT_ICON_DEFAULTS[kind]}
    </E>
  );
}

// ---------- Skill proficiency bar -----------------------------------------
/**
 * Render a 0-`max` proficiency indicator. Returns null when `value` is falsy
 * or <=0, so templates can drop it in unconditionally — invisible until the
 * user sets `levelValue` in the editor. `variant`:
 *   - "bar" (default): `max` segmented blocks, filled left-to-right.
 *   - "dots": `max` dots, filled left-to-right.
 * Color follows the active accent (`--ink-accent`) via `currentColor` so each
 * template inherits its theme automatically.
 */
export function SkillBar({
  value,
  max = 5,
  variant = "bar",
  className = "",
}: {
  value?: number;
  max?: number;
  variant?: "bar" | "dots";
  className?: string;
}) {
  if (!value || value <= 0) return null;
  const v = Math.max(0, Math.min(max, Math.round(value)));
  return (
    <span
      className={`skill-bar skill-bar-${variant} ${className}`}
      style={{ color: "var(--ink-accent)" }}
      aria-label={`level ${v} of ${max}`}
      role="img"
    >
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`skill-seg ${i < v ? "on" : "off"}`}
        />
      ))}
    </span>
  );
}

// ---------- User-defined custom sections ----------------------------------
/**
 * Renders every `resume.customSections[i]` as a templated `<Section>`. Each
 * section heading is inline-editable via `<E>` (so the user types the new
 * label directly into the preview), and each entry exposes title / subtitle /
 * date / description / highlight bullets.
 *
 * Templates simply mount `<CustomSections />` once (typically at the end of
 * the main column) and the loop handles the rest. When the user has no custom
 * sections, this returns null — zero visual footprint.
 */
export function CustomSections({ accent = true }: { accent?: boolean }) {
  // IMPORTANT: select the raw field — `|| []` would return a freshly-allocated
  // array on every call, which zustand sees as a state change and triggers an
  // infinite re-render loop. Default to [] only at the use site.
  const raw = useStore((s) => s.resume.customSections);
  const reorder = useStore((s) => s.reorderCustomEntry);
  const customSections = raw || [];
  if (customSections.length === 0) return null;
  return (
    <>
      {customSections.map((sec, i) => {
        if (!sec.label.trim() && sec.entries.every((e) => !e.title && !e.description)) return null;
        return (
          <Section
            key={sec.id}
            title={<E path={`customSections.${i}.label`}>{sec.label || "Custom"}</E>}
            accent={accent}
          >
            {sec.description && (
              <div className="text-[0.85em] text-gray-500 italic -mt-1 mb-1">
                <E path={`customSections.${i}.description`} multiline>{sec.description}</E>
              </div>
            )}
            {sec.entries.map((entry, j) => {
              const hasAny = entry.title || entry.subtitle || entry.date || entry.description ||
                (entry.highlights && entry.highlights.some(Boolean));
              if (!hasAny) return null;
              const dragId = `custom-${sec.id}`;
              return (
                <div
                  key={entry.id}
                  className={`resume-item ${entry.breakBefore ? "page-break-before" : ""}`}
                  data-custom-section={sec.id}
                  data-custom-entry={entry.id}
                  // Reorder via plain HTML5 drag — same pattern used elsewhere.
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData(`text/x-custom-${dragId}`, entry.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromId = e.dataTransfer.getData(`text/x-custom-${dragId}`);
                    if (fromId && fromId !== entry.id) reorder(sec.id, fromId, entry.id);
                  }}
                >
                  {(entry.title || entry.subtitle || entry.date) && (
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="font-semibold flex items-baseline gap-1.5">
                        <E path={`customSections.${i}.entries.${j}.title`}>{entry.title}</E>
                        {entry.subtitle && (
                          <span className="font-normal text-gray-600">
                            · <E path={`customSections.${i}.entries.${j}.subtitle`}>{entry.subtitle}</E>
                          </span>
                        )}
                      </div>
                      {entry.date && (
                        <div className="text-[0.85em] text-gray-500">
                          <E path={`customSections.${i}.entries.${j}.date`}>{entry.date}</E>
                        </div>
                      )}
                    </div>
                  )}
                  {entry.description && (
                    <div className="text-[0.9em] text-gray-700">
                      <E path={`customSections.${i}.entries.${j}.description`} multiline>{entry.description}</E>
                    </div>
                  )}
                  {entry.highlights && entry.highlights.some(Boolean) && (
                    <ul className="list-disc ml-5 mt-1 text-[0.92em]">
                      {entry.highlights.filter(Boolean).map((h, k) => (
                        <li key={k}>
                          <E path={`customSections.${i}.entries.${j}.highlights.${k}`}>{h}</E>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </Section>
        );
      })}
    </>
  );
}

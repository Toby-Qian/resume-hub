"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SectionKey, Resume } from "@/lib/schema";
import { t } from "@/lib/i18n";
import { Field } from "./Field";
import { DateField } from "./DateField";
import { toast } from "@/lib/toast";
import { compressToDataURL } from "@/lib/imageCompress";

const SECTION_ICONS: Record<string, string> = {
  basics: "👤",
  work: "💼",
  education: "🎓",
  projects: "🚀",
  skills: "🛠",
  awards: "🏆",
  languages: "🌐",
  publications: "📚",
  talks: "🎤",
  teaching: "🧑‍🏫",
};

/* -------------------------------------------------------------------------
 * IMPORTANT: these sub-components live at module scope, NOT inside Editor().
 * If they were defined inside Editor, every render would create new function
 * references → React would treat each <SortableCard /> element as a new
 * component type and unmount + remount the entire subtree on every keystroke.
 * That symptom: typing in any field made the editor jump back to the top
 * (focus + scroll lost). Keeping them outside fixes that.                  */

const RemoveBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick}
    className="text-[0.7rem] text-gray-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
    title={label}>
    ✕
  </button>
);

const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all hover:-translate-y-px flex items-center gap-1">
    <span className="text-[0.9em]">+</span> {label}
  </button>
);

interface SortableCardProps {
  section: SectionKey;
  id: string;
  breakBefore?: boolean;
  onToggleBreak?: (v: boolean) => void;
  onRemove: () => void;
  onReorder: (section: SectionKey, fromId: string, toId: string) => void;
  reorderHint: string;
  breakLabel: string;
  removeLabel: string;
  children: React.ReactNode;
}

const SortableCard = ({
  section, id, breakBefore, onToggleBreak, onRemove, onReorder,
  reorderHint, breakLabel, removeLabel, children,
}: SortableCardProps) => {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/x-resume-item", `${section}:${id}`);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("opacity-50");
  };
  const onDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("opacity-50");
  };
  const onDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("text/x-resume-item")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    (e.currentTarget as HTMLElement).classList.add("ring-2", "ring-amber-400");
  };
  const onDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("ring-2", "ring-amber-400");
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove("ring-2", "ring-amber-400");
    const raw = e.dataTransfer.getData("text/x-resume-item");
    if (!raw) return;
    const [srcSection, srcId] = raw.split(":");
    if (srcSection !== section) return;
    onReorder(section, srcId, id);
  };
  return (
    <div
      className="group relative border border-gray-200/80 rounded-xl p-3 mb-2.5 bg-gradient-to-br from-gray-50/70 to-white hover:border-gray-300 hover:shadow-sm transition-all"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <span
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="text-gray-300 group-hover:text-amber-500 hover:!text-amber-600 cursor-grab active:cursor-grabbing select-none text-sm leading-none px-1 transition-colors"
            title={reorderHint}
          >⋮⋮</span>
          {onToggleBreak ? (
            <label className="flex items-center gap-1 text-[0.7rem] text-gray-500 hover:text-gray-700 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                className="accent-blue-600 w-3 h-3"
                checked={!!breakBefore}
                onChange={(e) => onToggleBreak(e.target.checked)}
              />
              ⤓ {breakLabel}
            </label>
          ) : null}
        </div>
        <RemoveBtn onClick={onRemove} label={removeLabel} />
      </div>
      {children}
    </div>
  );
};

interface SectionTitleProps {
  children: React.ReactNode;
  onAdd?: () => void;
  sectionKey?: string;
  count?: number;
  open: boolean;
  onToggle?: () => void;
  addLabel: string;
}

const SectionTitle = ({ children, onAdd, sectionKey, count, open, onToggle, addLabel }: SectionTitleProps) => {
  const collapsible = !!sectionKey;
  const icon = sectionKey ? SECTION_ICONS[sectionKey] : null;
  return (
    <button
      type="button"
      onClick={() => collapsible && onToggle?.()}
      className={`w-full flex justify-between items-center mt-4 mb-2 px-2 py-1.5 rounded-lg transition-colors ${
        collapsible ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-base leading-none">{icon}</span>}
        <h3 className="text-[0.78rem] font-semibold text-gray-700 uppercase tracking-wider">
          {children}
        </h3>
        {typeof count === "number" && count > 0 && (
          <span className="text-[0.65rem] font-mono px-1.5 py-px rounded-full bg-gray-100 text-gray-500 min-w-[1.25rem] text-center">
            {count}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onAdd && open && <AddBtn onClick={onAdd} label={addLabel} />}
        {collapsible && (
          <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        )}
      </div>
    </button>
  );
};

export function Editor() {
  const { resume, update, addItem, removeItem, reorderItem, lang } = useStore();
  const L = t(lang);
  // Collapsible state per section (open by default).
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const isOpen = (key: string) => !collapsed[key];
  const toggle = (key: string) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  const patch = <K extends SectionKey>(section: K, id: string, field: string, value: any) => {
    const list = resume[section] as any[];
    update(section, list.map((x) => (x.id === id ? { ...x, [field]: value } : x)) as Resume[K]);
  };
  const patchBasics = (field: string, value: any) =>
    update("basics", { ...resume.basics, [field]: value });

  // Stable strings to pass into module-scope sub-components.
  const reorderHint = (L.actions as any).reorderHint ?? "拖动以排序 / drag to reorder";
  const breakLabel  = L.form.breakBefore;
  const removeLabel = L.actions.remove;
  const addLabel    = L.actions.add;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateEmail = (v: string) => (!v || emailRe.test(v) ? null : L.form.invalidEmail);

  return (
    <div className="space-y-1">
      <SectionTitle sectionKey="basics" open={isOpen("basics")} onToggle={() => toggle("basics")} addLabel={addLabel}>{L.sections.basics}</SectionTitle>
      {isOpen("basics") && <>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label={L.fields.name} value={resume.basics.name} onChange={(v) => patchBasics("name", v)}
          required requiredMessage={L.form.required} />
        <Field label={L.fields.label} value={resume.basics.label} onChange={(v) => patchBasics("label", v)} />
        <Field label={L.fields.email} value={resume.basics.email} onChange={(v) => patchBasics("email", v)}
          validate={validateEmail} />
        <Field label={L.fields.phone} value={resume.basics.phone} onChange={(v) => patchBasics("phone", v)} />
        <Field label={L.fields.location} value={resume.basics.location} onChange={(v) => patchBasics("location", v)} />
        <Field label={L.fields.website} value={resume.basics.website} onChange={(v) => patchBasics("website", v)} />
      </div>
      <Field textarea label={L.fields.summary} value={resume.basics.summary} onChange={(v) => patchBasics("summary", v)} />

      {/* Avatar controls */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-1">
          <Field
            label={L.fields.avatar}
            value={resume.basics.avatar || ""}
            onChange={(v) => patchBasics("avatar", v)}
            placeholder="https://... or data:image/..."
          />
        </div>
        <label className="flex flex-col items-center gap-1 text-[0.7rem] text-gray-600 cursor-pointer shrink-0 mt-[1.55rem]">
          <input
            type="checkbox"
            className="accent-blue-600"
            checked={!!resume.basics.showAvatar}
            onChange={(e) => patchBasics("showAvatar", e.target.checked)}
          />
          <span>{L.fields.showAvatar}</span>
        </label>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="file"
          accept="image/*"
          className="text-[0.7rem]"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const dataUrl = await compressToDataURL(f, { maxBytes: 700 * 1024, maxDim: 800 });
              patchBasics("avatar", dataUrl);
              if (f.size > 700 * 1024) {
                toast.success((L.toast as any).imageCompressed ?? "已自动压缩图片");
              }
            } catch {
              toast.error(L.form.avatarTooLarge);
            }
            e.target.value = "";
          }}
        />
        {resume.basics.avatar && (
          <button
            onClick={() => { patchBasics("avatar", ""); patchBasics("showAvatar", false); }}
            className="text-[0.7rem] text-red-500 hover:underline">
            {L.actions.remove}
          </button>
        )}
      </div>

      {/* Shape + size — only relevant when the avatar is actually rendered */}
      {resume.basics.showAvatar && resume.basics.avatar && (
        <div className="border border-gray-200 rounded p-3 mb-3 bg-gray-50 space-y-2">
          <div>
            <div className="text-[0.7rem] text-gray-600 mb-1">{(L.fields as any).avatarShape}</div>
            <div className="flex flex-wrap gap-1">
              {([
                ["circle", (L.fields as any).shapeCircle],
                ["rounded", (L.fields as any).shapeRounded],
                ["square", (L.fields as any).shapeSquare],
                ["portrait", (L.fields as any).shapePortrait],
              ] as const).map(([key, lbl]) => {
                const active = (resume.basics.avatarShape || "circle") === key;
                return (
                  <button key={key} type="button"
                    onClick={() => patchBasics("avatarShape", key)}
                    className={`text-[0.7rem] px-2 py-1 rounded border ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 hover:bg-gray-100"}`}>
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[0.7rem] text-gray-600 mb-1">
              {(L.fields as any).avatarSize}: {resume.basics.avatarSize ?? 88}px
            </div>
            <input
              type="range" min={48} max={160} step={4}
              value={resume.basics.avatarSize ?? 88}
              onChange={(e) => patchBasics("avatarSize", Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
          <div className="flex items-center justify-between text-[0.7rem] text-gray-600 pt-1 border-t border-gray-200">
            <span>
              {(L.fields as any).avatarPositionHint}
              {((resume.basics.avatarOffsetX || 0) !== 0 || (resume.basics.avatarOffsetY || 0) !== 0) && (
                <span className="ml-1 font-mono text-gray-500">
                  ({resume.basics.avatarOffsetX || 0}, {resume.basics.avatarOffsetY || 0})
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => { patchBasics("avatarOffsetX", 0); patchBasics("avatarOffsetY", 0); }}
              className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100">
              {(L.fields as any).avatarReset}
            </button>
          </div>
        </div>
      )}

      {/* Reset any dragged text blocks (header / summary / contact …). Shows up
          only when at least one offset is non-zero, so 99% of users never see it. */}
      {resume.basics.blockOffsets && Object.values(resume.basics.blockOffsets).some((o: any) => (o?.x || 0) !== 0 || (o?.y || 0) !== 0) && (
        <div className="border border-amber-200 bg-amber-50 rounded-md p-2 text-[0.72rem] text-amber-900 flex items-center justify-between">
          <span>{(L.fields as any).blockOffsetsNotice ?? "文本区块有拖动位移"}</span>
          <button
            type="button"
            onClick={() => patchBasics("blockOffsets", {} as any)}
            className="px-2 py-0.5 rounded border border-amber-300 hover:bg-amber-100">
            {(L.fields as any).blockOffsetsReset ?? "全部复位"}
          </button>
        </div>
      )}

      </>}

      <SectionTitle sectionKey="work" count={resume.work.length} open={isOpen("work")} onToggle={() => toggle("work")} addLabel={addLabel} onAdd={() => addItem("work")}>{L.sections.work}</SectionTitle>
      {isOpen("work") && resume.work.map((w) => (
        <SortableCard key={w.id} section="work" id={w.id}
          onRemove={() => removeItem("work", w.id)}
          breakBefore={(w as any).breakBefore}
          onToggleBreak={(v) => patch("work", w.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.company} value={w.company} onChange={(v) => patch("work", w.id, "company", v)} />
            <Field label={L.fields.position} value={w.position} onChange={(v) => patch("work", w.id, "position", v)} />
            <DateField label={L.fields.startDate} value={w.startDate} onChange={(v) => patch("work", w.id, "startDate", v)} />
            <DateField label={L.fields.endDate} value={w.endDate} allowPresent onChange={(v) => patch("work", w.id, "endDate", v)} />
          </div>
          <Field label={L.fields.location} value={w.location || ""} onChange={(v) => patch("work", w.id, "location", v)} />
          <Field textarea rows={4} label={L.fields.highlights} value={(w.highlights || []).join("\n")}
            onChange={(v) => patch("work", w.id, "highlights", v.split("\n"))} />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="education" count={resume.education.length} open={isOpen("education")} onToggle={() => toggle("education")} addLabel={addLabel} onAdd={() => addItem("education")}>{L.sections.education}</SectionTitle>
      {isOpen("education") && resume.education.map((e) => (
        <SortableCard key={e.id} section="education" id={e.id}
          onRemove={() => removeItem("education", e.id)}
          breakBefore={(e as any).breakBefore}
          onToggleBreak={(v) => patch("education", e.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.institution} value={e.institution} onChange={(v) => patch("education", e.id, "institution", v)} />
            <Field label={L.fields.studyType} value={e.studyType} onChange={(v) => patch("education", e.id, "studyType", v)} />
            <Field label={L.fields.area} value={e.area} onChange={(v) => patch("education", e.id, "area", v)} />
            <Field label={L.fields.score} value={e.score || ""} onChange={(v) => patch("education", e.id, "score", v)} />
            <DateField label={L.fields.startDate} value={e.startDate} onChange={(v) => patch("education", e.id, "startDate", v)} />
            <DateField label={L.fields.endDate} value={e.endDate} allowPresent onChange={(v) => patch("education", e.id, "endDate", v)} />
          </div>
          <Field label={L.fields.courses} value={(e.courses || []).join(", ")}
            onChange={(v) => patch("education", e.id, "courses", v.split(",").map((x) => x.trim()).filter(Boolean))} />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="projects" count={resume.projects.length} open={isOpen("projects")} onToggle={() => toggle("projects")} addLabel={addLabel} onAdd={() => addItem("projects")}>{L.sections.projects}</SectionTitle>
      {isOpen("projects") && resume.projects.map((p) => (
        <SortableCard key={p.id} section="projects" id={p.id}
          onRemove={() => removeItem("projects", p.id)}
          breakBefore={(p as any).breakBefore}
          onToggleBreak={(v) => patch("projects", p.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.projectName} value={p.name} onChange={(v) => patch("projects", p.id, "name", v)} />
            <Field label={L.fields.url} value={p.url || ""} onChange={(v) => patch("projects", p.id, "url", v)} />
            <DateField label={L.fields.startDate} value={p.startDate || ""} onChange={(v) => patch("projects", p.id, "startDate", v)} />
            <DateField label={L.fields.endDate} value={p.endDate || ""} allowPresent onChange={(v) => patch("projects", p.id, "endDate", v)} />
          </div>
          <Field label={L.fields.description} value={p.description} onChange={(v) => patch("projects", p.id, "description", v)} />
          <Field textarea rows={3} label={L.fields.highlights} value={(p.highlights || []).join("\n")}
            onChange={(v) => patch("projects", p.id, "highlights", v.split("\n"))} />
          <Field label={L.fields.keywords} value={(p.keywords || []).join(", ")}
            onChange={(v) => patch("projects", p.id, "keywords", v.split(",").map((x) => x.trim()).filter(Boolean))} />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="skills" count={resume.skills.length} open={isOpen("skills")} onToggle={() => toggle("skills")} addLabel={addLabel} onAdd={() => addItem("skills")}>{L.sections.skills}</SectionTitle>
      {isOpen("skills") && resume.skills.map((s) => (
        <SortableCard key={s.id} section="skills" id={s.id}
          onRemove={() => removeItem("skills", s.id)}
          breakBefore={(s as any).breakBefore}
          onToggleBreak={(v) => patch("skills", s.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.skillName} value={s.name} onChange={(v) => patch("skills", s.id, "name", v)} />
            <Field label={L.fields.level} value={s.level} onChange={(v) => patch("skills", s.id, "level", v)} />
          </div>
          <Field label={L.fields.keywords} value={s.keywords.join(", ")}
            onChange={(v) => patch("skills", s.id, "keywords", v.split(",").map((x) => x.trim()).filter(Boolean))} />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="awards" count={resume.awards.length} open={isOpen("awards")} onToggle={() => toggle("awards")} addLabel={addLabel} onAdd={() => addItem("awards")}>{L.sections.awards}</SectionTitle>
      {isOpen("awards") && resume.awards.map((a) => (
        <SortableCard key={a.id} section="awards" id={a.id}
          onRemove={() => removeItem("awards", a.id)}
          breakBefore={(a as any).breakBefore}
          onToggleBreak={(v) => patch("awards", a.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.awardTitle} value={a.title} onChange={(v) => patch("awards", a.id, "title", v)} />
            <DateField label={L.fields.date} value={a.date} onChange={(v) => patch("awards", a.id, "date", v)} />
            <Field label={L.fields.awarder} value={a.awarder} onChange={(v) => patch("awards", a.id, "awarder", v)} />
          </div>
          <Field label={L.fields.summary} value={a.summary || ""} onChange={(v) => patch("awards", a.id, "summary", v)} />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="languages" count={resume.languages.length} open={isOpen("languages")} onToggle={() => toggle("languages")} addLabel={addLabel} onAdd={() => addItem("languages")}>{L.sections.languages}</SectionTitle>
      {isOpen("languages") && resume.languages.map((l) => (
        <SortableCard key={l.id} section="languages" id={l.id}
          onRemove={() => removeItem("languages", l.id)}
          breakBefore={(l as any).breakBefore}
          onToggleBreak={(v) => patch("languages", l.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.language} value={l.language} onChange={(v) => patch("languages", l.id, "language", v)} />
            <Field label={L.fields.fluency} value={l.fluency} onChange={(v) => patch("languages", l.id, "fluency", v)} />
          </div>
        </SortableCard>
      ))}

      {/* Optional academic-flavoured sections — only the academic templates
          actively render these, but the editor exposes them universally so a
          user on, say, "modern" who switches to "academic-pub" later won't
          have to re-key data. Empty arrays are silently skipped by templates. */}
      <SectionTitle sectionKey="publications" count={(resume.publications || []).length} open={isOpen("publications")} onToggle={() => toggle("publications")} addLabel={addLabel} onAdd={() => addItem("publications")}>{(L.sections as any).publications}</SectionTitle>
      {isOpen("publications") && (resume.publications || []).map((p) => (
        <SortableCard key={p.id} section="publications" id={p.id}
          onRemove={() => removeItem("publications", p.id)}
          breakBefore={(p as any).breakBefore}
          onToggleBreak={(v) => patch("publications", p.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <Field label={(L.fields as any).pubTitle} value={p.title} onChange={(v) => patch("publications", p.id, "title", v)} />
          <Field label={(L.fields as any).pubAuthors} value={p.authors || ""} onChange={(v) => patch("publications", p.id, "authors", v)} />
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={(L.fields as any).pubVenue} value={p.venue || ""} onChange={(v) => patch("publications", p.id, "venue", v)} />
            <DateField label={L.fields.date} value={p.date || ""} onChange={(v) => patch("publications", p.id, "date", v)} />
            <Field label={(L.fields as any).pubDoi} value={p.doi || ""} onChange={(v) => patch("publications", p.id, "doi", v)} />
            <Field label={L.fields.url} value={p.url || ""} onChange={(v) => patch("publications", p.id, "url", v)} />
          </div>
          <Field label={L.fields.summary} value={p.summary || ""} onChange={(v) => patch("publications", p.id, "summary", v)} />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="talks" count={(resume.talks || []).length} open={isOpen("talks")} onToggle={() => toggle("talks")} addLabel={addLabel} onAdd={() => addItem("talks")}>{(L.sections as any).talks}</SectionTitle>
      {isOpen("talks") && (resume.talks || []).map((tk) => (
        <SortableCard key={tk.id} section="talks" id={tk.id}
          onRemove={() => removeItem("talks", tk.id)}
          breakBefore={(tk as any).breakBefore}
          onToggleBreak={(v) => patch("talks", tk.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <Field label={(L.fields as any).talkTitle} value={tk.title} onChange={(v) => patch("talks", tk.id, "title", v)} />
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={(L.fields as any).talkVenue} value={tk.venue || ""} onChange={(v) => patch("talks", tk.id, "venue", v)} />
            <DateField label={L.fields.date} value={tk.date || ""} onChange={(v) => patch("talks", tk.id, "date", v)} />
            <Field label={L.fields.location} value={tk.location || ""} onChange={(v) => patch("talks", tk.id, "location", v)} />
            <Field label={L.fields.url} value={tk.url || ""} onChange={(v) => patch("talks", tk.id, "url", v)} />
          </div>
        </SortableCard>
      ))}

      <SectionTitle sectionKey="teaching" count={(resume.teaching || []).length} open={isOpen("teaching")} onToggle={() => toggle("teaching")} addLabel={addLabel} onAdd={() => addItem("teaching")}>{(L.sections as any).teaching}</SectionTitle>
      {isOpen("teaching") && (resume.teaching || []).map((tg) => (
        <SortableCard key={tg.id} section="teaching" id={tg.id}
          onRemove={() => removeItem("teaching", tg.id)}
          breakBefore={(tg as any).breakBefore}
          onToggleBreak={(v) => patch("teaching", tg.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={(L.fields as any).teachCourse} value={tg.course} onChange={(v) => patch("teaching", tg.id, "course", v)} />
            <Field label={(L.fields as any).teachInstitution} value={tg.institution || ""} onChange={(v) => patch("teaching", tg.id, "institution", v)} />
            <Field label={(L.fields as any).teachRole} value={tg.role || ""} onChange={(v) => patch("teaching", tg.id, "role", v)} />
            <Field label={L.fields.summary} value={tg.summary || ""} onChange={(v) => patch("teaching", tg.id, "summary", v)} />
            <DateField label={L.fields.startDate} value={tg.startDate || ""} onChange={(v) => patch("teaching", tg.id, "startDate", v)} />
            <DateField label={L.fields.endDate} value={tg.endDate || ""} allowPresent onChange={(v) => patch("teaching", tg.id, "endDate", v)} />
          </div>
        </SortableCard>
      ))}
    </div>
  );
}

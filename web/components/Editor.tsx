"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SectionKey, Resume } from "@/lib/schema";
import { t } from "@/lib/i18n";
import { Field } from "./Field";
import { ChipsField } from "./ChipsField";
import { BulletsField } from "./BulletsField";
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

const DuplicateBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick}
    className="text-[0.7rem] text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
    title={label}>
    ⎘
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
  onDuplicate?: () => void;
  onReorder: (section: SectionKey, fromId: string, toId: string) => void;
  reorderHint: string;
  breakLabel: string;
  removeLabel: string;
  duplicateLabel: string;
  children: React.ReactNode;
}

const SortableCard = ({
  section, id, breakBefore, onToggleBreak, onRemove, onDuplicate, onReorder,
  reorderHint, breakLabel, removeLabel, duplicateLabel, children,
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
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const top = e.clientY < rect.top + rect.height / 2;
    el.classList.add("drop-indicator");
    el.classList.toggle("drop-indicator-top", top);
    el.classList.toggle("drop-indicator-bottom", !top);
  };
  const onDragLeave = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.classList.remove("drop-indicator", "drop-indicator-top", "drop-indicator-bottom");
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.classList.remove("drop-indicator", "drop-indicator-top", "drop-indicator-bottom");
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
        <div className="flex items-center gap-2">
          {onDuplicate && <DuplicateBtn onClick={onDuplicate} label={duplicateLabel} />}
          <RemoveBtn onClick={onRemove} label={removeLabel} />
        </div>
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
  /** When provided, this section participates in section-order DnD. */
  onReorderSection?: (fromKey: string, toKey: string) => void;
  reorderSectionHint?: string;
  /** Truthy when the user renamed this section's heading via inline edit;
   *  shows a small dot in the editor so the override is discoverable. */
  customized?: boolean;
  customizedLabel?: string;
}

const SectionTitle = ({
  children, onAdd, sectionKey, count, open, onToggle, addLabel,
  onReorderSection, reorderSectionHint,
  customized, customizedLabel,
}: SectionTitleProps) => {
  const collapsible = !!sectionKey;
  const icon = sectionKey ? SECTION_ICONS[sectionKey] : null;
  const reorderable = !!onReorderSection && !!sectionKey;

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/x-section-key", sectionKey!);
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };
  const onDragOver = (e: React.DragEvent) => {
    if (!reorderable) return;
    if (!e.dataTransfer.types.includes("text/x-section-key")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const top = e.clientY < rect.top + rect.height / 2;
    el.classList.add("drop-indicator");
    el.classList.toggle("drop-indicator-top", top);
    el.classList.toggle("drop-indicator-bottom", !top);
  };
  const clearDrop = (el: HTMLElement) => {
    el.classList.remove("drop-indicator", "drop-indicator-top", "drop-indicator-bottom");
  };
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={(e) => clearDrop(e.currentTarget as HTMLElement)}
      onDrop={(e) => {
        if (!reorderable) return;
        e.preventDefault();
        clearDrop(e.currentTarget as HTMLElement);
        const fromKey = e.dataTransfer.getData("text/x-section-key");
        if (!fromKey || fromKey === sectionKey) return;
        onReorderSection!(fromKey, sectionKey!);
      }}
    >
    <button
      type="button"
      onClick={() => collapsible && onToggle?.()}
      className={`group w-full flex justify-between items-center mt-4 mb-2 px-2 py-1.5 rounded-lg transition-colors ${
        collapsible ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="flex items-center gap-2">
        {reorderable && (
          <span
            draggable
            onDragStart={onDragStart}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-300 group-hover:text-amber-500 hover:!text-amber-600 cursor-grab active:cursor-grabbing select-none text-sm leading-none transition-colors -ml-1"
            title={reorderSectionHint ?? "拖动以调整节区顺序"}
          >⋮⋮</span>
        )}
        {icon && <span className="text-base leading-none">{icon}</span>}
        <h3 className="text-[0.78rem] font-semibold text-gray-700 uppercase tracking-wider">
          {children}
        </h3>
        {typeof count === "number" && count > 0 && (
          <span className="text-[0.65rem] font-mono px-1.5 py-px rounded-full bg-gray-100 text-gray-500 min-w-[1.25rem] text-center">
            {count}
          </span>
        )}
        {customized && (
          <span
            title={customizedLabel ?? "已自定义"}
            className="text-[0.55rem] uppercase tracking-wider px-1.5 py-px rounded-full bg-amber-100 text-amber-700 border border-amber-200"
          >
            {customizedLabel ?? "已自定义"}
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
    </div>
  );
};

export function Editor() {
  const { resume, update, addItem, removeItem, duplicateItem, reorderItem, reorderSection, lang,
    addCustomSection, removeCustomSection, updateCustomSection,
    addCustomEntry, updateCustomEntry, removeCustomEntry } = useStore();
  const L = t(lang);
  // Collapsible state per section (open by default).
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const isOpen = (key: string) => !collapsed[key];
  const toggle = (key: string) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));
  const ALL_SECTIONS = ["basics","work","education","projects","skills","awards","languages","publications","talks","teaching"];
  const collapseAll = () => setCollapsed(Object.fromEntries(ALL_SECTIONS.map((k) => [k, true])));
  const expandAll = () => setCollapsed({});
  const allCollapsed = ALL_SECTIONS.every((k) => collapsed[k]);

  const patch = <K extends SectionKey>(section: K, id: string, field: string, value: any) => {
    const list = resume[section] as any[];
    update(section, list.map((x) => (x.id === id ? { ...x, [field]: value } : x)) as Resume[K]);
  };
  const patchBasics = (field: string, value: any) =>
    update("basics", { ...resume.basics, [field]: value });

  // Stable strings to pass into module-scope sub-components.
  const reorderHint = L.actions.reorderHint ?? "拖动以排序 / drag to reorder";
  const reorderSectionHint = (L.style?.sectionOrderHint) ?? "拖动调整节区顺序";
  const onReorderSection = (fromKey: string, toKey: string) =>
    reorderSection(fromKey as SectionKey, toKey as SectionKey);
  const customizedLabel = L.actions.customized ?? "已自定义";
  const isCustomized = (k: string) => !!(resume.customLabels && resume.customLabels[k]);
  const breakLabel  = L.form.breakBefore;
  const removeLabel = L.actions.remove;
  const duplicateLabel = L.actions.duplicate ?? "Duplicate";
  const addLabel    = L.actions.add;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateEmail = (v: string) => (!v || emailRe.test(v) ? null : L.form.invalidEmail);

  return (
    <div className="space-y-1">
      <div className="flex justify-end -mb-1">
        <button
          type="button"
          onClick={allCollapsed ? expandAll : collapseAll}
          className="text-[0.7rem] text-gray-500 hover:text-blue-600 transition px-2 py-1 rounded hover:bg-gray-50"
          title={allCollapsed ? (L.actions.expandAll ?? "Expand all") : (L.actions.collapseAll ?? "Collapse all")}
        >
          {allCollapsed
            ? `▾ ${L.actions.expandAll ?? "Expand all"}`
            : `▴ ${L.actions.collapseAll ?? "Collapse all"}`}
        </button>
      </div>
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
                toast.success(L.toast.imageCompressed ?? "已自动压缩图片");
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
            <div className="text-[0.7rem] text-gray-600 mb-1">{L.fields.avatarShape}</div>
            <div className="flex flex-wrap gap-1">
              {([
                ["circle", L.fields.shapeCircle],
                ["rounded", L.fields.shapeRounded],
                ["square", L.fields.shapeSquare],
                ["portrait", L.fields.shapePortrait],
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
              {L.fields.avatarSize}: {resume.basics.avatarSize ?? 88}px
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
              {L.fields.avatarPositionHint}
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
              {L.fields.avatarReset}
            </button>
          </div>
        </div>
      )}

      {/* Reset any dragged text blocks (header / summary / contact …). Shows up
          only when at least one offset is non-zero, so 99% of users never see it. */}
      {resume.basics.blockOffsets && Object.values(resume.basics.blockOffsets).some((o: any) => (o?.x || 0) !== 0 || (o?.y || 0) !== 0) && (
        <div className="border border-amber-200 bg-amber-50 rounded-md p-2 text-[0.72rem] text-amber-900 flex items-center justify-between">
          <span>{L.fields.blockOffsetsNotice ?? "文本区块有拖动位移"}</span>
          <button
            type="button"
            onClick={() => patchBasics("blockOffsets", {} as any)}
            className="px-2 py-0.5 rounded border border-amber-300 hover:bg-amber-100">
            {L.fields.blockOffsetsReset ?? "全部复位"}
          </button>
        </div>
      )}

      </>}

      <SectionTitle sectionKey="work" count={resume.work.length} open={isOpen("work")} onToggle={() => toggle("work")} addLabel={addLabel} onAdd={() => addItem("work")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("work")} customizedLabel={customizedLabel}>{L.sections.work}</SectionTitle>
      {isOpen("work") && resume.work.map((w) => (
        <SortableCard key={w.id} section="work" id={w.id}
          onRemove={() => removeItem("work", w.id)}
          onDuplicate={() => duplicateItem("work", w.id)}
          breakBefore={w.breakBefore}
          onToggleBreak={(v) => patch("work", w.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.company} value={w.company} onChange={(v) => patch("work", w.id, "company", v)} />
            <Field label={L.fields.position} value={w.position} onChange={(v) => patch("work", w.id, "position", v)} />
            <DateField label={L.fields.startDate} value={w.startDate} onChange={(v) => patch("work", w.id, "startDate", v)} />
            <DateField label={L.fields.endDate} value={w.endDate} allowPresent onChange={(v) => patch("work", w.id, "endDate", v)} />
          </div>
          <Field label={L.fields.location} value={w.location || ""} onChange={(v) => patch("work", w.id, "location", v)} />
          <BulletsField
            label={L.fields.highlights}
            value={w.highlights || []}
            onChange={(next) => patch("work", w.id, "highlights", next)}
            placeholder={L.fields.highlightPlaceholder ?? "一条职责或成果…"}
            hint={L.form.bulletsHint ?? "Enter 新增 · Backspace 删空行 · Alt+↑/↓ 调序"}
          />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="education" count={resume.education.length} open={isOpen("education")} onToggle={() => toggle("education")} addLabel={addLabel} onAdd={() => addItem("education")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("education")} customizedLabel={customizedLabel}>{L.sections.education}</SectionTitle>
      {isOpen("education") && resume.education.map((e) => (
        <SortableCard key={e.id} section="education" id={e.id}
          onRemove={() => removeItem("education", e.id)}
          onDuplicate={() => duplicateItem("education", e.id)}
          breakBefore={e.breakBefore}
          onToggleBreak={(v) => patch("education", e.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.institution} value={e.institution} onChange={(v) => patch("education", e.id, "institution", v)} />
            <Field label={L.fields.studyType} value={e.studyType} onChange={(v) => patch("education", e.id, "studyType", v)} />
            <Field label={L.fields.area} value={e.area} onChange={(v) => patch("education", e.id, "area", v)} />
            <Field label={L.fields.score} value={e.score || ""} onChange={(v) => patch("education", e.id, "score", v)} />
            <DateField label={L.fields.startDate} value={e.startDate} onChange={(v) => patch("education", e.id, "startDate", v)} />
            <DateField label={L.fields.endDate} value={e.endDate} allowPresent onChange={(v) => patch("education", e.id, "endDate", v)} />
          </div>
          <ChipsField
            label={L.fields.courses}
            value={e.courses || []}
            onChange={(next) => patch("education", e.id, "courses", next)}
            placeholder={L.fields.courses}
            hint={L.form.chipsHint ?? "Enter / 逗号 添加 · Backspace 移除"}
          />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="projects" count={resume.projects.length} open={isOpen("projects")} onToggle={() => toggle("projects")} addLabel={addLabel} onAdd={() => addItem("projects")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("projects")} customizedLabel={customizedLabel}>{L.sections.projects}</SectionTitle>
      {isOpen("projects") && resume.projects.map((p) => (
        <SortableCard key={p.id} section="projects" id={p.id}
          onRemove={() => removeItem("projects", p.id)}
          onDuplicate={() => duplicateItem("projects", p.id)}
          breakBefore={p.breakBefore}
          onToggleBreak={(v) => patch("projects", p.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.projectName} value={p.name} onChange={(v) => patch("projects", p.id, "name", v)} />
            <Field label={L.fields.url} value={p.url || ""} onChange={(v) => patch("projects", p.id, "url", v)} />
            <DateField label={L.fields.startDate} value={p.startDate || ""} onChange={(v) => patch("projects", p.id, "startDate", v)} />
            <DateField label={L.fields.endDate} value={p.endDate || ""} allowPresent onChange={(v) => patch("projects", p.id, "endDate", v)} />
          </div>
          <Field label={L.fields.description} value={p.description} onChange={(v) => patch("projects", p.id, "description", v)} />
          <BulletsField
            label={L.fields.highlights}
            value={p.highlights || []}
            onChange={(next) => patch("projects", p.id, "highlights", next)}
            placeholder={L.fields.highlightPlaceholder ?? "一条职责或成果…"}
            hint={L.form.bulletsHint ?? "Enter 新增 · Backspace 删空行 · Alt+↑/↓ 调序"}
          />
          <ChipsField
            label={L.fields.keywords}
            value={p.keywords || []}
            onChange={(next) => patch("projects", p.id, "keywords", next)}
            placeholder={L.fields.keywords}
            hint={L.form.chipsHint ?? "Enter / 逗号 添加 · Backspace 移除"}
          />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="skills" count={resume.skills.length} open={isOpen("skills")} onToggle={() => toggle("skills")} addLabel={addLabel} onAdd={() => addItem("skills")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("skills")} customizedLabel={customizedLabel}>{L.sections.skills}</SectionTitle>
      {isOpen("skills") && resume.skills.map((s) => (
        <SortableCard key={s.id} section="skills" id={s.id}
          onRemove={() => removeItem("skills", s.id)}
          onDuplicate={() => duplicateItem("skills", s.id)}
          breakBefore={s.breakBefore}
          onToggleBreak={(v) => patch("skills", s.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.skillName} value={s.name} onChange={(v) => patch("skills", s.id, "name", v)} />
            <Field label={L.fields.level} value={s.level} onChange={(v) => patch("skills", s.id, "level", v)} />
          </div>
          {/* Numeric proficiency 0-5 → renders <SkillBar> in templates that
              opt in. 0 == hide bar. Stored as `levelValue` to keep the legacy
              free-text `level` untouched for ATS/text export. */}
          <div className="flex items-center gap-2 mt-1.5 mb-1">
            <span className="text-[0.7rem] text-gray-500 select-none">
              {L.fields.levelValue ?? "等级 / Proficiency"}
            </span>
            <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
              {[0, 1, 2, 3, 4, 5].map((n) => {
                const active = (s.levelValue || 0) === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => patch("skills", s.id, "levelValue", n)}
                    className={`text-[0.7rem] px-2 py-0.5 transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    } ${n > 0 ? "border-l border-gray-200" : ""}`}
                    title={n === 0 ? "隐藏 / hide" : `${n}/5`}
                  >
                    {n === 0 ? "—" : n}
                  </button>
                );
              })}
            </div>
          </div>
          <ChipsField
            label={L.fields.keywords}
            value={s.keywords || []}
            onChange={(next) => patch("skills", s.id, "keywords", next)}
            placeholder={L.fields.keywords}
            hint={L.form.chipsHint ?? "Enter / 逗号 添加 · Backspace 移除"}
          />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="awards" count={resume.awards.length} open={isOpen("awards")} onToggle={() => toggle("awards")} addLabel={addLabel} onAdd={() => addItem("awards")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("awards")} customizedLabel={customizedLabel}>{L.sections.awards}</SectionTitle>
      {isOpen("awards") && resume.awards.map((a) => (
        <SortableCard key={a.id} section="awards" id={a.id}
          onRemove={() => removeItem("awards", a.id)}
          onDuplicate={() => duplicateItem("awards", a.id)}
          breakBefore={a.breakBefore}
          onToggleBreak={(v) => patch("awards", a.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.awardTitle} value={a.title} onChange={(v) => patch("awards", a.id, "title", v)} />
            <DateField label={L.fields.date} value={a.date} onChange={(v) => patch("awards", a.id, "date", v)} />
            <Field label={L.fields.awarder} value={a.awarder} onChange={(v) => patch("awards", a.id, "awarder", v)} />
          </div>
          <Field label={L.fields.summary} value={a.summary || ""} onChange={(v) => patch("awards", a.id, "summary", v)} />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="languages" count={resume.languages.length} open={isOpen("languages")} onToggle={() => toggle("languages")} addLabel={addLabel} onAdd={() => addItem("languages")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("languages")} customizedLabel={customizedLabel}>{L.sections.languages}</SectionTitle>
      {isOpen("languages") && resume.languages.map((l) => (
        <SortableCard key={l.id} section="languages" id={l.id}
          onRemove={() => removeItem("languages", l.id)}
          onDuplicate={() => duplicateItem("languages", l.id)}
          breakBefore={l.breakBefore}
          onToggleBreak={(v) => patch("languages", l.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
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
      <SectionTitle sectionKey="publications" count={(resume.publications || []).length} open={isOpen("publications")} onToggle={() => toggle("publications")} addLabel={addLabel} onAdd={() => addItem("publications")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("publications")} customizedLabel={customizedLabel}>{L.sections.publications}</SectionTitle>
      {isOpen("publications") && (resume.publications || []).map((p) => (
        <SortableCard key={p.id} section="publications" id={p.id}
          onRemove={() => removeItem("publications", p.id)}
          onDuplicate={() => duplicateItem("publications", p.id)}
          breakBefore={p.breakBefore}
          onToggleBreak={(v) => patch("publications", p.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
          <Field label={L.fields.pubTitle} value={p.title} onChange={(v) => patch("publications", p.id, "title", v)} />
          <Field label={L.fields.pubAuthors} value={p.authors || ""} onChange={(v) => patch("publications", p.id, "authors", v)} />
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.pubVenue} value={p.venue || ""} onChange={(v) => patch("publications", p.id, "venue", v)} />
            <DateField label={L.fields.date} value={p.date || ""} onChange={(v) => patch("publications", p.id, "date", v)} />
            <Field label={L.fields.pubDoi} value={p.doi || ""} onChange={(v) => patch("publications", p.id, "doi", v)} />
            <Field label={L.fields.url} value={p.url || ""} onChange={(v) => patch("publications", p.id, "url", v)} />
          </div>
          <Field label={L.fields.summary} value={p.summary || ""} onChange={(v) => patch("publications", p.id, "summary", v)} />
        </SortableCard>
      ))}

      <SectionTitle sectionKey="talks" count={(resume.talks || []).length} open={isOpen("talks")} onToggle={() => toggle("talks")} addLabel={addLabel} onAdd={() => addItem("talks")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("talks")} customizedLabel={customizedLabel}>{L.sections.talks}</SectionTitle>
      {isOpen("talks") && (resume.talks || []).map((tk) => (
        <SortableCard key={tk.id} section="talks" id={tk.id}
          onRemove={() => removeItem("talks", tk.id)}
          onDuplicate={() => duplicateItem("talks", tk.id)}
          breakBefore={tk.breakBefore}
          onToggleBreak={(v) => patch("talks", tk.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
          <Field label={L.fields.talkTitle} value={tk.title} onChange={(v) => patch("talks", tk.id, "title", v)} />
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.talkVenue} value={tk.venue || ""} onChange={(v) => patch("talks", tk.id, "venue", v)} />
            <DateField label={L.fields.date} value={tk.date || ""} onChange={(v) => patch("talks", tk.id, "date", v)} />
            <Field label={L.fields.location} value={tk.location || ""} onChange={(v) => patch("talks", tk.id, "location", v)} />
            <Field label={L.fields.url} value={tk.url || ""} onChange={(v) => patch("talks", tk.id, "url", v)} />
          </div>
        </SortableCard>
      ))}

      <SectionTitle sectionKey="teaching" count={(resume.teaching || []).length} open={isOpen("teaching")} onToggle={() => toggle("teaching")} addLabel={addLabel} onAdd={() => addItem("teaching")} onReorderSection={onReorderSection} reorderSectionHint={reorderSectionHint} customized={isCustomized("teaching")} customizedLabel={customizedLabel}>{L.sections.teaching}</SectionTitle>
      {isOpen("teaching") && (resume.teaching || []).map((tg) => (
        <SortableCard key={tg.id} section="teaching" id={tg.id}
          onRemove={() => removeItem("teaching", tg.id)}
          onDuplicate={() => duplicateItem("teaching", tg.id)}
          breakBefore={tg.breakBefore}
          onToggleBreak={(v) => patch("teaching", tg.id, "breakBefore", v)}
          onReorder={reorderItem} reorderHint={reorderHint} breakLabel={breakLabel} removeLabel={removeLabel} duplicateLabel={duplicateLabel}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.teachCourse} value={tg.course} onChange={(v) => patch("teaching", tg.id, "course", v)} />
            <Field label={L.fields.teachInstitution} value={tg.institution || ""} onChange={(v) => patch("teaching", tg.id, "institution", v)} />
            <Field label={L.fields.teachRole} value={tg.role || ""} onChange={(v) => patch("teaching", tg.id, "role", v)} />
            <Field label={L.fields.summary} value={tg.summary || ""} onChange={(v) => patch("teaching", tg.id, "summary", v)} />
            <DateField label={L.fields.startDate} value={tg.startDate || ""} onChange={(v) => patch("teaching", tg.id, "startDate", v)} />
            <DateField label={L.fields.endDate} value={tg.endDate || ""} allowPresent onChange={(v) => patch("teaching", tg.id, "endDate", v)} />
          </div>
        </SortableCard>
      ))}

      {/* User-defined sections (volunteer / hobbies / certifications / ...) */}
      <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase text-gray-500">
            {L.customSections?.title ?? "自定义板块"}
          </div>
          <button
            onClick={addCustomSection}
            className="text-[0.7rem] px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          >
            + {L.customSections?.add ?? "新增板块"}
          </button>
        </div>
        {(resume.customSections || []).length === 0 && (
          <div className="text-[0.7rem] text-gray-400 italic mb-2">
            {L.customSections?.empty ?? "可以加「志愿服务」「证书」「兴趣爱好」等任意板块"}
          </div>
        )}
        {(resume.customSections || []).map((sec) => (
          <div key={sec.id} className="mb-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 grid grid-cols-2 gap-x-3">
                <Field
                  label={L.customSections?.label ?? "板块名称"}
                  value={sec.label}
                  onChange={(v) => updateCustomSection(sec.id, { label: v })}
                  placeholder={L.customSections?.labelPlaceholder ?? "如：志愿服务 / 证书 / 兴趣"}
                />
                <Field
                  label={L.customSections?.description ?? "副标题（可选）"}
                  value={sec.description || ""}
                  onChange={(v) => updateCustomSection(sec.id, { description: v })}
                />
              </div>
              <button
                onClick={() => {
                  if (window.confirm(L.customSections?.removeConfirm ?? "删除这个板块？")) {
                    removeCustomSection(sec.id);
                  }
                }}
                title={L.customSections?.removeSection ?? "删除板块"}
                className="text-[0.7rem] px-2 py-1 mt-[1.55rem] rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition shrink-0"
              >
                ✕
              </button>
            </div>
            {sec.entries.map((entry) => (
              <div key={entry.id} className="mb-2 p-2.5 rounded border border-gray-200 bg-white">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[0.65rem] uppercase tracking-wider text-gray-400">
                    {L.customSections?.entry ?? "条目"}
                  </span>
                  <button
                    onClick={() => removeCustomEntry(sec.id, entry.id)}
                    className="text-[0.7rem] text-rose-500 hover:text-rose-700 transition"
                    title={L.actions.remove}
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-3">
                  <Field
                    label={L.customSections?.entryTitle ?? "标题"}
                    value={entry.title}
                    onChange={(v) => updateCustomEntry(sec.id, entry.id, { title: v })}
                  />
                  <Field
                    label={L.customSections?.entrySubtitle ?? "副标题"}
                    value={entry.subtitle || ""}
                    onChange={(v) => updateCustomEntry(sec.id, entry.id, { subtitle: v })}
                  />
                  <Field
                    label={L.customSections?.entryDate ?? "时间"}
                    value={entry.date || ""}
                    onChange={(v) => updateCustomEntry(sec.id, entry.id, { date: v })}
                    placeholder="2024 - Present"
                  />
                </div>
                <Field
                  textarea
                  label={L.customSections?.entryDescription ?? "描述"}
                  value={entry.description || ""}
                  onChange={(v) => updateCustomEntry(sec.id, entry.id, { description: v })}
                />
                <BulletsField
                  label={L.customSections?.entryHighlights ?? "要点（每行一条）"}
                  value={entry.highlights || []}
                  onChange={(v) => updateCustomEntry(sec.id, entry.id, { highlights: v })}
                  hint={L.form.bulletsHint}
                />
              </div>
            ))}
            <button
              onClick={() => addCustomEntry(sec.id)}
              className="text-[0.7rem] px-2 py-1 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
            >
              + {L.customSections?.addEntry ?? "新增条目"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

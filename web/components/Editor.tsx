"use client";
import { useStore } from "@/lib/store";
import { SectionKey, Resume } from "@/lib/schema";
import { t } from "@/lib/i18n";
import { Field } from "./Field";

export function Editor() {
  const { resume, update, addItem, removeItem, lang } = useStore();
  const L = t(lang);

  const patch = <K extends SectionKey>(section: K, id: string, field: string, value: any) => {
    const list = resume[section] as any[];
    update(section, list.map((x) => (x.id === id ? { ...x, [field]: value } : x)) as Resume[K]);
  };
  const patchBasics = (field: string, value: string) =>
    update("basics", { ...resume.basics, [field]: value });

  const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="text-xs text-red-500 hover:underline">✕ {L.actions.remove}</button>
  );
  const AddBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">+ {L.actions.add}</button>
  );
  const SectionTitle = ({ children, onAdd }: { children: React.ReactNode; onAdd?: () => void }) => (
    <div className="flex justify-between items-center mt-6 mb-2">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">{children}</h3>
      {onAdd && <AddBtn onClick={onAdd} />}
    </div>
  );
  const Card = ({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) => (
    <div className="border border-gray-200 rounded p-3 mb-3 bg-gray-50">
      <div className="flex justify-end"><RemoveBtn onClick={onRemove} /></div>
      {children}
    </div>
  );

  return (
    <div className="space-y-1">
      <SectionTitle>{L.sections.basics}</SectionTitle>
      <div className="grid grid-cols-2 gap-x-3">
        <Field label={L.fields.name} value={resume.basics.name} onChange={(v) => patchBasics("name", v)} />
        <Field label={L.fields.label} value={resume.basics.label} onChange={(v) => patchBasics("label", v)} />
        <Field label={L.fields.email} value={resume.basics.email} onChange={(v) => patchBasics("email", v)} />
        <Field label={L.fields.phone} value={resume.basics.phone} onChange={(v) => patchBasics("phone", v)} />
        <Field label={L.fields.location} value={resume.basics.location} onChange={(v) => patchBasics("location", v)} />
        <Field label={L.fields.website} value={resume.basics.website} onChange={(v) => patchBasics("website", v)} />
      </div>
      <Field textarea label={L.fields.summary} value={resume.basics.summary} onChange={(v) => patchBasics("summary", v)} />

      <SectionTitle onAdd={() => addItem("work")}>{L.sections.work}</SectionTitle>
      {resume.work.map((w) => (
        <Card key={w.id} onRemove={() => removeItem("work", w.id)}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.company} value={w.company} onChange={(v) => patch("work", w.id, "company", v)} />
            <Field label={L.fields.position} value={w.position} onChange={(v) => patch("work", w.id, "position", v)} />
            <Field label={L.fields.startDate} value={w.startDate} onChange={(v) => patch("work", w.id, "startDate", v)} />
            <Field label={L.fields.endDate} value={w.endDate} onChange={(v) => patch("work", w.id, "endDate", v)} />
          </div>
          <Field label={L.fields.location} value={w.location || ""} onChange={(v) => patch("work", w.id, "location", v)} />
          <Field textarea rows={4} label={L.fields.highlights} value={(w.highlights || []).join("\n")}
            onChange={(v) => patch("work", w.id, "highlights", v.split("\n"))} />
        </Card>
      ))}

      <SectionTitle onAdd={() => addItem("education")}>{L.sections.education}</SectionTitle>
      {resume.education.map((e) => (
        <Card key={e.id} onRemove={() => removeItem("education", e.id)}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.institution} value={e.institution} onChange={(v) => patch("education", e.id, "institution", v)} />
            <Field label={L.fields.studyType} value={e.studyType} onChange={(v) => patch("education", e.id, "studyType", v)} />
            <Field label={L.fields.area} value={e.area} onChange={(v) => patch("education", e.id, "area", v)} />
            <Field label={L.fields.score} value={e.score || ""} onChange={(v) => patch("education", e.id, "score", v)} />
            <Field label={L.fields.startDate} value={e.startDate} onChange={(v) => patch("education", e.id, "startDate", v)} />
            <Field label={L.fields.endDate} value={e.endDate} onChange={(v) => patch("education", e.id, "endDate", v)} />
          </div>
          <Field label={L.fields.courses} value={(e.courses || []).join(", ")}
            onChange={(v) => patch("education", e.id, "courses", v.split(",").map((x) => x.trim()).filter(Boolean))} />
        </Card>
      ))}

      <SectionTitle onAdd={() => addItem("projects")}>{L.sections.projects}</SectionTitle>
      {resume.projects.map((p) => (
        <Card key={p.id} onRemove={() => removeItem("projects", p.id)}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.projectName} value={p.name} onChange={(v) => patch("projects", p.id, "name", v)} />
            <Field label={L.fields.url} value={p.url || ""} onChange={(v) => patch("projects", p.id, "url", v)} />
            <Field label={L.fields.startDate} value={p.startDate || ""} onChange={(v) => patch("projects", p.id, "startDate", v)} />
            <Field label={L.fields.endDate} value={p.endDate || ""} onChange={(v) => patch("projects", p.id, "endDate", v)} />
          </div>
          <Field label={L.fields.description} value={p.description} onChange={(v) => patch("projects", p.id, "description", v)} />
          <Field textarea rows={3} label={L.fields.highlights} value={(p.highlights || []).join("\n")}
            onChange={(v) => patch("projects", p.id, "highlights", v.split("\n"))} />
          <Field label={L.fields.keywords} value={(p.keywords || []).join(", ")}
            onChange={(v) => patch("projects", p.id, "keywords", v.split(",").map((x) => x.trim()).filter(Boolean))} />
        </Card>
      ))}

      <SectionTitle onAdd={() => addItem("skills")}>{L.sections.skills}</SectionTitle>
      {resume.skills.map((s) => (
        <Card key={s.id} onRemove={() => removeItem("skills", s.id)}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.skillName} value={s.name} onChange={(v) => patch("skills", s.id, "name", v)} />
            <Field label={L.fields.level} value={s.level} onChange={(v) => patch("skills", s.id, "level", v)} />
          </div>
          <Field label={L.fields.keywords} value={s.keywords.join(", ")}
            onChange={(v) => patch("skills", s.id, "keywords", v.split(",").map((x) => x.trim()).filter(Boolean))} />
        </Card>
      ))}

      <SectionTitle onAdd={() => addItem("awards")}>{L.sections.awards}</SectionTitle>
      {resume.awards.map((a) => (
        <Card key={a.id} onRemove={() => removeItem("awards", a.id)}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.awardTitle} value={a.title} onChange={(v) => patch("awards", a.id, "title", v)} />
            <Field label={L.fields.date} value={a.date} onChange={(v) => patch("awards", a.id, "date", v)} />
            <Field label={L.fields.awarder} value={a.awarder} onChange={(v) => patch("awards", a.id, "awarder", v)} />
          </div>
          <Field label={L.fields.summary} value={a.summary || ""} onChange={(v) => patch("awards", a.id, "summary", v)} />
        </Card>
      ))}

      <SectionTitle onAdd={() => addItem("languages")}>{L.sections.languages}</SectionTitle>
      {resume.languages.map((l) => (
        <Card key={l.id} onRemove={() => removeItem("languages", l.id)}>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label={L.fields.language} value={l.language} onChange={(v) => patch("languages", l.id, "language", v)} />
            <Field label={L.fields.fluency} value={l.fluency} onChange={(v) => patch("languages", l.id, "fluency", v)} />
          </div>
        </Card>
      ))}
    </div>
  );
}

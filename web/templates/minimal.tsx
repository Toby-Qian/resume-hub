"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels, useOrderedSections, DateRange, EditableLabel, SkillBar, EB } from "./shared";

export default function Minimal({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const Row = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
    <section className="resume-section grid grid-cols-[110px_1fr] gap-4 mb-5">
      <div className="text-[0.75em] uppercase tracking-widest text-gray-400 pt-1">{title}</div>
      <div className="space-y-3">{children}</div>
    </section>
  );

  const work = resume.work.length > 0 && (
    <Row title={<EditableLabel k="work" fallback={L.workShort} />}>
      {resume.work.map((w, i) => (
        <div key={w.id} className={itemCls(w)}>
          <div className="text-[0.95em]"><b><E path={`work.${i}.position`}>{w.position}</E></b> at <E path={`work.${i}.company`}>{w.company}</E> <span className="text-gray-400">· {<DateRange startPath={`work.${i}.startDate`} endPath={`work.${i}.endDate`} start={w.startDate} end={w.endDate} />}</span></div>
          <ul className="list-[circle] ml-5 text-[0.9em] text-gray-700">
            {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
          </ul>
        </div>
      ))}
    </Row>
  );

  const education = resume.education.length > 0 && (
    <Row title={<EditableLabel k="education" fallback={L.educationShort} />}>
      {resume.education.map((e, i) => (
        <div key={e.id} className={itemCls(e, "text-[0.9em]")}>
          <b><E path={`education.${i}.institution`}>{e.institution}</E></b> — <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E> <span className="text-gray-400">· {<DateRange startPath={`education.${i}.startDate`} endPath={`education.${i}.endDate`} start={e.startDate} end={e.endDate} />}</span>
        </div>
      ))}
    </Row>
  );

  const projects = resume.projects.length > 0 && (
    <Row title={<EditableLabel k="projects" fallback={L.projects} />}>
      {resume.projects.map((p, i) => (
        <div key={p.id} className={itemCls(p, "text-[0.9em]")}>
          <b><E path={`projects.${i}.name`}>{p.name}</E></b> — <span className="text-gray-600"><E path={`projects.${i}.description`} multiline>{p.description}</E></span>
        </div>
      ))}
    </Row>
  );

  const skills = resume.skills.length > 0 && (
    <Row title={<EditableLabel k="skills" fallback={L.skills} />}>
      {resume.skills.map((s, i) => (
        <div key={s.id} className={itemCls(s, "text-[0.9em]")}><b><E path={`skills.${i}.name`}>{s.name}</E></b> — {s.keywords.join(", ")}<SkillBar value={s.levelValue} /></div>
      ))}
    </Row>
  );

  const awards = resume.awards.length > 0 && (
    <Row title={<EditableLabel k="awards" fallback={L.awards} />}>
      {resume.awards.map((a, i) => (
        <div key={a.id} className={itemCls(a, "text-[0.9em]")}><b><E path={`awards.${i}.title`}>{a.title}</E></b> — <E path={`awards.${i}.awarder`}>{a.awarder}</E> <span className="text-gray-400"><E path={`awards.${i}.date`}>{a.date}</E></span></div>
      ))}
    </Row>
  );

  const languages = resume.languages.length > 0 && (
    <Row title={<EditableLabel k="languages" fallback={L.languagesShort} />}>
      <div className="text-[0.9em]">{resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join(" · ")}</div>
    </Row>
  );

  const ordered = useOrderedSections({ work, education, projects, skills, awards, languages });

  return (
    <div style={{ padding: "var(--pad)" }}>
      <Draggable name="header" as="header" className="mb-8 flex items-center gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2.4em] font-light"><EB b={b} field="name" /></h1>
          <div className="text-[1em] text-gray-500 mt-1"><EB b={b} field="label" /></div>
        </div>
        <Avatar basics={b} size={80} rounded="sm" />
      </Draggable>

      <Row title={<EditableLabel k="contact" fallback={L.contact} />}>
        <div className="text-[0.9em] text-gray-700 space-y-0.5">
          <div><EB b={b} field="email" /></div>
          <div><EB b={b} field="phone" /></div>
          <div><EB b={b} field="location" /></div>
          <div><EB b={b} field="website" /></div>
        </div>
      </Row>

      <Row title={<EditableLabel k="summary" fallback={L.about} />}>
        <Draggable name="summary"><p className="text-[0.95em]"><EB b={b} field="summary" multiline /></p></Draggable>
      </Row>

      {ordered}
    </div>
  );
}

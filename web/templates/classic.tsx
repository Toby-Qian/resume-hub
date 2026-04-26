"use client";
import { TemplateProps, Section, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

export default function Classic({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <Draggable name="header" as="header" className="text-center mb-6 pb-4 border-b-2 border-gray-800">
        {b.showAvatar && b.avatar && (
          <div className="flex justify-center mb-3">
            <Avatar basics={b} size={90} rounded="full" />
          </div>
        )}
        <h1 className="text-[2.2em] font-bold tracking-wider"><E path="basics.name">{b.name}</E></h1>
        <div className="text-[1em] italic text-gray-700 mt-1"><E path="basics.label">{b.label}</E></div>
        <div className="text-[0.85em] text-gray-600 mt-2 flex flex-wrap justify-center gap-x-3">
          <E path="basics.email">{b.email}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.phone">{b.phone}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.location">{b.location}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.website">{b.website}</E>
        </div>
      </Draggable>
      <Draggable name="summary"><p className="mb-5 text-[0.95em] italic text-center"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.education.length > 0 && (
        <Section title={L.education}>
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e)}>
              <div className="flex justify-between">
                <div><b><E path={`education.${i}.institution`}>{e.institution}</E></b> — <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E></div>
                <div className="text-[0.9em]">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-[0.9em] text-gray-700"><E path={`education.${i}.score`}>{e.score}</E></div>}
            </div>
          ))}
        </Section>
      )}

      {resume.work.length > 0 && (
        <Section title={L.experience}>
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w)}>
              <div className="flex justify-between">
                <div><b><E path={`work.${i}.company`}>{w.company}</E></b> — <i><E path={`work.${i}.position`}>{w.position}</E></i></div>
                <div className="text-[0.9em]">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-6 mt-1 text-[0.92em]">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.projects.length > 0 && (
        <Section title={L.projects}>
          {resume.projects.map((p, i) => (
            <div key={p.id} className={itemCls(p)}>
              <div className="flex justify-between">
                <div><b><E path={`projects.${i}.name`}>{p.name}</E></b>{p.url && <span className="text-[0.85em] text-gray-600"> — <E path={`projects.${i}.url`}>{p.url}</E></span>}</div>
                <div className="text-[0.9em]">{range(p.startDate, p.endDate)}</div>
              </div>
              <div className="text-[0.9em]"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>
              <ul className="list-disc ml-6 text-[0.92em]">
                {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.skills.length > 0 && (
        <Section title={L.skills}>
          {resume.skills.map((s, i) => (
            <div key={s.id} className={itemCls(s, "text-[0.92em]")}>
              <b><E path={`skills.${i}.name`}>{s.name}</E>:</b> {s.keywords.join(", ")}
            </div>
          ))}
        </Section>
      )}

      {resume.awards.length > 0 && (
        <Section title={L.honorsAndAwards}>
          {resume.awards.map((a, i) => (
            <div key={a.id} className={itemCls(a, "text-[0.92em]")}>
              <b><E path={`awards.${i}.title`}>{a.title}</E></b>, <E path={`awards.${i}.awarder`}>{a.awarder}</E> <span className="text-gray-600">(<E path={`awards.${i}.date`}>{a.date}</E>)</span>
              {a.summary && <div><E path={`awards.${i}.summary`} multiline>{a.summary}</E></div>}
            </div>
          ))}
        </Section>
      )}

      {resume.languages.length > 0 && (
        <Section title={L.languages}>
          <div className="text-[0.92em]">
            {resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join(" · ")}
          </div>
        </Section>
      )}
    </div>
  );
}

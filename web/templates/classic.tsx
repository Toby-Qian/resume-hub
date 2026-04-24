"use client";
import { TemplateProps, Section, range, itemCls, Avatar, E, Draggable } from "./shared";

export default function Classic({ resume }: TemplateProps) {
  const b = resume.basics;
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
        <Section title="Education">
          {resume.education.map((e) => (
            <div key={e.id} className={itemCls(e)}>
              <div className="flex justify-between">
                <div><b>{e.institution}</b> — {e.studyType}, {e.area}</div>
                <div className="text-[0.9em]">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-[0.9em] text-gray-700">{e.score}</div>}
            </div>
          ))}
        </Section>
      )}

      {resume.work.length > 0 && (
        <Section title="Experience">
          {resume.work.map((w) => (
            <div key={w.id} className={itemCls(w)}>
              <div className="flex justify-between">
                <div><b>{w.company}</b> — <i>{w.position}</i></div>
                <div className="text-[0.9em]">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-6 mt-1 text-[0.92em]">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.projects.length > 0 && (
        <Section title="Projects">
          {resume.projects.map((p) => (
            <div key={p.id} className={itemCls(p)}>
              <div className="flex justify-between">
                <div><b>{p.name}</b>{p.url && <span className="text-[0.85em] text-gray-600"> — {p.url}</span>}</div>
                <div className="text-[0.9em]">{range(p.startDate, p.endDate)}</div>
              </div>
              <div className="text-[0.9em]">{p.description}</div>
              <ul className="list-disc ml-6 text-[0.92em]">
                {p.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.skills.length > 0 && (
        <Section title="Skills">
          {resume.skills.map((s) => (
            <div key={s.id} className={itemCls(s, "text-[0.92em]")}>
              <b>{s.name}:</b> {s.keywords.join(", ")}
            </div>
          ))}
        </Section>
      )}

      {resume.awards.length > 0 && (
        <Section title="Honors & Awards">
          {resume.awards.map((a) => (
            <div key={a.id} className={itemCls(a, "text-[0.92em]")}>
              <b>{a.title}</b>, {a.awarder} <span className="text-gray-600">({a.date})</span>
              {a.summary && <div>{a.summary}</div>}
            </div>
          ))}
        </Section>
      )}

      {resume.languages.length > 0 && (
        <Section title="Languages">
          <div className="text-[0.92em]">
            {resume.languages.map((l) => `${l.language} (${l.fluency})`).join(" · ")}
          </div>
        </Section>
      )}
    </div>
  );
}

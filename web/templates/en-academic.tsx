"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

export default function ENAcademic({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.82em] uppercase tracking-[0.2em] font-bold mt-5 mb-2 pb-1 border-b border-gray-400">{children}</h2>
  );
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <Draggable name="header" as="header" className="text-center mb-3">
        {b.showAvatar && b.avatar && (
          <div className="flex justify-center mb-2"><Avatar basics={b} size={88} rounded="full" /></div>
        )}
        <h1 className="text-[2.2em] font-bold"><E path="basics.name">{b.name}</E></h1>
        <div className="text-[0.9em] text-gray-700 mt-1 flex flex-wrap justify-center gap-x-3">
          <E path="basics.location">{b.location}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.phone">{b.phone}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.email">{b.email}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.website">{b.website}</E>
        </div>
      </Draggable>
      <Draggable name="summary"><p className="text-[0.95em] text-justify"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.education.length > 0 && (
        <>
          <H>{L.education}</H>
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e, "mb-2 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><i><E path={`education.${i}.institution`}>{e.institution}</E></i></div>
                <div>{range(e.startDate, e.endDate)}</div>
              </div>
              <div><E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E>{e.score ? `. ${e.score}` : ""}</div>
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <>
          <H>{L.appointments}</H>
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w, "mb-3 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b><E path={`work.${i}.position`}>{w.position}</E></b>, <i><E path={`work.${i}.company`}>{w.company}</E></i></div>
                <div>{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5 mt-1">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <>
          <H>{L.publications}</H>
          {resume.projects.map((p, i) => (
            <div key={p.id} className={itemCls(p, "mb-2 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b><E path={`projects.${i}.name`}>{p.name}</E></b></div>
                <div>{range(p.startDate, p.endDate)}</div>
              </div>
              <div><E path={`projects.${i}.description`} multiline>{p.description}</E></div>
              {p.url && <div className="text-[0.85em] text-gray-600"><E path={`projects.${i}.url`}>{p.url}</E></div>}
            </div>
          ))}
        </>
      )}

      {resume.awards.length > 0 && (
        <>
          <H>{L.honorsAndAwards}</H>
          <ul className="list-disc ml-5 text-[0.95em]">
            {resume.awards.map((a, i) => (
              <li key={a.id} className={itemCls(a)}><b><E path={`awards.${i}.title`}>{a.title}</E></b>, <E path={`awards.${i}.awarder`}>{a.awarder}</E> (<E path={`awards.${i}.date`}>{a.date}</E>){a.summary && `. ${a.summary}`}</li>
            ))}
          </ul>
        </>
      )}

      {resume.publications && resume.publications.length > 0 && (
        <>
          <H>{L.publicationsOnly}</H>
          <ol className="text-[0.93em] space-y-1 ml-1">
            {resume.publications.map((p, i) => (
              <li key={p.id} className={itemCls(p, "flex gap-2")}>
                <span className="font-mono text-gray-600 shrink-0">[{i + 1}]</span>
                <div>
                  {p.authors && <span className="text-gray-700"><E path={`publications.${i}.authors`}>{p.authors}</E>. </span>}
                  <b><E path={`publications.${i}.title`}>{p.title}</E></b>
                  {p.venue && <>. <i><E path={`publications.${i}.venue`}>{p.venue}</E></i></>}
                  {p.date && <span className="text-gray-600"> ({p.date})</span>}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {resume.talks && resume.talks.length > 0 && (
        <>
          <H>{L.talks}</H>
          <ul className="list-disc ml-5 text-[0.93em]">
            {resume.talks.map((tk, i) => (
              <li key={tk.id} className={itemCls(tk)}>
                <b><E path={`talks.${i}.title`}>{tk.title}</E></b>{tk.venue && <>, <i><E path={`talks.${i}.venue`}>{tk.venue}</E></i></>}{tk.date && <span className="text-gray-600"> ({tk.date})</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      {resume.teaching && resume.teaching.length > 0 && (
        <>
          <H>{L.teaching}</H>
          {resume.teaching.map((tg, i) => (
            <div key={tg.id} className={itemCls(tg, "mb-1.5 text-[0.93em]")}>
              <div className="flex justify-between">
                <div><b><E path={`teaching.${i}.course`}>{tg.course}</E></b>{tg.institution && <>, <i><E path={`teaching.${i}.institution`}>{tg.institution}</E></i></>}{tg.role && <span className="text-gray-600"> · <E path={`teaching.${i}.role`}>{tg.role}</E></span>}</div>
                <div className="text-gray-600">{range(tg.startDate, tg.endDate)}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <H>{L.technicalSkills}</H>
          <div className="text-[0.93em] space-y-0.5">
            {resume.skills.map((s, i) => (
              <div key={s.id} className={itemCls(s)}><b><E path={`skills.${i}.name`}>{s.name}</E>:</b> {s.keywords.join(", ")}</div>
            ))}
          </div>
        </>
      )}

      {resume.languages.length > 0 && (
        <>
          <H>{L.languages}</H>
          <div className="text-[0.93em]">{resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join("; ")}</div>
        </>
      )}
    </div>
  );
}

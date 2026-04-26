"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

export default function CNFormal({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[1em] font-bold mb-2 pl-2 mt-4" style={{ borderLeft: "4px solid var(--resume-accent)" }}>{children}</h2>
  );
  return (
    <div style={{ padding: "var(--pad)" }}>
      <Draggable name="header" as="header" className="flex justify-between items-end pb-3 mb-4 border-b-2 gap-4" >
        <div className="flex items-end gap-4 min-w-0" style={{ borderColor: "var(--resume-accent)" }}>
          <Avatar basics={b} size={88} rounded="md" />
          <div>
            <h1 className="text-[2em] font-bold"><E path="basics.name">{b.name}</E></h1>
            <div className="text-[1em] text-gray-700 mt-1"><E path="basics.label">{b.label}</E></div>
          </div>
        </div>
        <div className="text-[0.85em] text-right text-gray-700 space-y-0.5">
          <div>电话：<E path="basics.phone">{b.phone}</E></div>
          <div>邮箱：<E path="basics.email">{b.email}</E></div>
          <div>城市：<E path="basics.location">{b.location}</E></div>
          <div>主页：<E path="basics.website">{b.website}</E></div>
        </div>
      </Draggable>
      <Draggable name="summary"><H>{L.summary}</H><p className="text-[0.95em]"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.education.length > 0 && (
        <>
          <H>{L.education}</H>
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e, "mb-2 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b><E path={`education.${i}.institution`}>{e.institution}</E></b> · <E path={`education.${i}.studyType`}>{e.studyType}</E> · <E path={`education.${i}.area`}>{e.area}</E></div>
                <div className="text-gray-500">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-gray-700"><E path={`education.${i}.score`}>{e.score}</E></div>}
              {e.courses && e.courses.length > 0 && <div className="text-gray-600 text-[0.9em]">主修：{e.courses.join("、")}</div>}
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <>
          <H>{L.experience}</H>
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w, "mb-3 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b><E path={`work.${i}.company`}>{w.company}</E></b> · <E path={`work.${i}.position`}>{w.position}</E></div>
                <div className="text-gray-500">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5 mt-1">
                {w.highlights.map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <>
          <H>{L.projects}</H>
          {resume.projects.map((p, i) => (
            <div key={p.id} className={itemCls(p, "mb-3 text-[0.95em]")}>
              <div className="flex justify-between">
                <div><b><E path={`projects.${i}.name`}>{p.name}</E></b>{p.keywords && p.keywords.length > 0 && <span className="text-gray-500"> · {p.keywords.join("/")}</span>}</div>
                <div className="text-gray-500">{range(p.startDate, p.endDate)}</div>
              </div>
              <div className="text-gray-700"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>
              <ul className="list-disc ml-5">
                {p.highlights.map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <H>{L.skills}</H>
          <ul className="list-disc ml-5 text-[0.95em]">
            {resume.skills.map((s) => (
              <li key={s.id} className={itemCls(s)}><b>{s.name}</b>{s.level && `（${s.level}）`}：{s.keywords.join("、")}</li>
            ))}
          </ul>
        </>
      )}

      {resume.awards.length > 0 && (
        <>
          <H>{L.awards}</H>
          <ul className="list-disc ml-5 text-[0.95em]">
            {resume.awards.map((a) => (
              <li key={a.id} className={itemCls(a)}><b>{a.title}</b> · {a.awarder} · {a.date}{a.summary && ` — ${a.summary}`}</li>
            ))}
          </ul>
        </>
      )}

      {resume.languages.length > 0 && (
        <>
          <H>{L.languages}</H>
          <div className="text-[0.95em]">
            {resume.languages.map((l) => `${l.language}（${l.fluency}）`).join(" · ")}
          </div>
        </>
      )}
    </div>
  );
}

"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

/**
 * Publication-first CV. Projects are rendered as a numbered publication list
 * [1], [2], … with corresponding-author bolding via description text.
 * Best when your output is the story — graduate students on the market,
 * research scientists, etc.
 */
export default function AcademicPub({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.92em] font-bold mt-4 mb-2 pb-0.5 border-b-2"
      style={{ borderColor: "var(--resume-accent)" }}>
      {children}
    </h2>
  );
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <Draggable name="header" as="header" className="flex items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2em] font-bold"><E path="basics.name">{b.name}</E></h1>
          <div className="text-[0.95em] italic text-gray-700"><E path="basics.label">{b.label}</E></div>
          <div className="text-[0.82em] text-gray-600 mt-1 flex flex-wrap gap-x-3">
            <E path="basics.email">{b.email}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.phone">{b.phone}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.website">{b.website}</E>
            <span className="text-gray-400">·</span>
            <E path="basics.location">{b.location}</E>
          </div>
          <Draggable name="summary"><p className="text-[0.9em] mt-2 text-gray-800"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>
        </div>
        <Avatar basics={b} size={88} />
      </Draggable>

      <H>{L.publicationsOnly}</H>
      {resume.projects.length === 0 ? (
        <div className="text-[0.88em] italic text-gray-500">No publications yet.</div>
      ) : (
        <ol className="text-[0.9em] space-y-1.5">
          {resume.projects.map((p, i) => (
            <li key={p.id} className={itemCls(p, "flex gap-2")}>
              <span className="font-mono text-gray-600 shrink-0">[{i + 1}]</span>
              <div className="min-w-0">
                <b><E path={`projects.${i}.name`}>{p.name}</E></b>
                {p.description && <span>. <E path={`projects.${i}.description`} multiline>{p.description}</E></span>}
                {(p.startDate || p.endDate) && <span className="text-gray-600"> ({range(p.startDate, p.endDate)})</span>}
                {p.url && <div className="text-[0.85em] text-gray-600 break-all"><E path={`projects.${i}.url`}>{p.url}</E></div>}
                {p.keywords && p.keywords.length > 0 && (
                  <div className="text-[0.82em] text-gray-500">keywords: {p.keywords.join(", ")}</div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {resume.education.length > 0 && (
        <><H>{L.education}</H>
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e, "mb-1.5 text-[0.9em]")}>
              <div className="flex justify-between">
                <div><i><E path={`education.${i}.institution`}>{e.institution}</E></i>, <E path={`education.${i}.studyType`}>{e.studyType}</E> in <E path={`education.${i}.area`}>{e.area}</E></div>
                <div className="text-gray-600">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-gray-700"><E path={`education.${i}.score`}>{e.score}</E></div>}
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <><H>{L.appointments}</H>
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w, "mb-2 text-[0.9em]")}>
              <div className="flex justify-between">
                <div><b><E path={`work.${i}.position`}>{w.position}</E></b>, <i><E path={`work.${i}.company`}>{w.company}</E></i></div>
                <div className="text-gray-600">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.awards.length > 0 && (
        <><H>{L.honorsAndGrants}</H>
          <ul className="list-disc ml-5 text-[0.9em]">
            {resume.awards.map((a, i) => (
              <li key={a.id} className={itemCls(a)}>
                <b><E path={`awards.${i}.title`}>{a.title}</E></b>, <i><E path={`awards.${i}.awarder`}>{a.awarder}</E></i>, <E path={`awards.${i}.date`}>{a.date}</E>{a.summary && `. ${a.summary}`}
              </li>
            ))}
          </ul>
        </>
      )}

      {(resume.skills.length > 0 || resume.languages.length > 0) && (
        <><H>{`${L.skills} & ${L.languages}`}</H>
          <div className="text-[0.88em] space-y-0.5">
            {resume.skills.map((s, i) => (
              <div key={s.id} className={itemCls(s)}><b><E path={`skills.${i}.name`}>{s.name}</E>:</b> {s.keywords.join(", ")}</div>
            ))}
            {resume.languages.length > 0 && (
              <div>{resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join("; ")}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

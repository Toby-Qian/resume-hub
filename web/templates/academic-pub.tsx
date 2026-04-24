"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable } from "./shared";

/**
 * Publication-first CV. Projects are rendered as a numbered publication list
 * [1], [2], … with corresponding-author bolding via description text.
 * Best when your output is the story — graduate students on the market,
 * research scientists, etc.
 */
export default function AcademicPub({ resume }: TemplateProps) {
  const b = resume.basics;
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

      <H>Publications</H>
      {resume.projects.length === 0 ? (
        <div className="text-[0.88em] italic text-gray-500">No publications yet.</div>
      ) : (
        <ol className="text-[0.9em] space-y-1.5">
          {resume.projects.map((p, i) => (
            <li key={p.id} className={itemCls(p, "flex gap-2")}>
              <span className="font-mono text-gray-600 shrink-0">[{i + 1}]</span>
              <div className="min-w-0">
                <b>{p.name}</b>
                {p.description && <span>. {p.description}</span>}
                {(p.startDate || p.endDate) && <span className="text-gray-600"> ({range(p.startDate, p.endDate)})</span>}
                {p.url && <div className="text-[0.85em] text-gray-600 break-all">{p.url}</div>}
                {p.keywords && p.keywords.length > 0 && (
                  <div className="text-[0.82em] text-gray-500">keywords: {p.keywords.join(", ")}</div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {resume.education.length > 0 && (
        <><H>Education</H>
          {resume.education.map((e) => (
            <div key={e.id} className={itemCls(e, "mb-1.5 text-[0.9em]")}>
              <div className="flex justify-between">
                <div><i>{e.institution}</i>, {e.studyType} in {e.area}</div>
                <div className="text-gray-600">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-gray-700">{e.score}</div>}
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <><H>Research Experience</H>
          {resume.work.map((w) => (
            <div key={w.id} className={itemCls(w, "mb-2 text-[0.9em]")}>
              <div className="flex justify-between">
                <div><b>{w.position}</b>, <i>{w.company}</i></div>
                <div className="text-gray-600">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.awards.length > 0 && (
        <><H>Fellowships & Awards</H>
          <ul className="list-disc ml-5 text-[0.9em]">
            {resume.awards.map((a) => (
              <li key={a.id} className={itemCls(a)}>
                <b>{a.title}</b>, <i>{a.awarder}</i>, {a.date}{a.summary && `. ${a.summary}`}
              </li>
            ))}
          </ul>
        </>
      )}

      {(resume.skills.length > 0 || resume.languages.length > 0) && (
        <><H>Skills & Languages</H>
          <div className="text-[0.88em] space-y-0.5">
            {resume.skills.map((s) => (
              <div key={s.id} className={itemCls(s)}><b>{s.name}:</b> {s.keywords.join(", ")}</div>
            ))}
            {resume.languages.length > 0 && (
              <div>{resume.languages.map((l) => `${l.language} (${l.fluency})`).join("; ")}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

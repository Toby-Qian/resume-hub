"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

/**
 * The quintessential CV: serif body, "Curriculum Vitae" banner, centered
 * name, plain section headers with a thin rule. Low visual noise so the
 * content carries the weight. Inspired by Oxford / Cambridge academic CVs.
 */
export default function AcademicClassic({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.95em] font-bold tracking-wide mt-5 mb-2 pb-1 border-b border-gray-500">
      {children}
    </h2>
  );
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <div className="text-center text-[0.8em] tracking-[0.3em] uppercase text-gray-600 mb-2">
        {L.cv}
      </div>
      <Draggable name="header" as="header" className="text-center border-b-2 border-gray-700 pb-3 mb-4">
        {b.showAvatar && b.avatar && (
          <div className="flex justify-center mb-3"><Avatar basics={b} size={96} /></div>
        )}
        <h1 className="text-[2.1em] font-bold"><E path="basics.name">{b.name}</E></h1>
        <div className="text-[0.95em] italic text-gray-700 mt-1"><E path="basics.label">{b.label}</E></div>
        <div className="text-[0.82em] text-gray-600 mt-2 flex flex-wrap justify-center gap-x-3">
          <E path="basics.email">{b.email}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.phone">{b.phone}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.location">{b.location}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.website">{b.website}</E>
        </div>
      </Draggable>
      <Draggable name="summary"><p className="text-[0.92em] text-justify italic mb-3"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.education.length > 0 && (
        <><H>{L.education}</H>
          {resume.education.map((e, i) => (
            <div key={e.id} className={itemCls(e, "mb-2 text-[0.93em]")}>
              <div className="flex justify-between">
                <div><i><E path={`education.${i}.institution`}>{e.institution}</E></i> — <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E></div>
                <div className="text-gray-600">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-gray-700"><E path={`education.${i}.score`}>{e.score}</E></div>}
              {e.courses && e.courses.length > 0 && (
                <div className="text-[0.88em] text-gray-600 italic">{L.coursework}: {e.courses.join("; ")}</div>
              )}
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <><H>{L.appointments}</H>
          {resume.work.map((w, i) => (
            <div key={w.id} className={itemCls(w, "mb-3 text-[0.93em]")}>
              <div className="flex justify-between">
                <div><b><E path={`work.${i}.position`}>{w.position}</E></b>, <i><E path={`work.${i}.company`}>{w.company}</E></i>{w.location && ` — ${w.location}`}</div>
                <div className="text-gray-600">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5 mt-0.5">
                {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <><H>{L.publications}</H>
          {resume.projects.map((p, idx) => (
            <div key={p.id} className={itemCls(p, "mb-2 text-[0.92em]")}>
              <div>
                <span className="font-mono text-[0.85em] text-gray-600 mr-1">[{idx + 1}]</span>
                <b><E path={`projects.${idx}.name`}>{p.name}</E></b>
                {p.url && <span className="text-[0.85em] text-gray-600"> — <E path={`projects.${idx}.url`}>{p.url}</E></span>}
                {(p.startDate || p.endDate) && <span className="text-gray-600"> ({range(p.startDate, p.endDate)})</span>}
              </div>
              {p.description && <div className="text-gray-700 pl-5"><E path={`projects.${idx}.description`} multiline>{p.description}</E></div>}
            </div>
          ))}
        </>
      )}

      {resume.awards.length > 0 && (
        <><H>{L.honorsAndGrants}</H>
          <ul className="list-disc ml-5 text-[0.92em]">
            {resume.awards.map((a, i) => (
              <li key={a.id} className={itemCls(a)}>
                <b><E path={`awards.${i}.title`}>{a.title}</E></b>, <i><E path={`awards.${i}.awarder`}>{a.awarder}</E></i> (<E path={`awards.${i}.date`}>{a.date}</E>){a.summary && `. ${a.summary}`}
              </li>
            ))}
          </ul>
        </>
      )}

      {resume.skills.length > 0 && (
        <><H>{L.technicalSkills}</H>
          <div className="text-[0.92em]">
            {resume.skills.map((s, i) => (
              <div key={s.id} className={itemCls(s)}><b><E path={`skills.${i}.name`}>{s.name}</E>:</b> {s.keywords.join(", ")}</div>
            ))}
          </div>
        </>
      )}

      {resume.publications && resume.publications.length > 0 && (
        <><H>{L.publicationsOnly}</H>
          <ol className="text-[0.92em] space-y-1">
            {resume.publications.map((p, i) => (
              <li key={p.id} className={itemCls(p, "flex gap-2")}>
                <span className="font-mono text-gray-600 shrink-0">[{i + 1}]</span>
                <div>
                  {p.authors && <span className="text-gray-700"><E path={`publications.${i}.authors`}>{p.authors}</E>. </span>}
                  <b><E path={`publications.${i}.title`}>{p.title}</E></b>
                  {p.venue && <>. <i><E path={`publications.${i}.venue`}>{p.venue}</E></i></>}
                  {p.date && <span className="text-gray-600"> ({p.date})</span>}
                  {p.doi && <span className="text-[0.88em] text-gray-600"> · doi: <E path={`publications.${i}.doi`}>{p.doi}</E></span>}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {resume.talks && resume.talks.length > 0 && (
        <><H>{L.talks}</H>
          <ul className="list-disc ml-5 text-[0.92em]">
            {resume.talks.map((tk, i) => (
              <li key={tk.id} className={itemCls(tk)}>
                <b><E path={`talks.${i}.title`}>{tk.title}</E></b>{tk.venue && <>, <i><E path={`talks.${i}.venue`}>{tk.venue}</E></i></>}{tk.date && <span className="text-gray-600"> ({tk.date})</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      {resume.teaching && resume.teaching.length > 0 && (
        <><H>{L.teaching}</H>
          {resume.teaching.map((tg, i) => (
            <div key={tg.id} className={itemCls(tg, "mb-1.5 text-[0.92em]")}>
              <div className="flex justify-between">
                <div><b><E path={`teaching.${i}.course`}>{tg.course}</E></b>{tg.institution && <>, <i><E path={`teaching.${i}.institution`}>{tg.institution}</E></i></>}{tg.role && <span className="text-gray-600"> · <E path={`teaching.${i}.role`}>{tg.role}</E></span>}</div>
                <div className="text-gray-600">{range(tg.startDate, tg.endDate)}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {resume.languages.length > 0 && (
        <><H>{L.languages}</H>
          <div className="text-[0.92em]">{resume.languages.map((l, i) => `${l.language} (${l.fluency})`).join("; ")}</div>
        </>
      )}
    </div>
  );
}

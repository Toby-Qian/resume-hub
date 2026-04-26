"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

/**
 * Magazine / editorial layout — inspired by The New Yorker / NYT feature
 * pages. Big serif name as a masthead, italic kicker line, two-column
 * body with a drop-cap on the summary. Section headers are small caps
 * with a thin rule. Reads great when the user has substantial prose.
 *
 * NOTE: a true CSS column-flow layout would make individual entries
 * break across columns mid-bullet. We instead split sections explicitly
 * across two columns by alternating placement, keeping each entry whole.
 */
export default function Magazine({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const Head = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[0.78em] font-bold uppercase tracking-[0.32em] text-gray-700 mt-4 mb-2 pb-1 border-b border-gray-400 first:mt-0">
      {children}
    </h2>
  );
  return (
    <div style={{ padding: "var(--pad)", fontFamily: "var(--resume-font-serif)" }}>
      <Draggable name="header" as="header" className="text-center pb-3 mb-3" >
        <div className="text-[0.7em] tracking-[0.4em] uppercase text-gray-500 mb-1">— {L.cv} —</div>
        <h1 className="text-[3.2em] font-bold leading-none tracking-tight"
          style={{ fontFamily: "var(--resume-font-serif)" }}>
          <E path="basics.name">{b.name}</E>
        </h1>
        <div className="flex justify-center my-2">
          <div className="h-px bg-gray-700" style={{ width: "40%" }} />
          <div className="px-3 italic text-[0.92em] text-gray-700 -mt-2"><E path="basics.label">{b.label}</E></div>
          <div className="h-px bg-gray-700" style={{ width: "40%" }} />
        </div>
        <div className="text-[0.82em] text-gray-700 mt-2 flex flex-wrap justify-center gap-x-3 gap-y-0.5 italic">
          <E path="basics.email">{b.email}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.phone">{b.phone}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.location">{b.location}</E>
          <span className="text-gray-400">·</span>
          <E path="basics.website">{b.website}</E>
        </div>
        {b.showAvatar && b.avatar && (
          <div className="flex justify-center mt-3"><Avatar basics={b} size={108} rounded="sm" /></div>
        )}
      </Draggable>

      <Draggable name="summary">
        <p className="text-[0.96em] text-justify mb-4 first-letter:text-[3em] first-letter:font-bold first-letter:float-left first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1"
          style={{ color: "#111827" }}>
          <E path="basics.summary" multiline>{b.summary}</E>
        </p>
      </Draggable>

      <div className="grid grid-cols-2 gap-x-6">
        {/* Left column: Experience + Education */}
        <div>
          {resume.work.length > 0 && (
            <>
              <Head>{L.experience}</Head>
              {resume.work.map((w, i) => (
                <div key={w.id} className={itemCls(w, "mb-3 text-[0.9em]")}>
                  <div className="font-semibold"><E path={`work.${i}.position`}>{w.position}</E></div>
                  <div className="italic text-gray-700"><E path={`work.${i}.company`}>{w.company}</E>{w.location && <> · <E path={`work.${i}.location`}>{w.location}</E></>}</div>
                  <div className="text-[0.82em] text-gray-500 mb-1">{range(w.startDate, w.endDate)}</div>
                  <ul className="list-disc ml-5">
                    {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
                  </ul>
                </div>
              ))}
            </>
          )}

          {resume.education.length > 0 && (
            <>
              <Head>{L.education}</Head>
              {resume.education.map((e, i) => (
                <div key={e.id} className={itemCls(e, "mb-2 text-[0.9em]")}>
                  <div className="font-semibold"><E path={`education.${i}.institution`}>{e.institution}</E></div>
                  <div className="italic"><E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E></div>
                  <div className="text-[0.82em] text-gray-500">{range(e.startDate, e.endDate)}{e.score && <> · <E path={`education.${i}.score`}>{e.score}</E></>}</div>
                  {e.courses && e.courses.length > 0 && (
                    <div className="text-[0.85em] text-gray-600 italic">{L.coursework}: {e.courses.join("; ")}</div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right column: Projects + Awards + Skills + Languages */}
        <div>
          {resume.projects.length > 0 && (
            <>
              <Head>{L.projects}</Head>
              {resume.projects.map((p, i) => (
                <div key={p.id} className={itemCls(p, "mb-3 text-[0.9em]")}>
                  <div className="font-semibold"><E path={`projects.${i}.name`}>{p.name}</E></div>
                  <div className="text-[0.82em] text-gray-500">{range(p.startDate, p.endDate)}</div>
                  {p.description && <div className="text-gray-800 mt-0.5"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>}
                  {p.highlights.filter(Boolean).length > 0 && (
                    <ul className="list-disc ml-5 mt-0.5">
                      {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
                    </ul>
                  )}
                  {p.keywords && p.keywords.length > 0 && (
                    <div className="text-[0.8em] text-gray-500 italic mt-0.5">— {p.keywords.join(", ")}</div>
                  )}
                </div>
              ))}
            </>
          )}

          {resume.awards.length > 0 && (
            <>
              <Head>{L.honorsAndAwards}</Head>
              <ul className="list-disc ml-5 text-[0.9em] space-y-0.5">
                {resume.awards.map((a, i) => (
                  <li key={a.id} className={itemCls(a)}>
                    <b><E path={`awards.${i}.title`}>{a.title}</E></b>, <i><E path={`awards.${i}.awarder`}>{a.awarder}</E></i> <span className="text-gray-500">(<E path={`awards.${i}.date`}>{a.date}</E>)</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {resume.skills.length > 0 && (
            <>
              <Head>{L.skills}</Head>
              <div className="text-[0.9em] space-y-0.5">
                {resume.skills.map((s, i) => (
                  <div key={s.id} className={itemCls(s)}>
                    <b><E path={`skills.${i}.name`}>{s.name}</E></b> — <span className="italic text-gray-700">{s.keywords.join(", ")}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {resume.languages.length > 0 && (
            <>
              <Head>{L.languages}</Head>
              <div className="text-[0.9em] italic">
                {resume.languages.map((l) => `${l.language} (${l.fluency})`).join(" · ")}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

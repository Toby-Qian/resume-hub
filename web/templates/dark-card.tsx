"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

/**
 * Dark hero band + light content cards. Modern startup / SaaS-portfolio
 * aesthetic. The accent colour drives a navy-tinted hero strip with
 * white type, then the body returns to a normal light surface so it
 * stays printer-friendly. Each entry is a soft card with a left rule.
 *
 * The hero strip uses a CSS gradient with the accent so it adapts to
 * whatever theme the user picked (red, green, purple, …).
 */
export default function DarkCard({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const SectionH = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mt-5 mb-3 first:mt-2">
      <span className="w-1.5 h-5 rounded-sm" style={{ background: "var(--resume-accent)" }} aria-hidden />
      <h2 className="text-[0.95em] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--resume-accent)" }}>
        {children}
      </h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
  const Card = ({ children, className = "", breakBefore = false }: { children: React.ReactNode; className?: string; breakBefore?: boolean }) => (
    <div className={`resume-item ${breakBefore ? "page-break-before" : ""} relative pl-4 py-2 mb-2 ${className}`}
      style={{ borderLeft: "3px solid var(--resume-tint-35)", background: "var(--resume-tint-04)" }}>
      {children}
    </div>
  );
  return (
    <div>
      {/* Hero band */}
      <div style={{
        background: "linear-gradient(135deg, var(--resume-accent) 0%, var(--resume-accent-dark) 100%)",
        color: "white",
        padding: "calc(var(--pad) * 0.75) var(--pad)",
      }}>
        <Draggable name="header" as="header" className="flex items-center gap-5">
          {b.showAvatar && b.avatar && (
            <Avatar basics={b} size={104} rounded="full" className="ring-4 ring-white/40 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[2.2em] font-bold leading-tight"><E path="basics.name">{b.name}</E></h1>
            <div className="text-[1em] opacity-90 mt-0.5"><E path="basics.label">{b.label}</E></div>
            <div className="text-[0.82em] opacity-95 mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <span>✉ <E path="basics.email">{b.email}</E></span>
              <span>☎ <E path="basics.phone">{b.phone}</E></span>
              <span>📍 <E path="basics.location">{b.location}</E></span>
              <span>🔗 <E path="basics.website">{b.website}</E></span>
            </div>
          </div>
        </Draggable>
      </div>

      <div style={{ padding: "var(--pad)" }}>
        <Draggable name="summary">
          <p className="text-[0.95em] text-gray-800 leading-relaxed mt-1 mb-3"
            style={{ borderLeft: "3px solid var(--resume-accent)", paddingLeft: "0.75rem", fontStyle: "italic" }}>
            <E path="basics.summary" multiline>{b.summary}</E>
          </p>
        </Draggable>

        {resume.work.length > 0 && (
          <>
            <SectionH>{L.experience}</SectionH>
            {resume.work.map((w, i) => (
              <Card key={w.id} breakBefore={(w as any).breakBefore} className="text-[0.92em]">
                <div className="flex justify-between items-baseline">
                  <div className="font-semibold"><E path={`work.${i}.position`}>{w.position}</E> <span className="font-normal text-gray-700">@ <E path={`work.${i}.company`}>{w.company}</E></span></div>
                  <div className="text-[0.82em] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "var(--resume-tint-12)", color: "var(--resume-accent)" }}>
                    {range(w.startDate, w.endDate)}
                  </div>
                </div>
                {w.location && <div className="text-[0.82em] text-gray-500"><E path={`work.${i}.location`}>{w.location}</E></div>}
                <ul className="list-disc ml-5 mt-1 text-gray-800">
                  {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
                </ul>
              </Card>
            ))}
          </>
        )}

        {resume.projects.length > 0 && (
          <>
            <SectionH>{L.projects}</SectionH>
            {resume.projects.map((p, i) => (
              <Card key={p.id} breakBefore={(p as any).breakBefore} className="text-[0.92em]">
                <div className="flex justify-between items-baseline">
                  <div className="font-semibold"><E path={`projects.${i}.name`}>{p.name}</E></div>
                  <div className="text-[0.82em] text-gray-500 whitespace-nowrap">{range(p.startDate, p.endDate)}</div>
                </div>
                {p.description && <div className="text-gray-700 mt-0.5"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>}
                {p.highlights.filter(Boolean).length > 0 && (
                  <ul className="list-disc ml-5 mt-0.5 text-gray-800">
                    {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
                  </ul>
                )}
                {p.keywords && p.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.keywords.map((k, j) => (
                      <span key={j} className="text-[0.78em] px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: "var(--resume-tint-30)",
                          color: "var(--resume-accent)",
                        }}>{k}</span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          {resume.education.length > 0 && (
            <div>
              <SectionH>{L.education}</SectionH>
              {resume.education.map((e, i) => (
                <Card key={e.id} className="text-[0.9em]">
                  <div className="font-semibold"><E path={`education.${i}.institution`}>{e.institution}</E></div>
                  <div className="text-gray-700"><E path={`education.${i}.studyType`}>{e.studyType}</E> · <E path={`education.${i}.area`}>{e.area}</E></div>
                  <div className="text-[0.82em] text-gray-500">{range(e.startDate, e.endDate)}{e.score ? ` · ${e.score}` : ""}</div>
                </Card>
              ))}
            </div>
          )}

          {resume.skills.length > 0 && (
            <div>
              <SectionH>{L.skills}</SectionH>
              <Card className="text-[0.9em]">
                {resume.skills.map((s, i) => (
                  <div key={s.id} className={itemCls(s, "mb-1")}>
                    <span className="font-semibold"><E path={`skills.${i}.name`}>{s.name}</E></span>
                    {s.level && <span className="text-gray-500 text-[0.85em]"> · {s.level}</span>}
                    {s.keywords.length > 0 && <div className="text-gray-700 text-[0.88em]">{s.keywords.join(" · ")}</div>}
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>

        {(resume.awards.length > 0 || resume.languages.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {resume.awards.length > 0 && (
              <div>
                <SectionH>{L.awards}</SectionH>
                {resume.awards.map((a, i) => (
                  <Card key={a.id} className="text-[0.88em]">
                    <div className="font-semibold"><E path={`awards.${i}.title`}>{a.title}</E></div>
                    <div className="text-gray-600"><E path={`awards.${i}.awarder`}>{a.awarder}</E> · <E path={`awards.${i}.date`}>{a.date}</E></div>
                  </Card>
                ))}
              </div>
            )}
            {resume.languages.length > 0 && (
              <div>
                <SectionH>{L.languages}</SectionH>
                <Card className="text-[0.9em] flex flex-wrap gap-x-3 gap-y-1">
                  {resume.languages.map((l, i) => (
                    <span key={l.id} className={itemCls(l)}>
                      <b><E path={`languages.${i}.language`}>{l.language}</E></b> <span className="text-gray-500"><E path={`languages.${i}.fluency`}>{l.fluency}</E></span>
                    </span>
                  ))}
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

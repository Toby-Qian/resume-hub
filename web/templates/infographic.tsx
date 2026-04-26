"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable, useSectionLabels } from "./shared";

/**
 * Infographic resume — skill bars, language proficiency dots, ribbon-style
 * section ribbons. Designed for designers / marketers / PMs who want a
 * visually loud one-pager. Two-column with a tinted left rail.
 *
 * Skill levels are inferred from `skill.level` text (heuristic) so users
 * don't have to learn a new schema field — common keywords like "expert",
 * "高级", "熟练", "初级" map to a 0–100 percentage.
 */
function levelToPct(level?: string): number {
  if (!level) return 70;
  const s = level.toLowerCase();
  if (/expert|master|精通|专家/.test(s)) return 95;
  if (/advanced|高级|熟练/.test(s)) return 85;
  if (/proficient|intermediate|中级|良好/.test(s)) return 70;
  if (/familiar|basic|了解|入门|初级/.test(s)) return 50;
  return 70;
}
function fluencyToDots(f?: string): number {
  if (!f) return 4;
  const s = f.toLowerCase();
  if (/native|母语/.test(s)) return 5;
  if (/fluent|流利/.test(s)) return 4;
  if (/professional|商务/.test(s)) return 4;
  if (/intermediate|中等/.test(s)) return 3;
  if (/basic|基础/.test(s)) return 2;
  return 3;
}

export default function Infographic({ resume }: TemplateProps) {
  const b = resume.basics;
  const L = useSectionLabels();
  const Ribbon = ({ children }: { children: React.ReactNode }) => (
    <div className="relative inline-block mt-5 mb-3">
      <div className="text-white font-semibold text-[0.82em] uppercase tracking-[0.2em] px-3 py-1"
        style={{ background: "var(--resume-accent)" }}>
        {children}
      </div>
      <div className="absolute right-0 top-0 translate-x-full border-y-[14px] border-y-transparent border-l-[10px]"
        style={{ borderLeftColor: "var(--resume-accent)" }} aria-hidden />
    </div>
  );
  const SideTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[0.78em] font-bold uppercase tracking-[0.22em] mt-5 mb-2 first:mt-0 pb-1"
      style={{ color: "var(--resume-accent)", borderBottom: "2px solid var(--resume-accent)" }}>
      {children}
    </div>
  );
  return (
    <div className="grid grid-cols-[36%_1fr]" style={{ minHeight: "inherit" }}>
      <aside style={{
        background: "var(--resume-tint-08)",
        padding: "var(--pad)",
      }}>
        {b.showAvatar && b.avatar && (
          <div className="flex justify-center mb-3"><Avatar basics={b} size={140} rounded="full" className="ring-4 ring-white" /></div>
        )}
        <Draggable name="header">
          <h1 className="text-[1.7em] font-bold text-center leading-tight" style={{ color: "var(--resume-accent)" }}><E path="basics.name">{b.name}</E></h1>
          <div className="text-[0.92em] text-center text-gray-700 mt-1"><E path="basics.label">{b.label}</E></div>
        </Draggable>

        <SideTitle>{L.contact}</SideTitle>
        <div className="text-[0.83em] space-y-1 text-gray-800">
          <div>✉ <E path="basics.email">{b.email}</E></div>
          <div>☎ <E path="basics.phone">{b.phone}</E></div>
          <div>📍 <E path="basics.location">{b.location}</E></div>
          <div className="break-all">🔗 <E path="basics.website">{b.website}</E></div>
        </div>

        {resume.skills.length > 0 && (
          <>
            <SideTitle>{L.skills}</SideTitle>
            {resume.skills.map((s, i) => {
              const pct = levelToPct(s.level);
              return (
                <div key={s.id} className={itemCls(s, "mb-2")}>
                  <div className="flex justify-between text-[0.83em]">
                    <span className="font-semibold"><E path={`skills.${i}.name`}>{s.name}</E></span>
                    {s.level && <span className="text-gray-500"><E path={`skills.${i}.level`}>{s.level}</E></span>}
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--resume-accent)" }} />
                  </div>
                  {s.keywords.length > 0 && (
                    <div className="text-[0.78em] text-gray-600 mt-0.5">{s.keywords.join(" · ")}</div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {resume.languages.length > 0 && (
          <>
            <SideTitle>{L.languages}</SideTitle>
            {resume.languages.map((l, i) => {
              const dots = fluencyToDots(l.fluency);
              return (
                <div key={l.id} className={itemCls(l, "flex justify-between items-center text-[0.85em] mb-1")}>
                  <div>
                    <span className="font-semibold"><E path={`languages.${i}.language`}>{l.language}</E></span>
                    <span className="text-gray-500 text-[0.85em] ml-1"><E path={`languages.${i}.fluency`}>{l.fluency}</E></span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className="w-2 h-2 rounded-full inline-block"
                        style={{ background: n <= dots ? "var(--resume-accent)" : "#d1d5db" }} aria-hidden />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {resume.awards.length > 0 && (
          <>
            <SideTitle>{L.awards}</SideTitle>
            {resume.awards.map((a, i) => (
              <div key={a.id} className={itemCls(a, "text-[0.83em] mb-2")}>
                <div className="font-semibold"><E path={`awards.${i}.title`}>{a.title}</E></div>
                <div className="text-gray-600"><E path={`awards.${i}.awarder`}>{a.awarder}</E> · <E path={`awards.${i}.date`}>{a.date}</E></div>
              </div>
            ))}
          </>
        )}
      </aside>

      <main style={{ padding: "var(--pad)" }}>
        <Draggable name="summary"><p className="text-[0.95em] text-gray-800 leading-relaxed mb-2"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

        {resume.work.length > 0 && (
          <>
            <Ribbon>{L.experience}</Ribbon>
            {resume.work.map((w, i) => (
              <div key={w.id} className={itemCls(w, "mb-3 text-[0.92em] pl-3 border-l-2")}
                style={{ borderColor: "var(--resume-tint-35)" }}>
                <div className="flex justify-between items-baseline">
                  <div><b><E path={`work.${i}.position`}>{w.position}</E></b> · <span className="text-gray-700"><E path={`work.${i}.company`}>{w.company}</E></span></div>
                  <div className="text-[0.85em] px-2 rounded text-white font-semibold whitespace-nowrap"
                    style={{ background: "var(--resume-accent)" }}>{range(w.startDate, w.endDate)}</div>
                </div>
                {w.location && <div className="text-[0.82em] text-gray-500"><E path={`work.${i}.location`}>{w.location}</E></div>}
                <ul className="list-disc ml-5 mt-1">
                  {w.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`work.${i}.highlights.${j}`}>{h}</E></li>)}
                </ul>
              </div>
            ))}
          </>
        )}

        {resume.projects.length > 0 && (
          <>
            <Ribbon>{L.projects}</Ribbon>
            {resume.projects.map((p, i) => (
              <div key={p.id} className={itemCls(p, "mb-3 text-[0.92em] pl-3 border-l-2")}
                style={{ borderColor: "var(--resume-tint-35)" }}>
                <div className="flex justify-between items-baseline">
                  <div><b><E path={`projects.${i}.name`}>{p.name}</E></b></div>
                  <div className="text-[0.85em] text-gray-500 whitespace-nowrap">{range(p.startDate, p.endDate)}</div>
                </div>
                {p.description && <div className="text-gray-700"><E path={`projects.${i}.description`} multiline>{p.description}</E></div>}
                {p.highlights.filter(Boolean).length > 0 && (
                  <ul className="list-disc ml-5 mt-0.5">
                    {p.highlights.filter(Boolean).map((h, j) => <li key={j}><E path={`projects.${i}.highlights.${j}`}>{h}</E></li>)}
                  </ul>
                )}
                {p.keywords && p.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.keywords.map((k, j) => (
                      <span key={j} className="text-[0.78em] px-1.5 py-0.5 rounded"
                        style={{ background: "var(--resume-tint-12)", color: "var(--resume-accent)" }}>{k}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {resume.education.length > 0 && (
          <>
            <Ribbon>{L.education}</Ribbon>
            {resume.education.map((e, i) => (
              <div key={e.id} className={itemCls(e, "mb-2 text-[0.92em] pl-3 border-l-2")}
                style={{ borderColor: "var(--resume-tint-35)" }}>
                <div className="flex justify-between items-baseline">
                  <div><b><E path={`education.${i}.institution`}>{e.institution}</E></b> · <E path={`education.${i}.studyType`}>{e.studyType}</E>, <E path={`education.${i}.area`}>{e.area}</E></div>
                  <div className="text-[0.85em] text-gray-500 whitespace-nowrap">{range(e.startDate, e.endDate)}</div>
                </div>
                {e.score && <div className="text-[0.85em] text-gray-600"><E path={`education.${i}.score`}>{e.score}</E></div>}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

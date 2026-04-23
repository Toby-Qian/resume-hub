"use client";
import { TemplateProps, range } from "./shared";

export default function CNFormal({ resume }: TemplateProps) {
  const b = resume.basics;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[1em] font-bold mb-2 pl-2 mt-4" style={{ borderLeft: "4px solid var(--resume-accent)" }}>{children}</h2>
  );
  return (
    <div style={{ padding: "var(--pad)" }}>
      <header className="flex justify-between items-end pb-3 mb-4 border-b-2" style={{ borderColor: "var(--resume-accent)" }}>
        <div>
          <h1 className="text-[2em] font-bold">{b.name}</h1>
          <div className="text-[1em] text-gray-700 mt-1">{b.label}</div>
        </div>
        <div className="text-[0.85em] text-right text-gray-700 space-y-0.5">
          {b.phone && <div>电话：{b.phone}</div>}
          {b.email && <div>邮箱：{b.email}</div>}
          {b.location && <div>城市：{b.location}</div>}
          {b.website && <div>主页：{b.website}</div>}
        </div>
      </header>
      {b.summary && (<><H>个人简介</H><p className="text-[0.95em]">{b.summary}</p></>)}

      {resume.education.length > 0 && (
        <>
          <H>教育背景</H>
          {resume.education.map((e) => (
            <div key={e.id} className="mb-2 text-[0.95em]">
              <div className="flex justify-between">
                <div><b>{e.institution}</b> · {e.studyType} · {e.area}</div>
                <div className="text-gray-500">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-gray-700">{e.score}</div>}
              {e.courses && e.courses.length > 0 && <div className="text-gray-600 text-[0.9em]">主修：{e.courses.join("、")}</div>}
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <>
          <H>工作经历</H>
          {resume.work.map((w) => (
            <div key={w.id} className="mb-3 text-[0.95em]">
              <div className="flex justify-between">
                <div><b>{w.company}</b> · {w.position}{w.location && ` · ${w.location}`}</div>
                <div className="text-gray-500">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5 mt-1">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <>
          <H>项目经历</H>
          {resume.projects.map((p) => (
            <div key={p.id} className="mb-3 text-[0.95em]">
              <div className="flex justify-between">
                <div><b>{p.name}</b>{p.keywords && p.keywords.length > 0 && <span className="text-gray-500"> · {p.keywords.join("/")}</span>}</div>
                <div className="text-gray-500">{range(p.startDate, p.endDate)}</div>
              </div>
              <div className="text-gray-700">{p.description}</div>
              <ul className="list-disc ml-5">
                {p.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.skills.length > 0 && (
        <>
          <H>专业技能</H>
          <ul className="list-disc ml-5 text-[0.95em]">
            {resume.skills.map((s) => (
              <li key={s.id}><b>{s.name}</b>{s.level && `（${s.level}）`}：{s.keywords.join("、")}</li>
            ))}
          </ul>
        </>
      )}

      {resume.awards.length > 0 && (
        <>
          <H>荣誉奖项</H>
          <ul className="list-disc ml-5 text-[0.95em]">
            {resume.awards.map((a) => (
              <li key={a.id}><b>{a.title}</b> · {a.awarder} · {a.date}{a.summary && ` — ${a.summary}`}</li>
            ))}
          </ul>
        </>
      )}

      {resume.languages.length > 0 && (
        <>
          <H>语言能力</H>
          <div className="text-[0.95em]">
            {resume.languages.map((l) => `${l.language}（${l.fluency}）`).join(" · ")}
          </div>
        </>
      )}
    </div>
  );
}

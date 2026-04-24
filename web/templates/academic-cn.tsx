"use client";
import { TemplateProps, range, itemCls, Avatar, E, Draggable } from "./shared";

/**
 * 中文学术简历 — 适配国内高校/研究所风格：姓名居右带证件照槽位、
 * 左侧 labelled sections；教育经历 → 科研/工作经历 → 发表论文
 * → 荣誉奖励 → 专业技能 → 语言。
 */
export default function AcademicCN({ resume }: TemplateProps) {
  const b = resume.basics;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[1em] font-bold mt-4 mb-2 pb-1 border-b"
      style={{ borderColor: "var(--resume-accent)", color: "var(--resume-accent)" }}>
      {children}
    </h2>
  );
  return (
    <div style={{ padding: "var(--pad)" }}>
      <Draggable name="header" as="header" className="flex items-center gap-5 pb-4 mb-3 border-b-2 border-gray-700">
        <div className="flex-1 min-w-0">
          <h1 className="text-[2em] font-bold"><E path="basics.name">{b.name}</E></h1>
          <div className="text-[1em] text-gray-700 mt-1"><E path="basics.label">{b.label}</E></div>
          <div className="grid grid-cols-2 gap-x-4 text-[0.85em] text-gray-700 mt-2">
            <div>电话：<E path="basics.phone">{b.phone}</E></div>
            <div>邮箱：<E path="basics.email">{b.email}</E></div>
            <div>城市：<E path="basics.location">{b.location}</E></div>
            <div className="break-all">主页：<E path="basics.website">{b.website}</E></div>
          </div>
        </div>
        <Avatar basics={b} size={112} rounded="sm" />
      </Draggable>
      <Draggable name="summary"><p className="text-[0.93em] text-gray-800 mb-2 indent-8"><E path="basics.summary" multiline>{b.summary}</E></p></Draggable>

      {resume.education.length > 0 && (
        <><H>教育经历</H>
          {resume.education.map((e) => (
            <div key={e.id} className={itemCls(e, "mb-1.5 text-[0.93em]")}>
              <div className="flex justify-between">
                <div><b>{e.institution}</b> · {e.studyType} · {e.area}</div>
                <div className="text-gray-600">{range(e.startDate, e.endDate)}</div>
              </div>
              {e.score && <div className="text-gray-700 text-[0.88em]">{e.score}</div>}
              {e.courses && e.courses.length > 0 && (
                <div className="text-[0.85em] text-gray-600">主修：{e.courses.join("、")}</div>
              )}
            </div>
          ))}
        </>
      )}

      {resume.work.length > 0 && (
        <><H>科研 / 工作经历</H>
          {resume.work.map((w) => (
            <div key={w.id} className={itemCls(w, "mb-2 text-[0.93em]")}>
              <div className="flex justify-between">
                <div><b>{w.company}</b> · {w.position}{w.location && ` · ${w.location}`}</div>
                <div className="text-gray-600">{range(w.startDate, w.endDate)}</div>
              </div>
              <ul className="list-disc ml-5 mt-0.5">
                {w.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}

      {resume.projects.length > 0 && (
        <><H>发表论文 / 研究项目</H>
          <ol className="text-[0.9em] space-y-1 list-decimal ml-6">
            {resume.projects.map((p) => (
              <li key={p.id} className={itemCls(p)}>
                <b>{p.name}</b>
                {p.description && <span>。{p.description}</span>}
                {(p.startDate || p.endDate) && <span className="text-gray-600">（{range(p.startDate, p.endDate)}）</span>}
                {p.url && <div className="text-[0.82em] text-gray-600 break-all">{p.url}</div>}
              </li>
            ))}
          </ol>
        </>
      )}

      {resume.awards.length > 0 && (
        <><H>荣誉奖励</H>
          <ul className="list-disc ml-5 text-[0.9em]">
            {resume.awards.map((a) => (
              <li key={a.id} className={itemCls(a)}>
                <b>{a.title}</b>，{a.awarder}，{a.date}{a.summary && `。${a.summary}`}
              </li>
            ))}
          </ul>
        </>
      )}

      {resume.skills.length > 0 && (
        <><H>专业技能</H>
          <div className="text-[0.9em] space-y-0.5">
            {resume.skills.map((s) => (
              <div key={s.id} className={itemCls(s)}>
                <b>{s.name}{s.level && `（${s.level}）`}：</b>{s.keywords.join("、")}
              </div>
            ))}
          </div>
        </>
      )}

      {resume.languages.length > 0 && (
        <><H>语言能力</H>
          <div className="text-[0.9em]">{resume.languages.map((l) => `${l.language}（${l.fluency}）`).join(" · ")}</div>
        </>
      )}
    </div>
  );
}

// Serialise a Resume to GitHub-flavoured Markdown for backup, sharing, or
// pasting into a README. Lossy by design — we intentionally drop layout-only
// fields (avatar, blockOffsets, theme) and keep just the human-readable
// content. Headings are localised so the output reads naturally in either
// language. Pair with `downloadMarkdown()` to push it as a `.md` download.

import type { Resume } from "./schema";
import type { UILang } from "./store";
import { t } from "./i18n";

const safeFileSegment = (s: string) =>
  s.replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 80);

/** Turn a Resume into a Markdown document. Only sections with content are
 *  emitted. Date ranges render as "Start – End" (en-dash). All free-text
 *  user content is left untouched (so existing `**bold**` etc. survive). */
export function resumeToMarkdown(r: Resume, lang: UILang): string {
  const L = t(lang);
  const S = L.sections;
  const F = L.fields;
  const lines: string[] = [];

  // Header — name + headline + contact line.
  if (r.basics.name) lines.push(`# ${r.basics.name}`);
  if (r.basics.label) lines.push(`*${r.basics.label}*`, "");
  const contact: string[] = [];
  if (r.basics.email)    contact.push(r.basics.email);
  if (r.basics.phone)    contact.push(r.basics.phone);
  if (r.basics.location) contact.push(r.basics.location);
  if (r.basics.website)  contact.push(r.basics.website);
  if (contact.length) lines.push(contact.join(" · "), "");
  if (r.basics.summary) lines.push(r.basics.summary, "");

  const dateRange = (start?: string, end?: string) => {
    const s = (start || "").trim();
    const e = (end || "").trim();
    if (!s && !e) return "";
    if (!e) return s;
    if (!s) return e;
    return `${s} – ${e}`;
  };
  const heading = (title: string) => { lines.push("", `## ${title}`, ""); };

  if (r.work.length) {
    heading(S.work);
    for (const w of r.work) {
      const dr = dateRange(w.startDate, w.endDate);
      const head = [w.position, w.company].filter(Boolean).join(" @ ");
      lines.push(`### ${head}${dr ? ` _(${dr})_` : ""}`);
      if (w.location) lines.push(`*${w.location}*`);
      for (const h of w.highlights.filter(Boolean)) lines.push(`- ${h}`);
      lines.push("");
    }
  }

  if (r.education.length) {
    heading(S.education);
    for (const e of r.education) {
      const dr = dateRange(e.startDate, e.endDate);
      const head = [e.studyType, e.area].filter(Boolean).join(", ");
      const inst = e.institution || "";
      lines.push(`### ${[head, inst].filter(Boolean).join(" — ")}${dr ? ` _(${dr})_` : ""}`);
      if (e.score) lines.push(`*${F.score}: ${e.score}*`);
      if (e.courses && e.courses.length) lines.push(`${F.courses}: ${e.courses.join(", ")}`);
      lines.push("");
    }
  }

  if (r.projects.length) {
    heading(S.projects);
    for (const p of r.projects) {
      const dr = dateRange(p.startDate, p.endDate);
      const link = p.url ? ` ([link](${p.url}))` : "";
      lines.push(`### ${p.name}${link}${dr ? ` _(${dr})_` : ""}`);
      if (p.description) lines.push(p.description);
      for (const h of (p.highlights || []).filter(Boolean)) lines.push(`- ${h}`);
      if (p.keywords && p.keywords.length) lines.push(`*${F.keywords}: ${p.keywords.join(", ")}*`);
      lines.push("");
    }
  }

  if (r.skills.length) {
    heading(S.skills);
    for (const s of r.skills) {
      const lvl = s.level ? ` _(${s.level})_` : "";
      const stars = s.levelValue && s.levelValue > 0 ? ` ${"★".repeat(s.levelValue)}` : "";
      const kw = s.keywords && s.keywords.length ? `: ${s.keywords.join(", ")}` : "";
      lines.push(`- **${s.name}**${lvl}${stars}${kw}`);
    }
    lines.push("");
  }

  if (r.publications && r.publications.length) {
    heading(S.publications);
    for (const p of r.publications) {
      const venue = p.venue ? ` _${p.venue}_` : "";
      const date = p.date ? ` (${p.date})` : "";
      const doi = p.doi ? ` doi:${p.doi}` : "";
      lines.push(`- **${p.title}**${venue}${date}${doi}`);
      if (p.authors) lines.push(`  ${p.authors}`);
      if (p.summary) lines.push(`  ${p.summary}`);
    }
    lines.push("");
  }

  if (r.talks && r.talks.length) {
    heading(S.talks);
    for (const tk of r.talks) {
      const venue = tk.venue ? `, ${tk.venue}` : "";
      const date = tk.date ? ` (${tk.date})` : "";
      lines.push(`- **${tk.title}**${venue}${date}`);
    }
    lines.push("");
  }

  if (r.teaching && r.teaching.length) {
    heading(S.teaching);
    for (const tc of r.teaching) {
      const dr = dateRange(tc.startDate, tc.endDate);
      const inst = tc.institution ? ` — ${tc.institution}` : "";
      const role = tc.role ? ` _(${tc.role})_` : "";
      lines.push(`- **${tc.course}**${inst}${role}${dr ? ` ${dr}` : ""}`);
      if (tc.summary) lines.push(`  ${tc.summary}`);
    }
    lines.push("");
  }

  if (r.awards.length) {
    heading(S.awards);
    for (const a of r.awards) {
      const date = a.date ? ` (${a.date})` : "";
      const awarder = a.awarder ? `, ${a.awarder}` : "";
      lines.push(`- **${a.title}**${awarder}${date}`);
      if (a.summary) lines.push(`  ${a.summary}`);
    }
    lines.push("");
  }

  if (r.languages.length) {
    heading(S.languages);
    for (const lg of r.languages) {
      const fl = lg.fluency ? ` _(${lg.fluency})_` : "";
      lines.push(`- ${lg.language}${fl}`);
    }
    lines.push("");
  }

  // Trim trailing blank lines.
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n") + "\n";
}

/** Browser-side download helper — converts to Markdown then triggers a save. */
export function downloadMarkdown(r: Resume, lang: UILang) {
  const md = resumeToMarkdown(r, lang);
  const date = new Date().toISOString().slice(0, 10);
  const name = safeFileSegment(r.basics.name || "resume");
  const filename = `${name || "resume"}_${date}.md`;
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

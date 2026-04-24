// Convert a JSON Resume document (https://jsonresume.org/schema/) to our
// internal Resume shape. Missing fields are filled in with sensible defaults.
// The converter is permissive — GitHub repos include plenty of non-canonical
// variants — but it never throws for unknown keys.

import type { Resume } from "./schema";

const uid = () => Math.random().toString(36).slice(2, 9);

const asString = (v: any): string => (typeof v === "string" ? v : v == null ? "" : String(v));
const asArr = (v: any): any[] => (Array.isArray(v) ? v : []);

// JSON Resume stores contact info under basics.profiles / basics.location.
// We flatten location to a single string and pull the first profile as website
// when no explicit url exists.
function coalesceWebsite(b: any): string {
  if (b?.url) return asString(b.url);
  if (b?.website) return asString(b.website);
  const profs = asArr(b?.profiles);
  const p = profs[0];
  return p?.url ? asString(p.url) : "";
}

function flattenLocation(loc: any): string {
  if (!loc || typeof loc !== "object") return asString(loc);
  const parts = [loc.city, loc.region, loc.countryCode, loc.address].filter(Boolean);
  return parts.join(", ");
}

function toRange(start: any, end: any): { startDate: string; endDate: string } {
  return { startDate: asString(start), endDate: end ? asString(end) : "" };
}

export function jsonResumeToResume(doc: any): Resume {
  const b = doc?.basics ?? {};
  const imageUrl = asString(b.image || b.picture || "");
  return {
    basics: {
      name: asString(b.name),
      label: asString(b.label || b.headline),
      email: asString(b.email),
      phone: asString(b.phone),
      location: flattenLocation(b.location),
      website: coalesceWebsite(b),
      summary: asString(b.summary),
      avatar: imageUrl,
      showAvatar: !!imageUrl,
    },
    work: asArr(doc?.work).map((w) => ({
      id: uid(),
      company: asString(w.name || w.company),
      position: asString(w.position || w.title),
      location: asString(w.location),
      ...toRange(w.startDate, w.endDate),
      highlights: asArr(w.highlights).map(asString).filter(Boolean).length
        ? asArr(w.highlights).map(asString)
        : (w.summary ? [asString(w.summary)] : [""]),
    })),
    education: asArr(doc?.education).map((e) => ({
      id: uid(),
      institution: asString(e.institution || e.school),
      area: asString(e.area || e.studyArea),
      studyType: asString(e.studyType || e.degree),
      ...toRange(e.startDate, e.endDate),
      score: asString(e.score || e.gpa || ""),
      courses: asArr(e.courses).map(asString),
    })),
    projects: asArr(doc?.projects).map((p) => ({
      id: uid(),
      name: asString(p.name),
      description: asString(p.description),
      url: asString(p.url),
      ...toRange(p.startDate, p.endDate),
      highlights: asArr(p.highlights).map(asString),
      keywords: asArr(p.keywords).map(asString),
    })),
    skills: asArr(doc?.skills).map((s) => ({
      id: uid(),
      name: asString(s.name),
      level: asString(s.level),
      keywords: asArr(s.keywords).map(asString),
    })),
    awards: asArr(doc?.awards).map((a) => ({
      id: uid(),
      title: asString(a.title),
      date: asString(a.date),
      awarder: asString(a.awarder),
      summary: asString(a.summary),
    })),
    languages: asArr(doc?.languages).map((l) => ({
      id: uid(),
      language: asString(l.language),
      fluency: asString(l.fluency),
    })),
  };
}

// Quick shape check. JSON Resume's only required top-level key is `basics`
// but we'll accept anything that has at least one recognisable resume section.
export function looksLikeJsonResume(doc: any): boolean {
  if (!doc || typeof doc !== "object") return false;
  return Boolean(
    doc.basics || doc.work || doc.education || doc.projects || doc.skills
  );
}

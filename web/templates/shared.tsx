import type { Resume } from "@/lib/schema";

export interface TemplateProps {
  resume: Resume;
}

export const fmtDate = (s?: string) => s || "";
export const range = (a?: string, b?: string) =>
  [fmtDate(a), fmtDate(b)].filter(Boolean).join(" — ");

export function Section({ title, children, accent = false }: { title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <section style={{ marginBottom: "var(--gap)" }}>
      <h2
        className="font-semibold tracking-wide uppercase text-[0.82em] mb-2 pb-1 border-b"
        style={{ color: accent ? "var(--resume-accent)" : "#111827", borderColor: "#e5e7eb" }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

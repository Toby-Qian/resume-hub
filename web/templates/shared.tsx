import type { Resume } from "@/lib/schema";

export interface TemplateProps {
  resume: Resume;
}

export const fmtDate = (s?: string) => s || "";
export const range = (a?: string, b?: string) =>
  [fmtDate(a), fmtDate(b)].filter(Boolean).join(" — ");

/** Produces CSS classes for an individual resume item div.
 *  Always adds `resume-item` (so CSS break-inside: avoid applies),
 *  and conditionally adds `page-break-before` when the item has breakBefore=true. */
export const itemCls = (item: any, extra = "") =>
  `resume-item ${item?.breakBefore ? "page-break-before" : ""} ${extra}`.trim();

/** Render the avatar only when user has both uploaded/pasted one AND enabled the toggle. */
export function Avatar({
  basics,
  size = 88,
  rounded = "full",
  style,
  className = "",
}: {
  basics: {
    avatar?: string;
    showAvatar?: boolean;
    name?: string;
    avatarShape?: "circle" | "rounded" | "square" | "portrait";
    avatarSize?: number;
  };
  size?: number;
  rounded?: "full" | "md" | "sm" | "none";
  style?: React.CSSProperties;
  className?: string;
}) {
  if (!basics.showAvatar || !basics.avatar) return null;
  // User-set shape / size override the template's default preference.
  const explicit = basics.avatarShape;
  const w = basics.avatarSize ?? size;
  const h = explicit === "portrait" ? Math.round((w * 4) / 3) : w;
  const roundCls = explicit
    ? (explicit === "circle" ? "rounded-full"
        : explicit === "rounded" ? "rounded-lg"
        : /* square | portrait */ "")
    : (rounded === "full" ? "rounded-full"
        : rounded === "md" ? "rounded-md"
        : rounded === "sm" ? "rounded-sm" : "");
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={basics.avatar}
      alt={basics.name || "avatar"}
      className={`object-cover shrink-0 ${roundCls} ${className}`}
      style={{ width: w, height: h, ...style }}
    />
  );
}

/**
 * Section: if items inside have `breakBefore`, the auto-generated CSS class
 * `page-break-before` on the item will push it to a new page. Templates
 * typically don't need to pass `breakBefore` on Section itself — but it is
 * available for explicit "this entire section on a new page" use.
 */
export function Section({ title, children, accent = false, breakBefore = false }: { title: string; children: React.ReactNode; accent?: boolean; breakBefore?: boolean }) {
  return (
    <section
      className={`resume-section ${breakBefore ? "page-break-before" : ""}`}
      style={{ marginBottom: "var(--gap)" }}
    >
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

/** Wrapper for individual entries (one job, one project) so a page break never
 *  splits a single item. Also used to mark per-item breakBefore. */
export function Item({ children, breakBefore = false, className = "" }: { children: React.ReactNode; breakBefore?: boolean; className?: string }) {
  return (
    <div className={`resume-item ${breakBefore ? "page-break-before" : ""} ${className}`}>
      {children}
    </div>
  );
}

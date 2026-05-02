import { Resume, emptyResume } from "./schema";
import { uid } from "./uid";


/**
 * Validate and normalize a parsed JSON object into a fully-shaped `Resume`.
 *
 * The previous import path only checked for a top-level `basics` key and
 * passed the rest of the object straight to the store. That meant any JSON
 * missing array sections (e.g. only `basics` + `work`) crashed templates
 * on `.map()`, and items without an `id` would silently fail React keying.
 *
 * This helper:
 *   - throws `Error` with a human-readable message on hard structural issues
 *     (the file isn't an object, no basics block, basics isn't an object)
 *   - coerces every list-section to `[]` when missing or non-array
 *   - drops list entries that aren't objects, mints a fresh `id` on any
 *     entry missing one
 *   - merges `basics` over `emptyResume().basics` so partial imports keep
 *     reasonable defaults instead of `undefined`
 *
 * Forward-compat: any extra top-level keys we don't know about are ignored
 * (not preserved). If a future schema adds a new section, its data is lost
 * on round-trip through an older build — same trade-off as JSON Resume.
 */
export function validateAndNormalize(input: unknown): Resume {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("not_object");
  }
  const o = input as Record<string, unknown>;
  if (!o.basics || typeof o.basics !== "object" || Array.isArray(o.basics)) {
    throw new Error("missing_basics");
  }

  const empty = emptyResume();
  const arr = (k: string): unknown[] => Array.isArray(o[k]) ? (o[k] as unknown[]) : [];
  const ensureIds = <T extends { id?: string }>(items: unknown[]): T[] =>
    items
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x))
      .map((x) => ({ ...(x as object), id: typeof x.id === "string" && x.id ? x.id : uid() }) as T);

  const customLabels =
    o.customLabels && typeof o.customLabels === "object" && !Array.isArray(o.customLabels)
      ? (o.customLabels as Record<string, string>)
      : undefined;

  return {
    basics: { ...empty.basics, ...(o.basics as object) },
    ...(customLabels ? { customLabels } : {}),
    work:         ensureIds(arr("work")),
    education:    ensureIds(arr("education")),
    projects:     ensureIds(arr("projects")),
    skills:       ensureIds(arr("skills")),
    awards:       ensureIds(arr("awards")),
    languages:    ensureIds(arr("languages")),
    publications: ensureIds(arr("publications")),
    talks:        ensureIds(arr("talks")),
    teaching:     ensureIds(arr("teaching")),
    notes:        ensureIds(arr("notes")),
    // Custom sections — refresh missing ids on the section AND its entries.
    customSections: arr("customSections")
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x))
      .map((x) => ({
        id: typeof x.id === "string" && x.id ? x.id : uid(),
        label: typeof x.label === "string" ? x.label : "",
        description: typeof x.description === "string" ? x.description : undefined,
        entries: Array.isArray(x.entries)
          ? (x.entries as unknown[])
              .filter((e): e is Record<string, unknown> => !!e && typeof e === "object" && !Array.isArray(e))
              .map((e) => ({
                ...(e as object),
                id: typeof e.id === "string" && e.id ? e.id : uid(),
              })) as any
          : [],
      })),
  };
}

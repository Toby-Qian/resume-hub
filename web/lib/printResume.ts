import type { Resume } from "./schema";

/**
 * Sanitize a string for use as a filename component. Drops characters that
 * Windows / macOS / Linux all dislike (`/ \ : * ? " < > |`) plus runs of
 * whitespace. Empty strings stay empty so callers can filter them out.
 */
function safeFileSegment(s: string): string {
  return s.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_").trim();
}

/**
 * Wrap `window.print()` so the browser's "Save as PDF" dialog defaults to a
 * meaningful filename (`Name_Label_YYYY-MM-DD.pdf`) instead of the React
 * route title.
 *
 * Browsers derive the suggested filename from `document.title` at print
 * time. We swap the title for the duration of the print, then restore it
 * on the `afterprint` event. Firefox / older Safari sometimes don't fire
 * `afterprint`, so we also schedule a fallback restore after 5s.
 */
export function printResume(resume: Resume) {
  const name = safeFileSegment(resume.basics.name || "resume");
  const label = safeFileSegment(resume.basics.label || "");
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = [name || "resume", label, date].filter(Boolean).join("_");

  const orig = document.title;
  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    document.title = orig;
  };

  document.title = filename;
  window.addEventListener("afterprint", restore, { once: true });
  // Safety net for browsers that don't fire afterprint reliably.
  setTimeout(restore, 5000);

  window.print();
}

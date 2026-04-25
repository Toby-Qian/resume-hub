"use client";

/**
 * Optional, env-driven error reporting. Set NEXT_PUBLIC_SENTRY_DSN in
 * your environment (e.g. Vercel project settings) and this module loads
 * `@sentry/browser` lazily and initialises it with sensible defaults.
 *
 * If the env var is unset (the default for local dev) this is a no-op
 * and `@sentry/browser` is NOT pulled into the bundle — see the dynamic
 * import below. So the dependency is *optional* — install only when you
 * actually want reporting:
 *
 *     npm i @sentry/browser
 *
 * For now we ship without it; run install + set DSN to flip it on.
 *
 * Also installs a window.onerror / unhandledrejection listener that
 * forwards uncaught errors to console so we at least see them while
 * Sentry is dormant.
 */

let installed = false;
export function installErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // Always install a basic console fallback so unhandled errors are visible.
  window.addEventListener("error", (e) => {
    // eslint-disable-next-line no-console
    console.error("[resume-hub] uncaught", e.error || e.message);
  });
  window.addEventListener("unhandledrejection", (e) => {
    // eslint-disable-next-line no-console
    console.error("[resume-hub] unhandled rejection", e.reason);
  });

  // Lazy-init Sentry only when DSN is present. The dynamic import keeps
  // the SDK out of the main bundle when not configured.
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  // We intentionally hide the import string from webpack's static
  // analyzer (via the Function constructor) so the build doesn't fail
  // when @sentry/browser isn't installed. Once you `npm i @sentry/browser`
  // and set NEXT_PUBLIC_SENTRY_DSN, the SDK loads at runtime.
  try {
    const dynImport = new Function("p", "return import(p)") as (p: string) => Promise<any>;
    dynImport("@sentry/browser")
      .then((Sentry: any) => {
        Sentry.init({
          dsn,
          sendDefaultPii: false,
          tracesSampleRate: 0.1,
        });
        (window as any).Sentry = Sentry;
      })
      .catch(() => { /* SDK not installed — silently skip. */ });
  } catch { /* old browser without dynamic import — skip. */ }
}

"use client";
import { useEffect } from "react";
import { installErrorReporting } from "@/lib/errorReporting";

/** Tiny client component that hooks Sentry / console error listeners
 *  on first mount. Empty render — purely a side-effect host.           */
export function ReportingBootstrap() {
  useEffect(() => { installErrorReporting(); }, []);
  return null;
}

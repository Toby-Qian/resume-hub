"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** Inject webfont stylesheets via JS on mount, AFTER first paint.
 *
 *  Why: Loading 14 Google-Fonts families and the LXGW WenKai CJK font as
 *  blocking `<link rel="stylesheet">` in `<head>` adds 1–3 s of TTFB-blocking
 *  CSS download. Most users only ever look at one or two of these — picking
 *  is optional in the Style panel. Deferring all of them to a post-mount
 *  script lets the page paint immediately; fonts swap in when ready thanks
 *  to `font-display: swap` in the Google Fonts CSS itself.                  */
export function FontLoader() {
  // Subscribe to the two font fields that can opt the resume into LXGW
  // WenKai. The CSS for it is huge (~5 MB across font shards) so we only
  // append the stylesheet when the user actually picks the family. Use
  // primitive selectors so we don't re-render on unrelated state changes.
  const fontSans  = useStore((s) => s.theme.fontSans);
  const fontSerif = useStore((s) => s.theme.fontSerif);

  // Mount-once: bulk Google Fonts.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("rh-fonts-google")) return;

    const link = document.createElement("link");
    link.id = "rh-fonts-google";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2" +
      "?family=Inter:wght@400;500;600;700" +
      "&family=EB+Garamond:wght@400;500;600" +
      "&family=Lora:wght@400;500;600;700" +
      "&family=Source+Serif+4:wght@400;500;600;700" +
      "&family=Playfair+Display:wght@400;600;700" +
      "&family=Noto+Sans+SC:wght@300;400;500;600;700" +
      "&family=Noto+Serif+SC:wght@400;500;600;700" +
      "&family=ZCOOL+XiaoWei&family=ZCOOL+KuaiLe&family=ZCOOL+QingKe+HuangYou" +
      "&family=Ma+Shan+Zheng&family=Long+Cang&family=Liu+Jian+Mao+Cao" +
      "&display=swap";
    document.head.appendChild(link);
  }, []);

  // Lazy: append LXGW WenKai stylesheet only when the active theme picks it.
  // Driven by zustand state, not a MutationObserver — the previous version
  // observed every body/.paper attribute change and could fire continuously
  // during print preview, which crashed Chromium on some machines.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const wantsLxgw =
      (fontSans && fontSans.includes("LXGW")) ||
      (fontSerif && fontSerif.includes("LXGW"));
    if (!wantsLxgw) return;
    if (document.getElementById("rh-fonts-lxgw")) return;
    const lx = document.createElement("link");
    lx.id = "rh-fonts-lxgw";
    lx.rel = "stylesheet";
    lx.href = "https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css";
    document.head.appendChild(lx);
  }, [fontSans, fontSerif]);

  return null;
}

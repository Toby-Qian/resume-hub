"use client";
import { useEffect } from "react";

/** Inject webfont stylesheets via JS on mount, AFTER first paint.
 *
 *  Why: Loading 14 Google-Fonts families and the LXGW WenKai CJK font as
 *  blocking `<link rel="stylesheet">` in `<head>` adds 1–3 s of TTFB-blocking
 *  CSS download (especially LXGW WenKai, ~5 MB CSS that references multi-MB
 *  font shards). Most users only ever look at one or two of these — the rest
 *  are picked optionally from the Style panel. Deferring all of them to a
 *  post-mount script lets the page paint immediately; fonts swap in when
 *  ready thanks to `font-display: swap` in the Google Fonts CSS itself.     */
export function FontLoader() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("rh-fonts-google")) return; // already injected

    const googleFontsHref =
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

    const link = document.createElement("link");
    link.id = "rh-fonts-google";
    link.rel = "stylesheet";
    link.href = googleFontsHref;
    document.head.appendChild(link);

    // LXGW WenKai is huge (~5MB CSS+font shards) — only load it when the user
    // actually selects it in the Style panel. Lazily inject by watching the
    // computed body font for the LXGW family name.
    const observer = new MutationObserver(() => {
      const usingLxgw = document.body && getComputedStyle(document.body).fontFamily.includes("LXGW");
      const paperHasLxgw = !!document.querySelector('.paper [style*="LXGW"]');
      if ((usingLxgw || paperHasLxgw) && !document.getElementById("rh-fonts-lxgw")) {
        const lx = document.createElement("link");
        lx.id = "rh-fonts-lxgw";
        lx.rel = "stylesheet";
        lx.href = "https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css";
        document.head.appendChild(lx);
      }
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style", "class"] });
    return () => observer.disconnect();
  }, []);

  return null;
}

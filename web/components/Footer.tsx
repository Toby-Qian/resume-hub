"use client";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

/** Site footer: privacy line, GitHub link, disclaimer.
 *  Hidden during print so PDFs don't carry it.                          */
export function Footer() {
  const lang = useStore((s) => s.lang);
  const L = t(lang);
  const F = (L as any).footer ?? {};
  return (
    <footer className="no-print mt-6 mb-4 px-4">
      <div className="max-w-[1600px] mx-auto border-t border-gray-200/70 pt-4 text-[0.7rem] text-gray-500 leading-relaxed flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-500">🔒</span>
          <span>
            {F.privacy ?? "所有内容仅保存在你的浏览器本地，不会上传到任何服务器。"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Toby-Qian/resume-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            <span>★</span>
            <span>{F.github ?? "在 GitHub 查看源码"}</span>
          </a>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400">
            {F.disclaimer ?? "早期版本 · 建议定期导出 JSON 备份"}
          </span>
        </div>
      </div>
    </footer>
  );
}

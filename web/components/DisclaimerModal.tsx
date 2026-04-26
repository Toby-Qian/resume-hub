"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** Full disclaimer modal. Opens from the footer "查看完整免责声明" link.
 *  Esc or click-outside closes; Tab-trap not implemented since it's a
 *  small read-only dialog. */
export function DisclaimerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  const zh = lang === "zh";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-sm no-print px-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="text-base font-semibold text-gray-800">
            {zh ? "免责声明 & 使用须知" : "Disclaimer & Terms"}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition flex items-center justify-center"
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto text-[0.85rem] text-gray-700 leading-relaxed space-y-4">
          {zh ? <ZhBody /> : <EnBody />}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-gray-900 text-white text-xs hover:bg-gray-700 transition"
          >
            {zh ? "我已知晓" : "I understand"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[0.78rem] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
        {title}
      </h3>
      <div className="text-gray-700 space-y-1.5">{children}</div>
    </section>
  );
}

function ZhBody() {
  return (
    <>
      <Section title="1. 数据存储与隐私">
        <p>
          本应用为<strong>纯前端工具</strong>，所有数据（个人信息、工作经历、上传的头像与图片等）均仅保存在你当前浏览器的 <code className="px-1 rounded bg-gray-100 text-gray-800">localStorage</code> 中。
        </p>
        <p>
          我们 <strong>不会</strong> 将任何内容上传到服务器，<strong>不会</strong> 设置任何用于身份追踪的 Cookie，也<strong>不会</strong>把数据共享给第三方。简历内容只属于你本人。
        </p>
        <p>
          作为代价：清除浏览器数据 / 切换设备 / 切换浏览器都会导致数据丢失。<strong>请定期点击 "导出 JSON" 备份。</strong>
        </p>
      </Section>

      <Section title="2. 模板版权">
        <p>
          画廊页展示的 GitHub 简历模板由开源作者创作，本应用仅聚合并展示其元数据（仓库名、描述、星标数、链接）。所有模板的源码、设计与版权均归原作者所有，使用前请阅读各自仓库的 LICENSE。
        </p>
        <p>
          内置的 14 套 React 模板由本项目作者编写，遵循仓库根目录的 MIT 许可证，可自由复用、修改、商用。
        </p>
      </Section>

      <Section title="3. 服务可用性">
        <p>
          本应用以 <strong>"现状"</strong>（as-is）形式提供，<strong>不提供任何形式的服务保证</strong>，包括但不限于：可用性、准确性、对特定用途的适用性、PDF 导出兼容性、跨浏览器/设备一致性等。
        </p>
        <p>
          作者可能在任何时刻调整、暂停或终止本服务，恕不另行通知。
        </p>
      </Section>

      <Section title="4. 责任范围">
        <p>
          因使用、误用、无法使用本应用，或因数据丢失、PDF 渲染异常、模板内容错误、第三方仓库链接失效等导致的任何直接或间接损失（包括但不限于求职机会、面试、收入损失等），作者<strong>不承担任何责任</strong>。
        </p>
        <p>
          请在投递前自行检查 PDF 渲染效果与简历内容真实性。
        </p>
      </Section>

      <Section title="5. 用户责任">
        <p>
          请勿在简历中填写他人的真实信息或虚假经历。请勿利用本工具生成用于欺诈、伪造、规避背景调查的简历。
        </p>
        <p>
          上传的头像 / 图片若涉及他人肖像、品牌商标或受版权保护的素材，由你自行承担相应法律责任。
        </p>
      </Section>

      <Section title="6. 反馈与联系">
        <p>
          这是一个早期阶段的个人项目，欢迎在 GitHub 提 Issue / PR：
          <a href="https://github.com/Toby-Qian/resume-hub/issues" target="_blank" rel="noopener noreferrer"
             className="text-blue-600 hover:underline ml-1">github.com/Toby-Qian/resume-hub</a>
        </p>
      </Section>

      <p className="text-[0.7rem] text-gray-400 pt-2 border-t border-gray-100">
        最后更新：2025-04 · 继续使用即表示你已阅读并同意以上条款。
      </p>
    </>
  );
}

function EnBody() {
  return (
    <>
      <Section title="1. Storage & Privacy">
        <p>
          This app is a <strong>fully client-side tool</strong>. Everything you enter — personal details, work history, uploaded avatars and images — lives only in your browser&apos;s <code className="px-1 rounded bg-gray-100 text-gray-800">localStorage</code>.
        </p>
        <p>
          We do <strong>not</strong> upload your data to any server, do <strong>not</strong> set tracking cookies, and do <strong>not</strong> share anything with third parties. Your résumé is yours.
        </p>
        <p>
          The trade-off: clearing browser data, switching devices, or switching browsers will lose your data. <strong>Use &quot;Export JSON&quot; regularly to back up.</strong>
        </p>
      </Section>

      <Section title="2. Template copyright">
        <p>
          The GitHub résumé templates shown in the gallery are authored by the open-source community. This app only aggregates their metadata (repo name, description, stars, link). All template source code, design, and copyright belong to the original authors — read each repo&apos;s LICENSE before reuse.
        </p>
        <p>
          The 14 built-in React templates are written by this project and released under the repo&apos;s MIT license — free to reuse, modify, and use commercially.
        </p>
      </Section>

      <Section title="3. Service availability">
        <p>
          The app is provided <strong>as-is</strong>, with <strong>no warranty of any kind</strong>, including but not limited to availability, accuracy, fitness for any particular purpose, PDF export fidelity, or cross-browser consistency.
        </p>
        <p>
          The author may modify, pause, or shut down the service at any time without notice.
        </p>
      </Section>

      <Section title="4. Limitation of liability">
        <p>
          The author is <strong>not liable</strong> for any direct or indirect loss arising from using, misusing, or being unable to use this app — including but not limited to data loss, PDF rendering issues, template errors, broken third-party links, or downstream consequences such as missed job opportunities, interviews, or earnings.
        </p>
        <p>
          Always proofread your PDF and verify the contents of your résumé before submitting.
        </p>
      </Section>

      <Section title="5. User responsibility">
        <p>
          Do not enter someone else&apos;s real information or fabricate work experience. Do not use this tool to produce résumés for fraud, forgery, or circumventing background checks.
        </p>
        <p>
          If your uploaded avatar / images involve another person&apos;s likeness, brand trademarks, or copyrighted material, you bear the legal responsibility for that use.
        </p>
      </Section>

      <Section title="6. Feedback & contact">
        <p>
          This is an early-stage personal project. Issues and PRs welcome:
          <a href="https://github.com/Toby-Qian/resume-hub/issues" target="_blank" rel="noopener noreferrer"
             className="text-blue-600 hover:underline ml-1">github.com/Toby-Qian/resume-hub</a>
        </p>
      </Section>

      <p className="text-[0.7rem] text-gray-400 pt-2 border-t border-gray-100">
        Last updated: 2025-04 · Continued use means you have read and accepted these terms.
      </p>
    </>
  );
}

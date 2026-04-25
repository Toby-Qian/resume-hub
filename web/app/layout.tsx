import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReportingBootstrap } from "@/components/ReportingBootstrap";

export const metadata: Metadata = {
  title: "Resume Hub — 简历聚合 & 编辑器",
  description: "聚合 500+ GitHub 开源简历模板，浏览器端在线编辑，一键导出 PDF。所有数据仅保存在你的浏览器本地。",
  keywords: ["简历", "resume", "CV", "JSON Resume", "PDF", "GitHub templates"],
  authors: [{ name: "Toby Qian" }],
  // Favicon auto-discovered from app/icon.svg by Next App Router.
  openGraph: {
    title: "Resume Hub — 简历聚合 & 编辑器",
    description: "在浏览器里 0 后端在线编辑简历，500+ GitHub 模板可选，一键导出 PDF。",
    type: "website",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <ErrorBoundary>
          <ReportingBootstrap />
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReportingBootstrap } from "@/components/ReportingBootstrap";
import { MobileWarning } from "@/components/MobileWarning";

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
      <head>
        {/* Webfonts.
            Most CJK families the user can pick (Noto Sans/Serif SC, EB Garamond,
            Inter, ZCOOL XiaoWei, Ma Shan Zheng, Long Cang, ZCOOL QingKe
            HuangYou, etc.) aren't pre-installed on typical machines, so picking
            them in the panel would otherwise silently fall back. We load them
            from Google Fonts (CSS2 supports range subsetting per family).
            LXGW WenKai is hosted on jsdelivr — it's the de-facto open-source
            handwritten/学術 font used in Chinese resumes. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href={
            "https://fonts.googleapis.com/css2" +
            "?family=Inter:wght@400;500;600;700" +
            "&family=EB+Garamond:wght@400;500;600&family=Lora:wght@400;500;600;700" +
            "&family=Source+Serif+4:wght@400;500;600;700" +
            "&family=Playfair+Display:wght@400;600;700" +
            "&family=Noto+Sans+SC:wght@300;400;500;600;700" +
            "&family=Noto+Serif+SC:wght@400;500;600;700" +
            "&family=ZCOOL+XiaoWei&family=ZCOOL+KuaiLe&family=ZCOOL+QingKe+HuangYou" +
            "&family=Ma+Shan+Zheng&family=Long+Cang&family=Liu+Jian+Mao+Cao" +
            "&display=swap"
          }
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css"
        />
      </head>
      <body>
        <ErrorBoundary>
          <ReportingBootstrap />
          {children}
        </ErrorBoundary>
        <MobileWarning />
        <Toaster />
      </body>
    </html>
  );
}

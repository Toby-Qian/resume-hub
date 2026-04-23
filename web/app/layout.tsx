import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Hub",
  description: "Aggregate GitHub resume templates, edit online, switch themes, export PDF.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}

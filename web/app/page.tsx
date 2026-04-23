"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";
import { StylePanel } from "@/components/StylePanel";
import { Gallery } from "@/components/Gallery";
import { Toolbar } from "@/components/Toolbar";

type Tab = "editor" | "gallery";

export default function Home() {
  const { lang } = useStore();
  const L = t(lang);
  const [tab, setTab] = useState<Tab>("editor");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // avoid hydration mismatch from zustand persist

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white no-print">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-6">
          <div>
            <div className="text-base font-bold">{L.appTitle}</div>
            <div className="text-xs text-gray-500">{L.appSub}</div>
          </div>
          <nav className="ml-auto flex gap-1">
            {(["editor", "gallery"] as Tab[]).map((x) => (
              <button key={x} onClick={() => setTab(x)}
                className={`px-3 py-1.5 text-sm rounded ${tab === x ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                {L.tabs[x]}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {tab === "gallery" ? (
        <Gallery />
      ) : (
        <div className="max-w-[1600px] mx-auto grid grid-cols-[320px_1fr_280px] gap-4 p-4">
          <aside className="bg-white rounded-lg border p-4 h-[calc(100vh-100px)] overflow-y-auto no-print">
            <Toolbar />
            <div className="mt-4"><Editor /></div>
          </aside>
          <main className="flex justify-center overflow-auto h-[calc(100vh-100px)]">
            <Preview />
          </main>
          <aside className="bg-white rounded-lg border p-4 h-[calc(100vh-100px)] overflow-y-auto no-print">
            <div className="text-xs font-semibold uppercase text-gray-500 mb-3">{L.tabs.settings}</div>
            <StylePanel />
          </aside>
        </div>
      )}
    </div>
  );
}

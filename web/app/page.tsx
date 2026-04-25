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
type Pane = "editor" | "preview" | "style";

export default function Home() {
  const { lang } = useStore();
  const L = t(lang);
  const [tab, setTab] = useState<Tab>("editor");
  const [pane, setPane] = useState<Pane>("editor");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // avoid hydration mismatch from zustand persist

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/70">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white text-sm font-bold shadow-sm">
              R
            </div>
            <div className="leading-tight">
              <div className="text-[0.95rem] font-semibold text-gray-900">{L.appTitle}</div>
              <div className="text-[0.7rem] text-gray-500 hidden sm:block">{L.appSub}</div>
            </div>
          </div>
          <nav className="ml-auto flex gap-0.5 bg-gray-100/80 rounded-full p-0.5">
            {(["editor", "gallery"] as Tab[]).map((x) => (
              <button key={x} onClick={() => setTab(x)}
                className={`px-3.5 py-1.5 text-sm rounded-full transition-all ${
                  tab === x
                    ? "bg-white text-gray-900 shadow-sm font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                {L.tabs[x]}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {tab === "gallery" ? (
        <Gallery />
      ) : (
        <>
          {/* Mobile pane switcher: visible below lg */}
          <div className="lg:hidden sticky top-[57px] z-30 bg-white/85 backdrop-blur-md border-b border-gray-200/70 no-print">
            <div className="max-w-[1600px] mx-auto px-4 py-2 flex gap-0.5 bg-gray-100/80 rounded-full p-0.5 my-2">
              {([
                ["editor", L.tabs.editor],
                ["preview", L.tabs.preview],
                ["style", L.tabs.settings],
              ] as [Pane, string][]).map(([p, label]) => (
                <button key={p} onClick={() => setPane(p)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-full transition-all ${
                    pane === p
                      ? "bg-white text-gray-900 shadow-sm font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr_300px] gap-4 p-4">
            <aside
              className={`pane pane-editor bg-white rounded-2xl border border-gray-200/70 shadow-sm lg:h-[calc(100vh-100px)] lg:overflow-y-auto no-print ${
                pane === "editor" ? "block" : "hidden lg:block"
              }`}
            >
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 pt-4 pb-3 rounded-t-2xl">
                <Toolbar />
              </div>
              <div className="px-4 pb-4 pt-2"><Editor /></div>
            </aside>
            <main
              className={`pane pane-preview flex justify-center lg:overflow-auto lg:h-[calc(100vh-100px)] ${
                pane === "preview" ? "block" : "hidden lg:flex"
              }`}
            >
              <Preview />
            </main>
            <aside
              className={`pane pane-style bg-white rounded-2xl border border-gray-200/70 shadow-sm p-4 lg:h-[calc(100vh-100px)] lg:overflow-y-auto no-print ${
                pane === "style" ? "block" : "hidden lg:block"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-700">{L.tabs.settings}</div>
              </div>
              <StylePanel />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

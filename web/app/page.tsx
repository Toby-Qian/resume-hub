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
      <header className="border-b bg-white no-print sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div>
            <div className="text-base font-bold">{L.appTitle}</div>
            <div className="text-[0.7rem] sm:text-xs text-gray-500 hidden sm:block">{L.appSub}</div>
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
        <>
          {/* Mobile pane switcher: visible below lg */}
          <div className="lg:hidden sticky top-[57px] z-30 bg-white border-b no-print">
            <div className="max-w-[1600px] mx-auto px-4 py-2 flex gap-1">
              {([
                ["editor", L.tabs.editor],
                ["preview", L.tabs.preview],
                ["style", L.tabs.settings],
              ] as [Pane, string][]).map(([p, label]) => (
                <button key={p} onClick={() => setPane(p)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded ${
                    pane === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr_280px] gap-4 p-4">
            <aside
              className={`pane pane-editor bg-white rounded-lg border p-4 lg:h-[calc(100vh-100px)] lg:overflow-y-auto no-print ${
                pane === "editor" ? "block" : "hidden lg:block"
              }`}
            >
              <Toolbar />
              <div className="mt-4"><Editor /></div>
            </aside>
            <main
              className={`pane pane-preview flex justify-center lg:overflow-auto lg:h-[calc(100vh-100px)] ${
                pane === "preview" ? "block" : "hidden lg:flex"
              }`}
            >
              <Preview />
            </main>
            <aside
              className={`pane pane-style bg-white rounded-lg border p-4 lg:h-[calc(100vh-100px)] lg:overflow-y-auto no-print ${
                pane === "style" ? "block" : "hidden lg:block"
              }`}
            >
              <div className="text-xs font-semibold uppercase text-gray-500 mb-3">{L.tabs.settings}</div>
              <StylePanel />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

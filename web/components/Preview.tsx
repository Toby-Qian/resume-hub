"use client";
import { useRef } from "react";
import { useStore } from "@/lib/store";
import { templates } from "@/templates";
import { t } from "@/lib/i18n";
import { NotesLayer } from "./NotesLayer";
import { toast } from "@/lib/toast";

export function Preview() {
  const { resume, template, theme, lang, addNote, addImageNote } = useStore();
  const L = t(lang);
  const Tpl = templates[template];
  const imgRef = useRef<HTMLInputElement>(null);

  const onPickImage = async (f: File) => {
    if (f.size > 800 * 1024) { toast.error(L.form.avatarTooLarge); return; }
    const reader = new FileReader();
    reader.onload = () => addImageNote(reader.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex items-center gap-1.5 no-print rounded-full bg-white border border-gray-200 shadow-sm px-2 py-1.5">
        <button
          type="button"
          onClick={addNote}
          className="text-xs px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition flex items-center gap-1"
          title={(L.preview as any).addNoteHint ?? "在简历上添加一个自由文本框"}
        >
          <span className="text-amber-600">＋</span>
          {(L.preview as any).addNote ?? "文本框"}
        </button>
        <button
          type="button"
          onClick={() => imgRef.current?.click()}
          className="text-xs px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition flex items-center gap-1"
          title={(L.preview as any).addImageHint ?? "在简历上插入一张图片（可拖动、缩放）"}
        >
          <span className="text-amber-600">＋</span>
          {(L.preview as any).addImage ?? "图片"}
        </button>
        <input ref={imgRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickImage(f); e.target.value = ""; }} />
      </div>
      <div
        className={`paper paper-flow print-area density-${theme.density}`}
        style={{
          ["--resume-accent" as any]: theme.accent,
          ["--resume-font-sans" as any]: theme.fontSans,
          ["--resume-font-serif" as any]: theme.fontSerif,
          ["--resume-font-scale" as any]: String(theme.fontScale),
          fontFamily: "var(--resume-font-sans)",
        }}
      >
        <Tpl resume={resume} />
        <NotesLayer />
      </div>
      <div className="text-[0.7rem] text-gray-400 mt-2 mb-4 px-4 text-center max-w-[794px] no-print space-y-0.5">
        <div>{(L.preview as any).editHint ?? "点击任意文字即可在预览中直接编辑；悬停文本区块左侧可拖动整段位置"}</div>
        <div>{(L.preview as any).noteHint ?? "文本框 / 图片：点击选中，拖动或 Alt+拖移动，方向键微移，Delete 删除，Ctrl+D 复制"}</div>
        <div>{L.preview.pageHint}</div>
      </div>
    </div>
  );
}

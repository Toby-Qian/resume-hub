"use client";
import { useToastStore } from "@/lib/toast";

const kindStyles: Record<string, string> = {
  success: "bg-emerald-600 border-emerald-700",
  error: "bg-rose-600 border-rose-700",
  info: "bg-slate-800 border-slate-900",
};

const kindIcon: Record<string, string> = {
  success: "✓",
  error: "!",
  info: "i",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 no-print"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`min-w-[220px] max-w-[360px] text-white text-sm px-3 py-2 rounded-md shadow-lg border flex items-start gap-2 animate-[slidein_.18s_ease-out] ${kindStyles[t.kind]}`}
        >
          <span
            aria-hidden
            className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-white/20 text-xs font-bold inline-flex items-center justify-center"
          >
            {kindIcon[t.kind]}
          </span>
          <span className="flex-1 leading-snug break-words">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="opacity-70 hover:opacity-100 text-white text-base leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
      <style jsx global>{`
        @keyframes slidein {
          from { transform: translateX(8px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

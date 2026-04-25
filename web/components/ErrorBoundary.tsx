"use client";
import React from "react";

interface Props { children: React.ReactNode }
interface State { error: Error | null }

/**
 * Top-level error boundary. Without it, an uncaught render error in any
 * template / note / editor field would show the full Next.js dev overlay
 * in dev and a blank page in production. Here we render a recoverable
 * card that points the user at a download-backup escape hatch.
 *
 * Persisted resume data is still in localStorage at this point, so
 * suggesting "export JSON" actually works — the user can recover
 * everything they typed.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Forward to Sentry / console. lib/sentry attaches a global handler too,
    // but render errors don't surface via window.onerror so this is needed.
    if (typeof window !== "undefined") {
      const w: any = window;
      if (w.Sentry?.captureException) w.Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
      else console.error("[resume-hub]", error, info.componentStack);
    }
  }
  reset = () => this.setState({ error: null });
  exportBackup = () => {
    try {
      const raw = localStorage.getItem("proj4-resume");
      if (!raw) return;
      const blob = new Blob([raw], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `resume-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  };
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 grid place-items-center text-white text-lg shadow-sm">⚠</div>
            <div>
              <div className="text-base font-semibold text-gray-900">出错了 / Something broke</div>
              <div className="text-xs text-gray-500 mt-0.5">{String(this.state.error.message || this.state.error)}</div>
            </div>
          </div>
          <div className="text-[0.78rem] text-gray-700 leading-relaxed mb-4">
            页面渲染遇到错误。你的数据还在浏览器本地，建议点下方按钮**先备份一份**，再尝试刷新。
            <br />
            <span className="text-gray-500">Render crashed. Your data is safe in localStorage — please export a backup before refreshing.</span>
          </div>
          <div className="flex gap-2">
            <button onClick={this.exportBackup}
              className="text-xs px-3 py-1.5 rounded-lg border bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-sm transition">
              ↓ 备份本地数据 / Backup data
            </button>
            <button onClick={this.reset}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition">
              重试 / Retry
            </button>
            <button onClick={() => location.reload()}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition">
              刷新 / Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}

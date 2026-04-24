"use client";
import { create } from "zustand";

export type ToastKind = "success" | "error" | "info";
export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastKind, message: string, ttl?: number) => void;
  dismiss: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (kind, message, ttl = 3000) => {
    const id = uid();
    set({ toasts: [...get().toasts, { id, kind, message }] });
    if (ttl > 0) {
      setTimeout(() => get().dismiss(id), ttl);
    }
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().push("success", msg),
  error: (msg: string) => useToastStore.getState().push("error", msg, 5000),
  info: (msg: string) => useToastStore.getState().push("info", msg),
};

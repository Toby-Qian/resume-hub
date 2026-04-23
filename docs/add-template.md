# 新增内置模板

所有模板都是接收一份 `Resume` 的 React 组件。

## 步骤

1. 在 `web/templates/` 新建 `yourname.tsx`，参考 `modern.tsx` 的结构：
   ```tsx
   "use client";
   import { TemplateProps, Section, range } from "./shared";
   export default function YourTpl({ resume }: TemplateProps) {
     return <div style={{ padding: "var(--pad)" }}> ... </div>;
   }
   ```
   - 使用 CSS 变量 `var(--resume-accent)`、`var(--pad)` 以响应样式面板。
   - 字体走 `var(--resume-font-sans)` / `var(--resume-font-serif)`。
2. 在 `web/templates/index.ts` 的 `templates` 和 `templateList` 中注册。
3. 在 `web/lib/store.ts` 的 `TemplateId` 类型中加 id。
4. 在 `web/lib/i18n.ts` 的 `T.zh.templates` / `T.en.templates` 中加显示名。

## 设计原则

- **只渲染有数据的分区**：`resume.work.length > 0 && (...)`，避免空白标题。
- **单栏优先**：A4 单栏更便于 ATS 解析；双栏用于视觉型角色。
- **字号用 em**：整体字号由用户在样式面板控制，模板内部用相对值。

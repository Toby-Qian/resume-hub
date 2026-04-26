# resume-hub · Aggregator + Online Editor for Résumé Templates

[![Live](https://img.shields.io/badge/live-resume--hub--mu--eight.vercel.app-black?logo=vercel)](https://resume-hub-mu-eight.vercel.app)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FToby-Qian%2Fresume-hub&root-directory=web)
[![Weekly refresh](https://github.com/Toby-Qian/resume-hub/actions/workflows/refresh-templates.yml/badge.svg)](https://github.com/Toby-Qian/resume-hub/actions/workflows/refresh-templates.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🇺🇸 English ｜ 🇨🇳 [简体中文](README.md)

A **fully client-side**, bilingual (Chinese & English) résumé editor: 16 built-in templates, PowerPoint-style free-form layout (multi-select / align / snap), one-click PDF export. Your data stays in **your** browser — nothing is uploaded.

> 🚀 **Try it**: <https://resume-hub-mu-eight.vercel.app>

![screenshot](docs/screenshot.png)

---

## ✨ Features

### Editor
- 📝 **JSON Resume–compatible schema** — work / education / projects / skills / awards / languages
- 🎨 **16 built-in templates** — Modern · Classic · Minimal · Elegant · Compact · Timeline · Chinese-formal · Chinese-creative · 4 Academic variants + 3 brand-new visual styles:
  - 🌈 **Infographic** — animated skill bars + 5-dot language proficiency + ribbon-style section heads
  - 📰 **Magazine** — large serif masthead + drop-cap summary + two-column body
  - 🌑 **Dark Card** — accent-gradient hero band + soft card panels + chip-style keyword tags
- 🌐 **Bilingual section titles** — toggling the UI language flips every template's headings (Experience ↔ 工作经历, Education ↔ 教育背景 …) instantly
- 🖼️ **Hover thumbnails** preview each template rendered with *your* data
- 📅 Native month picker + "Present" toggle for date fields
- 📊 **Completeness score** — 13 weighted signals; hover to see what's missing
- ↩️ Ctrl+Z / Ctrl+Y undo/redo (80-step history)

### Free-form Layout (PowerPoint-style)
- ➕ Drop text boxes / images / shapes (line / rect / circle) anywhere
- 🎯 **Multi-select + alignment toolbar** — Shift-click / marquee drag-select; align left / right / top / bottom / center, distribute h&v
- 📐 **PowerPoint-style dashed snap guides** — element edges, centers, and page midline
- 🖱️ Group drag, Alt-drag from inside text, arrow-key nudge (1px / 10px with Shift)
- 🔒 Lock / bring-to-front / duplicate / paste-from-clipboard
- 📋 Ctrl+V to paste a clipboard image directly onto the page

### Style Controls
- 🎨 8 curated theme presets + custom accent colour
- 📏 Line height (1.1–2.2) + font scale + density (compact / comfy / spacious)
- 📌 5 bullet styles (• ○ ■ — ∅) with **independent colour**
- 📄 Live-adjustable page margin (mm precision)
- 👁️ One-click section visibility toggles (data preserved)

### Export
- 🖨️ A4 / Letter, automatic pagination + page numbers + footer line
- 💾 JSON import / export — portable to other JSON Resume tools
- ⌨️ Ctrl+S triggers PDF export directly

### Template Gallery
- 🗂️ 500+ Chinese & English résumé templates auto-scraped from GitHub Search API
- 🔍 Filter by language / stack / keyword
- 🪶 LaTeX templates ship with **Open in Overleaf** quick-import

### Privacy First
- 🔒 **Zero servers** — everything in localStorage, nothing uploaded or tracked
- 🚫 No cookies, no third-party analytics
- 💾 Built-in error boundary + one-click local-data backup as a safety net

---

## 🛠 Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 App Router · TypeScript · Tailwind CSS · Zustand (with persist) |
| PDF | Browser native print · `@page` · `break-inside: avoid` |
| Images | Canvas-based auto-compression (>700KB → resize to 1600px, JPEG q=0.85→0.4 staircase) |
| State | Zustand + persist middleware + 80-step undo/redo |
| Scraper | Python · GitHub REST API · 11 dedup-aware queries |
| Hosting | Vercel (Root Directory = `web/`) |
| Automation | GitHub Actions refresh `data/templates.json` weekly (Mon 06:00 UTC) |
| Error reporting | Optional Sentry (loaded at runtime; absent dependency doesn't break the build) |

---

## 📁 Repo layout

```
resume-hub/
├── .github/workflows/
│   └── refresh-templates.yml    Weekly template refresh
├── scraper/
│   ├── fetch_templates.py       11 GitHub Search queries + dedup
│   └── requirements.txt
├── data/
│   └── templates.json           Scraper output (gallery datasource)
├── docs/
│   ├── deployment.md
│   └── add-template.md
├── web/                         Next.js app (Vercel Root = this dir)
│   ├── app/                     page.tsx · layout.tsx · globals.css · icon.svg
│   ├── components/              Editor · Preview · NotesLayer · AlignToolbar
│   │                            · StylePanel · TemplatePreview · DateField
│   │                            · DisclaimerModal · ErrorBoundary · ...
│   ├── lib/                     store · schema · i18n · samples · imageCompress
│   ├── templates/               16 built-in templates + shared Avatar/Section + useSectionLabels
│   └── public/                  sample-avatar.jpg · static assets
└── README.md / README.en.md
```

---

## 🚀 Quick start

```bash
git clone https://github.com/Toby-Qian/resume-hub.git
cd resume-hub/web

npm install
npm run dev          # http://localhost:3000
```

Optional — re-scrape the gallery data (needs a GitHub token):

```bash
cd ../scraper
pip install -r requirements.txt

# Linux / macOS
GITHUB_TOKEN=ghp_xxx python fetch_templates.py
# Windows PowerShell
$env:GITHUB_TOKEN="ghp_xxx"; python fetch_templates.py

cp ../data/templates.json ../web/data/templates.json
```

---

## 🌍 Deploy

**One-click to Vercel**: hit *Deploy with Vercel* at the top, then set **Root Directory** to `web` (the repo has no root `package.json`, so this step is required).

After that, every push to `main` ships automatically and PRs get preview URLs.

Full guide: [docs/deployment.md](docs/deployment.md).

---

## ⌨️ Keyboard shortcuts

| Scope | Keys | Action |
|---|---|---|
| Global | `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo |
| Global | `Ctrl+S` | Export PDF |
| Global | `Ctrl+V` | Paste a clipboard image onto the canvas |
| Global | `Ctrl + Wheel` / `Ctrl+0` / `Ctrl+±` | Zoom preview |
| Global | `?` | Show keyboard cheat sheet |
| Float elements | Drag | Snap to edges / centers / page midline |
| Float elements | `Shift+Drag` | Temporarily disable snapping |
| Float elements | `Shift+Click` | Add / remove from multi-selection |
| Float elements | `Ctrl+A` | Select all floating elements |
| Float elements | `↑↓←→` | Nudge 1px (`Shift` for 10px) |
| Float elements | `Delete` / `Ctrl+D` / `L` | Delete / Duplicate / Lock |

---

## 🛡️ Privacy & Disclaimer

Full disclaimer is available via the "Disclaimer" link in the app footer. Highlights:

- **Data is fully local** — everything sits in your browser's localStorage; the author has no access.
- **Back up regularly** — clearing browser data or switching devices loses your data; use *Export JSON*.
- **Early build** — bugs may exist. Always proofread your PDF and résumé contents before submitting.
- **No warranty** — the author is not liable for any direct or indirect loss (including missed job opportunities) arising from use of this tool.
- **Template copyright** — gallery templates belong to their original GitHub authors; check each repo's LICENSE before reusing.

---

## 🤝 Feedback

- 🐛 Bugs: [GitHub Issues](https://github.com/Toby-Qian/resume-hub/issues)
- ✨ Features / PRs: very welcome
- 💌 Email: q1509713692@gmail.com

---

## 📜 License

[MIT](LICENSE) — built-in templates and code are free to reuse, modify, and use commercially. Third-party GitHub templates aggregated by the gallery remain under their respective authors' copyright.

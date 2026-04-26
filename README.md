# resume-hub · 简历模板聚合 + 在线编辑器

[![Live](https://img.shields.io/badge/live-resume--hub--mu--eight.vercel.app-black?logo=vercel)](https://resume-hub-mu-eight.vercel.app)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FToby-Qian%2Fresume-hub&root-directory=web)
[![Weekly refresh](https://github.com/Toby-Qian/resume-hub/actions/workflows/refresh-templates.yml/badge.svg)](https://github.com/Toby-Qian/resume-hub/actions/workflows/refresh-templates.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🇨🇳 简体中文 ｜ 🇺🇸 [English](README.en.md)

一个**纯前端**的中英双语简历编辑器：16 套内置模板、PPT 式自由排版（多选 / 对齐 / 吸附）、一键导出 PDF。所有数据只保存在你自己的浏览器里，不上传任何服务器。

> 🚀 **在线试用**：<https://resume-hub-mu-eight.vercel.app>

![screenshot](docs/screenshot.png)

---

## ✨ 核心功能

### 编辑器
- 📝 **JSON Resume 兼容 schema** — 工作 / 教育 / 项目 / 技能 / 奖项 / 语言一应俱全
- 🎨 **16 套内置模板** — 现代 / 经典 / 极简 / 优雅 / 紧凑 / 时间轴 / 中文正式 / 中文创意 / 学术（4 套）+ 三套全新视觉风格：
  - 🌈 **信息图（Infographic）** — 技能进度条 + 5 点语言流利度 + 三角丝带式节头
  - 📰 **杂志（Magazine）** — 大衬线 masthead + 摘要首字母放大 + 双栏正文
  - 🌑 **深色卡片（Dark Card）** — 主色渐变 hero 横条 + 浅色卡片化经历 + 关键字 chip
- 🌐 **中英文一键切换** — 切换 UI 语言时，所有模版的小标题（Experience ↔ 工作经历 / Education ↔ 教育背景 …）也跟着切
- 🖼️ **模板缩略图悬浮预览** — 鼠标悬停时显示用你自己数据渲染的实际效果
- 📅 **原生月份选择器** + "至今" 快捷开关
- 📊 **完整度评分** — 13 项加权指标，悬浮看缺什么
- ↩️ Ctrl+Z / Ctrl+Y 撤销重做（80 步历史）

### 自由排版（PPT 式）
- ➕ 任意位置插入文本框 / 图片 / 形状（分隔线 / 矩形 / 圆形）
- 🎯 **多选 + 对齐工具栏** — Shift+点击 / 框选；左 / 右 / 顶 / 底 / 居中 + 水平&垂直等距
- 📐 **PPT 风格虚线吸附线** — 拖动时自动吸附其他元素的边/中心 + 页面中线
- 🖱️ 整组拖动、Alt+拖动正文、方向键 1/10px 微调
- 🔒 元素锁定、置顶置底、复制粘贴
- 📋 Ctrl+V 直接粘贴剪贴板图片

### 样式控制
- 🎨 8 套配色预设 + 自定义主色
- 📏 行间距 (1.1–2.2) + 字号缩放 + 信息密度（紧凑/舒适/宽松）
- 📌 5 种项目符号（• ○ ■ — ∅）+ **独立颜色**
- 📄 实时可调页边距（mm 精度）
- 👁️ 节区一键隐藏（保留数据）

### 导出
- 🖨️ A4 / Letter，自动多页分页 + 页码 + 页脚
- 💾 JSON 导入导出（数据可迁移）
- ⌨️ Ctrl+S 直接触发导出 PDF

### 模板画廊
- 🗂️ GitHub Search API 自动抓取的 500+ 中英简历模板
- 🔍 按语言 / 技术栈 / 关键词筛选搜索
- 🪶 LaTeX 模板附 **Open in Overleaf** 一键导入

### 隐私优先
- 🔒 **零服务器** — 所有数据 localStorage，不上传不追踪
- 🚫 不设 cookie，不接入第三方分析
- 💾 内置错误边界 + "一键备份本地数据" 兜底

---

## 🛠 技术栈

| 类别 | 选型 |
|---|---|
| 前端 | Next.js 14 App Router · TypeScript · Tailwind CSS · Zustand (含 persist) |
| PDF | 浏览器原生打印 · `@page` · `break-inside: avoid` |
| 图像 | Canvas 自动压缩（>700KB 缩到 1600px / JPEG q=0.85→0.4 阶梯式） |
| 状态 | Zustand + 中间件 persist + 80 步 undo/redo |
| 爬虫 | Python · GitHub REST API · 11 种查询去噪 |
| 部署 | Vercel（Root Directory = `web/`） |
| 自动化 | GitHub Actions 每周一 UTC 06:00 刷新 `data/templates.json` |
| 错误监控 | 可选 Sentry（运行时按需加载，未安装也不影响构建） |

---

## 📁 仓库结构

```
resume-hub/
├── .github/workflows/
│   └── refresh-templates.yml    每周刷新模板数据
├── scraper/
│   ├── fetch_templates.py       11 个 GitHub Search 查询 + 去噪
│   └── requirements.txt
├── data/
│   └── templates.json           爬取结果（画廊数据源）
├── docs/
│   ├── deployment.md
│   └── add-template.md
├── web/                         Next.js 应用（Vercel Root = 此目录）
│   ├── app/                     page.tsx · layout.tsx · globals.css · icon.svg
│   ├── components/              Editor · Preview · NotesLayer · AlignToolbar
│   │                            · StylePanel · TemplatePreview · DateField
│   │                            · DisclaimerModal · ErrorBoundary · ...
│   ├── lib/                     store · schema · i18n · samples · imageCompress
│   ├── templates/               16 套内置模板 + 共享 Avatar/Section 组件 + useSectionLabels
│   └── public/                  sample-avatar.jpg · 静态资源
└── README.md / README.en.md
```

---

## 🚀 快速开始

```bash
git clone https://github.com/Toby-Qian/resume-hub.git
cd resume-hub/web

npm install
npm run dev          # http://localhost:3000
```

可选：重新爬取模板画廊数据（需 GitHub token）

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

## 🌍 部署

**一键到 Vercel**：点页首 *Deploy with Vercel* 按钮，把 **Root Directory** 设为 `web`（仓库没有根 `package.json`，这步是关键）。

之后每次 push 到 `main` 自动发布，PR 自带 preview URL。

详见 [docs/deployment.md](docs/deployment.md)。

---

## ⌨️ 快捷键

| 类别 | 快捷键 | 说明 |
|---|---|---|
| 全局 | `Ctrl+Z` / `Ctrl+Shift+Z` | 撤销 / 重做 |
| 全局 | `Ctrl+S` | 导出 PDF |
| 全局 | `Ctrl+V` | 粘贴剪贴板图片到画布 |
| 全局 | `Ctrl + 滚轮` / `Ctrl+0` / `Ctrl+±` | 缩放预览 |
| 全局 | `?` | 显示快捷键面板 |
| 浮动元素 | 拖动 | 自动吸附其他元素 + 页面中线 |
| 浮动元素 | `Shift+拖动` | 临时关闭吸附 |
| 浮动元素 | `Shift+点击` | 加入/移出多选 |
| 浮动元素 | `Ctrl+A` | 选中所有浮动元素 |
| 浮动元素 | `↑↓←→` | 微移 1px（`Shift` = 10px） |
| 浮动元素 | `Delete` / `Ctrl+D` / `L` | 删除 / 复制 / 锁定 |

---

## 🛡️ 隐私 & 免责

完整免责声明见应用页脚的"免责声明"链接，要点：

- **数据完全本地**：所有内容仅保存在你的浏览器 localStorage 中，作者无法访问。
- **请定期备份**：清浏览器数据 / 切换设备会导致数据丢失，请用"导出 JSON"备份。
- **早期版本**：可能有未发现的 bug，使用前请自行检查 PDF 与简历内容。
- **作者免责**：因使用本工具导致的任何直接或间接损失（包括求职机会等），作者不承担任何责任。
- **模板版权**：画廊中的 GitHub 模板版权归原作者，使用前请阅读各自仓库的 LICENSE。

---

## 🤝 反馈

- 🐛 Bug：[GitHub Issues](https://github.com/Toby-Qian/resume-hub/issues)
- ✨ 新功能 / PR：欢迎提
- 💌 邮箱：q1509713692@gmail.com

---

## 📜 许可

[MIT](LICENSE) — 内置模板与代码可自由复用、修改、商用。仓库聚合的第三方 GitHub 模板版权归各自作者所有。

# resume-hub — 简历模板聚合 & 在线编辑器

[![Live](https://img.shields.io/badge/live-resume--hub--mu--eight.vercel.app-black?logo=vercel)](https://resume-hub-mu-eight.vercel.app)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FToby-Qian%2Fresume-hub&root-directory=web)
[![Weekly refresh](https://github.com/Toby-Qian/resume-hub/actions/workflows/refresh-templates.yml/badge.svg)](https://github.com/Toby-Qian/resume-hub/actions/workflows/refresh-templates.yml)

一个集 **GitHub 简历模板聚合** + **在线表单编辑** + **多主题切换** + **PDF 导出** 于一体的 Web 应用，中英双语简历皆可。

> 🚀 **线上地址**：<https://resume-hub-mu-eight.vercel.app>

## 1. 功能

| 能力 | 说明 |
|------|------|
| 模板聚合 | GitHub Search API 自动抓取 500+ 中英简历/CV 模板，画廊内可筛选、搜索、一键跳转 |
| 数据驱动 | 用户填一份 [JSON Resume](https://jsonresume.org/) 近似 schema，所有内置模板共用同一份数据 |
| 主题切换 | 6 套内置 React 模板（现代 / 经典 / 极简 / 中文正式 / 中文创意 / 英文学术） |
| 样式微调 | 主色、字体、间距、字号在侧栏实时调整；支持紧凑 / 舒适 / 宽松 3 档密度 |
| 导出 | 浏览器原生打印 → A4 PDF，支持多页自动分页 + 手动"下一节换页" |
| 导入导出 | JSON Resume 子集，跨设备 / 跨工具可迁移 |
| 响应式 | 桌面三栏布局，移动端自动折叠为 Tab 切换 |
| i18n | 界面中英文一键切换 |
| 画廊 | 每卡含 OG 缩略图、仓库元信息；LaTeX 模板附 **Open in Overleaf** 一键导入 |

## 2. 技术栈

- **前端**：Next.js 14 App Router + TypeScript + Tailwind CSS + Zustand（状态 + toast）
- **数据**：JSON Resume schema 子集
- **爬虫**：Python `requests`，调用 GitHub REST API
- **PDF**：`window.print()` + `@page A4` + `break-inside: avoid`（推荐在 Chrome / Edge 中导出，兼容性最佳）
- **部署**：Vercel（根目录设为 `web/`）
- **自动化**：GitHub Actions 每周一 UTC 06:00 跑一次 `scraper/fetch_templates.py` 刷新 `data/templates.json`

## 3. 仓库结构

```
resume-hub/
├── .github/workflows/
│   └── refresh-templates.yml   每周刷新模板数据
├── scraper/
│   ├── fetch_templates.py      11 个 GitHub Search 查询 + 去噪
│   └── requirements.txt
├── data/
│   └── templates.json          爬取结果（画廊数据源）
├── docs/
│   ├── deployment.md
│   └── add-template.md
├── web/                        Next.js 应用（Vercel Root = 此目录）
│   ├── app/                    page.tsx / layout.tsx / globals.css
│   ├── components/             Editor / Preview / Gallery / Toolbar / StylePanel / Toast ...
│   ├── lib/                    store / schema / i18n / samples / toast
│   ├── templates/              6 套内置模板
│   └── data/templates.json     爬取结果的镜像（供 import 使用）
└── README.md
```

## 4. 快速开始

```bash
# 克隆
git clone https://github.com/Toby-Qian/resume-hub.git
cd resume-hub

# 跑 web
cd web && npm install && npm run dev       # http://localhost:3000

# 可选：重新爬模板
cd ../scraper && pip install -r requirements.txt
GITHUB_TOKEN=ghp_xxx python fetch_templates.py    # Windows PS: $env:GITHUB_TOKEN="..."
cp ../data/templates.json ../web/data/templates.json
```

## 5. 部署

**一键到 Vercel：** 点页首 `Deploy with Vercel` 按钮，Vercel 会克隆本仓库并要求你把 **Root Directory** 设为 `web`（仓库没有根 `package.json`，这是关键）。框架自动识别为 Next.js，无需环境变量。

完成后每次 push 到 `main` 都会自动发布，PR 自带 preview URL。

更详细步骤见 [docs/deployment.md](docs/deployment.md)。

## 6. 许可

MIT — 仓库内模板仅聚合元数据，原模板的版权归各自作者所有。

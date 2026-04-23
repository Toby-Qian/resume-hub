# proj4-resume — 简历模板聚合 & 在线编辑器

一个集 **GitHub 简历模板聚合** + **在线表单编辑** + **多主题切换** + **PDF 导出** 于一体的 Web 应用，中英双语简历皆可。

## 1. 目标

| 能力 | 说明 |
|------|------|
| 模板聚合 | 用 GitHub Search API 抓取 `topic:resume` / `topic:cv` 仓库（中英），生成可浏览的画廊 |
| 数据驱动 | 用户填一份 [JSON Resume](https://jsonresume.org/) schema，所有模板共用同一份数据 |
| 主题切换 | 在站内可一键切换 6+ 套精心移植的 React 模板（HTML/CSS） |
| 样式微调 | 主色、字体、间距、字号在侧边栏实时调整 |
| 导出 | 浏览器原生打印 → PDF；同时支持导出 / 导入 JSON、Markdown、HTML |
| i18n | 界面 + 内容均支持中文 / English 切换 |
| 画廊 | 收录 GitHub 上的 LaTeX / HTML 模板元数据 + 截图 + 跳转链接（无法在线渲染的给出 Overleaf / clone 指引） |

## 2. 架构

```
proj4-resume/
├── scraper/              Python，抓 GitHub 模板元数据
│   ├── fetch_templates.py
│   └── requirements.txt
├── data/
│   ├── templates.json    爬取结果（模板画廊数据源）
│   └── sample-resume.json 示例 JSON Resume 数据
├── templates/            React 组件版本的内置模板（可在站内切换）
│   ├── modern/
│   ├── classic/
│   ├── minimal/
│   ├── cn-formal/        中文求职常见样式
│   ├── cn-creative/
│   └── en-academic/
├── web/                  Next.js 14 App Router 单页应用
│   ├── app/
│   ├── components/       Editor / Preview / ThemeSwitcher / Gallery
│   ├── lib/              schema、i18n、PDF 导出
│   └── public/
└── docs/
    ├── deployment.md
    └── add-template.md
```

## 3. 技术栈

- **前端**：Next.js 14 + TypeScript + Tailwind CSS + Zustand（状态）
- **数据**：JSON Resume schema（业界标准，方便迁移）
- **爬虫**：Python + `requests`，调用 GitHub REST API（可选 token，提高 rate limit）
- **PDF**：`window.print()` + 精调 `@page` CSS（无需服务端）；可选 `html2pdf.js` 兜底
- **部署**：Vercel（推荐）或 GitHub Pages（静态导出）

## 4. 路线图

- [x] 项目骨架 + 路线图
- [ ] M1 — 爬虫产出 `data/templates.json`（zh + en，>=80 个）
- [ ] M2 — Web 骨架 + JSON Resume 表单 + 实时预览
- [ ] M3 — 6 套内置 React 模板 + 主题/样式切换
- [ ] M4 — PDF 导出 + JSON 导入导出 + i18n
- [ ] M5 — 模板画廊页（消费 templates.json）
- [ ] M6 — 部署到 Vercel，写文档

## 5. 快速开始

```bash
# 爬模板（可选，仓库已附 data/templates.json）
cd scraper && pip install -r requirements.txt
GITHUB_TOKEN=ghp_xxx python fetch_templates.py

# 跑 web
cd web && npm install && npm run dev
```

详见 [docs/deployment.md](docs/deployment.md)。

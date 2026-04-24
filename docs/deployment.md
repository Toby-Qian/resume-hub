# 部署 & 使用指南

## 本地开发

```bash
# 1. （可选）重新拉取模板数据 — 仓库已附 data/templates.json
cd scraper
pip install -r requirements.txt
# Search API 未登录仅 10 req/min，带 token 5000 req/h
export GITHUB_TOKEN=ghp_xxx        # Windows PowerShell: $env:GITHUB_TOKEN="ghp_xxx"
python fetch_templates.py
cp ../data/templates.json ../web/data/templates.json

# 2. 跑 web
cd ../web
npm install
npm run dev                        # http://localhost:3000
```

## 生产构建

```bash
cd web
npm run build
npm run start                      # http://localhost:3000
```

## 部署到 Vercel（推荐）

走 Vercel GUI，不需要写 workflow：

1. 打开 [vercel.com/new](https://vercel.com/new) → Import `Toby-Qian/resume-hub`。
2. **Root Directory** 设为 `web`（仓库没有根 `package.json`，这是关键）。
3. Framework Preset 会自动识别为 **Next.js**，其它保持默认。
4. Deploy。

之后每次 push 到 `main` 自动发布，PR 会生成 preview URL。无需任何环境变量。

也可用 CLI：

```bash
npm i -g vercel
cd web
vercel                             # 首次交互式设置，选根目录为当前
vercel --prod
```

## 模板数据周更（已在本仓库）

本仓库已启用 `.github/workflows/refresh-templates.yml`：

- **触发**：每周一 UTC 06:00（北京周一 14:00），或 Actions 面板手动触发。
- **认证**：用 Actions 内置 `GITHUB_TOKEN`（5000 req/h），无需配 secret。
- **行为**：跑 `scraper/fetch_templates.py` → 同步到 `web/data/templates.json` → 有 diff 时以 `github-actions[bot]` 身份 commit `"chore(data): weekly template refresh"` 并 push 到 main。
- **首次需要做一件事**：仓库 Settings → Actions → General → Workflow permissions 勾 **Read and write permissions**，否则 push 会被 403。

手动触发方式：GitHub 网页 → Actions → "Refresh template data" → Run workflow。

## 关键功能

| 功能 | 入口 |
|------|------|
| 编辑简历 | 左栏表单，所有字段实时同步预览 |
| 切换模板 | 右栏顶部 6 张模板卡片 |
| 调主色 | 右栏 7 个色板 + 取色器 |
| 切换字体 | 右栏无衬线 / 衬线下拉 |
| 信息密度 | 右栏紧凑 / 舒适 / 宽松 |
| 字号 | 右栏滑竿（0.85–1.20） |
| 中英切换 | 右上角"中 / EN"按钮 |
| 导出 PDF | 顶栏 `Export PDF`，走浏览器打印（A4、无边距）|
| 自动分页 | 长简历预览有分页线，打印时自动按 A4 分页，不会切断小节 |
| 手动换页 | 每条目右侧勾"下一节换页"，对应 section 会强制从新页开始 |
| 导入/导出 JSON | 顶栏两按钮，走 JSON Resume 近似 schema |
| 示例数据 | 顶栏 `Load sample`，按当前界面语言加载中或英示例 |
| 模板画廊 | 顶部导航 `Gallery`，500+ GitHub 模板可筛选、搜索；LaTeX 卡一键 Overleaf |
| 移动端 | 窗口 <1024px 自动折叠为 `Editor / Preview / Style` 三 Tab |

## 已知局限

- **PDF 兼容性**：`break-inside: avoid` 在 Chrome / Edge / Firefox 表现都不错，Safari 较弱。导出 PDF 建议用 Chrome / Edge。
- **LaTeX 渲染**：站内不编译 LaTeX，画廊的 Overleaf 按钮会把整个 GitHub 仓库导入 Overleaf 在线编辑。
- **字体**：默认主题假定本机装了 Inter / Source Han Serif；没装则回落到系统 UI 字体（PingFang / Microsoft YaHei）。
- **本地存储**：所有编辑状态存在浏览器 localStorage（key `proj4-resume`），清浏览器数据会丢失。可用顶栏 "Export JSON" 做备份。

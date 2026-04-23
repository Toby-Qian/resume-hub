# 部署 & 使用指南

## 本地开发

```bash
# 1. 拉取模板数据（可选，仓库自带 data/templates.json）
cd scraper
pip install -r requirements.txt
# 带 token 可大幅提升限额（GitHub Search API 未登录仅 10 req/min）
export GITHUB_TOKEN=ghp_xxx        # Windows PowerShell: $env:GITHUB_TOKEN="ghp_xxx"
python fetch_templates.py
# 将结果复制给 web：
cp ../data/templates.json ../web/data/templates.json

# 2. 运行 web
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

```bash
npm i -g vercel
cd web
vercel                             # 首次会询问项目设置
vercel --prod
```

Vercel 自动识别 Next.js，无需额外配置。

## 部署到 GitHub Pages（静态导出）

在 `web/next.config.mjs` 中加 `output: 'export'`，然后：

```bash
npm run build
# 产物在 web/out，推送到 gh-pages 分支
```

## 定期更新模板数据

在仓库根目录加一个 GitHub Actions（示例）：

```yaml
# .github/workflows/refresh-templates.yml
on:
  schedule: [{ cron: "0 3 * * 0" }]  # 每周日 03:00 UTC
  workflow_dispatch:
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r scraper/requirements.txt
      - run: python scraper/fetch_templates.py
        env: { GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
      - run: cp data/templates.json web/data/templates.json
      - uses: stefanzweifel/git-auto-commit-action@v5
        with: { commit_message: "chore: refresh templates" }
```

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
| 导出 PDF | 顶栏 `Export PDF`，走浏览器打印（A4、无边距） |
| 导入/导出 JSON | 顶栏两按钮，走 JSON Resume 近似 schema |
| 示例数据 | 顶栏 `Load sample`，按当前界面语言加载中或英示例 |
| 模板画廊 | 顶部导航 `Gallery`，500+ GitHub 模板可筛选跳转 |

## 已知局限 & 后续可做

- LaTeX 模板无法在站内直接渲染。目前画廊只给跳转链接；后续可接 Overleaf "import from GitHub" 或搭建 Tectonic 云编译服务。
- 长简历跨 A4 分页时偶有元素被截断，打印前请人工检查；可后续引入 `react-to-print` 或 Paged.js。
- 主题字体假定用户本机已装 Inter/Source Han Serif；需要更稳的跨平台表现可改用 Google Fonts 自托管。

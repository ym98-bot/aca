# 导航栏与主页图标调整方案

## Summary

对个人主页（Next.js / PRISM 模板）做四项调整：删除 Services/Awards 导航、Publications 改名为 Research（URL 一并改为 `/research`）、CV 页只保留 PDF 链接并做中英文文案国际化、主页社交图标把 GitHub 换成 PhilPeople（"P" 形图标），并按 GitHub Pages 子路径 `https://ym98-bot.github.io/aca/` 配置 `basePath`。

## Current State Analysis

- 导航由 `content/config.toml`（英文）与 `content_zh/config.toml`（中文）的 `[[navigation]]` 定义，Navigation 组件据此渲染；动态路由 `src/app/[slug]/page.tsx` 依据 `nav.target` 读取 `content/<target>.toml` 生成页面。
- 当前导航含：About / Publications / Teaching / Awards / Services / CV。
- 页面配置文件：`content/` 与 `content_zh/` 下各有 `publications.toml`、`awards.toml`、`services.toml`、`teaching.toml`、`cv.toml`。
- 论文数据源为 `content/publications.bib`；每篇论文的简介由 `src/components/publications/PublicationsList.tsx` 渲染，`pdf` 字段已在上轮由 `src/lib/bibtexParser.ts` 解析为 `pub.pdfUrl`，PDF 按钮已存在。
- 首页"精选论文"里的 "View All" 链接位于 `src/components/home/SelectedPublications.tsx`，硬编码 `/publications`。
- 主页社交图标由 `src/components/home/Profile.tsx` 的 `socialLinks` 数组渲染，含 email / location / google_scholar / orcid / github / philpeople / linkedin。
- `next.config.ts` 尚无 `basePath`；`src/app/layout.tsx` `<head>` 里手写了一个 favicon `<link>`。
- 语言：`content/`=英文，`content_zh/`=中文；运行中文案统一在 `src/lib/i18n/messages.ts`（en/zh）。

## Proposed Changes

### A. 导航栏调整（删除 Services/Awards，Publications→Research）

1. `content/config.toml`（英文）：
   - 删除 `Awards`、`Services` 两个 `[[navigation]]` 块。
   - `Publications` 块改为 `title = "Research"`、`target = "research"`、`href = "/research"`。
2. `content_zh/config.toml`（中文）：
   - 删除 `奖项`、`服务` 两个 `[[navigation]]` 块。
   - `论文` 块改为 `title = "研究论文"`、`target = "research"`、`href = "/research"`。
3. 重命名页面配置文件（因 `getPageConfig(slug)` 读取 `<slug>.toml`，target 改为 research 后必须配套）：
   - `content/publications.toml` → `content/research.toml`，`title` 改 `"Research"`，保留 `type/source/description`。
   - `content_zh/publications.toml` → `content_zh/research.toml`，`title` 改 `"研究论文"`，保留其余。
   - `source = "publications.bib"` 保持不变（bib 文件名不需要改）。
4. 删除不再需要的文件：`content/services.toml`、`content/awards.toml`、`content_zh/services.toml`、`content_zh/awards.toml`。
5. `src/components/home/SelectedPublications.tsx`：`View All` 的 `href="/publications"` 改为 `"/research"`（one-page 分支 `"/#publications"` 改为 `"/#research"`）。

> 说明：`generateStaticParams` 从 navigation 生成静态页，删除导航条目后 Services/Awards 页面不再生成。

### B. Research 页：文章简介渲染与 PDF 链接（解释 + 现有能力）

- 文章简介来源：`content/publications.bib` → `src/lib/bibtexParser.ts` 解析为 `Publication[]` → `src/components/publications/PublicationsList.tsx` 渲染标题/作者/期刊/摘要。
- PDF 对应关系：bib 中每篇论文的 `pdf = {papers/<文件名>.pdf}` 字段被解析进 `pub.pdfUrl`，`PublicationsList.tsx` 在每条论文的按钮区渲染一个 `PDF` 按钮，点击打开 `public/papers/<文件名>.pdf`。
- 本轮仅需把 PDF 按钮的 `href` 加上 basePath 前缀（见 D），其余已实现。

### C. CV 页只放 PDF 链接 + 中英文文案

1. `content/cv.toml`、`content_zh/cv.toml`：已含 `pdf = "/cv.pdf"`，保持 `type="text"`、`source="cv.md"`、`title`。
2. `src/lib/i18n/messages.ts`：新增字段（en/zh），如 `common.openPdf`（"Open PDF"/"打开 PDF"）与 `common.openPdfHint`（"Click below to open the PDF version of my CV"/"点击下方按钮打开 PDF 版简历"）。
3. `src/components/pages/TextPage.tsx`：
   - 引入 `useMessages()`，用 `messages` 替换当前硬编码的中文按钮文案。
   - PDF 链接 `href` 拼接 basePath（见 D）。

### D. GitHub Pages 子路径部署（basePath=/aca）

1. `next.config.ts`：新增 `basePath: '/aca'`、`assetPrefix: '/aca'`。
2. 新建 `src/lib/basePath.ts`：`export const BASE_PATH = '/aca';`，供手写链接复用。
3. `src/app/layout.tsx`：删除 `<head>` 中手写的 favicon `<link>`（保留 `generateMetadata` 的 `icons`，Next 会为 metadata 图标自动加 basePath 前缀），避免 favicon 404。
4. `src/components/pages/TextPage.tsx`：PDF `href` 改为 `` `${BASE_PATH}${config.pdf}` ``。
5. `src/components/publications/PublicationsList.tsx`：PDF 按钮 `href` 同样拼接 `BASE_PATH`。
   - 注：`<a>` 手写链接不会自动加 basePath；`next/image`、`next/link` 会自动加，故头像、导航、精选论文链接无需改动。

### E. 主页照片下方图标（GitHub→PhilPeople）

1. `content/config.toml`：删除 `github = "https://github.com"` 一行（或注释掉），保留 `philpeople = "https://philpeople.org/"`。
2. `src/components/home/Profile.tsx`：
   - 删除 `socialLinks` 中 `github` 与 `linkedin` 两个渲染条目（linkedin 本就被注释隐藏，一并清理避免 unused import）。
   - 删除 `import { Github, Linkedin, Pin }` 中的 `Github`、`Linkedin`（`Pin` 仍用于地址 tooltip）。
   - 把 `PhilPeopleIcon` 的 SVG path 改为清晰的字母 "P" 形状（如 `M9 21V3h6a5 5 0 0 1 0 10h-3v8H9z`），保持 `className` 透传。

## Assumptions & Decisions

- 中文菜单名定为"研究论文"，英文为"Research"。
- Research 页 URL 一并改为 `/research`（用户已确认）。
- 删除 Services/Awards：同时删除导航条目与对应 4 个配置文件。
- 部署为 GitHub Pages 子路径，`basePath="/aca"`（用户已确认）。
- CV 页在配置了 `pdf` 时只显示 PDF 打开卡片，不渲染 `cv.md` 正文（上一轮已实现，本轮补充国际化与 basePath）。
- 真实 PDF 文件由用户自行放入 `public/cv.pdf` 与 `public/papers/<文件名>.pdf`，本轮不生成 PDF 内容。

## Verification

1. 运行 `npm run build`，确认编译、类型检查与静态页生成全部通过（9 个页面）。
2. 确认 `out/` 下不再生成 `awards`、`services` 页面，生成 `research` 页面。
3. 检查 `out/` 中 PDF 与静态资源引用路径带 `/aca` 前缀（如 `/aca/cv.pdf`、`/aca/papers/...`）。
4. 本地 `npm run dev` 预检：访问 `http://localhost:3000/aca/research`、`.../aca/cv` 验证导航高亮、PDF 按钮、CV 卡片、PhilPeople 图标（"P" 形）与中英文切换下的 CV 文案。
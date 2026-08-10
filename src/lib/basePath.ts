// GitHub Pages 子路径部署前缀。
// 站点部署在 https://ym98-bot.github.io/aca/，所有手写静态链接需加此前缀
// （next/link、next/image 会自动加 basePath，normal <a> 不会）。
//
// 本地 dev（npm run dev）时站点运行在根路径，前缀应为空，否则 PDF 等静态链接
// 会被错误拼成 /aca/... 导致 404。生产构建时才需要 /aca 前缀。
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/aca' : '';
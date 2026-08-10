import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 静态导出：构建后生成 out/ 目录，可直接托管到 GitHub Pages
  output: 'export',
  trailingSlash: true,
  // 站点部署在 https://ym98-bot.github.io/aca/，配置子路径前缀
  basePath: '/aca',
  assetPrefix: '/aca',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
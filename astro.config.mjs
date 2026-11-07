// @ts-check
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  // PoC su GitHub Pages (repository rinominato in gojukairenbuweb-oss.github.io)
  site: 'https://gojukairenbuweb-oss.github.io',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  markdown: {
    // i link esterni scritti nei testi si aprono in una nuova scheda
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]],
  },
});

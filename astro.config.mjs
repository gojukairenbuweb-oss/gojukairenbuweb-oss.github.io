// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // PoC su GitHub Pages (repository rinominato in gojukairenbuweb-oss.github.io)
  site: 'https://gojukairenbuweb-oss.github.io',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});

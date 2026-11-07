// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // DA COMPILARE: URL del sito di test, es. https://test.tuodominio.it
  site: 'https://test.example.org',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});

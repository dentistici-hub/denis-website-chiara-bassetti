import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dentistici-hub.github.io',
  base: '/denis-website-chiara-bassetti/',
  integrations: [sitemap()],
});

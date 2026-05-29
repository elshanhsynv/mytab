import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), extensionManifestPlugin()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        newtab: resolve(__dirname, 'src/pages/newtab.html'),
      },
    },
  },
});

function extensionManifestPlugin() {
  return {
    name: 'my-tab-extension-manifest',
    writeBundle() {
      const manifest = {
        manifest_version: 3,
        name: 'My Tab',
        version: '1.0',
        description: 'A fast, polished custom favorites dashboard.',
        permissions: ['bookmarks', 'storage'],
        chrome_url_overrides: {
          newtab: 'src/pages/newtab.html',
        },
        icons: {
          128: 'icons/icon128.png',
        },
      };

      writeFileSync(resolve(__dirname, 'dist/manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}

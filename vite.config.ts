import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidLabels from 'unplugin-solid-labels';

export default defineConfig({
  plugins: [
    solidPlugin(),
    solidLabels.vite({}),
  ],
});

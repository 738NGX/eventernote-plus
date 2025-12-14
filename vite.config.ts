import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyDirBeforeBuild: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.tsx'),
      },
      output: {
        format: 'iife',
        entryFileNames: 'scripts/[name].js',
        assetFileNames: 'scripts/[name].[ext]',
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    minify: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

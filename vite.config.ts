import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import electronRenderer from "vite-plugin-electron-renderer" 
import polyfillExports from "vite-plugin-electron-renderer" 
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: "src/electron/main.ts", // 主进程文件
        vite: { build: { outDir: "dist-electron" } },
      },
      {
        entry: "src/electron/preload.js",
        vite: { build: { outDir: "dist-electron" } },
      }
    ]),
    electronRenderer(),
    polyfillExports(),
  ],
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, './src/core'),
      "@src": path.resolve(__dirname, './src'),
      "@render": path.resolve(__dirname, './src/render'),
    }
  },
  build: {
    rollupOptions: {
      external: [
        '@core/utils/ipc',
        '@core/utils/files',
        '@core/const/path',
      ]
    }
  },
  server: {
    port: 3000
  }
});

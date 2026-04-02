import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL('./client/src', import.meta.url)),
        "@shared": fileURLToPath(new URL('./shared', import.meta.url)),
      },
    },
    root: fileURLToPath(new URL('./client', import.meta.url)),
    envDir: fileURLToPath(new URL('.', import.meta.url)),
    build: {
      chunkSizeWarningLimit: 160000,
    },
  }
})
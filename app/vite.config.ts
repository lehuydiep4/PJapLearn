import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// Plugin to prevent Vite from sending Content-Encoding: gzip for Kuromoji dict files
const kuromojiDictPlugin = () => {
  return {
    name: 'kuromoji-dict-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const urlWithoutQuery = req.url ? req.url.split('?')[0] : '';
        if (urlWithoutQuery.includes('/dict/') && urlWithoutQuery.endsWith('.gz')) {
           const originalSetHeader = res.setHeader;
           res.setHeader = function(name: string, value: any) {
              if (name.toLowerCase() === 'content-encoding' && value === 'gzip') {
                 // Do not set gzip encoding so the browser doesn't auto-decompress it
                 return;
              }
              return originalSetHeader.call(res, name, value);
           };
        }
        next();
      });
    }
  };
};

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), kuromojiDictPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "path": "path-browserify"
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));

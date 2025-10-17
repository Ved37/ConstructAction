import { defineConfig, loadEnv } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = {};
  if (env.VITE_API_PROXY) {
    proxy["/api"] = {
      target: env.VITE_API_PROXY,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ""),
    };
  }
  return {
    plugins: [react(), tailwindcss()],
    server: Object.keys(proxy).length ? { proxy } : undefined,
  };
});

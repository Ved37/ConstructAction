import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, new URL("./", import.meta.url).pathname, "");
  const proxy = {};
  if (env.VITE_API_PROXY) {
    proxy["/api"] = {
      target: env.VITE_API_PROXY,
      changeOrigin: true,
      secure: false,
    };
  }
  return {
    plugins: [react(), tailwindcss()],
    server: Object.keys(proxy).length ? { proxy } : undefined,
  };
});

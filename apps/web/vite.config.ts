import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../.."), "");
  const apiTarget =
    env.VITE_API_TARGET || process.env.VITE_API_TARGET || "http://localhost:3000";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@muoi/core": path.resolve(__dirname, "../../packages/core/src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});

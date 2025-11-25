import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [zaloMiniApp(), tsconfigPaths(), react()],
    resolve: {
      alias: {
        "utils": path.resolve(process.cwd(), "src/utils"),
        "components": path.resolve(process.cwd(), "src/components"),
        "pages": path.resolve(process.cwd(), "src/pages"),
        "state": path.resolve(process.cwd(), "src/state"),
        "types": path.resolve(process.cwd(), "src/types"),
        "static": path.resolve(process.cwd(), "src/static"),
        "hooks": path.resolve(process.cwd(), "src/hooks"),
      },
    },
  });
};

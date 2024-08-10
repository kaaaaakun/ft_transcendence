import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  publicDir: "../public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
    },
  },
  root: path.resolve(__dirname, "./src"),
});

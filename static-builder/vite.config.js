import path from "node:path";
import { defineConfig } from "vite";
import fs from "fs";

const sharedConfigPath = path.resolve(__dirname, "./config.json");
let sharedConfig = {};
try {
  const rawData = fs.readFileSync(sharedConfigPath, "utf-8");
  sharedConfig = JSON.parse(rawData);
} catch (error) {
  console.error("config.json の読み込みに失敗しました:", error);
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
    },
  },
  define: {
    __END_GAME_SCORE__: JSON.stringify(sharedConfig.END_GAME_SCORE),
    __WALL_X_LIMIT__: JSON.stringify(sharedConfig.WALL_X_LIMIT),
    __WALL_Y_LIMIT__: JSON.stringify(sharedConfig.WALL_Y_LIMIT),  
    __PADDLE_HEIGHT__: JSON.stringify(sharedConfig.PADDLE_HEIGHT),
    __BALL_RADIUS__: JSON.stringify(sharedConfig.BALL_RADIUS)
  },
  assetsInclude: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg",],
  server: {
    host: "0.0.0.0",
  },
});

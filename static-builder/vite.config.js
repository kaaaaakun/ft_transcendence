import path from "node:path";
import { defineConfig } from "vite";
import fs from "fs";

const sharedConfigPath = path.resolve(__dirname, "./game-settings.json");
let sharedConfig = {};
try {
  const rawData = fs.readFileSync(sharedConfigPath, "utf-8");
  sharedConfig = JSON.parse(rawData);
} catch (error) {
  console.error("game-settings.json の読み込みに失敗しました:", error);
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
    },
  },
  define: {
    END_GAME_SCORE: JSON.stringify(sharedConfig.END_GAME_SCORE),
    WALL_X_LIMIT: JSON.stringify(sharedConfig.WALL_X_LIMIT),
    WALL_Y_LIMIT: JSON.stringify(sharedConfig.WALL_Y_LIMIT),  
    PADDLE_HEIGHT: JSON.stringify(sharedConfig.PADDLE_HEIGHT),
    BALL_RADIUS: JSON.stringify(sharedConfig.BALL_RADIUS)
  },
  assetsInclude: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg",],
  server: {
    host: "0.0.0.0",
  },
});

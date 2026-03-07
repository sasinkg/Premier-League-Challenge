import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/', // Add this to ensure absolute paths for assets
  server: {
    proxy: {
      "/api": {
        target: "https://api.football-data.org",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, "/v4"),
      },
    },
  },
});

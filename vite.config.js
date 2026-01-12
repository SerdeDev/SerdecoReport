import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    host: "10.200.10.249",
    allowedHosts: ["10.200.10.249"],
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/corpoelec": {
        target: "http://10.16.2.99:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/corpoelec/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@validations": path.resolve(__dirname, "src/validations"),
    },
  },
  plugins: [react()],
});

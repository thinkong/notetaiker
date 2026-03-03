import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react-vendor";
            }
            if (id.includes("react-force-graph") || id.includes("d3-")) {
              return "graph-vendor";
            }
            if (id.includes("codemirror") || id.includes("lezer")) {
              return "editor-vendor";
            }
            if (id.includes("lucide")) {
              return "ui-vendor";
            }
          }
        },
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },

  plugins: [
    react(),
  ],

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor_react";
            }
            if (id.includes("moment")) {
              return "vendor_moment";
            }
            if (id.includes("axios") || id.includes("lib/apiClient")) {
              return "vendor_api";
            }
            return "vendor";
          }
        },
      },
    },
  },
});

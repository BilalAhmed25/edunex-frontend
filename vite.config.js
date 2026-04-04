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
                        // Group React core libs together for better interop
                        if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom") || id.includes("@reduxjs/toolkit")) {
                            return "vendor_core";
                        }
                        if (id.includes("moment")) {
                            return "vendor_moment";
                        }
                        if (id.includes("axios")) {
                            return "vendor_api";
                        }
                        return "vendor";
                    }
                },
            },
        },
        commonjsOptions: {
            transformMixedEsModules: true, // Handle mixed ESM/CJS code (like React + addons)
        },
    },
});

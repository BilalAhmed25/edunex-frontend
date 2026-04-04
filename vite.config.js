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
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        // Consolidate ALL core React, Redux, Router and related libs to ensure they share interop context
                        if (
                            id.includes("react") ||
                            id.includes("react-dom") ||
                            id.includes("react-router-dom") ||
                            id.includes("@reduxjs/toolkit") ||
                            id.includes("react-redux") ||
                            id.includes("immer") ||
                            id.includes("react-is") ||
                            id.includes("hoist-non-react-statics")
                        ) {
                            return "vendor_core";
                        }
                        if (id.includes("moment")) {
                            return "vendor_moment";
                        }
                        return "vendor";
                    }
                },
            },
        },
        commonjsOptions: {
            transformMixedEsModules: true, // Handle mixed ESM/CJS code (like React + addons)
            include: [/node_modules/],     // Ensure all dependencies are covered by CJS transformation
        },
    },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// 🛡️ Final Surgical Interop Configuration
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            // SURGICAL FIX for @juggle/resize-observer resolution error on Windows
            "@juggle/resize-observer": "@juggle/resize-observer/lib/ResizeObserver.js",
        },
    },
    plugins: [
        react(),
    ],
    // Essential defines for Redux and HeadlessUI hybrids in production
    define: {
        global: "window",
        "process.env.NODE_ENV": JSON.stringify("production"),
    },
    build: {
        minify: "terser", // Use terser for more stable CJS/ESM compression
        cssMinify: true,
        sourcemap: true,
        chunkSizeWarningLimit: 5000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        // Keep core libraries together to share interop context
                        if (
                            id.includes("react") ||
                            id.includes("react-dom") ||
                            id.includes("react-router-dom") ||
                            id.includes("@headlessui") ||
                            id.includes("@reduxjs/toolkit") ||
                            id.includes("react-redux") ||
                            id.includes("framer-motion") ||
                            id.includes("use-sync-external-store")
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
            transformMixedEsModules: true,
            // 'preferred' forces Rollup to prioritize ESM patterns, bypassing broken 'exports' shims
            requireReturnsDefault: "preferred",
            esmExternals: true,
            include: [/node_modules/],
        },
    },
});

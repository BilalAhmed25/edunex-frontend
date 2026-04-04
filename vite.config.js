import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 🛡️ SPACE-PROOF DEFINITIVE STABLE CONFIGURATION
export default defineConfig({
    resolve: {
        alias: {
            // Using direct relative aliases to avoid Windows path resolution errors with spaces
            "@": "/src",
            "@juggle/resize-observer": "@juggle/resize-observer/lib/ResizeObserver.js",
        },
    },
    plugins: [
        react(),
    ],
    // Defines for Redux and UI library hybrids in production
    define: {
        global: "window",
        "process.env": {},
    },
    css: {
        preprocessorOptions: {
            scss: {
                // EXPLICIT RESOLUTION: Moving to the modern, high-performance Sass compiler API
                api: "modern-compiler",
                // Suppress remaining 3rd party warnings while our internal code is now modernized
                quietDeps: true,
            },
        },
    },
    build: {
        minify: true,
        cssMinify: true,
        sourcemap: true,
        chunkSizeWarningLimit: 5000,
        commonjsOptions: {
            transformMixedEsModules: true,
            requireReturnsDefault: "preferred",
            esmExternals: true,
        },
    },
});

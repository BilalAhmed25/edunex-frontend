// vite.config.js
import { defineConfig } from "file:///E:/My%20Projects/Edunex/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///E:/My%20Projects/Edunex/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import rollupReplace from "file:///E:/My%20Projects/Edunex/frontend/node_modules/@rollup/plugin-replace/dist/es/index.js";
var __vite_injected_original_dirname = "E:\\My Projects\\Edunex\\frontend";
var vite_config_default = defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__vite_injected_original_dirname, "./src")
      }
    ]
  },
  plugins: [
    rollupReplace({
      preventAssignment: true,
      values: {
        __DEV__: JSON.stringify(true),
        "process.env.NODE_ENV": JSON.stringify("development")
      }
    }),
    react()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxNeSBQcm9qZWN0c1xcXFxFZHVuZXhcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXE15IFByb2plY3RzXFxcXEVkdW5leFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovTXklMjBQcm9qZWN0cy9FZHVuZXgvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuLy9pbXBvcnQgcmVhY3RSZWZyZXNoIGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1yZWZyZXNoXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHJvbGx1cFJlcGxhY2UgZnJvbSBcIkByb2xsdXAvcGx1Z2luLXJlcGxhY2VcIjtcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IFtcbiAgICAgIHtcbiAgICAgICAgLy8gXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICAgIGZpbmQ6IFwiQFwiLFxuICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcblxuICBwbHVnaW5zOiBbXG4gICAgcm9sbHVwUmVwbGFjZSh7XG4gICAgICBwcmV2ZW50QXNzaWdubWVudDogdHJ1ZSxcbiAgICAgIHZhbHVlczoge1xuICAgICAgICBfX0RFVl9fOiBKU09OLnN0cmluZ2lmeSh0cnVlKSxcbiAgICAgICAgXCJwcm9jZXNzLmVudi5OT0RFX0VOVlwiOiBKU09OLnN0cmluZ2lmeShcImRldmVsb3BtZW50XCIpLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICByZWFjdCgpLFxuICAgIC8vcmVhY3RSZWZyZXNoKCksXG4gIF0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1IsU0FBUyxvQkFBb0I7QUFFblQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixPQUFPLG1CQUFtQjtBQUoxQixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTDtBQUFBLFFBRUUsTUFBTTtBQUFBLFFBQ04sYUFBYSxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQzlDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLGNBQWM7QUFBQSxNQUNaLG1CQUFtQjtBQUFBLE1BQ25CLFFBQVE7QUFBQSxRQUNOLFNBQVMsS0FBSyxVQUFVLElBQUk7QUFBQSxRQUM1Qix3QkFBd0IsS0FBSyxVQUFVLGFBQWE7QUFBQSxNQUN0RDtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLEVBRVI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

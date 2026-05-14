import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/admin/",
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT) || 3000,
  },
});

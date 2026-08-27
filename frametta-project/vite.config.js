import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    // Allow Cloudflare quick-tunnel / localtunnel hostnames for shareable previews
    allowedHosts: true,
    host: true,
  },
  server: {
    allowedHosts: true,
    host: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // listen on 0.0.0.0, required for ngrok
    port: 5173,       // make sure this matches your local dev port
    strictPort: true, // optional, prevents auto-incrementing
    cors: true,       // allow cross-origin requests
    allowedHosts: true 
  },
});

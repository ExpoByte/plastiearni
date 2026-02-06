import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    // Force Vite to pre-bundle these packages together to avoid ESM issues
    include: ["react-dom", "leaflet", "react-leaflet", "@react-leaflet/core"],
  },
  ssr: {
    noExternal: ["leaflet", "react-leaflet", "@react-leaflet/core"],
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

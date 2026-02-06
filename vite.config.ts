import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    // Include react-dom to ensure createPortal export is available
    include: ["react-dom"],
    // Prevent Vite from pre-bundling Leaflet/react-leaflet; the optimized bundle can
    // mis-handle React Context and crash with: "render2 is not a function".
    exclude: ["leaflet", "react-leaflet", "@react-leaflet/core"],
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

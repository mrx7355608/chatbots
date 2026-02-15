import { defineConfig, loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __WIDGET_SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL ?? ""),
      __WIDGET_SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? ""),
      __WIDGET_WEBHOOK_URL__: JSON.stringify(env.VITE_N8N_WEBHOOK_MESSAGING ?? ""),
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/widget/index.ts"),
        name: "ChatBot",
        formats: ["iife"],
        fileName: () => "widget.js",
      },
      outDir: "dist-widget",
      emptyOutDir: true,
      minify: true,
    },
  };
});

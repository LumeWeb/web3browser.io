import { defineConfig } from "vite";
import optimizer from "vite-plugin-optimizer";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  define: { "window.": "globalThis." },
  build: {
    emptyOutDir: false,
    outDir: "dist",
    lib: {
      entry: "build/worker.js",
      name: "sw",
      formats: ["cjs"],
      fileName: () => "sw.js",
    },
    minify: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
  resolve: {
    dedupe: ["@lumeweb/libportal", "@lumeweb/libweb", "@lumeweb/libkernel"],
  },
  plugins: [
    optimizer({
      "node-fetch":
        "const e = undefined; export default e;export {e as Response, e as FormData, e as Blob};",
    }),
    nodePolyfills({
      exclude: ["fs"],
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
});

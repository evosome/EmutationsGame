import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"),
      $types: path.resolve(__dirname, "./src/types"),
      $stores: path.resolve(__dirname, "./src/stores"),
      $utils: path.resolve(__dirname, "./src/utils"),
      $services: path.resolve(__dirname, "./src/services"),
      $constants: path.resolve(__dirname, "./src/constants"),
    },
  },
  plugins: [svelte(), viteSingleFile()],
});

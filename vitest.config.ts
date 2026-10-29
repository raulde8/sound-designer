import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("./engine", import.meta.url)),
      "@catalog": fileURLToPath(new URL("./catalog", import.meta.url)),
      "@": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  test: {
    include: ["engine/**/*.test.ts", "catalog/**/*.test.ts", "app/**/*.test.ts", "scripts/**/*.test.ts"],
    environment: "node",
  },
});

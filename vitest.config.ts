import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    watch: false,
    setupFiles: ["./setupTests.ts"],
    coverage: {
      reporter: ["lcov"],
      reportsDirectory: "./coverage",
    },
  },
});

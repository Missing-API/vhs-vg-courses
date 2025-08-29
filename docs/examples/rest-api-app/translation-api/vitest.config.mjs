/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    exclude: [
      "**/node_modules/**",
      "**/tests/api/**", // Exclude Playwright API tests
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/**",
        "tests/api/**", // Exclude Playwright API tests from coverage
      ],
    },
    deps: {
      interopDefault: true,
    },
  }
});

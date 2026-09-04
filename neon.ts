import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  preview: {
    // Upgrade to a paid plan to enable AI Gateway for your project.
    // aiGateway: true,
    functions: {
      api: { name: "api", source: "./hello.ts" },
    },
  },
});

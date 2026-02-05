import baseConfig from "@notetaiker/eslint-config/base.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ["dist/**", ".turbo/**"],
  },
  {
    rules: {
      "no-console": "off", // Allow console for server startup logs
    },
  },
];

import baseConfig from "@notetaiker/eslint-config/base.js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended, ...tseslint.configs.stylistic],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: [
            "badgeVariants",
            "buttonVariants",
            "cardVariants",
            "inputVariants",
            "alertVariants",
            "toggleVariants",
          ],
        },
      ],
    },
  },
);

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    rules: {
      curly: ["error", "all"],
    },
  },
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
);

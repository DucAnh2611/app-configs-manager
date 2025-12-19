import eslintPluginPrettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.cache/**"
    ],
    files: ["src/**/*.{ts,tsx,js}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "@typescript-eslint": tseslint.plugin,
      "unused-imports": unusedImports
    },
    rules: {
      "prettier/prettier": ["error", {
        endOfLine: "auto"
      }],
      "eol-last": "off",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
      "padding-line-between-statements": "off",

      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": ["warn", {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off"
    }
  }
];
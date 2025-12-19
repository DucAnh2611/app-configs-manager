import eslintPluginPrettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

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
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      "prettier/prettier": ["error", {
        endOfLine: "auto"
      }],
      "eol-last": "off",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
      "padding-line-between-statements": "off"
    }
  }
];
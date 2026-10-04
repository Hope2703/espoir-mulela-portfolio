import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
import accessibility from "eslint-plugin-jsx-a11y";
import globals from "globals";
export default defineConfig([
    globalIgnores([
        "artifacts/**",
        ".cache/**",
        "vendor/**",
        "bootstrap/ssr/**",
        "public/build/**",
        ".local/**",
    ]),
    {
        files: ["scripts/check-browser.mjs"],
        languageOptions: { globals: globals.browser },
    },
    {
        ...js.configs.recommended,
        files: ["**/*.mjs"],
        languageOptions: { globals: globals.node },
    },
    ...ts.configs.recommended.map((config) => ({
        ...config,
        files: ["**/*.ts", "**/*.tsx"],
    })),
    {
        files: ["resources/js/**/*.tsx", "resources/js/hooks/**/*.ts"],
        plugins: { "react-hooks": hooks, "jsx-a11y": accessibility },
        rules: {
            ...hooks.configs.recommended.rules,
            ...accessibility.configs.recommended.rules,
        },
    },
]);

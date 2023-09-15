// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path")

/** @type {import("eslint").Linter.Config} */
const config = {
    // overrides: [
    //   {
    //     extends: [
    //       "plugin:@typescript-eslint/recommended-requiring-type-checking",
    //     ],
    //     files: ["*.ts", "*.tsx"],
    //     parserOptions: {
    //       project: path.join(__dirname, "tsconfig.json"),
    //     },
    //   },
    // ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
    },
    plugins: ["@typescript-eslint"],
    extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/no-empty-function": "off",
        "prefer-const": "off",
        "react/no-children-prop": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/consistent-type-imports": [
            "off",
            {
                prefer: "type-imports",
                fixStyle: "inline-type-imports",
            },
        ],
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "^_" },
        ],
        "react/no-unescaped-entities": "off",
    },
}

module.exports = config

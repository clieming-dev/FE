module.exports = {
  root: true,
  extends: ["@clieming/eslint-config/base"],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    ".next/",
    ".expo/",
    "packages/*/dist/",
  ],
  overrides: [
    {
      files: ["*.config.*"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "import/no-anonymous-default-export": "off",
      },
    },
  ],
};

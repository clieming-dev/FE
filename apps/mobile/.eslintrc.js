module.exports = {
  extends: ["@clieming/eslint-config/react-native"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    "node_modules/",
    ".expo/",
    "dist/",
    "web-build/",
    "*.config.js",
    "*.config.ts",
    ".eslintrc.js",
  ],
};

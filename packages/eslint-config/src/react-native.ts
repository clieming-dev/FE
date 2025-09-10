const config = {
  extends: ["./base", "plugin:react-native/all"],
  env: {
    "react-native/react-native": true,
    es2022: true,
  },
  globals: {
    __DEV__: "readonly",
  },
  overrides: [
    {
      files: ["*.ios.*", "*.android.*"],
      rules: {
        "react-native/split-platform-components": "off",
      },
    },
  ],
};

export = config;

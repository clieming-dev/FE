const config = {
  extends: ["./base", "next/core-web-vitals"],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
};

export = config;

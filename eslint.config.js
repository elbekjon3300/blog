const rules = {
  "no-var": "error",
  "eqeqeq": "error",
  "no-unused-vars": "error",
  "no-undef": "error",
  "prefer-const": "error",
};

const browser = { document: "readonly", window: "readonly", fetch: "readonly", location: "readonly", Promise: "readonly" };
const node = { require: "readonly", module: "writable", process: "readonly", console: "readonly", __dirname: "readonly", URL: "readonly" };

module.exports = [
  { ignores: ["node_modules/**", "dist/**"] },
  {
    // the logic runs in the browser AND in Node
    files: ["src/blog.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals: { module: "writable" } },
    rules,
  },
  {
    // the page code runs in the browser and uses Blog from blog.js
    files: ["src/app.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals: { ...browser, Blog: "readonly" } },
    rules,
  },
  {
    files: ["scripts/**/*.js", "test/**/*.js", "eslint.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals: node },
    rules,
  },
];

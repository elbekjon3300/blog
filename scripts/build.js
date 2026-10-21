// build.js: checks the blog data, copies src/ to dist/, and stamps the version.
// The commit id comes from the GIT_SHA environment variable (the pipeline sets it); on your laptop it is "dev".

const fs = require("node:fs");
const path = require("node:path");
const Blog = require("../src/blog.js");

const root = path.join(__dirname, "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

function readJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(src, name), "utf8"));
  } catch (error) {
    console.error(name + " is not valid JSON: " + error.message);
    process.exit(1);
  }
}

const site = readJson("site.json");
const posts = readJson("posts.json");

const problems = Blog.validatePosts(posts);
if (!site.title || !site.author) problems.push("site.json needs a title and an author");
if (problems.length > 0) {
  console.error("The blog data has problems:");
  problems.forEach(function (problem) { console.error("  - " + problem); });
  process.exit(1);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(src, dist, { recursive: true });

const version = { version: process.env.GIT_SHA || "dev", builtAt: new Date().toISOString() };
fs.writeFileSync(path.join(dist, "version.json"), JSON.stringify(version) + "\n");

console.log("Built " + posts.length + " posts into dist/ (version " + version.version + ")");

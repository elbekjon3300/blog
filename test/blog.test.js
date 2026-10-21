const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const Blog = require("../src/blog.js");

const src = path.join(__dirname, "..", "src");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(src, name), "utf8"));

const sample = [
  { id: "a", title: "Docker basics", date: "2026-01-10", tags: ["docker", "learning"], body: "Images and containers." },
  { id: "b", title: "A red build", date: "2026-03-05", tags: ["ci"], body: "I fixed a comma." },
  { id: "c", title: "Tea and code", date: "2026-02-01", tags: ["life", "docker"], body: "Four cups of tea." },
];

// ---------- the logic ----------

test("formatDate writes a date in words", () => {
  assert.strictEqual(Blog.formatDate("2026-10-20"), "20 Oct 2026");
  assert.strictEqual(Blog.formatDate("2026-01-05"), "5 Jan 2026");
});

test("sortPosts puts the newest post first and keeps the original list", () => {
  const sorted = Blog.sortPosts(sample);
  assert.deepStrictEqual(sorted.map((p) => p.id), ["b", "c", "a"]);
  assert.deepStrictEqual(sample.map((p) => p.id), ["a", "b", "c"]);
});

test("filterPosts finds words in the title, body and tags, ignoring case", () => {
  assert.deepStrictEqual(Blog.filterPosts(sample, { query: "TEA" }).map((p) => p.id), ["c"]);
  assert.deepStrictEqual(Blog.filterPosts(sample, { query: "ci" }).map((p) => p.id), ["b"]);
  assert.deepStrictEqual(Blog.filterPosts(sample, { query: "docker" }).map((p) => p.id), ["a", "c"]);
  assert.deepStrictEqual(Blog.filterPosts(sample, { query: "nothing like this" }), []);
});

test("filterPosts can filter by tag and by words together", () => {
  assert.deepStrictEqual(Blog.filterPosts(sample, { tag: "docker" }).map((p) => p.id), ["a", "c"]);
  assert.deepStrictEqual(Blog.filterPosts(sample, { tag: "docker", query: "tea" }).map((p) => p.id), ["c"]);
  assert.strictEqual(Blog.filterPosts(sample, {}).length, 3);
});

test("allTags counts the tags, most used first", () => {
  assert.deepStrictEqual(Blog.allTags(sample)[0], { tag: "docker", count: 2 });
  assert.strictEqual(Blog.allTags(sample).length, 4);
});

test("excerpt cuts a long text at a space", () => {
  assert.strictEqual(Blog.excerpt("short", 20), "short");
  assert.strictEqual(Blog.excerpt("one two three four", 10), "one two\u2026");
});

test("readingTime is at least one minute", () => {
  assert.strictEqual(Blog.readingTime("a few words"), 1);
  assert.strictEqual(Blog.readingTime("word ".repeat(450)), 3);
});

test("findPost finds a post by id, or returns null", () => {
  assert.strictEqual(Blog.findPost(sample, "b").title, "A red build");
  assert.strictEqual(Blog.findPost(sample, "zzz"), null);
});

test("isRealDate rejects days that do not exist", () => {
  assert.strictEqual(Blog.isRealDate("2026-02-28"), true);
  assert.strictEqual(Blog.isRealDate("2026-02-30"), false);
  assert.strictEqual(Blog.isRealDate("20-10-2026"), false);
});

// ---------- the checker for posts.json ----------

test("validatePosts accepts good posts", () => {
  assert.deepStrictEqual(Blog.validatePosts(sample), []);
});

test("validatePosts explains what is wrong", () => {
  const bad = [
    { id: "ok", title: "Fine", date: "2026-01-01", tags: [], body: "text" },
    { id: "ok", title: "Same id", date: "2026-01-01", tags: [], body: "text" },
    { id: "Bad Id", title: "", date: "2026-13-45", tags: "docker", body: "" },
  ];
  const problems = Blog.validatePosts(bad);
  assert.ok(problems.some((p) => p.includes("used twice")));
  assert.ok(problems.some((p) => p.includes("lowercase letters")));
  assert.ok(problems.some((p) => p.includes("needs a title")));
  assert.ok(problems.some((p) => p.includes("needs a body")));
  assert.ok(problems.some((p) => p.includes("real day")));
  assert.ok(problems.some((p) => p.includes("tags must be")));
  assert.ok(Blog.validatePosts("not a list").length > 0);
});

// ---------- the real data of your blog ----------

test("posts.json is valid", () => {
  assert.deepStrictEqual(Blog.validatePosts(readJson("posts.json")), []);
});

test("site.json has a title and an author", () => {
  const site = readJson("site.json");
  assert.ok(site.title && site.title.trim());
  assert.ok(site.author && site.author.trim());
});

test("index.html has the places the page code needs and loads the scripts", () => {
  const html = fs.readFileSync(path.join(src, "index.html"), "utf8");
  ["site-title", "site-author", "search", "tags", "posts", "post", "version"].forEach((id) => {
    assert.ok(html.includes('id="' + id + '"'), "missing id " + id);
  });
  assert.ok(html.includes('src="blog.js"') && html.includes('src="app.js"'));
});

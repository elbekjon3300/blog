// blog.js: the LOGIC of the blog. There is no page code here, so it is easy to test.
// It works in the browser (global "Blog") and in Node (require), for the tests and the build.

const Blog = (function () {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // "2026-10-20" -> "20 Oct 2026"
  function formatDate(isoDate) {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
    if (!parts) return isoDate;
    return Number(parts[3]) + " " + MONTHS[Number(parts[2]) - 1] + " " + parts[1];
  }

  // newest post first (the original list is not changed)
  function sortPosts(posts) {
    return posts.slice().sort(function (a, b) {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });
  }

  // keep the posts that match the search words and the chosen tag
  function filterPosts(posts, options) {
    const query = ((options && options.query) || "").trim().toLowerCase();
    const tag = (options && options.tag) || "";
    return posts.filter(function (post) {
      if (tag && !post.tags.includes(tag)) return false;
      if (!query) return true;
      const text = (post.title + " " + post.body + " " + post.tags.join(" ")).toLowerCase();
      return text.includes(query);
    });
  }

  // [{ tag: "docker", count: 2 }, ...] most used first
  function allTags(posts) {
    const counts = {};
    posts.forEach(function (post) {
      post.tags.forEach(function (tag) {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .map(function (tag) { return { tag: tag, count: counts[tag] }; })
      .sort(function (a, b) { return b.count - a.count || a.tag.localeCompare(b.tag); });
  }

  // the first words of a text, cut at a space
  function excerpt(text, maxLength) {
    if (text.length <= maxLength) return text;
    const cut = text.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "\u2026";
  }

  // minutes to read, at 200 words per minute (at least 1)
  function readingTime(text) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function findPost(posts, id) {
    return posts.find(function (post) { return post.id === id; }) || null;
  }

  // is "2026-02-30" a real day? (it is not)
  function isRealDate(isoDate) {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
    if (!parts) return false;
    const date = new Date(Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])));
    return date.getUTCFullYear() === Number(parts[1]) &&
      date.getUTCMonth() === Number(parts[2]) - 1 &&
      date.getUTCDate() === Number(parts[3]);
  }

  // checks posts.json and returns a list of problems in plain words ([] = all good)
  function validatePosts(posts) {
    if (!Array.isArray(posts)) return ["posts.json must be a list of posts: [ {...}, {...} ]"];
    const problems = [];
    const seen = {};
    posts.forEach(function (post, index) {
      const label = "post #" + (index + 1) + (post && post.title ? ' ("' + post.title + '")' : "");
      if (!post || typeof post !== "object") { problems.push(label + ": must be an object { ... }"); return; }
      if (typeof post.id !== "string" || !/^[a-z0-9-]+$/.test(post.id)) problems.push(label + ": id must be lowercase letters, digits and dashes, like my-first-post");
      else if (seen[post.id]) problems.push(label + ': the id "' + post.id + '" is used twice');
      else seen[post.id] = true;
      if (typeof post.title !== "string" || !post.title.trim()) problems.push(label + ": needs a title");
      if (typeof post.body !== "string" || !post.body.trim()) problems.push(label + ": needs a body");
      if (!isRealDate(post.date)) problems.push(label + ": the date must be a real day written like 2026-10-20");
      if (!Array.isArray(post.tags) || post.tags.some(function (tag) { return typeof tag !== "string" || !tag.trim(); })) problems.push(label + ': tags must be a list of words, like ["docker", "ci"]');
    });
    return problems;
  }

  return { formatDate, sortPosts, filterPosts, allTags, excerpt, readingTime, findPost, isRealDate, validatePosts };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Blog;
}

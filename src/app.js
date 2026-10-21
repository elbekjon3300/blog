// app.js: draws the page in the browser. The logic (search, sort, dates) is in blog.js.
// Text from the data files is always put in with textContent, never as HTML.

(function () {
  const state = { site: null, posts: [], query: "", tag: "" };

  const listView = document.getElementById("list-view");
  const postView = document.getElementById("post-view");
  const errorBox = document.getElementById("error");

  function make(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function getJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error(url + " answered " + response.status);
      return response.json();
    });
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function renderHeader() {
    document.title = state.site.title;
    document.getElementById("site-title").textContent = state.site.title;
    document.getElementById("site-author").textContent = "by " + state.site.author;
    document.getElementById("site-bio").textContent = state.site.bio || "";
  }

  function renderTags() {
    const box = document.getElementById("tags");
    box.textContent = "";
    const chips = [{ tag: "", label: "All" }].concat(
      Blog.allTags(state.posts).map(function (item) {
        return { tag: item.tag, label: item.tag + " (" + item.count + ")" };
      })
    );
    chips.forEach(function (chip) {
      const button = make("button", "tag" + (state.tag === chip.tag ? " active" : ""), chip.label);
      button.type = "button";
      button.addEventListener("click", function () {
        state.tag = chip.tag;
        renderTags();
        renderList();
      });
      box.appendChild(button);
    });
  }

  function metaText(post) {
    return Blog.formatDate(post.date) + " \u00b7 " + Blog.readingTime(post.body) + " min read \u00b7 " + post.tags.join(", ");
  }

  function renderList() {
    const box = document.getElementById("posts");
    box.textContent = "";
    const shown = Blog.sortPosts(Blog.filterPosts(state.posts, { query: state.query, tag: state.tag }));
    document.getElementById("count").textContent = shown.length === 1 ? "1 post" : shown.length + " posts";
    shown.forEach(function (post) {
      const card = make("article", "card");
      const title = make("h2");
      const link = make("a", "", post.title);
      link.href = "#/post/" + post.id;
      title.appendChild(link);
      card.appendChild(title);
      card.appendChild(make("p", "meta", metaText(post)));
      card.appendChild(make("p", "", Blog.excerpt(post.body.replace(/\s+/g, " "), 140)));
      box.appendChild(card);
    });
  }

  function renderPost(post) {
    const box = document.getElementById("post");
    box.textContent = "";
    box.appendChild(make("h2", "", post.title));
    box.appendChild(make("p", "meta", metaText(post)));
    post.body.split("\n\n").forEach(function (paragraph) {
      box.appendChild(make("p", "", paragraph));
    });
  }

  function route() {
    const match = /^#\/post\/([a-z0-9-]+)$/.exec(location.hash);
    if (!match) {
      postView.hidden = true;
      listView.hidden = false;
      return;
    }
    const post = Blog.findPost(state.posts, match[1]);
    if (!post) {
      showError("There is no post called " + match[1]);
      postView.hidden = true;
      listView.hidden = false;
      return;
    }
    renderPost(post);
    listView.hidden = true;
    postView.hidden = false;
    window.scrollTo(0, 0);
  }

  function showVersion(version) {
    const node = document.getElementById("version");
    if (!version) { node.textContent = "version unknown"; return; }
    node.textContent = "version " + String(version.version).slice(0, 7) + " \u00b7 built " + version.builtAt.slice(0, 16).replace("T", " ") + " UTC";
  }

  Promise.all([getJson("site.json"), getJson("posts.json"), getJson("version.json").catch(function () { return null; })])
    .then(function (results) {
      state.site = results[0];
      state.posts = results[1];
      renderHeader();
      renderTags();
      renderList();
      showVersion(results[2]);
      document.getElementById("search").addEventListener("input", function (event) {
        state.query = event.target.value;
        renderList();
      });
      window.addEventListener("hashchange", route);
      route();
    })
    .catch(function (error) {
      showError("The blog could not be loaded: " + error.message);
    });
})();

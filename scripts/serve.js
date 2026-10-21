// serve.js: a tiny web server to look at dist/ on your laptop: npm start, then open http://localhost:8080

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const dist = path.join(__dirname, "..", "dist");
const port = Number(process.env.PORT) || 8080;
const types = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".json": "application/json" };

const server = http.createServer(function (request, response) {
  const urlPath = new URL(request.url, "http://localhost").pathname;
  if (urlPath === "/health") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("ok\n");
    return;
  }
  const file = path.join(dist, urlPath === "/" ? "index.html" : path.normalize(urlPath));
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found\n");
    return;
  }
  response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, function () {
  console.log("Open http://localhost:" + port);
});

# Personal blog: HTML + JavaScript, built with a pipeline

A tiny blog with no framework. The text of the blog lives in two data files, the page is drawn by JavaScript,
and a GitHub Actions pipeline lints it, tests it, builds a Docker image and publishes it to Docker Hub.

## Run it on your laptop
```
npm ci
npm start          # then open http://localhost:8080
```

## Make it yours (this is the lab: change something, then push)
| File | What to change |
|------|----------------|
| `src/site.json` | your **name** (`author`), the blog `title` and the `bio` |
| `src/posts.json` | write your own posts (look at the examples: `id`, `title`, `date`, `tags`, `body`) |
| `src/style.css` | the first lines: change `--accent` to a color you like |

Mistakes are caught for you: `npm run build` explains what is wrong in `posts.json`, `npm run lint` checks the code
style, and `npm test` runs the tests.

## The pipeline (`.github/workflows/ci.yaml`)
On every push to `main`, one job runs these steps: get the code, install Node.js, install the tools, **lint**, **test**,
**build** the blog, log in to Docker Hub, and **build the image and push it** as `<you>/blog:latest`.
In the lab you add one more step at the end (`cd-step.yaml`): **deploy to the server**, which logs in over SSH and runs
your own `deploy.sh`.

Secrets in your repository (Settings, Secrets and variables, Actions):
- `DOCKERHUB_USERNAME`: your Docker Hub user name
- `DOCKERHUB_TOKEN`: a Docker Hub access token with write permission
- `SERVER_PASSWORD`: the password of the student account on the server (for the deploy step)

The page footer shows the commit the running site was built from, so after each deploy you can see your new version.

## The Docker image
```
npm run build
docker build -t blog .
docker run -p 8080:8080 blog        # open http://localhost:8080
```
`dist/` (the built site) must exist before `docker build`. The image is nginx (running as a normal user) serving `dist/`.

## Deploy to the class server
Follow `LAB.md`. The teacher's notes are in `server/README.md`.

## Files
```
src/            the blog: index.html, style.css, app.js (draws the page), blog.js (the logic), site.json, posts.json
test/           the tests
scripts/        build.js (checks data, makes dist/), serve.js (preview on your laptop)
Dockerfile      the image (nginx serving dist/)
nginx.conf      the web server settings
server/         deploy.sh (the script every student keeps on the server) and the teacher's notes
cd-step.yaml    the deploy step students add to the workflow
LAB.md          the lab steps for students
teacher/        the finished workflow (answer key): remove it from the student template
```

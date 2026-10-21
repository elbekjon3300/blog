# Lab: from your laptop to a real server, with a pipeline

You change your own blog, push it, and a pipeline tests it, packs it into a Docker image, sends it to Docker Hub and
puts it on the class server. Then you open your blog in a browser.

## Part 1: your own copy of the project
Open the project on GitHub, click **Use this template**, then **Create a new repository** (public).
(If you only see **Fork**: fork it, then open the **Actions** tab and enable workflows.)

## Part 2: Docker Hub secrets
1. Docker Hub, Account settings, Personal access tokens: create a token that can **write** and copy it.
2. In your GitHub repository: Settings, Secrets and variables, Actions, **New repository secret**:
   - `DOCKERHUB_USERNAME` = your Docker Hub user name
   - `DOCKERHUB_TOKEN` = the token
3. Open **Actions**, open the failed run and click **Re-run all jobs**. When it is green, `hub.docker.com` has your
   repository `<you>/blog`. Check that it is **public**.

## Part 3: make it yours
Edit `src/site.json`: put **your name** in `author`. Add a post in `src/posts.json`. Commit and push, and watch the run.
If you make a mistake in the data, the pipeline stops and tells you what is wrong.

## Part 4: your deploy script on the server (by hand, once)
You need: the server `5.133.141.122`, the user `student`, the password and **your port** (from your teacher).

1. Log in: `ssh student@5.133.141.122`
2. Make **your own folder** with your first name, in lowercase letters: `mkdir ~/anna`
   (If it says "File exists", someone has that name: choose another.)
3. Copy the script into it, from your laptop, in the project folder:
   `scp server/deploy.sh student@5.133.141.122:anna/deploy.sh`
4. On the server, change the `PORT=` line to **your** port: `nano ~/anna/deploy.sh`
   (save: Ctrl+O, Enter, Ctrl+X). Then: `chmod +x ~/anna/deploy.sh`
5. Run it: `~/anna/deploy.sh <your-dockerhub-user>`
6. Open `http://5.133.141.122:<your-port>`: your blog. The footer shows the commit it was built from.

Read the script. It does three things: pull the image, remove the old container, start the new one.

## Part 5: let GitHub Actions deploy for you
1. Add one more secret: `SERVER_PASSWORD` = the password of the student account.
2. Open `.github/workflows/ci.yaml`. Paste the content of `cd-step.yaml` at the **end** (the same indentation as the
   other steps). Change `yourname` to the name of **your** folder.
3. Commit and push. After the run is green, open your blog: the footer shows the new commit.

## Part 6: the cycle
Change something, push, wait for the green run, refresh your page. Then try:
- push a broken change (a missing comma in `posts.json`) and watch the pipeline stop before your blog is touched
- change the first line of a post and see how long the whole way takes
- read `deploy.sh` again: what happens if the port is already used?

## Stuck?
| Message | What to do |
|---------|------------|
| `Username and password required` (login step) | add the secrets of Part 2 |
| `Permission denied` (deploy step) | the `SERVER_PASSWORD` secret is wrong |
| `No such file or directory` (deploy step) | the folder name in the deploy step is not the name of your folder |
| `pull access denied` | wrong Docker Hub user, or the repository does not exist yet |
| `port is already allocated` | your `PORT` is used by someone else: check the port your teacher gave you |

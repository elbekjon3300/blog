#!/usr/bin/env bash
#
# My deploy script: pull my blog image from Docker Hub and run it on MY port.
#
#   ~/anna/deploy.sh <dockerhub-user>
#
# GitHub Actions runs this on the server after every build.
# Keep it in a folder with your name (like ~/anna/) and change the PORT.
#
set -euo pipefail

PORT=8101                  # <-- CHANGE THIS: the port your teacher gave you

if [ $# -ne 1 ]; then
  echo "usage: ~/yourname/deploy.sh <dockerhub-user>"
  exit 1
fi
IMAGE="$1/blog:latest"
NAME="blog-$(basename "$(dirname "$(readlink -f "$0")")")"   # blog- + the name of this folder

echo "Pulling $IMAGE ..."
docker pull -q "$IMAGE" > /dev/null

echo "Replacing the old container ..."
docker rm -f "$NAME" > /dev/null 2>&1 || true      # it is fine if there is none yet
docker run -d --name "$NAME" --restart unless-stopped -p "$PORT:8080" --memory 64m "$IMAGE" > /dev/null

echo "Done: http://5.133.141.122:$PORT"

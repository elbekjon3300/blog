# The server side of the lab (for the teacher)

One shared Linux account (`student`). Every student makes a folder with their own name in it and keeps a copy of
`deploy.sh` there, with their own port written inside:

```
/home/student/
    anna/deploy.sh     PORT=8101    -> container blog-anna
    bob/deploy.sh      PORT=8102    -> container blog-bob
```
After every build, GitHub Actions logs in as `student` and runs `bash ~/<folder>/deploy.sh <dockerhub-user>`.

## deploy.sh (28 lines)
1. pull `<dockerhub-user>/blog:latest` from Docker Hub (if this fails, nothing else happens: the running blog stays)
2. remove the old container `blog-<folder>`
3. start the new one on the student's port (64 MB memory limit, restarts after a reboot)

The container is named after the folder, so students cannot remove each other's containers by accident. If two students
use the same port, the second one fails with "port is already allocated" and the first one keeps running.

## Set up once
```bash
adduser --disabled-password --gecos "" student
echo "student:A-LONG-RANDOM-PASSWORD" | chpasswd        # openssl rand -base64 18 makes a good one
usermod -aG docker student

# let this account log in with a password (everyone else keeps the global setting)
cat > /etc/ssh/sshd_config.d/20-student.conf <<'EOT'
Match User student
    PasswordAuthentication yes
    MaxAuthTries 3
EOT
sshd -t && systemctl reload ssh                          # "sshd" instead of "ssh" on some systems
```
- Open TCP **8101-8115** (the students' ports) and your SSH port.
- Give every student **one port** from the range (a table on the board: anna 8101, bob 8102, ...).
- If your SSH port is not 22, change `port: 22` in `cd-step.yaml` once, before you hand out the template.
- Install `fail2ban`.

## During the class
```bash
docker ps --filter "name=^blog-" --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
```
To see which version a student runs, open `http://5.133.141.122:<port>` and read the footer.

## After the class
```bash
docker ps -aq --filter "name=^blog-" | xargs -r docker rm -f
rm -rf /home/student/*/
passwd -l student                                        # lock the shared password
```

## Weak points to know about
- One account means no walls between students: anyone can read or delete another student's folder or container.
  The script protects against accidents, not against a student who wants to.
- The shared password is in every student's repository secrets, and members of the `docker` group are effectively
  root. Use a long random password, change it after the class, and use a throwaway server.
- The login step does not check the server's identity (a real team would add `fingerprint:` to the deploy step, with
  the output of `ssh-keygen -l -f /etc/ssh/ssh_host_ed25519_key.pub`). It is left out to keep the lab simple.
- The image is always `latest`: there is no rollback. The footer shows which commit is running.
- The Docker Hub repositories must be public. Docker Hub limits anonymous pulls (100 per 6 hours per server): a class of
  15 pushing a few times is fine.

## The answer key
`teacher/ci-cd.yaml` is `.github/workflows/ci.yaml` with the deploy step already added. Remove the `teacher/` folder
from the student template.

# Deployment

Production (`kubepreflight.com`) runs on a DigitalOcean droplet, behind
Cloudflare (proxied/orange-cloud), serving `dist/` via nginx.
`.github/workflows/deploy-digitalocean.yml` builds and deploys on every
push to `main`, or on demand via `workflow_dispatch`.

## How a deploy works

Releases are atomic — a deploy never overwrites the directory nginx is
currently serving from:

1. CI builds the site (`npm run build:prod` — the same check + check:content
   + build + check:links gate documented in `production-hardening.md`).
2. The build is rsynced to `$DEPLOY_PATH/releases/<git-sha>/` on the
   droplet — a brand new directory, not touching whatever's currently live.
3. `scripts/deploy/activate-release.sh` (rsynced fresh on every run, so the
   droplet's copy can never drift from what's in this repo) flips the
   `current` symlink to the new release and reloads nginx.
4. It then smoke-checks `http://127.0.0.1/` on the droplet itself. If that
   fails, it automatically flips `current` back to the previous release,
   reloads nginx again, and exits non-zero — the bad deploy never stays
   live, and CI reports the run as failed.
5. On success, it prunes old release directories, keeping the 5 most
   recent.

`kubepreflight.com`'s DNS record is Cloudflare-proxied (orange cloud), which
doesn't forward SSH — so the workflow talks to the droplet by its
**origin IP**, not the public hostname.

## One-time droplet bootstrap

Run as root on the droplet, once. Adjust `EXISTING_ROOT` to wherever nginx
currently points (`grep root /etc/nginx/sites-enabled/*` if unsure) — this
lets the first automated deploy have a working predecessor to fall back to,
and stops nginx from breaking the moment its `root` is repointed at a
symlink that doesn't exist yet.

```bash
# 1. Dedicated, non-root deploy user (deploys have been happening as root —
#    this replaces that).
adduser --disabled-password --gecos "" deploy

# 2. Release directory structure, owned by deploy.
mkdir -p /var/www/kubepreflight/releases
chown -R deploy:deploy /var/www/kubepreflight

# 3. Bootstrap "current" so nginx has something valid to point at before
#    the first CI deploy runs.
EXISTING_ROOT=/var/www/kubepreflight-manual   # <- your actual current path
sudo -u deploy ln -s "$EXISTING_ROOT" /var/www/kubepreflight/current

# 4. Point nginx's `root` at the symlink, then reload.
#    In the site's server block:
#      root /var/www/kubepreflight/current;
nginx -t && systemctl reload nginx

# 5. Narrow, passwordless sudo — exactly one command, nothing else.
cat > /etc/sudoers.d/deploy-nginx-reload <<'EOF'
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl reload nginx
EOF
chmod 440 /etc/sudoers.d/deploy-nginx-reload
visudo -c
```

## One-time SSH key setup

Run **on your own machine**, not in any chat — the private key must never
be pasted anywhere outside a GitHub Secret.

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy@kubepreflight" -f ./kp-deploy-key -N ""
```

Add the **public** key to the droplet, restricted to exactly what this key
is for (defense in depth — this key has one job):

```bash
# On the droplet, as root or deploy:
echo 'no-port-forwarding,no-agent-forwarding,no-X11-forwarding '"$(cat kp-deploy-key.pub)" \
  >> /home/deploy/.ssh/authorized_keys   # create ~deploy/.ssh (chmod 700) first if it doesn't exist
chmod 600 /home/deploy/.ssh/authorized_keys
```

Capture the droplet's host key once, from a trusted vantage point (the
DigitalOcean web console, or directly on/near the droplet — not blindly
trusted over the network during every CI run):

```bash
ssh-keyscan -t ed25519 <droplet-origin-ip>
```

## GitHub repository setup

**Settings → Secrets and variables → Actions → Secrets:**

| Secret | Value |
|---|---|
| `DEPLOY_SSH_KEY` | contents of `kp-deploy-key` (the private key) |
| `DEPLOY_HOST` | the droplet's origin IP (not `kubepreflight.com`) |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_HOST_KEY` | the exact line(s) from `ssh-keyscan` above |

**Settings → Secrets and variables → Actions → Variables** (optional):

| Variable | Default if unset |
|---|---|
| `DEPLOY_PATH` | `/var/www/kubepreflight` |

Delete the local private key file once it's in GitHub Secrets:
`rm kp-deploy-key kp-deploy-key.pub`.

The workflow deploys through a GitHub Environment named `production`
(auto-created on first run) — add required reviewers there
(Settings → Environments → production) if you want a manual approval gate
before every deploy, on top of the automated checks.

## Manual rollback

The activation script already auto-rolls-back on a failed smoke check. For
a manual rollback (e.g. something looks wrong minutes after a deploy that
smoke-checked fine), SSH in and re-activate an older release directly —
`ls $DEPLOY_PATH/releases` to see what's available, then:

```bash
ssh deploy@<droplet-origin-ip> "bash ~/activate-release.sh <older-release-sha>"
```

## First deploy checklist

1. Complete the droplet bootstrap and SSH key setup above.
2. Add the four secrets and confirm `DEPLOY_PATH` if you're not using the
   default.
3. Push to `main` (or run the workflow manually via
   Actions → Deploy to DigitalOcean → Run workflow).
4. Watch the run — `Activate release` succeeding means the smoke check
   passed on the droplet itself.
5. Verify from outside: `curl -I https://kubepreflight.com` and the
   production checks in `production-hardening.md`.

# Deploying The Lawn Guy Bradford to DigitalOcean

End-to-end guide for putting the site on a DigitalOcean Droplet at **lawnguybradford.ca**.

**Recommended droplet:** Basic Regular, **4 GB / 2 vCPU / 80 GB SSD**, **TOR1 (Toronto)**, Ubuntu 24.04 LTS x86_64. ~$24/mo + ~$4.80/mo for weekly auto-snapshots + $5/mo for Spaces (offsite backup) = **~$33.80/mo**.

The scripts here are hosting-agnostic — they also work on an OCI Always-Free Ampere A1 ARM VM with no edits (the MongoDB apt source declares both `amd64` and `arm64`).

---

## 0. Prereqs (one-time)

- A DigitalOcean account.
- An SSH key pair on your local machine (`ssh-keygen -t ed25519` if you don't have one) — paste the `.pub` contents into the droplet creation form.
- A registered domain (`lawnguybradford.ca`) where you can edit DNS or change nameservers.
- A Gmail app password ready (for sending lead emails — not your account password).
- A DO Spaces bucket in **TOR1** named `tlg-backups` (or whatever you want — match the `DO_SPACES_BUCKET` env on the backup unit). Generate a Spaces access key/secret in DO panel → API → Spaces Keys.
- Optional: OpenAI / Gemini API keys.

UFW inside the VM opens **22, 80, 443**. Nothing else needs to be opened on the DO side — droplets don't have a separate cloud firewall by default.

---

## 1. Provision the droplet

DO control panel → Create → Droplets:

- **Image:** Ubuntu 24.04 (LTS) x64
- **Plan:** Basic → Regular Intel/SSD → **$24/mo (4 GB / 2 vCPU / 80 GB)**
- **Region:** TOR1 (Toronto)
- **Authentication:** SSH Key — paste your `~/.ssh/id_ed25519.pub`
- **Hostname:** `lawnguy-prod`
- **Backups:** ON (recommended — adds ~$4.80/mo for weekly snapshots)

Hit Create. After ~30 seconds the droplet has a public IP — copy it.

---

## 2. Bootstrap the droplet

DO Ubuntu droplets ship with `root` enabled by default. From PowerShell or a Bash terminal on your laptop:

```bash
DROPLET_IP=<paste from DO panel>
scp ops/scripts/bootstrap-vm.sh root@${DROPLET_IP}:~/
ssh root@${DROPLET_IP} "bash ~/bootstrap-vm.sh"
```

This installs Node 22, pnpm 9, MongoDB 7, Nginx, certbot, **s3cmd**, creates the `lawnguy` user, and configures UFW.

---

## 3. Get the repo onto the droplet

```bash
ssh root@${DROPLET_IP}

# Option A: clone from your remote (recommended — `deploy.sh` later does git pull)
sudo -u lawnguy git clone https://github.com/<you>/TheLawnGuyBradford-v2.git /srv/lawnguy

# Option B: rsync from your laptop
# (run this on your laptop)
rsync -avz --exclude=node_modules --exclude=.next --exclude=.turbo \
  ./ root@${DROPLET_IP}:/tmp/lawnguy/
ssh root@${DROPLET_IP} "rsync -a /tmp/lawnguy/ /srv/lawnguy/ && chown -R lawnguy:lawnguy /srv/lawnguy"
```

---

## 4. Create env files

These are **secrets** — never commit them. Both files should be `chmod 600` and owned by `lawnguy`.

**`/srv/lawnguy/apps/api/.env`** — copy from `apps/api/.env.example` and fill in:

```bash
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://lawnguybradford.ca

MONGO_URI=mongodb://127.0.0.1:27017/lawnguy
ADMIN_TOKEN=<generate a long random string — `openssl rand -hex 32`>

# AI (optional)
OPENAI_API_KEY=
GEMINI_API_KEY=

# Email (Gmail app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=remy.post.06@gmail.com
SMTP_PASS=<gmail app password>
OWNER_EMAIL=remy.post.06@gmail.com

OWNER_SMS_HREF=sms:+1...
```

**`/srv/lawnguy/apps/web/.env.local`** — copy from `apps/web/.env.local.example` and fill in:

```bash
NEXT_PUBLIC_SITE_URL=https://lawnguybradford.ca
NEXT_PUBLIC_API_BASE_URL=          # empty in prod — same-origin via Nginx
API_BASE_URL=http://127.0.0.1:3001 # internal API URL for SSR
ADMIN_TOKEN=<must match apps/api/.env ADMIN_TOKEN>
```

```bash
sudo chmod 600 /srv/lawnguy/apps/api/.env /srv/lawnguy/apps/web/.env.local
sudo chown lawnguy:lawnguy /srv/lawnguy/apps/api/.env /srv/lawnguy/apps/web/.env.local
```

**`~lawnguy/.s3cfg`** — credentials for nightly DO Spaces backup uploads. The bootstrap script installed `s3cmd`; this file is what it reads. Generate the key/secret in DO panel → API → Spaces Keys.

```bash
sudo -u lawnguy bash -c "cat > ~lawnguy/.s3cfg <<'EOF'
[default]
access_key = <SPACES_ACCESS_KEY>
secret_key = <SPACES_SECRET>
host_base = tor1.digitaloceanspaces.com
host_bucket = %(bucket)s.tor1.digitaloceanspaces.com
use_https = True
EOF"
sudo chmod 600 ~lawnguy/.s3cfg
```

If you skip this step, nightly backups still write locally to `/var/backups/lawnguy/`; only the offsite copy is disabled. You can also disable the offsite leg entirely by commenting out the `Environment=DO_SPACES_BUCKET=...` line in [`ops/systemd/lawnguy-backup.service`](systemd/lawnguy-backup.service).

---

## 5. First install + build + seed

```bash
cd /srv/lawnguy
sudo -u lawnguy pnpm install --frozen-lockfile
sudo -u lawnguy pnpm build
sudo -u lawnguy pnpm seed   # imports website.json + brand.json into MongoDB
```

---

## 6. Install systemd services

```bash
sudo /srv/lawnguy/ops/scripts/install-systemd.sh
```

Verifies that `lawnguy-api`, `lawnguy-web`, and `lawnguy-backup.timer` are enabled and running.

```bash
# tail logs
journalctl -u lawnguy-api -f
journalctl -u lawnguy-web -f
```

At this point both processes are up but nothing is reachable from the public IP yet.

---

## 7. Point DNS at the droplet

Two options — pick one:

**Option A: DigitalOcean DNS (simplest).** In DO panel → Networking → Domains, add `lawnguybradford.ca`. Add records:

```
A     @     <droplet IP>   TTL 300
A     www   <droplet IP>   TTL 300
```

Then at your registrar, change nameservers to `ns1.digitalocean.com`, `ns2.digitalocean.com`, `ns3.digitalocean.com`.

**Option B: Keep your registrar's DNS.** Add the same two A records there.

Wait until `Resolve-DnsName lawnguybradford.ca` (PowerShell) or `dig lawnguybradford.ca +short` (Bash) returns the droplet IP. Usually a few minutes; can take up to an hour after a nameserver change.

---

## 8. Issue SSL + enable Nginx site

```bash
sudo /srv/lawnguy/ops/scripts/install-ssl.sh
```

Certbot will:
- Copy `ops/nginx/lawnguy.conf` to `/etc/nginx/sites-available/`
- Issue a Let's Encrypt cert for `lawnguybradford.ca` and `www.lawnguybradford.ca`
- Edit the Nginx config to add the SSL listener and HTTP → HTTPS redirect
- Set up auto-renewal via `certbot.timer`

Open `https://lawnguybradford.ca/` — should serve the home page.

---

## 9. Verify

| Check | Command |
|---|---|
| API health | `curl https://lawnguybradford.ca/api/health` |
| Public homepage data | `curl https://lawnguybradford.ca/api/public/homepage \| jq '.content \| keys'` |
| Admin gate (no token) | `curl -i https://lawnguybradford.ca/api/admin/leads` → 401 |
| Admin gate (with token) | `curl -H "Authorization: Bearer <ADMIN_TOKEN>" https://lawnguybradford.ca/api/admin/leads` → 200 |
| Services up | `systemctl is-active lawnguy-api lawnguy-web mongod nginx` |
| Backup timer schedule | `systemctl list-timers \| grep lawnguy` |
| Force a backup now | `sudo systemctl start lawnguy-backup.service`, then check `/var/backups/lawnguy/` AND `s3://tlg-backups/lawnguy/` (DO panel) |
| UFW status | `ufw status` → only 22, 80, 443 |
| Reboot survives | `sudo reboot` then re-check above |
| SSL grade | <https://www.ssllabs.com/ssltest/analyze.html?d=lawnguybradford.ca> |

---

## Updating the site (every deploy after the first)

From your laptop:

```bash
git push   # to your remote
```

On the droplet:

```bash
sudo /srv/lawnguy/ops/scripts/deploy.sh

# If website.json or brand.json changed:
sudo /srv/lawnguy/ops/scripts/deploy.sh --seed
```

---

## Backups

Three layers, each independent of the others:

1. **Nightly local mongodump** at 03:00 local → `/var/backups/lawnguy/lawnguy-<TIMESTAMP>.archive.gz`. 14-day retention, auto-pruned. Always on.
2. **Nightly offsite to DO Spaces** — same archive, also uploaded to `s3://${DO_SPACES_BUCKET}/lawnguy/`. Controlled by the `Environment=DO_SPACES_BUCKET=...` line in [`systemd/lawnguy-backup.service`](systemd/lawnguy-backup.service); requires `~lawnguy/.s3cfg` (see §4). Comment out the `Environment=` line to disable.
3. **Weekly droplet snapshot** — DO's automated backups feature ($4.80/mo). Restores the entire box image, not just data. Enabled at droplet creation; can be toggled in DO panel.

Restore from a local archive:

```bash
mongorestore --uri="mongodb://127.0.0.1:27017/lawnguy" \
  --archive=/var/backups/lawnguy/lawnguy-20260505T030000.archive.gz \
  --gzip --drop
```

Pull a Spaces archive back to the droplet (e.g. after losing the local one):

```bash
sudo -u lawnguy s3cmd get \
  s3://${DO_SPACES_BUCKET}/lawnguy/lawnguy-20260505T030000.archive.gz \
  /tmp/restore.archive.gz
mongorestore --uri="mongodb://127.0.0.1:27017/lawnguy" \
  --archive=/tmp/restore.archive.gz --gzip --drop
```

---

## Troubleshooting

| Symptom | Check |
|---|---|
| `502 Bad Gateway` on the home page | `systemctl status lawnguy-web` |
| `502` only on `/api/*` | `systemctl status lawnguy-api`, then `journalctl -u lawnguy-api` |
| `503` from admin endpoint | `ADMIN_TOKEN` not set in `apps/api/.env` |
| Lead form returns 500 | `journalctl -u lawnguy-api`, often Mongo connection or SMTP |
| Site shows old content after `pnpm seed` | Web is cached for 30s — wait, or `systemctl restart lawnguy-web` |

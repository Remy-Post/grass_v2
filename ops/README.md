# Deploying The Lawn Guy Bradford to OCI

End-to-end guide for putting the site on an Oracle Cloud Always-Free **Ampere A1** VM at **thelawnguybradford.ca**.

---

## 0. Prereqs (one-time)

- An OCI account with the Always-Free Ampere A1 instance provisioned (Ubuntu 22.04 or 24.04 LTS, ARM64).
- SSH access to the VM (key-based — no passwords).
- A registered domain (`thelawnguybradford.ca`) where you can edit DNS.
- A Gmail app password ready (for sending lead emails — not your account password).
- Optional: OpenAI / Gemini API keys.

Open the OCI security list / VCN to allow inbound TCP **80** and **443** in addition to **22**. UFW inside the VM will mirror this.

---

## 1. Bootstrap the VM

Copy `ops/scripts/bootstrap-vm.sh` onto the VM and run it as root. Easiest way:

```bash
# From your laptop
scp ops/scripts/bootstrap-vm.sh ubuntu@<VM_IP>:~/
ssh ubuntu@<VM_IP> "sudo bash ~/bootstrap-vm.sh"
```

This installs Node 22, pnpm 9, MongoDB 7, Nginx, certbot, creates the `lawnguy` user, and configures UFW.

---

## 2. Get the repo onto the VM

```bash
ssh ubuntu@<VM_IP>

# Option A: clone from your remote (recommended)
sudo -u lawnguy git clone https://github.com/<you>/TheLawnGuyBradford-v2.git /srv/lawnguy

# Option B: rsync from your laptop
# (run this on your laptop)
rsync -avz --exclude=node_modules --exclude=.next --exclude=.turbo \
  ./ ubuntu@<VM_IP>:/tmp/lawnguy/
ssh ubuntu@<VM_IP> "sudo rsync -a /tmp/lawnguy/ /srv/lawnguy/ && sudo chown -R lawnguy:lawnguy /srv/lawnguy"
```

---

## 3. Create env files

These are **secrets** — never commit them. Both files should be `chmod 600` and owned by `lawnguy`.

**`/srv/lawnguy/apps/api/.env`** — copy from `apps/api/.env.example` and fill in:

```bash
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://thelawnguybradford.ca

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
NEXT_PUBLIC_SITE_URL=https://thelawnguybradford.ca
NEXT_PUBLIC_API_BASE_URL=          # empty in prod — same-origin via Nginx
API_BASE_URL=http://127.0.0.1:3001 # internal API URL for SSR
ADMIN_TOKEN=<must match apps/api/.env ADMIN_TOKEN>
```

```bash
sudo chmod 600 /srv/lawnguy/apps/api/.env /srv/lawnguy/apps/web/.env.local
sudo chown lawnguy:lawnguy /srv/lawnguy/apps/api/.env /srv/lawnguy/apps/web/.env.local
```

---

## 4. First install + build + seed

```bash
cd /srv/lawnguy
sudo -u lawnguy pnpm install --frozen-lockfile
sudo -u lawnguy pnpm build
sudo -u lawnguy pnpm seed   # imports website.json + brand.json into MongoDB
```

---

## 5. Install systemd services

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

## 6. Point DNS at the VM

In your registrar's DNS panel:

```
A     @     <VM public IP>
A     www   <VM public IP>
```

Wait until `dig thelawnguybradford.ca +short` from your laptop returns the VM IP. Usually a few minutes.

---

## 7. Issue SSL + enable Nginx site

```bash
sudo /srv/lawnguy/ops/scripts/install-ssl.sh
```

Certbot will:
- Copy `ops/nginx/lawnguy.conf` to `/etc/nginx/sites-available/`
- Issue a Let's Encrypt cert for `thelawnguybradford.ca` and `www.thelawnguybradford.ca`
- Edit the Nginx config to add the SSL listener and HTTP → HTTPS redirect
- Set up auto-renewal via `certbot.timer`

Open `https://thelawnguybradford.ca/` — should serve the home page.

---

## 8. Verify

| Check | Command |
|---|---|
| API health | `curl https://thelawnguybradford.ca/api/health` |
| Public homepage data | `curl https://thelawnguybradford.ca/api/public/homepage \| jq '.content \| keys'` |
| Backup ran today | `ls -lh /var/backups/lawnguy/` |
| Backup timer schedule | `systemctl list-timers \| grep lawnguy` |
| Reboot survives | `sudo reboot` then re-check above |
| SSL grade | <https://www.ssllabs.com/ssltest/analyze.html?d=thelawnguybradford.ca> |

---

## Updating the site (every deploy after the first)

From your laptop:

```bash
git push   # to your remote
```

On the VM:

```bash
sudo -u lawnguy /srv/lawnguy/ops/scripts/deploy.sh

# If website.json or brand.json changed:
sudo -u lawnguy /srv/lawnguy/ops/scripts/deploy.sh --seed
```

---

## Backups

- Nightly `mongodump` at 03:00 local → `/var/backups/lawnguy/lawnguy-<TIMESTAMP>.archive.gz`
- 14-day local retention, then auto-pruned
- To enable OCI Object Storage upload, set `OCI_BUCKET=<bucket-name>` in the systemd unit's `Environment=` line and configure the `oci` CLI for the `lawnguy` user

Restore from a backup:

```bash
mongorestore --uri="mongodb://127.0.0.1:27017/lawnguy" \
  --archive=/var/backups/lawnguy/lawnguy-20260505T030000.archive.gz \
  --gzip --drop
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

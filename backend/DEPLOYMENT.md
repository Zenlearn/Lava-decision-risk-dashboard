# Lava Backend — Deployment Runbook (OCI VM, Docker, same box as PathwaysBackend)

Follow the existing project convention: **no code changes are made directly on
the server.** Everything below is either a `git pull` of what's already
committed, or a server-local config file (`.env`, Nginx, cron) that isn't part
of the repo. All application code changes go through git as usual.

## 0. Prerequisites check (run once, before first deploy)

```bash
# Confirm Docker is available (it must be — PathwaysBackend already runs on it)
docker --version
docker compose version

# Confirm nothing already uses the ports Lava needs
sudo lsof -iTCP -sTCP:LISTEN -P | grep -E ':(3010|5433)\b'
# Should print nothing. If 3010 or 5433 is taken, change the host-side port
# in docker-compose.yml (left side of "host:container") and adjust Nginx / DATABASE_URL to match.

# Confirm available RAM before picking --max-old-space-size in the Dockerfile
free -h
# The Master Data import needs ~4GB heap headroom (see Dockerfile comment).
# If this box has less than ~6GB free, lower --max-old-space-size accordingly
# and re-test the largest file (Delivered Master Data, ~15MB / 107K rows)
# before relying on it in production.
```

## 1. Get the code onto the server

```bash
cd /path/to/deployments   # wherever PathwaysBackend's checkout lives, as a sibling
git clone https://github.com/Zenlearn/Lava-decision-risk-dashboard.git
cd Lava-decision-risk-dashboard/backend
```

For subsequent deploys, it's just `git pull` here — never hand-edit files in
this checkout on the server.

## 2. Create the server-local `.env`

This file is gitignored — it's created once on the server, not committed.

```bash
cp .env.example .env   # if no .example exists yet, create from scratch with the keys below
```

Required keys:

```
PORT=3010
JWT_SECRET=<the SAME secret PathwaysBackend uses to sign tokens>
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/lava
REDIS_HOST=redis
REDIS_PORT=6379
NODE_ENV=production
ALLOWED_ORIGINS=https://lava.zenlearn.ai,https://pathways.zenlearn.ai
```

**`JWT_SECRET` is the critical one** — it must exactly match whatever
PathwaysBackend is configured with (check PathwaysBackend's own server-side
`.env`), otherwise tokens issued at login won't validate here and every
authenticated request will 401. Do not invent a new value.

`DATABASE_URL`/`REDIS_HOST` use the Docker Compose service names (`postgres`,
`redis`), not `localhost` — the app container reaches them over the Compose-
internal network, which is why `docker-compose.yml` doesn't need to expose
Postgres/Redis to the host at all except for the Postgres port (5433) kept
open for manual `psql`/backup access.

Change the Postgres password from the `docker-compose.yml` default
(`POSTGRES_PASSWORD: postgres`) before going live — update it in both
`docker-compose.yml` and this `.env`'s `DATABASE_URL`.

## 3. Build and start

```bash
docker compose build
docker compose up -d
docker compose ps      # confirm postgres and redis show "healthy", lava-api is running
```

## 4. Apply the schema (first deploy only, and after any future schema change)

```bash
docker compose exec lava-api npx prisma db push
```

(`db push` matches how local dev has been done so far in this project; switch
to `prisma migrate deploy` with tracked migrations once the schema stabilizes
and you want reversible migration history instead of a direct sync.)

## 5. Verify

```bash
curl http://localhost:3010/api/v1/health
# Expect: {"status":"ok",...,"services":{"api":"ok","database":"ok","redis":"ok"}}
```

If `redis` shows `"unavailable"`, the app still works (Redis is optional —
see `redis.config.ts`) but check `docker compose logs redis` regardless.

## 6. Nginx reverse proxy + SSL

Add a new server block alongside whatever already proxies
`api-m.zenlearn.ai` to PathwaysBackend's ports 3001–3004 — match that file's
existing SSL/security-header conventions rather than the example below
verbatim, since the live Nginx config isn't in either git repo (it's
server-local) and I can't read it to copy it exactly.

```nginx
server {
    listen 443 ssl;
    server_name lava-api.zenlearn.ai;

    ssl_certificate     /etc/letsencrypt/live/lava-api.zenlearn.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lava-api.zenlearn.ai/privkey.pem;

    # Master Data imports can run 60-120s+ — do not let the proxy time out
    # a legitimate long-running import request.
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d lava-api.zenlearn.ai
sudo nginx -t && sudo systemctl reload nginx
```

Once this is live, set `NEXT_PUBLIC_LAVA_API_URL=https://lava-api.zenlearn.ai`
in PathwaysFrontend's Netlify environment variables (the `next.config.ts`
rewrite already falls back to this exact URL, but setting it explicitly in
Netlify's env is still recommended so it's not silently relying on a
hardcoded fallback).

## 7. Postgres backups (self-hosted — you own this, unlike a managed provider)

A minimal daily dump + rotation. Adjust the retention window and destination
(e.g. copy to S3 alongside PathwaysBackend's existing backup pattern, if one
exists) as needed.

```bash
#!/bin/bash
# /opt/lava-backup.sh
set -euo pipefail
BACKUP_DIR="/var/backups/lava-postgres"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker compose -f /path/to/Lava-decision-risk-dashboard/backend/docker-compose.yml \
  exec -T postgres pg_dump -U postgres lava | gzip > "$BACKUP_DIR/lava_${TIMESTAMP}.sql.gz"
# Keep 14 days
find "$BACKUP_DIR" -name "lava_*.sql.gz" -mtime +14 -delete
```

```bash
chmod +x /opt/lava-backup.sh
# crontab -e
0 2 * * * /opt/lava-backup.sh >> /var/log/lava-backup.log 2>&1
```

## Open item — Lava frontend hosting

This runbook covers the **backend only**. The Lava frontend
(`Lava-decision-risk-dashboard/frontend`, the Next.js dashboard app) hasn't
been assigned a host yet — `ALLOWED_ORIGINS`/CORS config so far assumes it
ends up on something like Vercel or Netlify (a plain Next.js static/SSR host
works fine here, unlike the backend, since it isn't running long synchronous
import requests). Decide and document that separately before go-live.

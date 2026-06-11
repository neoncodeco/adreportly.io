# AdReportly VPS Deployment Guide

## Server Info

```txt
VPS IP: 217.216.108.237
Project path: /var/www/adreportly
Domain: adreportly.io
PM2 app name: adreportly-app
Port: 3001
```

## Login

```bash
ssh root@217.216.108.237
```

## First Time Setup

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs git nginx certbot python3-certbot-nginx dnsutils -y
npm install -g pm2
```

## Clone Project

```bash
cd /var/www
git clone https://github.com/neoncodeco/adreportly.git adreportly
cd adreportly
```

If the repository is private, GitHub may ask for credentials:

```txt
Username: your_github_username
Password: your_github_token
```

Do not put the GitHub token directly in the clone URL because it can be saved in shell history.

## Environment File

Create the production environme

















nano .env
```

Required production values include:

```env
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_SITE_URL=https://adreportly.io
FACEBOOK_REDIRECT_URI=https://adreportly.io/api/auth/facebook/callback
```

Also add production Supabase/Prisma database URLs, Supabase Auth keys, JWT/encryption, payment, SMTP, and Facebook app values (see `.env.example`).

```env
DATABASE_URL=postgresql://...pooler...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
ENCRYPTION_KEY=...
```

Run the `handle_new_user` SQL trigger from `supabase/migrations/` in the Supabase SQL editor before first signup.

## Install And Build

```bash
npm install
npm run build
```

This project uses Next.js standalone mode:

```txt
.next/standalone/server.js
```

The build script also copies `public` and `.next/static` into the standalone output.

## Run With PM2

```bash
PORT=3001 pm2 start .next/standalone/server.js --name adreportly-app
pm2 startup
pm2 save
```

Check status:

```bash
pm2 list
```

Expected apps:

```txt
neoncode-app      online
adreportly-app    online
```

## Nginx Config

Create the Nginx site config:

```bash
nano /etc/nginx/sites-available/adreportly
```

Paste:

```nginx
server {
    listen 80;
    server_name adreportly.io www.adreportly.io;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/adreportly /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## DNS

In Cloudflare or the domain DNS panel, set:

```txt
A   @     217.216.108.237
A   www   217.216.108.237
```

For Certbot, set Cloudflare proxy status to:

```txt
DNS only
```

Check DNS from the VPS:

```bash
dig adreportly.io +short
dig www.adreportly.io +short
```

Expected:

```txt
217.216.108.237
217.216.108.237
```

## SSL

```bash
certbot --nginx -d adreportly.io -d www.adreportly.io
```

After SSL is successful, Cloudflare can be set back to proxied mode if needed.

Use this Cloudflare SSL mode:

```txt
Full (strict)
```

## Update After GitHub Push

```bash
ssh root@217.216.108.237
cd /var/www/adreportly
git pull
npm install
npm run build
pm2 restart adreportly-app --update-env
pm2 save
```

One-line update command:

```bash
cd /var/www/adreportly && git pull && npm install && npm run build && pm2 restart adreportly-app --update-env && pm2 save
```

## Health Checks

Check PM2:

```bash
pm2 list
```

Check the app directly:

```bash
curl -I http://127.0.0.1:3001
```

Check Nginx domain routing locally:

```bash
curl -I -H "Host: adreportly.io" http://127.0.0.1
```

Check HTTPS:

```bash
curl -I https://adreportly.io
curl -I https://www.adreportly.io
```

Check Nginx:

```bash
systemctl status nginx
nginx -t
```

## Logs

```bash
pm2 logs adreportly-app
pm2 logs neoncode-app
```

## Restart Commands

Restart only AdReportly:

```bash
pm2 restart adreportly-app --update-env
```

Reload Nginx:

```bash
systemctl reload nginx
```

## Notes

- Existing `neoncode-app` runs separately.
- `adreportly-app` runs on port `3001`.
- Do not use the same PM2 name or same port for both apps.
- Rotate any exposed GitHub tokens and `.env` secrets before production use.

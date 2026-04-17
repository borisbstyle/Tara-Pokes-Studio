# Tara Pokes — Zelf hosten op een Raspberry Pi (of VPS)

Deze gids legt stap voor stap uit hoe je deze website buiten Replit draait,
bijvoorbeeld op een Raspberry Pi thuis of op een goedkope VPS.

> **Aanrader:** Pi 4 of Pi 5 met **minstens 4 GB RAM** en een **SSD** via USB 3.
> Een SD-kaart slijt te snel voor een database die elke dag schrijft.

---

## Inhoud

1. [Pi voorbereiden](#1-pi-voorbereiden)
2. [Software installeren](#2-software-installeren)
3. [Code ophalen vanaf GitHub](#3-code-ophalen-vanaf-github)
4. [Code-aanpassingen die nodig zijn](#4-code-aanpassingen-die-nodig-zijn)
5. [Environment variables instellen](#5-environment-variables-instellen)
6. [Database initialiseren](#6-database-initialiseren)
7. [Builden en starten met PM2](#7-builden-en-starten-met-pm2)
8. [Domein, HTTPS en port forwarding](#8-domein-https-en-port-forwarding)
9. [Backups](#9-backups)
10. [Realistisch advies](#10-realistisch-advies)

---

## 1. Pi voorbereiden

Installeer **Raspberry Pi OS Lite (64-bit)** met de
[Raspberry Pi Imager](https://www.raspberrypi.com/software/).
In de Imager onder **"Edit settings"** stel je meteen in:

- **Hostname**: bv. `tarapokes`
- **SSH**: aan zetten (met wachtwoord of SSH-key)
- **Gebruikersnaam + wachtwoord**
- **Wifi** (beter: bekabeld via ethernet)

Na het opstarten log je in via SSH en update je het systeem:

```bash
ssh pi@tarapokes.local
sudo apt update && sudo apt upgrade -y
```

---

## 2. Software installeren

```bash
# Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git postgresql postgresql-contrib caddy

# pnpm (gebruikt door deze monorepo)
sudo npm install -g pnpm

# PM2 voor "altijd-aan" processen
sudo npm install -g pm2

# PostgreSQL gebruiker + database aanmaken
sudo -u postgres psql -c "CREATE USER tara WITH PASSWORD 'kies-een-sterk-wachtwoord';"
sudo -u postgres psql -c "CREATE DATABASE tarapokes OWNER tara;"
```

> Schrijf het Postgres-wachtwoord ergens veilig op — je hebt het zo nodig.

---

## 3. Code ophalen vanaf GitHub

Push het project eerst naar GitHub vanuit Replit (via het Git-paneel of de
shell). Daarna op de Pi:

```bash
cd ~
git clone https://github.com/jouw-naam/tara-pokes.git
cd tara-pokes
pnpm install
```

---

## 4. Code-aanpassingen die nodig zijn

Drie dingen werken alleen binnen Replit en moeten vervangen worden. Zoek in de
code op `SELF-HOSTING` — overal waar dat staat is uitleg gegeven.

### a) Object-storage voor foto-uploads

**Bestand:** `artifacts/api-server/src/lib/objectStorage.ts`

Deze service praat met Replit's interne object-storage sidecar (op poort 1106).
Buiten Replit bestaat die niet en zal NIETS hier werken. Je hebt twee opties:

**Optie A — Lokale schijf** (simpelst):

- Sla foto's op in `/home/pi/tara-pokes/uploads/<uuid>.<ext>`
- `getObjectEntityUploadURL()` geeft een eigen URL terug zoals
  `${API_BASE}/api/storage/upload/<uuid>` waar je een PUT op accepteert
- `getObjectEntityFile()` / `downloadObject()` lezen direct van disk
- **Vergeet niet** dagelijkse backup van die map

**Optie B — S3-compatibel** (MinIO self-hosted, AWS S3, Cloudflare R2):

- Vervang `@google-cloud/storage` door `@aws-sdk/client-s3`
- `getObjectEntityUploadURL()` genereert een presigned PUT URL
- `downloadObject()` wordt een S3 GetObject stream

> De rest van de codebase praat alleen via de `ObjectStorageService` class.
> Als je dezelfde public methods behoudt, hoeft elders **niets** aangepast.

### b) E-mail (Brevo)

Brevo werkt prima vanaf je Pi. Je hebt nodig:

- `BREVO_API_KEY` — gratis aan te maken op [brevo.com](https://www.brevo.com)
- `BREVO_SENDER_EMAIL` — een geverifieerd verzendadres

Zie sectie 5 hieronder.

### c) RESEND (alternatief)

Resend is ook een optie als je liever die gebruikt. `RESEND_API_KEY` zet je dan
in de `.env`.

---

## 5. Environment variables instellen

Maak `~/tara-pokes/.env`:

```bash
# Database
DATABASE_URL=postgres://tara:jouw-postgres-wachtwoord@localhost:5432/tarapokes

# Sessions (genereer met: openssl rand -hex 32)
SESSION_SECRET=een-lange-willekeurige-string-van-minstens-32-tekens

# E-mail (kies één)
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=tara@tarapokes.nl
# of
RESEND_API_KEY=re_...

# Server
PORT=8080
NODE_ENV=production

# Object storage — alleen invullen als je Optie B (S3) gebruikt
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# S3_BUCKET=tarapokes-photos
# S3_ENDPOINT=https://s3.eu-central-1.amazonaws.com
```

> **Heel belangrijk:** zet `.env` in je `.gitignore` zodat je secrets nooit op
> GitHub belanden.

---

## 6. Database initialiseren

Eenmalig het schema naar de Pi-Postgres pushen:

```bash
DATABASE_URL=postgres://tara:wachtwoord@localhost:5432/tarapokes \
  pnpm --filter @workspace/db run push
```

Als alles goed gaat zie je Drizzle de tabellen aanmaken (bookings, slots,
sessions, etc.).

---

## 7. Builden en starten met PM2

```bash
# Build
pnpm --filter @workspace/api-server build
pnpm --filter @workspace/tara-pokes build

# Starten (vanuit ~/tara-pokes)
pm2 start "pnpm --filter @workspace/api-server start" --name api
pm2 start "pnpm --filter @workspace/tara-pokes preview" --name web

# Auto-start bij reboot
pm2 save
pm2 startup
# ↑ deze print een commando dat met sudo gerund moet worden, plak en run het
```

Handige PM2 commando's:

```bash
pm2 status            # zie wat draait
pm2 logs              # live logs
pm2 logs api          # alleen API logs
pm2 restart api       # herstart na code-wijziging
pm2 stop all          # alles uit
```

---

## 8. Domein, HTTPS en port forwarding

Je hebt drie dingen nodig:

### a) Een domein dat naar je huis wijst

Je internetprovider geeft meestal een wisselend IP-adres. Twee opties:

- **Gratis:** [DuckDNS](https://www.duckdns.org) → krijg `tarapokes.duckdns.org`
- **Eigen domein:** koop bij TransIP/Namecheap, en stel een DDNS-update script
  in dat dagelijks je publieke IP naar de domein-DNS pusht

### b) Port forwarding in je router

Zet poorten **80** (HTTP) en **443** (HTTPS) door naar het lokale IP van je Pi
(bv. `192.168.1.50`). Hoe je dit doet verschilt per router — zoek op
"port forwarding [merk router]".

> **Tip:** geef je Pi een statisch lokaal IP via de DHCP-instellingen van je
> router, anders verandert het adres en breekt de doorverwijzing.

### c) Caddy als reverse proxy + automatisch HTTPS

Caddy regelt automatisch een gratis Let's Encrypt SSL-certificaat. Bewerk
`/etc/caddy/Caddyfile`:

```caddyfile
tarapokes.nl {
    handle /api/* {
        reverse_proxy localhost:8080
    }
    handle {
        reverse_proxy localhost:5173
    }
}
```

Dan:

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

Open `https://tarapokes.nl` in je browser — Caddy heeft binnen een minuut een
geldig SSL-certificaat geregeld. Klaar.

---

## 9. Backups

Een SD-kaart of zelfs SSD kan stuk. Zet een dagelijkse backup van Postgres in
`cron`:

```bash
mkdir -p ~/backups
crontab -e
```

Voeg toe:

```cron
# Elke nacht om 03:00 een Postgres-dump
0 3 * * * pg_dump -U tara tarapokes | gzip > /home/pi/backups/tara-$(date +\%F).sql.gz

# Foto's syncen naar externe schijf (als je Optie A gebruikt)
0 4 * * * rsync -a /home/pi/tara-pokes/uploads/ /mnt/usb-backup/uploads/

# Oude backups (>30 dagen) opruimen
0 5 * * * find /home/pi/backups -name "tara-*.sql.gz" -mtime +30 -delete
```

Voor extra zekerheid: kopieer de backup-map met `rclone` naar Google Drive,
Dropbox of een andere cloud — dan ben je beschermd tegen brand/diefstal/etc.

```bash
# Herstellen van een backup (in noodgeval)
gunzip -c /home/pi/backups/tara-2026-04-17.sql.gz | psql -U tara tarapokes
```

---

## 10. Realistisch advies

Het kan prima op een Pi, maar weeg dit af:

### Voordelen

- **Volledig eigen controle** — jouw data, jouw server
- **Geen maandelijkse kosten** (na de eenmalige hardware-aankoop)
- **Leerzaam** — je leert hoe je eigen infra werkt

### Nadelen

- **Stroomstoring of internet eruit = site offline.** Geen 99.9% uptime
  zonder dubbele apparatuur
- **Je bent zelf de sysadmin** — security updates, backups, monitoring,
  alles ligt bij jou
- **Foto-uploads** vereisen de codewijziging in sectie 4a — pas in als je
  comfortabel bent met Node/Express
- **Hardware kan kapot** — een UPS (kleine accu-backup) is verstandig zodat
  Postgres netjes kan afsluiten bij stroomverlies

### Alternatieven om te overwegen

- **Replit Deployments** — laat het draaien waar het al staat, vanaf €5/maand
- **VPS** bij Hetzner (€4/maand) of Vultr (€5/maand) — zelfde controle als Pi,
  maar zonder zorgen over stroom/internet en met snellere disks

---

## Snelle troubleshooting

| Probleem | Mogelijke oplossing |
|----------|---------------------|
| `pm2 status` toont app als "errored" | `pm2 logs api` om de echte fout te zien |
| Foto-upload geeft 500 | Sectie 4a — objectStorage.ts is nog niet aangepast |
| E-mails komen niet aan | Brevo sender-adres niet geverifieerd in dashboard |
| HTTPS werkt niet | Check `sudo journalctl -u caddy -f` — vaak port 80 niet open |
| Database connection refused | Postgres draait niet: `sudo systemctl start postgresql` |
| Site traag | Pi heeft te weinig RAM, of je gebruikt een SD-kaart i.p.v. SSD |

---

## Hulp nodig bij sectie 4a?

De aanpassing voor lokale foto-opslag is de enige echte codewijziging die
nodig is. Vraag het me gerust — dan maak ik die voor je.

# gojuren-poc

Proof of concept del nuovo sito dell'A.S.D. Renbukan (Goju Kai Roma): sito statico **Astro**, pannello di redazione **Sveltia CMS** su repository **GitHub**.

**PoC attuale:** pubblicato su **GitHub Pages** (`.github/workflows/pages.yml`) → https://gojukairenbuweb-oss.github.io/ – pannello: `/admin/`.
Le sezioni 2–3 (server proprio + runner self-hosted) restano come riferimento per il passaggio a un hosting definitivo (`deploy/deploy-selfhosted.yml.example`).

```
Redattore ──> /admin (Sveltia, nel browser) ──commit──> GitHub (main)
                                                         │ push
                                                         ▼
                                      runner self-hosted sul server
                                      npm ci → astro build → rsync
                                                         ▼
                                           /var/www/gojuren-test (nginx)
```

## Struttura

| Percorso | Contenuto |
| --- | --- |
| `src/content/{news,eventi,gallerie,pagine}` | Contenuti in Markdown (quello che modifica il CMS) |
| `src/content.config.ts` | Schema dei contenuti: deve restare allineato a `public/admin/config.yml` |
| `public/admin/config.yml` | Configurazione di Sveltia (collezioni, campi, media, backend) |
| `public/media/` | Immagini caricate dal CMS (convertite in WebP nel browser) |
| `.github/workflows/pages.yml` | Build e pubblicazione su GitHub Pages |
| `deploy/` | Esempi per hosting proprio: vhost nginx, workflow self-hosted e via SSH |

Le bozze (`draft: true`) si vedono con `npm run dev` ma non finiscono nel build.

## 1. Prova in locale

```bash
npm install
npm run dev          # http://localhost:4321  – pannello: http://localhost:4321/admin/
```

In locale Sveltia può lavorare direttamente sulla cartella del progetto (browser Chromium: "Work with Local Repository").

## 2. Server

1. Sottodominio di test (es. `test.tuodominio.it`) puntato al server; certificato Let's Encrypt (`certbot --nginx`).
2. Cartella del sito: `sudo mkdir -p /var/www/gojuren-test`.
3. Basic auth: `sudo htpasswd -c /etc/nginx/.htpasswd-gojuren <utente>`.
4. Vhost: adattare `deploy/nginx-gojuren-test.conf`, poi `sudo nginx -t && sudo systemctl reload nginx`.
5. Pacchetti: `rsync`, `git`, `curl`, `tar`. Node non serve installarlo a mano: lo scarica `actions/setup-node`.

## 3. Runner self-hosted

1. Utente dedicato senza privilegi: `sudo useradd -m -s /bin/bash ghrunner`
2. Permessi di scrittura solo sul sito: `sudo chown -R ghrunner:www-data /var/www/gojuren-test`
3. Su GitHub: *Settings → Actions → Runners → New self-hosted runner* (Linux x64) e seguire i comandi **come utente `ghrunner`**. Il token di registrazione resta a te.
4. Installarlo come servizio: `sudo ./svc.sh install ghrunner && sudo ./svc.sh start`
5. Variabile di repository: *Settings → Secrets and variables → Actions → Variables* → `DEPLOY_PATH` = `/var/www/gojuren-test`

> Sicurezza: tenere il repository **privato**. Un runner self-hosted su repository pubblico eseguirebbe codice di chiunque apra una pull request.

Alternativa senza runner sul server: `deploy/deploy-ssh.yml.example` (runner GitHub + rsync via SSH).

## 4. Login al pannello

**Fase 1 – token personale (subito):**
1. Sull'account GitHub: *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate*.
2. Repository access: *Only select repositories* → `gojuren-poc`. Permessi: **Contents: Read and write** (Metadata: read, automatico). Scadenza: 30–90 giorni.
3. Aprire `https://test.tuodominio.it/admin/` → *Sign in with Token* → incollare il token.

**Fase 2 – "Accedi con GitHub" (OAuth):** serve una OAuth App GitHub e un piccolo proxy di autenticazione (`base_url` in `config.yml`). Da preparare dopo la fase 1.

## 5. Checklist di test

- [ ] Nuova news da pannello → online in pochi minuti
- [ ] News con *Bozza* attiva → non compare online
- [ ] Nuova galleria con ~20 foto JPG grandi → convertite in WebP ≤ 2000 px, ordine rispettato
- [ ] Modifica pagina *Corsi e orari*
- [ ] Rollback: `git revert` dell'ultimo commit → sito ripristinato
- [ ] Build rotto di proposito → il sito resta alla versione precedente
- [ ] Console del browser su `/admin/`: nessuna violazione CSP (altrimenti annotarle)
- [ ] Revoca del token / rimozione collaboratore → accesso negato
- [ ] Pannello da tablet/smartphone

# DropZone

[![CI](https://github.com/Dkhallis/DropZone_Oscar/actions/workflows/ci.yml/badge.svg)](https://github.com/Dkhallis/DropZone_Oscar/actions/workflows/ci.yml)

Plateforme de **drops** de sneakers en édition limitée : un drop met en vente un nombre fixe de paires à une heure précise, et les acheteurs commandent jusqu'à épuisement du stock.

> Projet pédagogique (BTS SIO SLAM, cours « Introduction DevOps »). L'application fonctionne ; il lui manque tout ce qui permet de la livrer et de l'exploiter : conteneurs, intégration continue, déploiement, monitoring. C'est l'objet du TP. L'application n'a pas d'authentification.

## Fonctionnalités

- Liste des drops avec leur statut (`upcoming`, `live`, `sold_out`), un filtre par statut et un compte à rebours avant l'ouverture.
- Page détail d'un drop avec un bouton « Commander ».
- Une commande décrémente le stock, sans jamais vendre deux fois la dernière paire (décrément atomique en base).
- Données de démonstration insérées au premier démarrage.

## Stack

| Partie | Technologies |
|---|---|
| API (`backend/`) | Python 3.12, FastAPI, SQLAlchemy 2, SQLite en local ou PostgreSQL, pytest, Ruff |
| Front (`frontend/`) | React 19, Vite, TypeScript, ESLint, Vitest + Testing Library, Playwright |

## Lancer le projet avec Docker (recommandé)

Prérequis : Docker avec Docker Compose. Rien d'autre à installer.

```bash
cp .env.example .env          # Windows PowerShell : Copy-Item .env.example .env
docker compose up -d --build
```

| Service | Adresse | Rôle |
|---|---|---|
| `front` | <http://localhost:8080> | site servi par nginx, qui redirige `/api/` vers l'API |
| `api` | <http://localhost:8000> | API FastAPI (documentation sur `/docs`) |
| `db` | interne | PostgreSQL 16, données dans le volume `db-data` |

Commandes utiles :

```bash
docker compose ps             # état des services (db doit être "healthy")
docker compose logs -f api    # suivre les logs de l'API
docker compose down           # arrêter (les données sont conservées)
docker compose down -v        # arrêter ET supprimer les données
```

## Lancer le projet en local (sans Docker)

Prérequis : Git, Python 3.12 ou plus récent, Node.js 22.12 ou plus récent.

**API**, dans un premier terminal :

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate              # Windows PowerShell : .\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

- L'API répond sur <http://localhost:8000> ; documentation interactive sur <http://localhost:8000/docs>.
- Par défaut, elle utilise une base SQLite locale (fichier `backend/dropzone.db`, ignoré par Git), créée et remplie au premier démarrage.
- Pour utiliser une base PostgreSQL existante, définir la variable `DATABASE_URL` avant de lancer uvicorn :
  `DATABASE_URL=postgresql+psycopg://utilisateur:motdepasse@localhost:5432/dropzone`.

**Front**, dans un second terminal :

```bash
cd frontend
npm ci
npm run dev
```

Le front est servi sur <http://localhost:5173> ; les appels à `/api` sont redirigés vers l'API sur le port 8000.

## Qualité et tests

```bash
# backend/ (venv activé)
ruff check .              # lint
ruff format --check .     # format
pytest                    # tests + couverture (minimum 85 %)

# frontend/
npm run lint              # ESLint
npm run typecheck         # TypeScript
npm test                  # Vitest
npm run build             # build de production (dossier dist/)
npm run test:e2e          # Playwright : nécessite l'application complète sur http://localhost:8080
```

Les tests Playwright visent l'adresse `http://localhost:8080` (variable `E2E_BASE_URL` pour en viser une autre). Avant le premier lancement : `npx playwright install chromium`.


## Intégration continue

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) vérifie chaque pull request vers `main` et chaque push sur `main` :

| Job | Contenu | Lancé |
|---|---|---|
| `lint` | Ruff (lint + format), ESLint, TypeScript | en parallèle |
| `tests-backend` | pytest avec couverture (minimum 85 %) | en parallèle |
| `tests-frontend` | Vitest puis build de production | en parallèle |
| `e2e` | stack Docker Compose + Playwright, rapport HTML conservé en artefact | si les 3 autres sont verts |

Les quatre jobs sont des vérifications obligatoires : une PR rouge ne peut pas être mergée.

Pour lancer un job en local avec [act](https://github.com/nektos/act) (Docker requis), depuis la racine :

```bash
act pull_request -j tests-backend
```
## Déploiement

### Publier une version

1. Mettre à jour le `CHANGELOG.md` (renommer `[Unreleased]` en `[x.y.z] - date`) et merger la PR.
2. Poser un tag annoté sur `main` et le pousser :

   ```bash
   git switch main && git pull
   git tag -a v0.2.0 -m "v0.2.0"
   git push origin v0.2.0
   ```

Le workflow [`.github/workflows/cd.yml`](.github/workflows/cd.yml) publie alors :

- les images `ghcr.io/dkhallis/dropzone-api` et `ghcr.io/dkhallis/dropzone-front`, taguées `0.2.0`, `0.2` et `sha-xxxxxxx` ;
- le front sur GitHub Pages : <https://dkhallis.github.io/DropZone_Oscar/> ;
- une release GitHub avec des notes générées.

Les tests ne sont pas relancés : le tag est posé sur un commit de `main`, déjà validé par la CI obligatoire.

### Lancer une version publiée

Choisir la version dans `.env` (`VERSION=0.2.0`), puis :

```bash
docker compose -f compose.release.yml up -d
docker compose -f compose.release.yml ps     # la colonne IMAGE montre la version lancée
```

### Revenir à la version précédente (rollback)

1. Dans `.env`, remettre l'ancienne version : `VERSION=0.2.0`.
2. Relancer :

   ```bash
   docker compose -f compose.release.yml up -d
   docker compose -f compose.release.yml ps
   ```

Le retour prend quelques secondes : aucune image n'est reconstruite, Compose réutilise l'image déjà publiée de l'ancienne version.

**Ce qui ne revient pas en arrière :** les données de la base (volume `db-data`) et son schéma. Les commandes passées entre-temps sont conservées, et une nouvelle version qui modifierait le schéma devrait rester compatible avec l'ancienne.

## API

| Requête | Réponse |
|---|---|
| `GET /health` | `200` : le processus répond (liveness) |
| `GET /health/ready` | `200` si la base répond, `503` sinon (readiness) |
| `GET /drops?status=live` | `200` : la liste triée par id, filtre facultatif `upcoming`, `live` ou `sold_out` |
| `GET /drops/{id}` | `200` le drop · `404` |
| `POST /drops` | `201` le drop créé · `422` données invalides |
| `POST /drops/{id}/orders` | `201` la commande · `404` · `409` drop pas encore ouvert ou épuisé |

Un drop : `id`, `product`, `description`, `price_cents` (entier, en centimes), `stock`, `remaining`, `opens_at` (RFC 3339) et `status`, calculé à chaque lecture.

```bash
curl -X POST localhost:8000/drops -H 'Content-Type: application/json' \
  -d '{"product":"Air Max 1","price_cents":18000,"stock":100,"opens_at":"2026-01-01T09:00:00Z"}'
curl -X POST localhost:8000/drops/1/orders
```

## Configuration

La configuration passe par des variables d'environnement (ou un fichier `backend/.env`, jamais commité).

| Variable | Rôle | Défaut |
|---|---|---|
| `DATABASE_URL` | URL SQLAlchemy de la base | `sqlite:///./dropzone.db` |
| `LOG_LEVEL` | niveau des logs | `INFO` |
| `SEED_DEMO_DATA` | insérer les données de démo si la base est vide | `true` |
| `CORS_ORIGINS` | origines autorisées, séparées par des virgules (front servi depuis un autre domaine) | vide |
| `VITE_API_URL` | URL de l'API pour le front, fixée au build | `/api` |
| `API_PROXY_TARGET` | API vers laquelle `npm run dev` redirige `/api` | `http://localhost:8000` |
| `POSTGRES_USER` | utilisateur PostgreSQL (Docker Compose) | dans `.env` |
| `POSTGRES_PASSWORD` | mot de passe PostgreSQL (Docker Compose) | dans `.env` |
| `POSTGRES_DB` | nom de la base (Docker Compose) | dans `.env` |

## Structure du projet

```text
.
├── backend/                 API FastAPI
│   ├── app/                 code (routes, services, domaine, modèles)
│   ├── tests/               tests pytest (SQLite en mémoire)
│   ├── pyproject.toml       configuration Ruff et pytest
│   └── requirements*.txt    dépendances épinglées
└── frontend/                application React
    ├── src/                 composants, pages et tests Vitest
    ├── e2e/                 tests Playwright
    ├── nginx.conf           configuration nginx pour servir le front dans un conteneur
    └── playwright.config.ts
```

## Ce qu'il reste à faire

## Avancement du TP

- [x] Partie 1 : dépôt remis d'aplomb (audit, contribution, `main` protégée, version `v0.1.0`)
- [x] Partie 2 : conteneurisation (Docker, Compose)
- [X] Partie 3 : intégration continue (GitHub Actions)
- [X] Partie 4 : déploiement continu (ghcr.io, GitHub Pages, releases)
- [ ] Partie 5 : observabilité (health checks, logs JSON, métriques, Uptime Kuma)

## Contribuer

Toute modification passe par une branche et une pull request vers `main`, protégée contre les push directs.
Les commits suivent la convention [Conventional Commits](https://www.conventionalcommits.org/fr/).
Le détail (nommage des branches, format des commits, cycle d'une PR, versions) est dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation du dépôt

| Fichier | Contenu |
|---|---|
| [AUDIT.md](AUDIT.md) | audit DevOps du dépôt de départ |
| [CONTRIBUTING.md](CONTRIBUTING.md) | règles de contribution |
| [CHANGELOG.md](CHANGELOG.md) | historique des versions |

## Licence

MIT.

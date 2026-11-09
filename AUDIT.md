# Audit DevOps du dépôt DropZone

- **Projet audité :** DropZone, plateforme de drops de sneakers
- **Stack :** API Python 3.12 / FastAPI / SQLAlchemy (SQLite en local, PostgreSQL prévu) ; front React 19 / Vite / TypeScript
- **Date :** état du dépôt au moment de sa récupération, avant le travail DevOps

Légende : ✅ OK · ⚠️ partiel · ❌ absent

## Git

| Point vérifié | Note | Constat |
|---|:---:|---|
| Dépôt GitHub existant et accessible | ✅ | Dépôt créé à partir du projet de départ, partagé avec l'enseignant |
| `.gitignore` adapté à la stack | ✅ | Couvre `.env`, `.venv/`, `__pycache__/`, `*.db`, `node_modules/`, `dist/`, les rapports de tests |
| Historique de commits lisible | ⚠️ | Un seul commit initial, aucune convention de message définie |
| Branche `main` protégée | ❌ | Push direct possible sur `main`, aucune pull request imposée |

## Build et lancement

| Point vérifié | Note | Constat |
|---|:---:|---|
| L'application démarre en une seule commande documentée | ⚠️ | Lancement documenté dans le README, mais il faut 2 terminaux et une dizaine de commandes (venv, `pip install`, `uvicorn`, `npm ci`, `npm run dev`) |
| Les dépendances sont listées | ✅ | `backend/requirements.txt` et `requirements-dev.txt` (versions épinglées), `frontend/package.json` + `package-lock.json` |
| Aucun chemin absolu codé en dur | ✅ | Configuration par variables d'environnement (`DATABASE_URL`, `API_PROXY_TARGET`, `E2E_BASE_URL`) ; seules des valeurs par défaut `localhost` |

## Tests

| Point vérifié | Note | Constat |
|---|:---:|---|
| Des tests existent | ✅ | pytest (couverture minimale de 85 %), Vitest, un test Playwright. Manquent : tests des commandes, du composant `DropCard`, scénarios E2E de commande |
| Les tests s'exécutent en une seule commande | ⚠️ | `pytest` et `npm test` séparément ; les tests E2E exigent l'application complète sur le port 8080, impossible sans conteneurs |

## Déploiement

| Point vérifié | Note | Constat |
|---|:---:|---|
| La méthode de déploiement est connue et documentée | ❌ | Aucun déploiement : pas d'image Docker, pas de pipeline, pas de release |
| Un environnement de staging existe | ❌ | Seul l'environnement de développement local existe |

## Monitoring

| Point vérifié | Note | Constat |
|---|:---:|---|
| L'URL de production est surveillée | ❌ | Pas de production ni de sonde ; les endpoints `/health` et `/health/ready` existent mais ne sont pas exploités |
| Les logs sont accessibles | ⚠️ | Logs en texte sur la sortie standard (`backend/app/logging_config.py`), visibles uniquement dans le terminal, non structurés |

## Bilan

**Total : 5 ✅ · 4 ⚠️ · 4 ❌** (sur 13 points)

### Mes 3 priorités d'amélioration

1. **Protéger `main`** : pull request obligatoire, puis CI obligatoire, pour empêcher qu'un code cassé arrive sur la branche principale.
2. **Rendre le déploiement automatique et réversible** : images Docker publiées sur ghcr.io, front sur GitHub Pages, release à chaque tag `v*`, procédure de rollback documentée.
3. **Surveiller l'application** : health checks Docker, sonde Uptime Kuma avec alerte, logs JSON et métriques `/metrics`.

> Le lancement en une seule commande (Docker Compose) et les tests automatiques (CI) sont traités en parties 2 et 3 du TP. L'environnement de staging n'est pas couvert par le TP.
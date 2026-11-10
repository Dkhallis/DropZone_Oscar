# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/).

## [Unreleased]

### Added

- Image Docker multi-stage de l'API, lancée par un utilisateur non-root sur le port 8000.
- Image Docker multi-stage du front, servie par nginx non privilégié sur le port 8080.
- Un `.dockerignore` pour chaque image.
- `compose.yml` : PostgreSQL 16 (volume persistant, healthcheck), API et front lancés en une seule commande.
- `.env.example` listant les variables nécessaires.
- Journal des modifications (`CHANGELOG.md`).
- Modèle de pull request (`.github/pull_request_template.md`).
- Tests des commandes côté API (`backend/tests/test_orders.py`).
- Test Vitest du composant `DropCard`.
- Scénarios Playwright : « commander décrémente le stock » et « un drop épuisé désactive le bouton ».
- Workflow d'intégration continue (`.github/workflows/ci.yml`) : lint, tests backend, tests frontend, puis E2E.
- Configuration de `act` (`.actrc`) pour lancer les workflows en local.
- Badge de la CI dans le README.

### Changed

- README : lancement avec Docker Compose.
- Branche `main` : les jobs de la CI deviennent des vérifications obligatoires.
## [0.1.0] - 2026-11-09

### Added

- Application de départ : API FastAPI (drops, commandes, health checks) et front React.
- Rapport d'audit DevOps du dépôt (`AUDIT.md`).
- Guide de contribution (`CONTRIBUTING.md`) : nommage des branches, Conventional Commits, cycle d'une PR, versions.
- Sections « Avancement du TP », « Contribuer » et « Documentation du dépôt » dans le README.

### Changed

- Projet déplacé à la racine du dépôt.
- Branche `main` protégée : pull request obligatoire, push direct et force push interdits.
- README : commande d'activation de l'environnement virtuel sous Windows PowerShell.

[Unreleased]: https://github.com/Dkhallis/DropZone_Oscar/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Dkhallis/DropZone_Oscar/releases/tag/v0.1.0
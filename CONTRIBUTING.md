# Contribuer à DropZone

Ce guide décrit comment proposer une modification. Toute modification passe par une branche et une pull request : **personne ne pousse directement sur `main`**.

## Nommage des branches

Format : `type/description-courte`, en minuscules, avec des tirets.

| Préfixe | Usage | Exemple |
|---|---|---|
| `feat/` | nouvelle fonctionnalité | `feat/filtre-par-prix` |
| `fix/` | correction de bug | `fix/stock-negatif` |
| `docs/` | documentation | `docs/guide-contribution` |
| `test/` | ajout ou correction de tests | `test/commandes-api` |
| `build/` | Docker, dépendances | `build/dockerfiles` |
| `ci/` | workflows GitHub Actions | `ci/pipeline-pr` |
| `chore/` | maintenance, configuration | `chore/mise-a-jour-gitignore` |

## Format des commits

Les messages suivent [Conventional Commits](https://www.conventionalcommits.org/fr/) :

Exemples :

- `feat(api): ajout du filtre par statut`
- `fix(front): affichage du stock restant`
- `docs: mise à jour du README`
- `test(api): tests des commandes`

Types autorisés : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`.

Un changement incompatible avec la version précédente s'indique par un `!` après le type (`feat!: ...`) ou par une ligne `BREAKING CHANGE:` dans le corps du message.

## Cycle d'une pull request

1. Partir de `main` à jour :
   ```bash
   git switch main
   git pull
   git switch -c type/description
   ```
2. Faire des commits petits et conventionnels.
3. Vérifier en local que tout est vert :
   ```bash
   # backend/ (venv activé)
   ruff check . && ruff format --check . && pytest
   # frontend/
   npm run lint && npm run typecheck && npm test
   ```
4. Pousser la branche et ouvrir une pull request vers `main` en remplissant le modèle.
5. Mettre à jour le `CHANGELOG.md` (section `[Unreleased]`) et le README si besoin.
6. Une fois les vérifications vertes, merger la PR puis supprimer la branche.

## Versions

Le projet suit le [versionnage sémantique](https://semver.org/lang/fr/) `MAJEUR.MINEUR.CORRECTIF` :

| Changement | Version modifiée | Exemple |
|---|---|---|
| `fix` | correctif | `0.1.0` → `0.1.1` |
| `feat` | mineure | `0.1.0` → `0.2.0` |
| changement incompatible (`!`) | majeure | `0.1.0` → `1.0.0` |

Une version est publiée en posant un **tag annoté** sur `main` :

```bash
git tag -a v0.2.0 -m "v0.2.0"
git push origin v0.2.0
```
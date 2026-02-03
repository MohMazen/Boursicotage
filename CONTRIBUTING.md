# 🤝 Guide de Contribution - Boursicotage

## 🌳 Gestion des Branches

### Branches principales

- **`main`** : Branche de production
  - ⛔ **PROTÉGÉE** : Personne ne peut push directement
  - ✅ Contient uniquement du code stable et validé
  - ✅ Mergée par le Lead uniquement

- **`develop`** : Branche d'intégration
  - ⛔ **PROTÉGÉE** : Push direct interdit pour l'équipe
  - ✅ Le Lead est le gardien de cette branche
  - ✅ Toutes les PRs de l'équipe arrivent ici

### Branches de travail

**Format obligatoire :**
```
feature/nom-de-la-fonctionnalite
fix/nom-du-bug
refactor/nom-du-refactor
docs/nom-de-la-doc
```

**Exemples :**
- `feature/market-board-component`
- `feature/socket-connection`
- `fix/portfolio-calculation`
- `refactor/api-error-handling`

---

## 🔄 Workflow Git (STRICT)

### 1️⃣ Créer une branche depuis `develop`

```bash
# Mettre à jour develop
git checkout develop
git pull origin develop

# Créer votre branche
git checkout -b feature/mon-feature
```

### 2️⃣ Coder et commiter régulièrement

```bash
# Vérifier les fichiers modifiés
git status

# Ajouter les fichiers
git add src/components/MyComponent.jsx

# Commiter avec un message clair (voir Commits conventionnels)
git commit -m "feat: add MyComponent with props validation"
```

### 3️⃣ Pusher votre branche

```bash
# Premier push
git push -u origin feature/mon-feature

# Pushs suivants
git push
```

### 4️⃣ Créer une Pull Request

1. **Sur GitHub** : Aller sur le repository
2. **Cliquer** : "Compare & pull request"
3. **Base branch** : `develop` (PAS main !)
4. **Titre** : Résumé clair de la fonctionnalité
5. **Description** :
   ```markdown
   ## 🎯 Objectif
   Ajouter le composant MarketBoard pour afficher les actions

   ## ✅ Changements
   - Création du composant MarketBoard.jsx
   - Ajout des props (stocks, onBuy, onSell)
   - Style CSS pour le tableau

   ## 🧪 Tests
   - Testé avec 10 actions fictives
   - Vérifié la réactivité mobile
   ```

6. **Assigner** : Le Lead (MohMazen) en reviewer
7. **Labels** : frontend / backend / documentation

### 5️⃣ Code Review

- ✅ Le Lead review votre code
- ✅ Si changements demandés : modifier et pusher
- ✅ Une fois approuvée : Le Lead merge dans `develop`

---

## 📝 Commits conventionnels

Suivre la convention **Conventional Commits** :

### Format

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

### Types autorisés

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(market): add real-time stock updates` |
| `fix` | Correction de bug | `fix(portfolio): correct total calculation` |
| `refactor` | Refactoring (sans changer le comportement) | `refactor(api): extract validation middleware` |
| `style` | Changements de style (formatage) | `style(components): fix indentation` |
| `docs` | Documentation uniquement | `docs(readme): add installation steps` |
| `test` | Ajout/modification de tests | `test(game): add timer unit tests` |
| `chore` | Tâches diverses (deps, config) | `chore(deps): update socket.io to 4.7.2` |

### Exemples concrets

```bash
# Fonctionnalité complète
git commit -m "feat(lobby): add game room creation form"

# Bug critique
git commit -m "fix(socket): prevent duplicate connections"

# Plusieurs fichiers
git commit -m "refactor(controllers): extract common error handling"

# Documentation
git commit -m "docs(contributing): add git workflow section"
```

---

## 🎯 Bonnes pratiques

### ✅ À FAIRE

1. **Une branche = Une fonctionnalité**
   - Ne pas mélanger plusieurs features
   - Garder les PRs petites et focalisées

2. **Commiter souvent**
   - Petits commits atomiques
   - Décrire chaque changement

3. **Tester avant de pusher**
   ```bash
   # Frontend
   cd client && npm run lint && npm run build
   
   # Backend
   cd server && npm run lint
   ```

4. **Mettre à jour depuis develop**
   ```bash
   # Si develop a avancé pendant votre travail
   git checkout develop
   git pull origin develop
   git checkout feature/ma-branche
   git merge develop
   # Résoudre les conflits si nécessaire
   ```

5. **Nettoyer après merge**
   ```bash
   # Supprimer la branche locale
   git branch -d feature/ma-branche
   
   # Supprimer la branche distante (optionnel, GitHub le fait automatiquement)
   git push origin --delete feature/ma-branche
   ```

### ❌ À NE PAS FAIRE

- ❌ Push directement sur `main` ou `develop`
- ❌ Merge sa propre PR sans review
- ❌ Commiter des `node_modules/` ou `.env`
- ❌ Commits vagues : "fix", "update", "changes"
- ❌ Travailler directement sur `develop`
- ❌ Laisser des `console.log()` de debug

---

## 🔍 Code Review - Checklist

### Pour le développeur (avant de demander la review)

- [ ] Code lint sans erreurs
- [ ] Code build avec succès
- [ ] Testé en local (UI ou API)
- [ ] Pas de `console.log` / commentaires de debug
- [ ] Fichiers inutiles exclus (.env, node_modules)
- [ ] Description claire de la PR

### Pour le reviewer (Lead)

- [ ] Code respecte les conventions du projet
- [ ] Logique métier correcte
- [ ] Pas de duplication de code
- [ ] Performance acceptable
- [ ] Pas de failles de sécurité évidentes
- [ ] Fichiers modifiés cohérents avec l'objectif

---

## 🐛 Gestion des bugs

### Signaler un bug

1. **Créer une issue** sur GitHub avec :
   - Titre clair : "Bug: Le portfolio ne se met pas à jour"
   - Description : Étapes pour reproduire
   - Environnement : OS, navigateur, Node version
   - Captures d'écran si applicable

2. **Assigner** : Le Lead décide qui corrige

### Corriger un bug

```bash
# Créer une branche fix/
git checkout -b fix/portfolio-update

# Corriger, tester, commiter
git commit -m "fix(portfolio): update state after transaction"

# PR vers develop
git push origin fix/portfolio-update
```

---

## 🚀 Déploiement (futur)

- **develop** → Déploiement automatique sur environnement de staging
- **main** → Déploiement automatique sur environnement de production

---

## 📚 Ressources

- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

## ❓ Questions fréquentes

**Q : Je veux travailler sur une fonctionnalité déjà en cours ?**  
R : Coordonner avec le Lead pour éviter les conflits.

**Q : J'ai un conflit de merge, comment faire ?**  
R : Demander de l'aide au Lead sur Discord/Teams.

**Q : Je peux commiter directement sur develop pour un petit fix ?**  
R : ❌ NON ! Toujours passer par une PR, même pour 1 ligne.

**Q : Combien de temps pour la review ?**  
R : Maximum 24h en période de projet actif.

---

**Bon code ! 🚀**

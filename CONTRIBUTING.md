# 🔄 Workflow Git - Boursicotage

## ⚠️ Règles STRICTES à respecter

### Branches principales

- **`main`** : Production - **PROTÉGÉE** ❌ Personne ne push directement
- **`develop`** : Intégration - **PROTÉGÉE** ❌ Seul le Lead merge les PRs

### Convention de nommage des branches

Format **OBLIGATOIRE** : `<type>/<scope>-<description>`

#### Types autorisés

- `feat/` - Nouvelle fonctionnalité
- `fix/` - Correction de bug
- `refactor/` - Refactoring de code
- `docs/` - Documentation
- `style/` - Formatage, CSS
- `test/` - Tests

#### Scopes

- `frontend-*` - Travail sur React (composants, pages, UI)
- `backend-api-*` - API et routes Express
- `backend-engine-*` - Moteur de jeu, logique métier
- `integration-*` - Connexion Front-Back, WebSocket

#### Exemples valides

```
feat/frontend-market-board
fix/backend-api-auth
feat/backend-engine-timer
refactor/frontend-portfolio-component
docs/readme-update
style/frontend-css-improvements
```

---

## 🚀 Workflow de développement

### 1️⃣ Partir de develop

**TOUJOURS** créer sa branche depuis `develop` :

```bash
git checkout develop
git pull origin develop
git checkout -b feat/frontend-market-board
```

### 2️⃣ Développer et committer

Faites vos modifications, puis commitez régulièrement :

```bash
git add .
git commit -m "feat: ajout du composant MarketBoard avec graphique temps réel"
```

**Convention de commit :**
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `refactor:` - Refactoring
- `docs:` - Documentation
- `style:` - CSS/formatage
- `test:` - Tests

### 3️⃣ Pusher et créer une Pull Request

```bash
git push origin feat/frontend-market-board
```

**Puis sur GitHub :**
1. Aller sur le repository
2. Créer une Pull Request
3. **Base branch : `develop`** (PAS `main` !)
4. Ajouter une description claire
5. Assigner le Lead (MohMazen) en reviewer

### 4️⃣ Attendre la validation du Lead

- ⛔ **Ne JAMAIS merger soi-même sa PR**
- ⛔ **Ne JAMAIS approuver sa propre PR**
- 📝 Répondre aux commentaires de review
- ✅ Attendre que le Lead merge

### 5️⃣ Après merge : nettoyer sa branche locale

```bash
git checkout develop
git pull origin develop
git branch -d feat/frontend-market-board
```

---

## ❌ Interdictions ABSOLUES

### 🚫 Ne JAMAIS faire :

1. **Push direct sur `main`**
   ```bash
   git push origin main  # ❌ INTERDIT
   ```

2. **Push direct sur `develop`**
   ```bash
   git push origin develop  # ❌ INTERDIT
   ```

3. **Merger ses propres Pull Requests**
   - Seul le Lead (MohMazen) merge les PRs

4. **Travailler directement sur develop**
   ```bash
   git checkout develop
   # faire des modifications...  # ❌ INTERDIT
   ```

5. **Créer une PR vers `main`**
   - Les PRs doivent TOUJOURS aller vers `develop`
   - Seul le Lead merge `develop` → `main` pour les releases

---

## 🔧 Commandes Git utiles

### Mettre à jour sa branche avec develop

Si `develop` a avancé pendant votre travail :

```bash
git checkout develop
git pull origin develop
git checkout feat/ma-branche
git merge develop
# Résoudre les conflits éventuels
git push origin feat/ma-branche
```

### Annuler des modifications non commitées

```bash
git checkout .  # Annule tous les changements
git checkout fichier.js  # Annule un fichier spécifique
```

### Voir l'état de votre branche

```bash
git status              # Fichiers modifiés
git log --oneline -5    # 5 derniers commits
git diff                # Différences non commitées
```

---

## 📊 Schéma du workflow

```
main (production)
  ↑
  └── develop (intégration)
        ↑
        ├── feat/frontend-market-board
        ├── feat/backend-engine-timer
        ├── fix/backend-api-auth
        └── ...
```

**Flux :**
1. Dev crée une branche depuis `develop`
2. Dev fait des commits et push sa branche
3. Dev ouvre une PR vers `develop`
4. Lead review et merge dans `develop`
5. Lead merge `develop` → `main` quand c'est prêt

---

## 🆘 Aide

En cas de problème :
1. **Ne pas paniquer** 😅
2. **Ne pas forcer** (`git push --force` est interdit)
3. **Demander au Lead** avant de faire quelque chose de risqué
4. Utiliser `git status` pour comprendre l'état actuel

---

## ✅ Checklist avant chaque PR

- [ ] Ma branche part de `develop` à jour
- [ ] J'ai testé mes modifications localement
- [ ] Mon code suit les conventions du projet
- [ ] J'ai committé avec des messages clairs
- [ ] Ma PR cible `develop` (pas `main`)
- [ ] J'ai ajouté une description dans la PR
- [ ] J'ai assigné le Lead en reviewer

---

**Rappel :** Ce workflow est là pour éviter les conflits et garder un code propre. Respectez-le ! 🎯

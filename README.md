# 🌿 Plant Shop - E-commerce Botanique (Node.js / Express / SQLite)

Application complète de vente de plantes développée avec Node.js.
Elle propose une interface client React-like (JSX) sans framework, avec une gestion complète côté serveur.

---

## 🛠 Stack Technique

### Backend

- **Langage** : JavaScript (Node.js)
- **Framework** : Express 4
- **Base de données** : SQLite3 (fichier `plantes.db`)
- **ORM** : Aucun (requêtes SQL directes via `sqlite3`)
- **Sécurité** : Bcrypt.js pour le hachage des mots de passe
- **Données** : Faker.js (données de test), fichier `seed.js`

### Frontend

- **Moteur** : JSX avec Babel + React 18 (CDN)
- **UI/UX** : Bootstrap 5.3.3
- **JS dynamique** : React + localStorage (panier)
- **Rendu SPA** : gestion du routing client (JS)

---

## ✨ Fonctionnalités

### Utilisateur

- Consultation catalogue des plantes
- Fiche produit
- Panier local (localStorage)
- Création de commande
- Suivi des commandes
- Profil utilisateur (modification possible)

### Administrateur

- Gestion des plantes (CRUD)
- Gestion des utilisateurs
- Visualisation globale des commandes
- Interface dédiée

### Sécurité

- Authentification avec sessions locales
- Rôles (user/admin)
- Vérification des accès
- Hachage des mots de passe

---

## 🚀 Installation et lancement

### Prérequis

- Node.js ≥ 18
- SQLite3 (local uniquement)
- npm

### Étapes

```bash
# Installation des dépendances
npm install

# Initialisation de la BDD avec des données de test
node db/seed.js

# Lancement du serveur
node app.js

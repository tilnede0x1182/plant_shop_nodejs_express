# Plant Shop - Node.js & Express

Application web complète pour gérer un **magasin de plantes en ligne**.

## 🎯 Objectif

Créer un site de vente de plantes, avec interface pour afficher, créer, modifier et supprimer des plantes.

## 🧱 Technologies utilisées

### 🔙 Backend
- **Node.js** avec **Express.js**
- **SQLite3** pour la base de données
- Architecture **MVC**
- Seed avec **@faker-js/faker**

### 🎨 Frontend
- **React 18 (via CDN)**
- **Bootstrap 5**
- Mini-routeur personnalisé avec `window.location.pathname`
- Pages :
  - `/` → accueil
  - `/plante/:id` → show
  - `/modifier/:id` → modification

## ▶️ Lancer le projet

```bash
npm install
npm run seed
npm start

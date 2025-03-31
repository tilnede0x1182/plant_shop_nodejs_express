// ----------------------------
// Import des modules
// ----------------------------
const express = require("express")
const path = require("path")
const planteRoutes = require("./routes/planteRoutes")
const authRoutes = require("./routes/authRoutes")

// ----------------------------
// Initialisation de l'application
// ----------------------------
const app = express()
const PORT = 3000

// ----------------------------
// Middleware généraux
// ----------------------------
app.use(express.json()) // Pour parser le JSON dans les requêtes
app.use(express.static(path.join(__dirname, "public"))) // Pour servir les fichiers statiques (frontend)

// ----------------------------
// Routes API
// ----------------------------
app.use("/api/plantes", planteRoutes) // Routes pour la ressource "plantes"
app.use("/api", authRoutes) // Routes pour l'authentification et les utilisateurs

// ----------------------------
// Catch-all pour React (SPA)
// ----------------------------
// Toutes les autres routes sont redirigées vers l'index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// ----------------------------
// Démarrage du serveur
// ----------------------------
app.listen(PORT, () => {
  console.log("Serveur lancé sur http://localhost:" + PORT)
})

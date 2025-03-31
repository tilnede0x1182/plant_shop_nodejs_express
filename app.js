const express = require("express")
const path = require("path")
const planteRoutes = require("./routes/planteRoutes")

const app = express()
const PORT = 3000

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// Routes API
app.use("/api/plantes", planteRoutes)

// Catch-all pour les routes frontend (React)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Lancement serveur
app.listen(PORT, function () {
  console.log("Serveur lancé sur http://localhost:" + PORT)
})

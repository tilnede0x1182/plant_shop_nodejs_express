const express = require("express")
const path = require("path")
const planteRoutes = require("./routes/planteRoutes")

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))
app.use("/api/plantes", planteRoutes)

app.listen(PORT, function() {
  console.log("Serveur lancé sur http://localhost:" + PORT)
})

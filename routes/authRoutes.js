const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const userModel = require("../models/userModel")

router.post("/utilisateurs", authController.registerUser)
router.post("/login", authController.loginUser)
router.get("/utilisateurs", (req, res) => {
  userModel.findAll((err, users) => {
    if (err) return res.status(500).json({ error: "Erreur lecture utilisateurs" })
    res.json(users)
  })
})
router.put("/utilisateurs/:id", (req, res) => {
  const id = req.params.id
  const { prenom, nom, email, adresse, telephone } = req.body

  const db = require("../models/userModel")
  db.update(id, { prenom, nom, email, adresse, telephone }, (err) => {
    if (err) return res.status(500).json({ error: "Erreur mise à jour utilisateur" })
    res.json({ message: "Mise à jour effectuée" })
  })
})

router.delete("/utilisateurs/:id", (req, res) => {
  userModel.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: "Erreur suppression" })
    res.status(204).send()
  })
})

module.exports = router

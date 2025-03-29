const bcrypt = require('bcryptjs')
const userModel = require("../models/userModel")

// POST /api/register
function registerUser(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" })
  }

  userModel.findByEmail(email, (err, existingUser) => {
    if (err) return res.status(500).json({ error: "Erreur interne" })
    if (existingUser) return res.status(400).json({ error: "Email déjà utilisé" })

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: "Erreur de chiffrement" })

      userModel.createUser(email, hash, "client", (err) => {
        if (err) return res.status(500).json({ error: "Erreur création compte" })
        res.status(201).json({ message: "Compte créé" })
      })
    })
  })
}

// POST /api/login
function loginUser(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" })
  }

  userModel.findByEmail(email, (err, user) => {
    if (err) return res.status(500).json({ error: "Erreur interne" })
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" })

    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) return res.status(401).json({ error: "Authentification échouée" })

      // Retourner les infos utilisateur sans le mot de passe
      const { password, ...safeUser } = user
      res.json(safeUser)
    })
  })
}

module.exports = {
  registerUser,
  loginUser
}

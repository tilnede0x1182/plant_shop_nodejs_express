const bcrypt = require('bcryptjs')
const userModel = require("../models/userModel")

// POST /api/register
function registerUser(req, res) {
  const { prenom, nom, email, mot_de_passe, adresse, telephone } = req.body

  if (!prenom || !nom || !email || !mot_de_passe) {
    return res.status(400).json({ error: "Champs requis manquants" })
  }

  userModel.findByEmail(email, (err, existingUser) => {
    if (err) return res.status(500).json({ error: "Erreur interne" })
    if (existingUser) return res.status(400).json({ error: "Email déjà utilisé" })

    bcrypt.hash(mot_de_passe, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: "Erreur de chiffrement" })

      const utilisateur = {
        prenom,
        nom,
        email,
        mot_de_passe: hash,
        adresse: adresse || "",
        telephone: telephone || "",
        role: "user",
        actif: 1,
        date_inscription: new Date().toISOString()
      }

      userModel.createUser(utilisateur, (err) => {
        if (err) return res.status(500).json({ error: "Erreur création compte" })
        res.status(201).json({ message: "Compte créé" })
      })
    })
  })
}

// POST /api/login
function loginUser(req, res) {
  const { email, mot_de_passe } = req.body

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: "Email et mot de passe requis" })
  }

  userModel.findByEmail(email, (err, user) => {
    if (err) return res.status(500).json({ error: "Erreur interne" })
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" })
    if (!user.actif) return res.status(403).json({ error: "Compte désactivé" })

    bcrypt.compare(mot_de_passe, user.mot_de_passe, (err, match) => {
      if (err || !match) return res.status(401).json({ error: "Mot de passe incorrect" })

      // Ne pas renvoyer le mot de passe
      const { mot_de_passe, ...safeUser } = user
      res.json({ message: "Connexion réussie", utilisateur: safeUser })
    })
  })
}

module.exports = {
  registerUser,
  loginUser
}

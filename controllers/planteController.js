const model = require("../models/planteModel")

function getAll(req, res) {
  model.getAll(function(err, plantes) {
    if (err) return res.status(500).json({ message: "Erreur lecture BDD" })
    res.json(plantes)
  })
}

function getById(req, res) {
  model.getById(req.params.id, function(err, plante) {
    if (err) return res.status(500).json({ message: "Erreur BDD" })
    if (!plante) return res.status(404).json({ message: "Plante non trouvée" })
    res.json(plante)
  })
}

function create(req, res) {
  const plante = req.body

  if (!plante.nom || !plante.prix || !plante.stock) {
    return res.status(400).json({ message: "Champs requis manquants." })
  }

  model.create(plante, function(err, newPlante) {
    if (err) return res.status(500).json({ message: "Erreur insertion" })
    res.status(201).json(newPlante)
  })
}

function update(req, res) {
  const plante = req.body
  model.update(req.params.id, plante, function(err) {
    if (err) return res.status(500).json({ message: "Erreur modification" })
    res.json(plante)
  })
}

function remove(req, res) {
  model.remove(req.params.id, function(err) {
    if (err) return res.status(500).json({ message: "Erreur suppression" })
    res.status(204).send()
  })
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
}

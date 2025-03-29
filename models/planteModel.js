const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "../db/plantes.db")
const db = new sqlite3.Database(dbPath)

function getAll(callback) {
  db.all("SELECT * FROM plantes", [], function(err, rows) {
    callback(err, rows)
  })
}

function getById(id, callback) {
  db.get("SELECT * FROM plantes WHERE id = ?", [id], function(err, row) {
    callback(err, row)
  })
}

function create(plante, callback) {
  const stmt = "INSERT INTO plantes (id, nom, description, prix, categorie, stock) VALUES (?, ?, ?, ?, ?, ?)"
  const params = [plante.id, plante.nom, plante.description, plante.prix, plante.categorie, plante.stock]
  db.run(stmt, params, function(err) {
    callback(err, plante)
  })
}

function update(id, plante, callback) {
  const stmt = "UPDATE plantes SET nom = ?, description = ?, prix = ?, categorie = ?, stock = ? WHERE id = ?"
  const params = [plante.nom, plante.description, plante.prix, plante.categorie, plante.stock, id]
  db.run(stmt, params, function(err) {
    callback(err)
  })
}

function remove(id, callback) {
  db.run("DELETE FROM plantes WHERE id = ?", [id], function(err) {
    callback(err)
  })
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
}

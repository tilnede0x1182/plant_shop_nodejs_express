const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "../db/plantes.db")
const db = new sqlite3.Database(dbPath)

function findByEmail(email, callback) {
  db.get("SELECT * FROM utilisateurs WHERE email = ?", [email], (err, row) => {
    callback(err, row || null)
  })
}

function createUser(data, callback) {
  const {
    prenom,
    nom,
    email,
    mot_de_passe,
    role,
    adresse,
    telephone
  } = data

  const date_inscription = new Date().toISOString()
  const actif = 1

  db.run(
    `INSERT INTO utilisateurs
    (prenom, nom, email, mot_de_passe, role, adresse, telephone, date_inscription, actif)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [prenom, nom, email, mot_de_passe, role, adresse, telephone, date_inscription, actif],
    (err) => callback(err)
  )
}

function findAll(callback) {
  db.all("SELECT * FROM utilisateurs ORDER BY role ASC, nom ASC, prenom ASC", [], (err, rows) => callback(err, rows))
}

function update(id, data, callback) {
  const { prenom, nom, email, adresse, telephone } = data
  db.run(
    `UPDATE utilisateurs SET prenom = ?, nom = ?, email = ?, adresse = ?, telephone = ? WHERE id = ?`,
    [prenom, nom, email, adresse, telephone, id],
    callback
  )
}

function remove(id, callback) {
  db.run("DELETE FROM utilisateurs WHERE id = ?", [id], (err) => callback(err))
}

module.exports = {
  findByEmail,
  createUser,
  findAll,
  remove,
  update
}

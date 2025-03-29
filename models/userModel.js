const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const { v4: uuidv4 } = require('uuid')

const dbPath = path.join(__dirname, "../db/plantes.db")
const db = new sqlite3.Database(dbPath)

function findByEmail(email, callback) {
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    callback(err, row || null)
  })
}

function createUser(email, password, role, callback) {
  const id = uuidv4()
  db.run(
    "INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)",
    [id, email, password, role],
    (err) => callback(err)
  )
}

module.exports = {
  findByEmail,
  createUser
}

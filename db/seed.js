const sqlite3 = require("sqlite3").verbose()
const { faker } = require("@faker-js/faker")
const path = require("path")

const db = new sqlite3.Database(path.join(__dirname, "plantes.db"))

function generatePlante() {
  return {
    id: faker.string.uuid(),
    nom: faker.word.words(1),
    description: faker.lorem.sentence(),
    prix: faker.number.int({ min: 5, max: 50 }),
    categorie: faker.helpers.arrayElement(["intérieur", "extérieur"]),
    stock: faker.number.int({ min: 1, max: 30 })
  }
}

function insertPlante(plante) {
  const stmt = db.prepare("INSERT INTO plantes (id, nom, description, prix, categorie, stock) VALUES (?, ?, ?, ?, ?, ?)")
  stmt.run([plante.id, plante.nom, plante.description, plante.prix, plante.categorie, plante.stock])
  stmt.finalize()
}

db.serialize(() => {
  db.run("DELETE FROM plantes") // on vide la table d'abord
  for (let i = 0; i < 30; i++) {
    const plante = generatePlante()
    insertPlante(plante)
  }
  console.log("30 plantes générées dans la base.")
  db.close()
})

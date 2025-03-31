const fs = require("fs")
const sqlite3 = require("sqlite3").verbose()
const { faker } = require("@faker-js/faker")
const path = require("path")

const db = new sqlite3.Database(path.join(__dirname, "plantes.db"))

const NB_PLANTES = 30
const NB_ADMINS = 3
const NB_USERS = 15

function generatePlante() {
  return {
    nom: faker.word.words(1),
    description: faker.lorem.sentence(),
    prix: faker.number.int({ min: 5, max: 50 }),
    categorie: faker.helpers.arrayElement(["intérieur", "extérieur"]),
    stock: faker.number.int({ min: 1, max: 30 })
  }
}

// # # Plantes
function insertPlante(plante) {
  const stmt = db.prepare("INSERT INTO plantes (nom, description, prix, categorie, stock) VALUES (?, ?, ?, ?, ?)")
  stmt.run([plante.nom, plante.description, plante.prix, plante.categorie, plante.stock])
  stmt.finalize()
}

// # Utilisateurs
const roles = ["user", "admin"]
const totalUtilisateurs = NB_USERS + NB_ADMINS

const utilisateurs = []

for (let i = 0; i < totalUtilisateurs; i++) {
  const role = i < NB_USERS ? "user" : "admin"
  const nom = faker.person.fullName()
  const email = faker.internet.email()
  const mot_de_passe = faker.internet.password()
  const adresse = faker.location.streetAddress() + ", " + faker.location.city()
  const telephone = faker.phone.number()
  const date_inscription = new Date().toISOString()
  const actif = 1

  db.run(
    `INSERT INTO utilisateurs
    (nom, email, mot_de_passe, role, adresse, telephone, date_inscription, actif)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nom, email, mot_de_passe, role, adresse, telephone, date_inscription, actif]
  )

  utilisateurs.push({ role: role, username: email, password: mot_de_passe })
}

// ## Création du fichier users.txt

let contenu = "Administrateurs :\n\n"
contenu += utilisateurs
  .filter(u => u.role === "admin")
  .map(u => u.username + " " + u.password)
  .join("\n")

contenu += "\n\nUsers :\n\n"
contenu += utilisateurs
  .filter(u => u.role === "user")
  .map(u => u.username + " " + u.password)
  .join("\n")

fs.writeFileSync(path.join(__dirname, "../users.txt"), contenu)

// # Ajout dans la BDD

db.serialize(() => {
  db.run("DELETE FROM plantes") // on vide la table d'abord
  for (let i = 0; i < 30; i++) {
    const plante = generatePlante()
    insertPlante(plante)
  }
  console.log("30 plantes générées dans la base.")
  db.close()
})

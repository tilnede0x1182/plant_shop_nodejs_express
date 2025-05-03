// # Import des dépendances et initialisation
const fs = require("fs")
const sqlite3 = require("sqlite3").verbose()
const { faker } = require("@faker-js/faker")
const bcrypt = require("bcryptjs")
const path = require("path")

const db = new sqlite3.Database(path.join(__dirname, "plantes.db"))

// # Constantes globales
const NB_PLANTES = 30
const NB_ADMINS = 3
const NB_USERS = 15

// # Fonctions utilitaires
function generatePlante() {
  return {
    nom: faker.word.words(1),
    description: faker.lorem.sentence(),
    prix: faker.number.int({ min: 5, max: 50 }),
    categorie: faker.helpers.arrayElement(["intérieur", "extérieur"]),
    stock: faker.number.int({ min: 1, max: 30 })
  }
}

// # Fonctions principales
// ## Insertion d'un utilisateur
function insertUtilisateur(u) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role, adresse, telephone, date_inscription, actif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        u.prenom,
        u.nom,
        u.email,
        u.mot_de_passe,
        u.role,
        u.adresse,
        u.telephone,
        u.date_inscription,
        u.actif
      ],
      err => (err ? reject(err) : resolve())
    )
  })
}

// ## Insertion d'une plante
function insertPlante(plante) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "INSERT INTO plantes (nom, description, prix, categorie, stock) VALUES (?, ?, ?, ?, ?)"
    )
    stmt.run(
      [plante.nom, plante.description, plante.prix, plante.categorie, plante.stock],
      err => (err ? reject(err) : resolve())
    )
    stmt.finalize()
  })
}

// Création d'utilisateurs admin fixes
async function insertFixedAdmins(utilisateurs) {
  for (let i = 1; i <= 3; i++) {
    const mot_de_passe = await bcrypt.hash("password", 10)
    const admin = {
      prenom: "Admin",
      nom: "Fixe" + i,
      email: `admin${i}@planteshop.com`,
      mot_de_passe,
      role: "admin",
      adresse: "1 rue des Admins",
      telephone: "0102030405",
      date_inscription: new Date().toISOString(),
      actif: 1
    }
    await insertUtilisateur(admin)
    utilisateurs.push({ role: "admin", username: admin.email, password: "password" })
  }
}


// # Main
async function main() {
  const utilisateurs = []

  // Nettoyage des tables
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM plantes")
      db.run("DELETE FROM utilisateurs", err => (err ? reject(err) : resolve()))
    })
  })

  // Création de 3 utilisateurs admin fixes
  await insertFixedAdmins(utilisateurs)

  // Création des utilisateurs (simples et admins)
  for (let i = 0; i < NB_USERS + NB_ADMINS; i++) {
    const role = i < NB_USERS ? "user" : "admin"
    const prenom = faker.person.firstName()
    const nom = faker.person.lastName()
    const email = faker.internet.email()
    const passwordClair = faker.internet.password()
    const mot_de_passe = await bcrypt.hash(passwordClair, 10)
    const adresse = faker.location.streetAddress() + ", " + faker.location.city()
    const telephone = faker.phone.number()
    const date_inscription = new Date().toISOString()
    const actif = 1

    const utilisateur = {
      prenom,
      nom,
      email,
      mot_de_passe,
      role,
      adresse,
      telephone,
      date_inscription,
      actif
    }

    await insertUtilisateur(utilisateur)
    utilisateurs.push({ role, username: email, password: passwordClair })
  }

  // Écriture des identifiants dans un fichier
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

  // Ajout des plantes
  for (let i = 0; i < NB_PLANTES; i++) {
    const plante = generatePlante()
    await insertPlante(plante)
  }

  console.log("Données initiales générées avec succès.")
  console.log(NB_PLANTES + " plantes, " + NB_USERS + " users et " + NB_ADMINS + " admins insérés.")
  db.close()
}

// Exécution
main()

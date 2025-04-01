"controllers/planteController.js"
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


"controllers/authController.js"
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


"public/script.js"
// ------------------- Imports et hooks ---------------------
const { useState, useEffect } = React

// ----------------- Données et utilitaires -----------------

// Ajout au panier
function ajouterAuPanier(plante) {
  const panier = JSON.parse(localStorage.getItem("panier")) || []
  const existing = panier.find(p => p.id === plante.id)

  if (existing) {
    existing.quantite = (existing.quantite || 1) + 1
  } else {
    panier.push({ ...plante, quantite: 1 })
  }

  localStorage.setItem("panier", JSON.stringify(panier))
  updatePanierCount()
}

// Mise à jour du badge panier
function updatePanierCount() {
  const badge = document.getElementById("panier-count")
  const panier = JSON.parse(localStorage.getItem("panier")) || []
  const total = panier.reduce((acc, p) => acc + (p.quantite || 1), 0)
  if (badge) badge.textContent = total
}

// Navigation
function navigate(path) {
  window.history.pushState({}, "", path)
  renderRoute()
}

// Suppression d'une plante
function supprimerPlante(id) {
  if (!confirm("Supprimer cette plante ?")) return
  fetch("/api/plantes/" + id, { method: "DELETE" })
    .then(() => window.location.pathname === "/" ? window.location.reload() : navigate("/"))
}

// ----------------- Pages en JSX -----------------

// PageAccueil (liste de plantes)
function renderPlantListPage() {
  const [plantes, setPlantes] = useState([])
  const [utilisateur, setUtilisateur] = useState(null)

  useEffect(() => {
    fetch("/api/plantes")
      .then(res => res.json())
      .then(setPlantes)

    const session = JSON.parse(localStorage.getItem("utilisateur"))
    setUtilisateur(session)
  }, [])

  return (
    <div>
      <div className="row">
        {plantes.map(p => (
          <div className="col-md-4 mb-3" key={p.id}>
            <div className="card p-3">
              <div onClick={() => navigate("/plante/" + p.id)}>
                <h5>{p.nom}</h5>
                <p>{p.prix} € – {p.categorie}</p>
              </div>
              <div className="d-flex gap-2 mt-3">
                {utilisateur && utilisateur.role === "admin" && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate("/modifier/" + p.id)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => supprimerPlante(p.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => ajouterAuPanier(p)}
                >
                  Ajouter au Panier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// PageShow (affichage d'une plante précise)
function renderPlantShowPage({ id }) {
  const [plante, setPlante] = useState(null)
  const [utilisateur, setUtilisateur] = useState(null)

  useEffect(() => {
    fetch("/api/plantes/" + id)
      .then(res => res.json())
      .then(setPlante)

    const session = JSON.parse(localStorage.getItem("utilisateur"))
    setUtilisateur(session)
  }, [id])

  if (!plante) return <p>Chargement...</p>

  return (
    <div>
      <h2 className="mb-3">{plante.nom}</h2>
      <p><strong>Description :</strong> {plante.description}</p>
      <p><strong>Prix :</strong> {plante.prix} €</p>
      <p><strong>Catégorie :</strong> {plante.categorie}</p>
      <p><strong>Stock :</strong> {plante.stock}</p>

      <div className="d-flex gap-2 mt-3">
        {utilisateur && utilisateur.role === "admin" && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/modifier/" + plante.id)}
            >
              Modifier
            </button>
            <button
              className="btn btn-danger"
              onClick={() => supprimerPlante(plante.id)}
            >
              Supprimer
            </button>
          </div>
        )}
        <button
          className="btn btn-success"
          onClick={() => ajouterAuPanier(plante)}
        >
          Ajouter au panier
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          Retour
        </button>
      </div>
    </div>
  )
}

// PagePanier
function renderCartPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("panier")) || []
    setItems(stored)
  }, [])

  function supprimer(index) {
    const updated = [...items]
    updated.splice(index, 1)
    setItems(updated)
    localStorage.setItem("panier", JSON.stringify(updated))
    updatePanierCount()
  }

  function handleQuantiteChange(e, i) {
    const updated = [...items]
    updated[i].quantite = parseInt(e.target.value)
    setItems(updated)
    localStorage.setItem("panier", JSON.stringify(updated))
    updatePanierCount()
  }

  function handleQuantiteBlur(plante, quantite) {
    fetch("/api/plantes/" + plante.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...plante, stock: quantite })
    }).then(() => console.log("Quantité mise à jour"))
  }

  function valider() {
    alert("Panier validé !")
    localStorage.removeItem("panier")
    setItems([])
    updatePanierCount()
  }

  const total = items.reduce((acc, p) => acc + p.prix * (p.quantite || 1), 0)

  if (items.length === 0) {
    return (
      <div className="mt-4">
        <h2>Votre panier est vide.</h2>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="mb-3">Mon panier</h2>
      <ul className="list-group mb-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{item.nom} – {item.prix} €</span>
            <input
              type="number"
              className="form-control form-control-sm w-25 me-2"
              value={item.quantite || 1}
              min="1"
              onChange={(e) => handleQuantiteChange(e, i)}
              onBlur={() => handleQuantiteBlur(item, item.quantite || 1)}
            />
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => supprimer(i)}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      <div className="d-flex justify-content-between align-items-center mb-3 px-1">
        <strong>Total :</strong>
        <span>{total.toFixed(2)} €</span>
      </div>
      <button className="btn btn-success" onClick={valider}>
        Valider mon panier
      </button>
    </div>
  )
}

// Inscription
function renderRegisterPage() {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    mot_de_passe: "",
    adresse: "",
    telephone: ""
  })
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setError(null)

    fetch("/api/utilisateurs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(() => {
        setMessage("Inscription réussie. Vous pouvez maintenant vous connecter.")
        navigate("/connexion")
      })
      .catch(() => setError("Erreur lors de l'inscription. Veuillez réessayer."))
  }

  return (
    <div className="mt-4">
      <h2 className="mb-3">Inscription</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
        <input className="form-control mb-2" name="nom" placeholder="Nom complet" value={form.nom} onChange={handleChange} required />
        <input className="form-control mb-2" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input className="form-control mb-2" type="password" name="mot_de_passe" placeholder="Mot de passe" value={form.mot_de_passe} onChange={handleChange} required />
        <input className="form-control mb-2" name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} />
        <input className="form-control mb-3" name="telephone" placeholder="Téléphone" value={form.telephone} onChange={handleChange} />
        <button className="btn btn-success" type="submit">S'inscrire</button>
      </form>
    </div>
  )
}

// Connection
function renderLoginPage() {
  const [form, setForm] = useState({
    email: "",
    mot_de_passe: ""
  })
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setError(null)

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(user => {
        localStorage.setItem("utilisateur", JSON.stringify(user.utilisateur))
        window.dispatchEvent(new Event("utilisateurChange"))
        setMessage("Connexion réussie.")
        navigate("/")
      })
      .catch(() => setError("Email ou mot de passe invalide."))
  }

  return (
    <div className="mt-4">
      <h2 className="mb-3">Connexion</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input className="form-control mb-3" type="password" name="mot_de_passe" placeholder="Mot de passe" value={form.mot_de_passe} onChange={handleChange} required />
        <button className="btn btn-primary" type="submit">Se connecter</button>
      </form>
    </div>
  )
}

// PageModifier une plante
function renderPlantEditPage({ id }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    fetch("/api/plantes/" + id)
      .then(res => res.json())
      .then(setForm)
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    fetch("/api/plantes/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        prix: parseInt(form.prix),
        stock: parseInt(form.stock)
      })
    }).then(() => navigate("/plante/" + id))
  }

  if (!form) return <p>Chargement...</p>

  return (
    <div>
      <h2 className="mb-3">Modifier {form.nom}</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          name="nom"
          value={form.nom}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          type="number"
          name="prix"
          value={form.prix}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="categorie"
          value={form.categorie}
          onChange={handleChange}
        />
        <input
          className="form-control mb-3"
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
        />
        <button className="btn btn-success me-2" type="submit">
          Enregistrer
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => navigate("/")}
        >
          Annuler
        </button>
      </form>
    </div>
  )
}

// Ajouter une nouvelle plante - admin
function renderPlantCreatePage() {
  const [form, setForm] = useState({
    nom: "",
    description: "",
    prix: "",
    categorie: "",
    stock: ""
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    fetch("/api/plantes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        prix: parseInt(form.prix),
        stock: parseInt(form.stock)
      })
    }).then(() => navigate("/"))
  }

  return (
    <div>
      <h2 className="mb-3">Ajouter une plante</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          name="nom"
          placeholder="Nom"
          value={form.nom}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          type="number"
          name="prix"
          placeholder="Prix"
          value={form.prix}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="categorie"
          placeholder="Catégorie"
          value={form.categorie}
          onChange={handleChange}
        />
        <input
          className="form-control mb-3"
          type="number"
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />
        <button className="btn btn-success me-2" type="submit">
          Ajouter
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => navigate("/")}
        >
          Annuler
        </button>
      </form>
    </div>
  )
}

// Gestion des utilisateurs - admin
function renderUserManagePage() {
  const [utilisateurs, setUtilisateurs] = useState([])

  useEffect(() => {
    fetch("/api/utilisateurs")
      .then(res => res.json())
      .then(setUtilisateurs)
  }, [])

  function supprimer(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return
    fetch("/api/utilisateurs/" + id, { method: "DELETE" })
      .then(() => setUtilisateurs(utilisateurs.filter(u => u.id !== id)))
  }

  return (
    <div className="mt-4">
      <h2 className="mb-3">Gestion des utilisateurs</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {utilisateurs.map(u => (
            <tr key={u.id}>
              <td>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/utilisateur/" + u.id) }}>
                  {u.prenom} {u.nom}
                </a>
              </td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => supprimer(u.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderUserProfilePage({ id }) {
  const [utilisateur, setUtilisateur] = useState(null)
  const [form, setForm] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("utilisateur"))
    setUtilisateur(session)

    fetch("/api/utilisateurs")
      .then(res => res.json())
      .then(data => {
        const cible = data.find(u => u.id == id)
        setForm(cible)
      })
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()

    fetch("/api/utilisateurs/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }).then(() => {
      setMessage("Les informations ont été mises à jour avec succès.")
    })
  }

  if (!form) return <p>Chargement...</p>

  const peutModifier = utilisateur && (utilisateur.id == id || utilisateur.role === "admin")

  return (
    <div className="mt-4">
      <h2 className="mb-3">Profil utilisateur</h2>
      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="prenom" value={form.prenom} disabled={!peutModifier} onChange={handleChange} />
        <input className="form-control mb-2" name="nom" value={form.nom} disabled={!peutModifier} onChange={handleChange} />
        <input className="form-control mb-2" name="email" value={form.email} disabled={!peutModifier} onChange={handleChange} />
        <input className="form-control mb-2" name="adresse" value={form.adresse} disabled={!peutModifier} onChange={handleChange} />
        <input className="form-control mb-3" name="telephone" value={form.telephone} disabled={!peutModifier} onChange={handleChange} />

        {peutModifier && (
          <button className="btn btn-success" type="submit">
            Enregistrer les modifications
          </button>
        )}
      </form>
    </div>
  )
}

// ------------------------ Navbar ------------------------
function Navbar() {
  const [utilisateur, setUtilisateur] = React.useState(null)

  React.useEffect(() => {
    function syncUtilisateur() {
      const session = JSON.parse(localStorage.getItem("utilisateur"))
      setUtilisateur(session)
    }

    updatePanierCount()
    syncUtilisateur()

    window.addEventListener("utilisateurChange", syncUtilisateur)
    window.addEventListener("storage", syncUtilisateur)

    return () => {
      window.removeEventListener("utilisateurChange", syncUtilisateur)
      window.removeEventListener("storage", syncUtilisateur)
    }
  }, [])

  function capitalize(str) {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  function deconnexion() {
    localStorage.removeItem("utilisateur")
    window.dispatchEvent(new Event("utilisateurChange"))
    window.location.href = "/" // recharge complète de la page
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success custom-navbar mt-3 mx-3">
      <div className="container">
        <a
          className="navbar-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            navigate("/")
          }}
        >
          Plant Shop
        </a>

        <div className="ms-auto d-flex gap-2 align-items-center">
          {utilisateur && (
            <div className="text-white me-2">
              {capitalize(utilisateur.nom) + " " + capitalize(utilisateur.prenom)}
              {utilisateur.role === "admin" ? " (Administrateur)" : ""}
            </div>
          )}

          {utilisateur && (
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => navigate("/utilisateur/" + utilisateur.id)}
            >
              Mon profil
            </button>
          )}
          {utilisateur && utilisateur.role === "admin" && (
            <div className="d-flex gap-2">
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/ajouter")}>
                Nouvelle plante
              </button>
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/admin/utilisateurs")}>
                Utilisateurs
              </button>
            </div>
          )}

          <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/panier")}>
            Panier (<span id="panier-count">0</span>)
          </button>

          {!utilisateur && (
            <div className="d-flex gap-2">
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/inscription")}>
                Inscription
              </button>
              <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/connexion")}>
                Connexion
              </button>
            </div>
          )}

          {utilisateur && (
            <button className="btn btn-outline-light btn-sm" onClick={deconnexion}>
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

// ------------------------ Router ------------------------
function renderRoute() {
  const path = window.location.pathname
  // const root = document.getElementById("root")

  function withNavbar(component) {
    return React.createElement(
      React.Fragment,
      null,
      [
        React.createElement(Navbar, { key: "navbar" }),
        React.createElement(component.type, { ...component.props, key: "page" })
      ]
    )
  }

  let route

  if (path === "/") {
    route = React.createElement(renderPlantListPage, null)
  } else if (path.startsWith("/plante/")) {
    const id = path.split("/")[2]
    route = React.createElement(renderPlantShowPage, { id: id })
  } else if (path === "/ajouter") {
    route = React.createElement(renderPlantCreatePage, null)
  } else if (path.startsWith("/modifier/")) {
    const id = path.split("/")[2]
    route = React.createElement(renderPlantEditPage, { id: id })
  } else if (path === "/inscription") {
    route = React.createElement(renderRegisterPage, null)
  } else if (path === "/connexion") {
    route = React.createElement(renderLoginPage, null)
  } else if (path === "/panier") {
    route = React.createElement(renderCartPage, null)
  } else if (path === "/admin/utilisateurs") {
    route = React.createElement(renderUserManagePage, null)
  } else if (path.startsWith("/utilisateur/")) {
    const id = path.split("/")[2]
    route = React.createElement(renderUserProfilePage, { id: id })
  } else {
    route = React.createElement("h2", null, "Page introuvable")
  }

  // On rend la Navbar + la page correspondante
  const finalElement = withNavbar(route)
  root.render(finalElement)
}

// ----------------- Activation du router -----------------
const rootContainer = document.getElementById("root")
const root = ReactDOM.createRoot(rootContainer)

window.onpopstate = renderRoute
window.onload = renderRoute
window.addEventListener("storage", () => updatePanierCount())


"app.js"
// ----------------------------
// Import des modules
// ----------------------------
const express = require("express")
const path = require("path")
const planteRoutes = require("./routes/planteRoutes")
const authRoutes = require("./routes/authRoutes")

// ----------------------------
// Initialisation de l'application
// ----------------------------
const app = express()
const PORT = 3000

// ----------------------------
// Middleware généraux
// ----------------------------
app.use(express.json()) // Pour parser le JSON dans les requêtes
app.use(express.static(path.join(__dirname, "public"))) // Pour servir les fichiers statiques (frontend)

// ----------------------------
// Routes API
// ----------------------------
app.use("/api/plantes", planteRoutes) // Routes pour la ressource "plantes"
app.use("/api", authRoutes) // Routes pour l'authentification et les utilisateurs

// ----------------------------
// Catch-all pour React (SPA)
// ----------------------------
// Toutes les autres routes sont redirigées vers l'index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// ----------------------------
// Démarrage du serveur
// ----------------------------
app.listen(PORT, () => {
  console.log("Serveur lancé sur http://localhost:" + PORT)
})


"models/planteModel.js"
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


"models/userModel.js"
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


"routes/authRoutes.js"
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


"routes/planteRoutes.js"
const express = require("express")
const router = express.Router()
const controller = require("../controllers/planteController")

router.get("/", controller.getAll)
router.get("/:id", controller.getById)
router.post("/", controller.create)
router.put("/:id", controller.update)
router.delete("/:id", controller.remove)

module.exports = router


"db/seed.js"
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



// ---------- Imports et hooks ----------
const { useState, useEffect } = React

// ---------- Données et utilitaires ----------

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

// ---------- Pages ----------

// index (Accueil)
function PageAccueil() {
  const [plantes, setPlantes] = useState([])

  useEffect(() => {
    fetch("/api/plantes").then(res => res.json()).then(setPlantes)
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

// show (Afficher une plante)
function PageShow({ id }) {
  const [plante, setPlante] = useState(null)

  useEffect(() => {
    fetch("/api/plantes/" + id).then(res => res.json()).then(setPlante)
  }, [id])

  if (!plante) return <p>Chargement...</p>

  return (
    <div>
      <h2 className="mb-3">{plante.nom}</h2>
      <p><strong>Description :</strong> {plante.description}</p>
      <p><strong>Prix :</strong> {plante.prix} €</p>
      <p><strong>Catégorie :</strong> {plante.categorie}</p>
      <p><strong>Stock :</strong> {plante.stock}</p>
      <button
        className="btn btn-primary me-2"
        onClick={() => navigate("/modifier/" + plante.id)}
      >
        Modifier
      </button>
      <button
        className="btn btn-danger me-2"
        onClick={() => supprimerPlante(plante.id)}
      >
        Supprimer
      </button>
      <button
        className="btn btn-success me-2"
        onClick={() => ajouterAuPanier(plante)}
      >
        Ajouter au panier
      </button>
      <button className="btn btn-secondary" onClick={() => navigate("/")}>
        Retour
      </button>
    </div>
  )
}

// panier
function PagePanier() {
  const [items, setItems] = React.useState([])

  React.useEffect(() => {
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

  const total = items.reduce((acc, p) => acc + (p.prix * (p.quantite || 1)), 0)

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

// inscription
function PageInscription() {
  return React.createElement("div", { className: "mt-4" }, [
    React.createElement("h2", { key: "h2" }, "Inscription"),
    React.createElement("p", { key: "p" }, "Formulaire d’inscription à implémenter...")
  ])
}

// connexion
function PageConnexion() {
  return React.createElement("div", { className: "mt-4" }, [
    React.createElement("h2", { key: "h2" }, "Connexion"),
    React.createElement("p", { key: "p" }, "Formulaire de connexion à implémenter...")
  ])
}

// modifier
function PageModifier({ id }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    fetch("/api/plantes/" + id).then(res => res.json()).then(setForm)
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

// ---------- Navbar ----------
function Navbar() {
  useEffect(() => {
    updatePanierCount()
  }, [])

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
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/panier")}>
            Panier (<span id="panier-count">0</span>)
          </button>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate("/inscription")}
          >
            Inscription
          </button>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate("/connexion")}
          >
            Connexion
          </button>
        </div>
      </div>
    </nav>
  )
}

// ---------- Router ----------
function renderRoute() {
  const path = window.location.pathname
  const root = document.getElementById("root")

  const withNavbar = (component) => {
    return React.createElement(React.Fragment, null, [
      React.createElement(Navbar, { key: "navbar" }),
      component
    ])
  }

  if (path === "/") {
    ReactDOM.createRoot(root).render(withNavbar(React.createElement(PageAccueil)))
  } else if (path.startsWith("/plante/")) {
    const id = path.split("/")[2]
    ReactDOM.createRoot(root).render(withNavbar(React.createElement(PageShow, { id: id })))
  } else if (path.startsWith("/modifier/")) {
    const id = path.split("/")[2]
    ReactDOM.createRoot(root).render(withNavbar(React.createElement(PageModifier, { id: id })))
  } else if (path === "/inscription") {
    ReactDOM.createRoot(root).render(
      React.createElement(React.Fragment, null, [
        React.createElement(Navbar, { key: "nav" }),
        React.createElement(PageInscription, { key: "insc" })
      ])
    )
  } else if (path === "/connexion") {
    ReactDOM.createRoot(root).render(
      React.createElement(React.Fragment, null, [
        React.createElement(Navbar, { key: "nav" }),
        React.createElement(PageConnexion, { key: "conn" })
      ])
    )
  } else if (path === "/panier") {
    ReactDOM.createRoot(root).render(
      React.createElement(React.Fragment, null, [
        React.createElement(Navbar, { key: "nav" }),
        React.createElement(PagePanier, { key: "panier" })
      ])
    )
  } else {
    ReactDOM.createRoot(root).render(withNavbar(
      React.createElement("h2", null, "Page introuvable")
    ))
  }
}

window.onpopstate = renderRoute
window.onload = renderRoute
window.addEventListener("storage", () => updatePanierCount())

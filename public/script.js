const { useState, useEffect } = React

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success custom-navbar mt-3 mx-3">
      <div className="container">
        <a className="navbar-brand" href="#" onClick={(e) => { e.preventDefault(); navigate("/") }}>Plant Shop</a>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/inscription")}>Inscription</button>
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/connexion")}>Connexion</button>
        </div>
      </div>
    </nav>
  )
}

function PageInscription() {
  return React.createElement("div", { className: "mt-4" }, [
    React.createElement("h2", { key: "h2" }, "Inscription"),
    React.createElement("p", { key: "p" }, "Formulaire d’inscription à implémenter...")
  ])
}

function PageConnexion() {
  return React.createElement("div", { className: "mt-4" }, [
    React.createElement("h2", { key: "h2" }, "Connexion"),
    React.createElement("p", { key: "p" }, "Formulaire de connexion à implémenter...")
  ])
}

function navigate(path) {
  window.history.pushState({}, "", path)
  renderRoute()
}

function supprimerPlante(id) {
  if (!confirm("Supprimer cette plante ?")) return
  fetch("/api/plantes/" + id, { method: "DELETE" })
    .then(() => window.location.pathname === "/" ? window.location.reload() : navigate("/"))
}

// Page d'accueil
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
                <button className="btn btn-sm btn-outline-primary" onClick={() => navigate("/modifier/" + p.id)}>Modifier</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => supprimerPlante(p.id)}>Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Page show
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
      <button className="btn btn-primary me-2" onClick={() => navigate("/modifier/" + plante.id)}>Modifier</button>
      <button className="btn btn-danger me-2" onClick={() => supprimerPlante(plante.id)}>Supprimer</button>
      <button className="btn btn-secondary" onClick={() => navigate("/")}>Retour</button>
    </div>
  )
}

// Page de modification
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
      body: JSON.stringify({ ...form, prix: parseInt(form.prix), stock: parseInt(form.stock) })
    }).then(() => navigate("/plante/" + id))
  }

  if (!form) return <p>Chargement...</p>

  return (
    <div>
      <h2 className="mb-3">Modifier {form.nom}</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="nom" value={form.nom} onChange={handleChange} required />
        <input className="form-control mb-2" name="description" value={form.description} onChange={handleChange} />
        <input className="form-control mb-2" type="number" name="prix" value={form.prix} onChange={handleChange} required />
        <input className="form-control mb-2" name="categorie" value={form.categorie} onChange={handleChange} />
        <input className="form-control mb-3" type="number" name="stock" value={form.stock} onChange={handleChange} />
        <button className="btn btn-success me-2" type="submit">Enregistrer</button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate("/")}>Annuler</button>
      </form>
    </div>
  )
}

// ROUTEUR
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
  } else {
    ReactDOM.createRoot(root).render(withNavbar(
      React.createElement("h2", null, "Page introuvable")
    ))
  }
}


window.onpopstate = renderRoute
window.onload = renderRoute

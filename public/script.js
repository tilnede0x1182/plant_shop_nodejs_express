const { useState, useEffect } = React

function navigate(path) {
  window.history.pushState({}, "", path)
  renderRoute()
}

// Page d'accueil
function PageAccueil() {
  const [plantes, setPlantes] = useState([])

  useEffect(() => {
    fetch("/api/plantes").then(res => res.json()).then(setPlantes)
  }, [])

  return (
    <div>
      <h1 className="mb-4">Catalogue</h1>
      <div className="row">
        {plantes.map(p => (
          <div className="col-md-4 mb-3" key={p.id}>
            <div className="card p-3" onClick={() => navigate("/plante/" + p.id)}>
              <h5>{p.nom}</h5>
              <p>{p.prix} € – {p.categorie}</p>
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
      <h2>{plante.nom}</h2>
      <p>{plante.description}</p>
      <p><strong>Prix :</strong> {plante.prix} €</p>
      <p><strong>Catégorie :</strong> {plante.categorie}</p>
      <p><strong>Stock :</strong> {plante.stock}</p>
      <button className="btn btn-primary me-2" onClick={() => navigate("/modifier/" + plante.id)}>Modifier</button>
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
      <h2>Modifier {form.nom}</h2>
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

// ROUTEUR MAISON
function renderRoute() {
  const path = window.location.pathname
  const root = document.getElementById("root")

  if (path === "/") {
    ReactDOM.createRoot(root).render(<PageAccueil />)
  } else if (path.startsWith("/plante/")) {
    const id = path.split("/")[2]
    ReactDOM.createRoot(root).render(<PageShow id={id} />)
  } else if (path.startsWith("/modifier/")) {
    const id = path.split("/")[2]
    ReactDOM.createRoot(root).render(<PageModifier id={id} />)
  } else {
    root.innerHTML = "<h2>Page introuvable</h2>"
  }
}

window.onpopstate = renderRoute
window.onload = renderRoute

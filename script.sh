#!/bin/bash

mkdir -p public

# index.html
cat > public/index.html <<'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Plant Shop</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="style.css" rel="stylesheet">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-success">
    <div class="container">
      <a class="navbar-brand" href="/" onclick="event.preventDefault(); navigate('/')">Plant Shop</a>
    </div>
  </nav>

  <div class="container py-4">
    <div id="root"></div>
  </div>

  <footer class="bg-light text-center py-3 border-top mt-4">
    <small>&copy; 2025 Plant Shop. Tous droits réservés.</small>
  </footer>

  <script type="text/babel" src="script.js"></script>
</body>
</html>
EOF

# style.css
cat > public/style.css <<'EOF'
body {
  background-color: #f8f9fa;
  font-family: sans-serif;
}
.card:hover {
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
EOF

# script.js
cat > public/script.js <<'EOF'
const { useState, useEffect } = React

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
      <h1 className="mb-4">Catalogue</h1>
      <div className="row">
        {plantes.map(p => (
          <div className="col-md-4 mb-3" key={p.id}>
            <div className="card p-3">
              <div onClick={() => navigate("/plante/" + p.id)}>
                <h5>{p.nom}</h5>
                <p>{p.prix} € – {p.categorie}</p>
              </div>
              <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => supprimerPlante(p.id)}>Supprimer</button>
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
EOF

echo "✅ Frontend avec navbar, footer, suppression et navigation multi-pages installé."

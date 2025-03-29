const { useState, useEffect } = React

function App() {
  const [plantes, setPlantes] = useState([])
  const [form, setForm] = useState({ id: "", nom: "", description: "", prix: "", categorie: "", stock: "" })
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPlantes()
  }, [])

  function fetchPlantes() {
    fetch("/api/plantes")
      .then(res => res.json())
      .then(data => setPlantes(data))
  }

  function showMessage(text) {
    setMessage(text)
    setTimeout(() => setMessage(null), 3000)
  }

  function showError(text) {
    setError(text)
    setTimeout(() => setError(null), 4000)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const method = editing ? "PUT" : "POST"
    const url = editing ? "/api/plantes/" + form.id : "/api/plantes"
    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, prix: parseInt(form.prix), stock: parseInt(form.stock) })
    }).then(res => {
      if (!res.ok) throw new Error("Erreur d’enregistrement")
      return res.json()
    }).then(() => {
      fetchPlantes()
      setForm({ id: "", nom: "", description: "", prix: "", categorie: "", stock: "" })
      setEditing(false)
      showMessage("Plante enregistrée avec succès")
    }).catch(() => showError("Échec lors de l'enregistrement"))
  }

  function handleEdit(plante) {
    setForm(plante)
    setEditing(true)
  }

  function handleDelete(id) {
    if (!confirm("Supprimer cette plante ?")) return
    fetch("/api/plantes/" + id, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("Erreur suppression")
        fetchPlantes()
        showMessage("Plante supprimée")
      }).catch(() => showError("Erreur lors de la suppression"))
  }

  return (
    <div>
      <h1 className="text-center mb-4">Catalogue des plantes</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="card card-body mb-5 card-form shadow-sm" onSubmit={handleSubmit}>
        <div className="row g-3 align-items-center">
          <div className="col-md-3">
            <input className="form-control" placeholder="ID" name="id" value={form.id} onChange={handleChange} disabled={editing} required />
          </div>
          <div className="col-md-3">
            <input className="form-control" placeholder="Nom" name="nom" value={form.nom} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="Description" name="description" value={form.description} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <input type="number" className="form-control" placeholder="Prix (€)" name="prix" value={form.prix} onChange={handleChange} required />
          </div>
          <div className="col-md-2">
            <input className="form-control" placeholder="Catégorie" name="categorie" value={form.categorie} onChange={handleChange} />
          </div>
          <div className="col-md-2">
            <input type="number" className="form-control" placeholder="Stock" name="stock" value={form.stock} onChange={handleChange} />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-success" type="submit">{editing ? "Mettre à jour" : "Ajouter"}</button>
          </div>
        </div>
      </form>

      <table className="table table-bordered table-striped table-hover shadow-sm">
        <thead className="table-success">
          <tr>
            <th>ID</th><th>Nom</th><th>Description</th><th>Prix</th><th>Catégorie</th><th>Stock</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plantes.map(plante => (
            <tr key={plante.id}>
              <td>{plante.id}</td>
              <td>{plante.nom}</td>
              <td>{plante.description}</td>
              <td>{plante.prix} €</td>
              <td>{plante.categorie}</td>
              <td>{plante.stock}</td>
              <td>
                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(plante)}>Modifier</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(plante.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />)

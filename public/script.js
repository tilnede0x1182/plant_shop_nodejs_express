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
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

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

  function valider() {
    const panier = JSON.parse(localStorage.getItem("panier")) || [];
    const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));

    if (!utilisateur) {
      setError("Vous devez être connecté pour passer une commande.");
      return;
    }

    // Pour chaque article, récupérer le stock réel et comparer avec la quantité demandée.
    Promise.all(
      panier.map(item =>
        fetch("/api/plantes/" + item.id)
          .then(res => res.json())
          .then(plante => {
            // Si le stock est nul ou insuffisant, on renvoie un flag d'erreur
            if (plante.stock <= 0) {
              return { ...item, erreur: true, stockDispo: 0 };
            } else if (item.quantite > plante.stock) {
              return { ...item, erreur: true, stockDispo: plante.stock };
            } else {
              return { ...item, erreur: false, stockDispo: plante.stock };
            }
          })
      )
    )
    .then(results => {
      // Vérifier si un ou plusieurs articles présentent une erreur de stock
      const itemsAvecErreur = results.filter(item => item.erreur);
      if (itemsAvecErreur.length > 0) {
        // Pour chaque article en erreur, ajuster la quantité au stock disponible (pouvant être 0)
        const updatedPanier = results.map(item =>
          item.erreur ? { ...item, quantite: item.stockDispo } : item
        );
        localStorage.setItem("panier", JSON.stringify(updatedPanier));
        setItems(updatedPanier);
        const noms = itemsAvecErreur.map(item => item.nom).join(", ");
        setError("La quantité de " + noms + " a été ajustée au stock disponible.");
        return; // On arrête la soumission pour que l'utilisateur prenne connaissance du problème
      }

      // Si tout est correct, calculer le total et soumettre la commande
      const total = results.reduce((acc, item) => acc + item.prix * (item.quantite || 1), 0);
      fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilisateur: utilisateur,
          items: results,
          total: total
        })
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(err => {
              throw new Error(err.message || "Erreur serveur");
            });
          }
          return res.json();
        })
        .then(data => {
          setMessage("Commande validée (ID " + data.orderId + ")");
          localStorage.removeItem("panier");
          setItems([]);
          updatePanierCount();
          navigate("/commandes");
        })
        .catch(err => {
          setError("Erreur lors de la validation de la commande : " + err.message);
        });
    })
    .catch(err => {
      setError("Erreur lors de la vérification du stock : " + err.message);
    });
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
      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
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

// Page commandes
function renderOrderListPage() {
  const [orders, setOrders] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));

  React.useEffect(function() {
    if (!utilisateur) {
      setError("Vous devez être connecté pour voir vos commandes.");
      navigate("/")
      return;
    }

    fetch("/api/commandes?userId=" + utilisateur.id + "&role=" + utilisateur.role, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then(function(res) { return res.json(); })
      .then(function(data) { setOrders(data); })
      .catch(function() {
        setError("Erreur lors de la récupération des commandes.");
      });
  }, []);

  if (!utilisateur) {
    return <p>Veuillez vous connecter.</p>;
  }

  if (orders.length === 0) {
    return <p>Aucune commande pour l’instant.</p>;
  }

  return (
    <div className="mt-4">
      <h2>Mes commandes</h2>
      {error && (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
      )}
      {orders.map(function(order) {
        return (
          <div className="card mb-3" key={order.id}>
            <div className="card-body">
              <h5 className="card-title">Commande #{order.id}</h5>
              <p>Total : {order.total_price} €</p>
              <p>Statut : {order.status}</p>
              <p>Passée le : {new Date(order.created_at).toLocaleString()}</p>
              <button
                className="btn btn-sm btn-info"
                onClick={function() { afficherDetailCommande(order.id); }}>
                Voir le détail
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function afficherDetailCommande(orderId) {
  // Exemple : rediriger vers /commande/:id
  navigate("/commande/" + orderId);
}

function renderOrderDetailPage({ orderId }) {
  const [items, setItems] = React.useState([]);
  const [message, setMessage] = React.useState(null)
  const [error, setError] = React.useState(null)
  const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));

  React.useEffect(() => {
    fetch("/api/commandes/" + orderId + "/items")
      .then(res => res.json())
      .then(setItems)
      .catch(() => setError("Erreur lors de la validation de la commande : " + err.message));
  }, [orderId]);

  if (!utilisateur) {
    return <p>Veuillez vous connecter.</p>;
  }

  if (items.length === 0) {
    return <p>Aucun item dans cette commande.</p>;
  }

  return (
    <div className="mt-4">
      <h2>Détails de la commande #{orderId}</h2>
      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <ul className="list-group">
        {items.map((item, i) => (
          <li key={i} className="list-group-item d-flex justify-content-between">
            <span>Plante ID {item.plante_id}</span>
            <span>Quantité : {item.quantite}</span>
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary mt-3" onClick={() => navigate("/commandes")}>
        Retour aux commandes
      </button>
    </div>
  );
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

      const session = JSON.parse(localStorage.getItem("utilisateur"))
      if (session && (session.id == id || session.role === "admin")) {
        const updated = { ...session, ...form }
        localStorage.setItem("utilisateur", JSON.stringify(updated))
        window.dispatchEvent(new Event("utilisateurChange"))
      }
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

          {utilisateur && (
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/commandes")}>
              Mes commandes
            </button>
          )}

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
  }  else if (path === "/commandes") {
    route = React.createElement(renderOrderListPage, null)
  } else if (path.startsWith("/commande/")) {
    const orderId = path.split("/")[2]
    route = React.createElement(renderOrderDetailPage, { orderId: orderId })
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

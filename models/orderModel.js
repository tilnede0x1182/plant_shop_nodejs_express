const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../db/plantes.db");
const db = new sqlite3.Database(dbPath);

// Création d'une commande
function createOrder(userId, items, totalPrice, status, callback) {
  const now = new Date().toISOString();
  db.run(
    "INSERT INTO orders (user_id, total_price, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [userId, totalPrice, status, now, now],
    function(err) {
      if (err) {
        callback(err);
      } else {
        const orderId = this.lastID;
        // Insertion de chaque item dans order_items
        insertOrderItems(orderId, items, callback);
      }
    }
  );
}

// Fonction interne pour insérer les items
function insertOrderItems(orderId, items, callback) {
  const now = new Date().toISOString();
  let remaining = items.length;
  let errorOccurred = false;

  if (remaining === 0) {
    return callback(null, orderId);
  }

  items.forEach(function(item) {
    console.log("→ Insertion item:", item);
    const stmt = `
      INSERT INTO order_items (order_id, plante_id, quantite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(
      stmt,
      [orderId, item.id, item.quantite, now, now],
      function(err) {
        if (errorOccurred) return;
        if (err) {
          console.error("✖ Erreur insert item:", item, err);
          errorOccurred = true;
          return callback(err);
        } else {
          console.log("✔ Item inséré:", item.id, "quantité:", item.quantite);
          decrementPlanteStock(item.id, item.quantite, function(err2) {
            if (errorOccurred) return;
            if (err2) {
              console.error("✖ Erreur stock plante", item.id, ":", err2);
              errorOccurred = true;
              return callback(err2);
            }
            remaining -= 1;
            if (remaining === 0) {
              console.log("✔ Tous les items insérés pour commande ID", orderId);
              callback(null, orderId);
            }
          });
        }
      }
    );
  });
}

// Fonction interne pour décrémenter le stock d’une plante
function decrementPlanteStock(planteId, quantite, callback) {
  const stmt = "UPDATE plantes SET stock = stock - ? WHERE id = ?";
  db.run(stmt, [quantite, planteId], function(err) {
    if (err) {
      console.error("✖ Erreur stock plante id:", planteId, err);
      return callback(err);
    }
    if (this.changes === 0) {
      console.warn("⚠ Aucun stock modifié pour plante id:", planteId);
      return callback(null); // ou return callback(new Error(...)) si vous voulez bloquer
    }
    console.log("✔ Stock décrémenté pour plante id:", planteId);
    callback(null);
  });
}

// Récupérer la liste des commandes pour un user donné (ou toutes si admin)
function getOrdersForUser(userId, isAdmin, callback) {
  if (isAdmin) {
    // L’admin voit toutes les commandes
    db.all("SELECT * FROM orders ORDER BY created_at DESC", [], callback);
  } else {
    // Un simple utilisateur ne voit que ses commandes
    db.all("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId], callback);
  }
}

// Récupérer les items d’une commande donnée
function getOrderItems(orderId, callback) {
  db.all("SELECT * FROM order_items WHERE order_id = ?", [orderId], callback);
}

module.exports = {
  createOrder,
  getOrdersForUser,
  getOrderItems
};

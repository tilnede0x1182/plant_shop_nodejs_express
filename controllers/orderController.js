const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");

function createOrder(req, res) {
  const { utilisateur, items } = req.body;
  if (!utilisateur || !items || items.length === 0) {
    return res.status(400).json({ message: "Données manquantes pour la commande" });
  }
  // Calculer le total de la commande
  const totalPrice = items.reduce((acc, item) => acc + item.prix * (item.quantite || 1), 0);
  orderModel.createOrder(utilisateur.id, items, totalPrice, "En cours", function(err, orderId) {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la création de la commande", error: err });
    }
    res.status(201).json({ message: "Commande créée avec succès", orderId: orderId });
  });
}

function listOrders(req, res) {
  const userId = req.query.userId;
  const role = req.query.role;
  if (!userId || !role) {
    return res.status(401).json({ message: "Utilisateur non connecté" });
  }
  const isAdmin = (role === "admin");
  // Conversion de userId en entier
  orderModel.getOrdersForUser(parseInt(userId, 10), isAdmin, function(err, orders) {
    if (err) {
      console.error("Erreur dans getOrdersForUser :", err);
      return res.status(500).json({ message: "Erreur lecture commandes", error: err });
    }
    res.json(orders);
  });
}

function listOrderItems(req, res) {
  const orderId = req.params.id;
  if (!orderId) {
    return res.status(400).json({ message: "Paramètre manquant" });
  }
  orderModel.getOrderItems(orderId, function(err, items) {
    if (err) {
      return res.status(500).json({ message: "Erreur lecture items", error: err });
    }
    res.json(items);
  });
}

module.exports = {
  createOrder,
  listOrders,
  listOrderItems
};

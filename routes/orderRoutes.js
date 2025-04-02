const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// POST pour créer une commande
router.post("/", orderController.createOrder);

// GET pour voir la liste des commandes (en passant userId et role en query string)
router.get("/", orderController.listOrders);

// GET pour voir les items d’une commande donnée
router.get("/:id/items", orderController.listOrderItems);

module.exports = router;

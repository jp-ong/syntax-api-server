const express = require("express");
const router = express.Router();

const Order = require("../../models/Order");
const Item = require("../../models/Item");

router.get("/", (req, res) => {
  Order.find({}, (err, orders) => {
    if (err)
      return res.json({ err, msg: "Error occurred while fetching orders." });
    return res.status(200).json({ orders });
  });
});

router.get("/order", (req, res) => {
  Order.findById(req.query.id, (err, order) => {
    if (err)
      return res.json({
        err,
        msg: "Error occurred while fetching order data.",
      });
    return order
      ? res.status(200).json({ order })
      : res.json({ msg: "Order does not exist." });
  });
});

router.post("/generate", (req, res) => {
  const { item_id } = req.body;
  const newOrder = new Order({ item: {}, user: {}, ...req.body });
  Item.findById(
    item_id,
    { item_name: 1, item_price: 1, sku: 1 },
    (err, item) => {
      if (err)
        return res.json({
          err,
          msg: "Error occurred while fetching item data.",
        });
      if (!item) return res.status(404).json({ msg: "Item does not exist." });
      newOrder.item = item;
      newOrder.save({}, (err, order) => {
        if (err)
          return res.json({
            err,
            msg: "Error occurred while generating order.",
          });
        res.status(200).json({ order, msg: "Order successfully generated." });
      });
    }
  );
});

router.delete("/delete", (req, res) => {
  Order.findByIdAndDelete(req.query.id, (err, order) => {
    if (err) return res.json({ msg: "Error occurred while deleting order." });
    return res.status(200).json({ order, msg: "Order permanently deleted." });
  });
});

module.exports = router;

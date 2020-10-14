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
  const { user, item, payment_method, shipping_address } = req.body;

  if (!user || !item || !payment_method || !shipping_address)
    return res.json({ msg: "Invalid request. Missing required fields." });

  const { item_id, quantity } = item;
  Item.findById(item_id, (err, item) => {
    if (err) return res.json({ msg: "Something went wrong." });
    if (!item) return res.json({ msg: "Item does not exist." });

    const newOrder = new Order({
      user,
      item: {
        id: item._id,
        name: item.item_name,
        price: item.item_price,
        quantity,
      },
      payment_method,
      shipping_address,
    });

    newOrder.save({}, (err, order) => {
      if (err || !order) return res.json({ msg: "Something went wrong." });

      res.json({ order, msg: "Order placed." });
    });
  });
});

router.delete("/delete", (req, res) => {
  Order.findByIdAndDelete(req.query.id, (err, order) => {
    if (err) return res.json({ msg: "Error occurred while deleting order." });
    return res.status(200).json({ order, msg: "Order permanently deleted." });
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();

const Order = require("../../models/Order");
const Item = require("../../models/Item");
const whitelist = require("../../middleware/whitelist");

router.get("/", whitelist, (req, res) => {
  Order.find({}, (err, orders) => {
    if (err)
      return res
        .status(400)
        .json({ err, msg: "Error occurred while fetching orders." });
    return res.status(200).json({ orders });
  });
});

router.get("/order", whitelist, (req, res) => {
  Order.findById(req.query.id, (err, order) => {
    if (err)
      return res.json({
        err,
        msg: "Error occurred while fetching order data.",
      });
    return order
      ? res.status(200).json({ order })
      : res.status(404).json({ msg: "Order does not exist." });
  });
});

router.post("/generate", whitelist, (req, res) => {
  const { user, item, payment_method, shipping_address } = req.body;

  if (!user || !item || !payment_method || !shipping_address)
    return res
      .status(400)
      .json({ msg: "Invalid request. Missing required fields." });

  const { _id, quantity } = item;
  Item.findById(_id, (err, item) => {
    if (err) return res.status(400).json({ msg: "Something went wrong." });
    if (!item) return res.status(404).json({ msg: "Item does not exist." });

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

    newOrder.save({}, whitelist, (err, order) => {
      if (err || !order)
        return res.status(400).json({ msg: "Something went wrong." });

      res.json({ order, msg: "Order placed." });
    });
  });
});

router.delete("/delete", whitelist, (req, res) => {
  Order.findByIdAndDelete(req.query.id, (err, order) => {
    if (err)
      return res
        .status(400)
        .json({ msg: "Error occurred while deleting order." });
    return res.status(200).json({ order, msg: "Order permanently deleted." });
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();

const Order = require("../../models/Order");
const Item = require("../../models/Item");
const User = require("../../models/User");

router.get("/getAll", (req, res) => {
  Order.find({}, (err, orders) => {
    if (err)
      return res
        .status(400)
        .json({ err, msg: "ERROR OCCURRED WHILE FETCHING ORDERS" });
    return res.status(200).json(orders);
  });
});

router.get("/getOne", (req, res) => {
  Order.findById(req.query.id, (err, order) => {
    if (err)
      return res
        .status(400)
        .json({ err, msg: "ERROR OCCURRED WHILE FETCHING ORDER" });
    return order
      ? res.status(200).json(order)
      : res.status(404).json({ msg: "ORDER NOT FOUND" });
  });
});

router.post("/generateOrder", (req, res) => {
  const { item_id, user_id } = req.body;

  if (!item_id || !user_id)
    return res.status(400).json({ msg: "MISSING ITEM OR USER" });

  const newOrder = new Order({ item: {}, user: {}, ...req.body });
  User.findById(
    user_id,
    { fullname: 1, full_address: 1, email: 1, mobile_number: 1 },
    (err, user) => {
      if (err)
        return res
          .status(400)
          .json({ err, msg: "ERROR OCCURRED WHILE FETCHING USER" });
      if (!user) return res.status(404).json({ msg: "INVALID USER ID" });
      newOrder.user = user;

      Item.findById(
        item_id,
        { item_name: 1, item_price: 1, sku: 1 },
        (err, item) => {
          if (err)
            return res
              .status(400)
              .json({ err, msg: "ERROR OCCURRED WHILE FETCHING ITEM" });
          if (!user) return res.status(404).json({ msg: "INVALID ITEM ID" });
          newOrder.item = item;

          newOrder.save({}, (err, order) => {
            if (err)
              return res
                .status(400)
                .json({ err, msg: "ERROR OCCURRED WHILE GENERATING ORDER" });

            res.status(200).json(order);
          });
        }
      );
    }
  );
});

router.delete("/deleteOne", (req, res) => {
  Order.findByIdAndDelete(req.query.id, (err, order) => {
    if (err)
      return res
        .status(400)
        .json({ msg: "ERROR OCCURRED WHILE DELETING ORDER" });
    return res.status(200).json({ order, msg: "ORDER PERMANENTLY DELETED" });
  });
});

module.exports = router;

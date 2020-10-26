const express = require("express");
const router = express.Router();

const Order = require("../../models/Order");
const Item = require("../../models/Item");

const whitelist = require("../../middleware/whitelist");

router.get("/", whitelist, (req, res) => {
  try {
    Order.find({ is_deleted: false }, (error, orders) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          msg: "Error occurred while fetching Orders.",
          status: 400,
          error,
        });
      } else {
        return orders.length !== 0
          ? res
              .status(200)
              .json({ results: orders.length, status: 200, orders })
          : res
              .status(404)
              .json({ msg: "Orders database is empty.", status: 404 });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error.", status: 500, error });
  }
});

router.get("/list", whitelist, (req, res) => {
  try {
    const { list } = req.body;
    Order.find({ is_deleted: false }, (error, orders) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          msg: "Error occurred while fetching Orders.",
          status: 400,
          error,
        });
      } else {
        if (orders.length === 0) {
          return res.status(404).json({ status: 404, msg: "No orders found." });
        } else {
          const ordersList = orders.filter((order) =>
            list.includes(order._id.toString())
          );

          if (ordersList.length === 0) {
            return res
              .status(404)
              .json({ status: 404, msg: "No orders found." });
          } else {
            return res.status(200).json({
              results: ordersList.length,
              status: 200,
              orders: ordersList,
            });
          }
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error.", status: 500, error });
  }
});

router.get("/order", whitelist, (req, res) => {
  try {
    Order.findOne({ _id: req.query.id, is_deleted: false }, (error, order) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          msg: "Error occurred while fetching Order.",
          status: 400,
          error,
        });
      } else {
        return order
          ? res.status(200).json({ status: 200, order })
          : res.status(404).json({ msg: "Order not found.", status: 404 });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", status: 500, error });
  }
});

router.post("/generate", whitelist, (req, res) => {
  try {
    const { user, item, payment_method, shipping_address } = req.body;

    if (!user || !item || !payment_method || !shipping_address)
      return res
        .status(400)
        .json({ msg: "Missing required fields.", status: 400 });

    const { id, quantity } = item;

    Item.findOne({ _id: id, is_hidden: false }, (error, item) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          msg: "Error occured while fetching Item.",
          status: 400,
          error,
        });
      }

      if (!item)
        return res.status(404).json({ msg: "Item not found.", status: 404 });

      const newOrder = new Order({
        user,
        item: {
          id: item.id,
          name: item.item_name,
          price: item.item_price,
          quantity,
        },
        payment_method,
        shipping_address,
      });

      newOrder.save({}, (error, order) => {
        if (error) {
          console.error(error);
          return res
            .status(400)
            .json({ msg: "Something went wrong.", status: 400 });
        } else if (!order) {
          return res.status(400).json({
            msg: "Order could not be processed at this time. Please try again.",
            status: 400,
          });
        } else {
          return res
            .status(201)
            .json({ msg: "Order successfully placed.", status: 201, order });
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error.", status: 500, error });
  }
});

router.patch("/delete", whitelist, (req, res) => {
  try {
    Order.findOneAndUpdate(
      { _id: req.query.id, is_deleted: false },
      { is_deleted: true },
      { new: true },
      (error, order) => {
        if (error) {
          return res.status(400).json({
            msg: "Error occured while fetching Order.",
            status: 400,
            error,
          });
        } else if (!order) {
          return res.status(404).json({ msg: "Order not found.", status: 404 });
        } else {
          return res
            .status(200)
            .json({ msg: "Order deleted.", status: 200, order });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error.", status: 500, error });
  }
});

module.exports = router;

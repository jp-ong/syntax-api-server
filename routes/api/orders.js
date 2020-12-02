const express = require("express");
const router = express.Router();

const Order = require("../../models/Order");
const Item = require("../../models/Item");

const whitelist = require("../../middleware/whitelist");

const capitalize = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

router.get("/", whitelist, (req, res) => {
  try {
    Order.find(
      { is_deleted: false },
      null,
      { sort: { created_at: -1 } },
      (error, orders) => {
        if (error) {
          console.error(error);
          return res.status(400).json({
            msg: "Error occurred while fetching Orders.",
            status: 400,
            error,
          });
        } else {
          return orders.length === 0
            ? res
                .status(404)
                .json({ msg: "Orders database is empty.", status: 404 })
            : res
                .status(200)
                .json({ results: orders.length, status: 200, orders });
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

router.get("/user", whitelist, (req, res) => {
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
        if (orders.length === 0) {
          return res.status(404).json({ status: 404, msg: "No orders found." });
        } else {
          const ordersList = orders.filter(
            (order) => order.user.id.toString() === req.query.id
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

router.get("/:year/:month/:date", whitelist, (req, res) => {
  try {
    const { year, month, date } = req.params;
    const queryDate = new Date(year, month - 1, date);
    Order.find(
      {
        is_deleted: false,
        created_at: {
          $gte: queryDate,
          $lt: new Date(queryDate).setDate(queryDate.getDate() + 1),
        },
      },
      null,
      { sort: { created_at: -1 } },
      (error, orders) => {
        if (error) {
          return res
            .status(400)
            .json({ msg: "Invalid syntax.", status: 400, error });
        } else {
          return orders.length === 0
            ? res.status(404).json({
                msg: `No orders found on ${queryDate.toLocaleDateString()}`,
                status: 404,
              })
            : res.status(200).json({
                results: orders.length,
                status: 200,
                date: queryDate.toLocaleDateString(),
                orders,
              });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", status: 500, error });
  }
});

router.get("/:payStatus/:ordStatus", whitelist, (req, res) => {
  try {
    if (
      (req.params.payStatus !== "processing" &&
        req.params.payStatus !== "paid" &&
        req.params.payStatus !== "cancelled") ||
      (req.params.ordStatus !== "processing" &&
        req.params.ordStatus !== "delivered" &&
        req.params.ordStatus !== "cancelled") ||
      !req.params.payStatus ||
      !req.params.ordStatus
    ) {
      return res
        .status(400)
        .json({ msg: "Invalid/Missing order payment status.", status: 400 });
    } else {
      Order.find(
        {
          is_deleted: false,
          payment_status: capitalize(req.params.payStatus),
          order_status: capitalize(req.params.ordStatus),
        },
        null,
        { sort: { created_at: -1 } },
        (error, orders) => {
          if (error) {
            return res.status(400).json({
              msg: `Error occurred while fetching orders`,
              status: 400,
            });
          } else {
            return orders.length === 0
              ? res.status(404).json({
                  msg: `No orders with specified status at the moment.`,
                  status: 404,
                  payment_status: req.params.payStatus,
                  order_status: req.params.ordStatus,
                })
              : res.status(200).json({
                  results: orders.length,
                  status: 200,
                  payment_status: req.params.payStatus,
                  order_status: req.params.ordStatus,
                  orders,
                });
          }
        }
      );
    }
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
          item.reserved_stock += quantity;
          item.save({}, (error, item) => {
            return res
              .status(201)
              .json({ msg: "Order successfully placed.", status: 201, order });
          });
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

router.patch("/delivered", whitelist, (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).json({ msg: "Missing order id.", status: 400 });
    } else {
      Order.findOne(
        { _id: req.query.id, is_deleted: false },
        (error, order) => {
          if (error) {
            return res
              .status(400)
              .json({ msg: "Invalid order id.", status: 400, error });
          } else if (!order) {
            return res
              .status(404)
              .json({ msg: "Order does not exist.", status: 404 });
          } else if (order.order_status === "Delivered") {
            return res.status(400).json({
              msg: "Order was already delivered.",
              status: 400,
              delivered_on: order.delivered_on,
            });
          } else {
            Item.findOne(
              { _id: order.item.id, is_hidden: false },
              (error, item) => {
                if (error) {
                  return res.status(400).json({
                    msg: "Invalid item in in order.",
                    status: 400,
                    error,
                  });
                } else if (!item) {
                  return res
                    .status(404)
                    .json({ msg: "Item in order not found.", status: 404 });
                } else if (item.item_stock < order.item.quantity) {
                  return res.status(400).json({
                    msg: "Not enough item stock to complete the delivery.",
                    status: 400,
                    item_stock: item.item_stock,
                    ordered_quantity: order.item.quantity,
                  });
                } else {
                  order.order_status = "Delivered";
                  order.delivered_on = new Date();
                  order.save({}, (error, order) => {
                    if (error) {
                      return res.status(500).json({
                        msg: "Error occurred while updating order status.",
                        status: 500,
                        error,
                      });
                    } else {
                      item.reserved_stock -= order.item.quantity;
                      item.item_stock -= order.item.quantity;
                      item.save({}, (error, item) => {
                        if (error) {
                          return res.status(500).json({
                            msg: "Error occurred while updating item stocks.",
                            status: 500,
                            error,
                          });
                        } else {
                          return res.status(200).json({
                            msg:
                              "Order status and Item stocks successfully updated.",
                            order: {
                              id: order._id,
                              order_status: order.order_status,
                            },
                            item: {
                              id: item._id,
                              item_stock: item.item_stock,
                              reserved_stock: item.reserved_stock,
                            },
                          });
                        }
                      });
                    }
                  });
                }
              }
            );
          }
        }
      );
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", status: 500, error });
  }
});

router.patch("/paid", whitelist, (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).json({ msg: "Missing order id.", status: 400 });
    } else {
      Order.findOne({ _id: req.query.id }, (error, order) => {
        if (error) {
          return res
            .status(400)
            .json({ msg: "Invalid order id.", status: 400, error });
        } else if (!order) {
          return res
            .status(404)
            .json({ msg: "Order does not exist.", status: 404 });
        } else if (order.payment_status === "Paid") {
          return res.status(400).json({
            msg: "Order was already paid for.",
            status: 400,
            paid_on: order.paid_on,
          });
        } else {
          order.payment_status = "Paid";
          order.paid_on = new Date();
          order.save({}, (error, order) => {
            if (error) {
              return res.status(400).json({
                msg: "Error occurred while saving payment status.",
                status: 400,
                error,
              });
            } else {
              return res.status(200).json({
                msg: "Order payment status saved.",
                status: 200,
                payment_status: order.payment_status,
                order,
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", status: 500, error });
  }
});

router.patch("/cancel", whitelist, (req, res) => {
  try {
    Order.findOneAndUpdate(
      {
        _id: req.query.id,
        is_deleted: false,
        payment_status: "Processing",
        order_status: "Processing",
      },
      {
        payment_status: "Cancelled",
        order_status: "Cancelled",
        paid_on: null,
        delivered_on: null,
      },
      { new: true },
      (error, order) => {
        if (error) {
          return res.status(400).json({
            msg: "Error occured while fetching Order.",
            status: 400,
            error,
          });
        } else if (!order) {
          return res
            .status(404)
            .json({ msg: "Order could not be cancelled.", status: 404 });
        } else {
          Item.findById(order.item.id, (error, item) => {
            item.reserved_stock -= order.item.quantity;
            item.save({}, (error, item) => {
              return res.status(200).json({
                msg: "Order successfully cancelled.",
                status: 200,
                order,
              });
            });
          });
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

router.patch("/delete", whitelist, (req, res) => {
  try {
    Order.findOne({ _id: req.query.id, is_deleted: false }, (error, order) => {
      if (error) {
        return res.status(400).json({ msg: "Invalid Order ID.", status: 400 });
      } else if (!order) {
        return res
          .status(404)
          .json({ msg: "Order does not exist.", status: 404 });
      } else if (
        order.order_status === "Processing" ||
        order.payment_status === "Processing"
      ) {
        return res
          .status(400)
          .json({ msg: "Processing Orders cannot be deleted.", status: 400 });
      } else {
        order.is_deleted = true;
        order.save({}, (error, order) => {
          return res
            .status(200)
            .json({ msg: "Order successfully deleted.", status: 200, order });
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error.", status: 500, error });
  }
});

router.patch("/admin/delete", whitelist, (req, res) => {
  try {
    Order.findOne({ _id: req.query.id, is_deleted: false }, (error, order) => {
      if (error) {
        return res.status(400).json({ msg: "Invalid Order ID.", status: 400 });
      } else if (!order) {
        return res
          .status(404)
          .json({ msg: "Order does not exist.", status: 404 });
      } else {
        order.is_deleted = true;
        order.save({}, (error, order) => {
          return res
            .status(200)
            .json({ msg: "Order successfully deleted.", status: 200, order });
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error.", status: 500, error });
  }
});

module.exports = router;

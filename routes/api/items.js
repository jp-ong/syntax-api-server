const express = require("express");
const router = express.Router();

const Item = require("../../models/Item");
const whitelist = require("../../middleware/whitelist");

const GET_ALL = {
  client: {
    item_name: 1,
    item_price: 1,
    category: 1,
    tags: 1,
    thumbnail: 1,
  },
  inventory: {
    item_description: 0,
    thumbnail: 0,
    images: 0,
  },
};

const GET_ONE = {
  client: {
    item_stock: 0,
    reserved_stock: 0,
    sku: 0,
    is_hidden: 0,
  },
  inventory: {},
};

router.get("/", whitelist, (req, res) => {
  let PROJECT = null;

  switch (req.query.type) {
    case "client":
      PROJECT = GET_ALL.client;
      break;
    case "inventory":
      PROJECT = GET_ALL.inventory;
      break;
    case "super":
      PROJECT = {};
      break;
    default:
      return res
        .status(400)
        .json({ msg: "Invalid/Missing type parameter.", status: 400 });
  }

  try {
    Item.find({ is_hidden: false }, PROJECT, (error, items) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          msg: "Error occurred while fetching Items.",
          status: 400,
          error,
        });
      } else {
        return items.length !== 0
          ? res.status(200).json({ results: items.length, status: 200, items })
          : res
              .status(404)
              .json({ msg: "Items database is empty.", status: 404 });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error.", status: 500, error });
  }
});

router.get("/item", whitelist, (req, res) => {
  let PROJECT = null;

  switch (req.query.type) {
    case "client":
      PROJECT = GET_ONE.client;
      break;
    case "inventory":
      PROJECT = GET_ONE.inventory;
      break;
    case "super":
      PROJECT = {};
      break;
    default:
      return res
        .status(400)
        .json({ msg: "Invalid/Missing type parameter.", status: 400 });
  }

  try {
    Item.findOne(
      { _id: req.query.id, is_hidden: false },
      PROJECT,
      (error, item) => {
        if (error) {
          console.error(error);
          return res.status(400).json({
            msg: "Error occurred while fetching Item.",
            status: 400,
            error,
          });
        } else {
          return item
            ? res.status(200).json({ status: 200, item })
            : res.status(404).json({ msg: "Item not found.", status: 404 });
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

router.post("/post", whitelist, (req, res) => {
  try {
    const newItem = new Item(req.body);
    newItem.save({}, (error, item) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          msg: "Error occurred while posting Item.",
          status: 400,
          error,
        });
      } else {
        return res
          .status(201)
          .json({ msg: "Item successfully created.", status: 201, item });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error.", status: 500, error });
  }
});

router.patch("/edit", whitelist, (req, res) => {
  try {
    Item.findOneAndUpdate(
      { _id: req.query.id, is_hidden: false },
      req.body,
      { new: true },
      (error, item) => {
        if (error) {
          console.error(error);
          return res.status(400).json({
            msg: "Error occurred while editing Item.",
            status: 400,
            error,
          });
        } else {
          return item
            ? res
                .status(200)
                .json({ msg: "Changes successfully saved.", status: 200, item })
            : res.status(404).json({ msg: "Item not found.", status: 404 });
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
  Item.findOneAndUpdate(
    { _id: req.query.id, is_hidden: false },
    { is_hidden: true },
    { new: true },
    (error, item) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          msg: "Error occurred while deleting Item.",
          status: 400,
          error,
        });
      } else {
        return item
          ? res.status(200).json({ msg: "Item deleted.", status: 200, item })
          : res.status(404).json({ msg: "Item not found.", status: 404 });
      }
    }
  );
});

module.exports = router;

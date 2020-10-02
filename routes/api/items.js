const express = require("express");
const router = express.Router();

const Item = require("../../models/Item");

const GET_ALL = {
  client: {
    item_id: 1,
    item_name: 1,
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
    thumbnail: 0,
    item_stock: 0,
    reserved_stock: 0,
    sku: 0,
    is_hidden: 0,
  },
  inventory: {},
};

router.get("/getAll/:type", (req, res) => {
  const { client, inventory } = GET_ALL;
  switch (req.params.type) {
    case "client":
      return Item.find({ is_hidden: false }, client, (err, items) => {
        if (err)
          return res
            .status(400)
            .json({ err, msg: "Error occurred while fetching items data." });
        return items.length === 0
          ? res
              .status(200)
              .json({ msg: "There are currently no items in the database." })
          : res.status(200).json(items);
      });

    case "inventory":
      return Item.find({}, inventory, (err, items) => {
        if (err)
          return res
            .status(400)
            .json({ err, msg: "Error occurred while fetching items data." });
        return items.length === 0
          ? res
              .status(200)
              .json({ msg: "There are currently no items in the database." })
          : res.status(200).json(items);
      });

    case "super":
      return Item.find({}, (err, items) => {
        if (err)
          return res
            .status(400)
            .json({ err, msg: "Error occurred while fetching items data." });
        return items.length === 0
          ? res
              .status(200)
              .json({ msg: "There are currently no items in the database." })
          : res.status(200).json(items);
      });

    default:
      return res.status(400).json({ msg: "Invalid system type parameter." });
  }
});

router.get("/getOne/:type", (req, res) => {
  const { client, inventory } = GET_ONE;
  switch (req.params.type) {
    case "client":
      return Item.findOne(
        { _id: req.query.id, is_hidden: false },
        client,
        (err, item) => {
          if (err)
            return res.status(400).json({
              err,
              msg: "Error occurred while fetching item data.",
            });
          return item
            ? res.status(200).json(item)
            : res.status(404).json({ msg: "Item does not exist." });
        }
      );
    case "inventory":
      return Item.findById(req.query.id, inventory, (err, item) => {
        if (err)
          return res.status(400).json({
            err,
            msg: "Error occurred while fetching item data.",
          });
        return item
          ? res.status(200).json(item)
          : res.status(404).json({ msg: "Item does not exist." });
      });
    default:
      return res.status(400).json({ msg: "Invalid system type parameter." });
  }
});

router.post("/postOne", (req, res) => {
  const newItem = new Item(req.body);
  newItem.save({}, (err, item) => {
    if (err)
      return res
        .status(400)
        .json({ err, msg: "Error occurred while posting item." });
    return res.status(200).json({ item, msg: "Item posted successfully." });
  });
});

router.post("/editOne", (req, res) => {
  Item.findByIdAndUpdate(req.query.id, req.body, { new: true }, (err, item) => {
    if (err)
      return res
        .status(400)
        .json({ err, msg: "Error occurred while editing item data." });
    return item
      ? res.status(200).json({ item, msg: "Changes successfully saved." })
      : res.status(404).json({ msg: "Item does not exist." });
  });
});

router.post("/disableOne", (req, res) => {
  Item.findByIdAndUpdate(
    req.query.id,
    { is_hidden: true },
    { new: true },
    (err, item) => {
      if (err)
        return res.status(400).json({ err, msg: "Something went wrong." });
      return item
        ? res
            .status(200)
            .json({ item, msg: "Item successfully disabled temporarily." })
        : res.status(404).json({ msg: "Item does not exist." });
    }
  );
});

router.post("/enableOne", (req, res) => {
  Item.findByIdAndUpdate(
    req.query.id,
    { is_hidden: false },
    { new: true },
    (err, item) => {
      if (err)
        return res.status(400).json({ err, msg: "Something went wrong." });
      return item
        ? res
            .status(200)
            .json({ item, msg: "Item successfully set to enabled." })
        : res.status(404).json({ msg: "Item does not exist." });
    }
  );
});

router.delete("/deleteOne", (req, res) => {
  Item.findByIdAndDelete(req.query.id, (err, item) => {
    if (err)
      return res
        .status(400)
        .json({ err, msg: "Error occurred while deleting item." });
    return item
      ? res.status(200).json({ item, msg: "Item permanently deleted." })
      : res.status(404).json({ msg: "Item does not exist." });
  });
});

module.exports = router;

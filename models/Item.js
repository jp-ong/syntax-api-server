const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      default: "",
    },
    item_description: {
      type: String,
      default: "",
    },
    item_price: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    images: {
      type: Array,
      default: [],
    },
    category: {
      type: String,
      default: "",
    },
    tags: {
      type: Array,
      default: [],
    },
    item_stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reserved_stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      default: "",
    },
    is_hidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

itemSchema.set("toJSON", {
  transform: (doc, result) => {
    const id = result._id;
    delete result._id;
    return {
      item_id: id,
      ...result,
    };
  },
});

module.exports = Item = mongoose.model("Item", itemSchema);

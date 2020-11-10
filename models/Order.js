const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: Object, default: {} },
    item: { type: Object, default: {} },
    shipping_address: Object,
    payment_method: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      default: "Processing",
    },
    paid_on: {
      type: Date,
      default: null,
    },
    delivered_on: {
      type: Date,
      default: null,
    },
    order_status: {
      type: String,
      default: "Processing",
    },
    fee: {
      type: Number,
      default: 40,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = Order = mongoose.model("Order", orderSchema);

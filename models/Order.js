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
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at:" } }
);

orderSchema.set("toJSON", {
  transform: (doc, result) => {
    const id = result._id;
    delete result._id;
    return {
      order_id: id,
      ...result,
    };
  },
});

module.exports = Order = mongoose.model("Order", orderSchema);

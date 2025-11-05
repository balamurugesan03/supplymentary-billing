// backend/models/Bill.js
import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    billNo: { type: String, required: true },
    date: { type: Date, default: Date.now },
    customerName: { type: String },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        qty: Number,
        price: Number,
        gst: Number,
        total: Number,
      },
    ],
    grandTotal: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);

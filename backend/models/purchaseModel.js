import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    gstPercent: { type: Number, default: 0 },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        gstPercent: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);

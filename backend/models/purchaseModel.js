import mongoose from "mongoose";
const purchaseSchema = new mongoose.Schema({
  supplierName: String,
  invoiceNumber: String,
  purchaseDate: Date,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  brandName: String,
  flavour: String,
  quantity: Number,
  unitPrice: Number,
  gstPercent: Number,
  batchNumber: String,
  expiryDate: Date,
  totalAmount: Number,
},
  { timestamps: true }
);


const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;

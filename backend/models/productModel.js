import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: String,
  flavour: String,
  quantity: String,
  count: { type: Number, default: 0 },   // This will hold actual stock
  mrp: Number,
  salesPrice: Number,
  gstPercent: Number,
},
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);
export default Product;

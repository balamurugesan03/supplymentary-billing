import Purchase from "../models/purchaseModel.js";

import Product from "../models/productModel.js";


// ✅ Add Purchase (with multiple products)
export const addPurchase = async (req, res) => {
  try {
    const { products, supplierName, invoiceNumber, purchaseDate, gstPercent } =
      req.body;

    let totalAmount = 0;

    // loop through each product
    for (const p of products) {
      const lineTotal = p.quantity * p.unitPrice;
      const gst = (lineTotal * (p.gstPercent || gstPercent || 0)) / 100;
      p.totalAmount = lineTotal + gst;
      totalAmount += p.totalAmount;

      // update stock count for each product
      await Product.findByIdAndUpdate(p.productId, {
        $inc: { count: p.quantity },
      });
    }

    const purchase = new Purchase({
      supplierName,
      invoiceNumber,
      purchaseDate,
      gstPercent,
      products,
      totalAmount,
    });

    await purchase.save();
    res.json({ message: "Purchase Added & Stock Updated ✅", purchase });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Purchases
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("products.productId", "productName flavour brandName")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Purchase
export const updatePurchase = async (req, res) => {
  try {
    const updated = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Purchase
export const deletePurchase = async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const filterPurchasesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const purchases = await Purchase.find({
      purchaseDate: { $gte: start, $lte: end }
    }).populate("products.productId", "productName flavour brandName");

    res.json(purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to filter purchases" });
  }
};

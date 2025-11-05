import Purchase from "../models/purchaseModel.js";

import Product from "../models/productModel.js";

export const addPurchase = async (req, res) => {
  try {
    const { products, ...purchaseData } = req.body;

    
    for (const product of products) {
      const newPurchase = {
        ...purchaseData,
        productId: product.productId,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
      };

     
      await Purchase.create(newPurchase);

    
      await Product.findByIdAndUpdate(
        product.productId,
        { $inc: { count: product.quantity } }
      );
    }

    res.json({ message: "Purchase Added & Stock Updated ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("productId", "productName flavour brandName") 
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Purchase
export const updatePurchase = async (req, res) => {
  try {
    const updated = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Purchase
export const deletePurchase = async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const filterPurchasesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include full day

    const purchases = await Purchase.find({
      purchaseDate: { $gte: start, $lte: end }
    }).populate("productId", "productName flavour brandName");

    res.json(purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to filter purchases" });
  }
};

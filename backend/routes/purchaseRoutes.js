import express from "express";
import {
  addPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase,
  filterPurchasesByDate
} from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/", addPurchase);
router.get("/", getPurchases);
router.put("/:id", updatePurchase);
router.delete("/:id", deletePurchase);
router.get("/filter", filterPurchasesByDate);


export default router;

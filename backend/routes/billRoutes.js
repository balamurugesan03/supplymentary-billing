// backend/routes/billRoutes.js
import express from "express";
import { addBill, getBills, filterBills, sendBillEmail } from "../controllers/billController.js";

const router = express.Router();

router.post("/", addBill);
router.get("/", getBills);
router.get("/filter", filterBills);
router.post("/send-email", sendBillEmail);

export default router;

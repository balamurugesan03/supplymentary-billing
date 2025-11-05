import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/today-sales", getDashboardData);

export default router;

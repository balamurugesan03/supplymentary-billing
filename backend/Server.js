import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import billRoutes from "./routes/billRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const startServer = async () => {
  await connectDB();

  app.use("/api/products", productRoutes);
  app.use("/api/purchases", purchaseRoutes);
  app.use("/api/bills", billRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();

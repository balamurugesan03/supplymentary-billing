import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout";
import ProductPage from "./pages/ProductPage";
import PurchasePage from "./pages/PurchasePage";
import PurchaseHistory from "./pages/PurchaseHistory";
import BillingPage from "./pages/BillingPage";
import BillingHistoryPage from "./pages/BillingHistoryPage"
import DashboardPage from "./pages/DashboardPage";



const App = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/products" element={<ProductPage />} />
         
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
           <Route path="/billing" element={<BillingPage />} />
           <Route path="/billing-history" element={<BillingHistoryPage />} />
           <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="*" element={<ProductPage />} /> {/* Default */}
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;

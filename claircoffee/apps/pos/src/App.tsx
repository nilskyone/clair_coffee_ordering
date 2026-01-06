import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { ToastStack } from "./components/ToastStack";
import { MenuPage } from "./pages/MenuPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ReceiptPage } from "./pages/ReceiptPage";
import { ShiftOpenPage } from "./pages/ShiftOpenPage";
import { ShiftClosePage } from "./pages/ShiftClosePage";
import { OrderSearchPage } from "./pages/OrderSearchPage";
import { RefundPage } from "./pages/RefundPage";
import { VoidPage } from "./pages/VoidPage";
import { getPosMode } from "./hooks/usePosMode";
import { useOfflineSync } from "./hooks/useOfflineSync";

const PosRoutes = () => (
  <>
    <Route path="/shift/open" element={<ShiftOpenPage />} />
    <Route path="/shift/close" element={<ShiftClosePage />} />
    <Route path="/orders/search" element={<OrderSearchPage />} />
    <Route path="/orders/:id/refund" element={<RefundPage />} />
    <Route path="/orders/:id/void" element={<VoidPage />} />
  </>
);

const App: React.FC = () => {
  const mode = getPosMode();
  useOfflineSync();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/receipt/:orderId" element={<ReceiptPage />} />
          {mode === "POS" && <PosRoutes />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastStack />
    </div>
  );
};

export default App;

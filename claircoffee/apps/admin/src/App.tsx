import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MenuPage } from "./pages/MenuPage";
import { InventoryPage } from "./pages/InventoryPage";
import { RecipesPage } from "./pages/RecipesPage";
import { PurchaseOrdersPage } from "./pages/PurchaseOrdersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { useAuthStore } from "./store/auth";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 className="text-xl font-semibold text-espresso-900">Clair Coffee Admin</h1>
      <nav className="flex flex-wrap gap-4 text-sm text-slate-600">
        <Link to="/admin/dashboard" className="hover:text-espresso-700">
          Dashboard
        </Link>
        <Link to="/admin/menu" className="hover:text-espresso-700">
          Menu
        </Link>
        <Link to="/admin/inventory" className="hover:text-espresso-700">
          Inventory
        </Link>
        <Link to="/admin/recipes" className="hover:text-espresso-700">
          Recipes
        </Link>
        <Link to="/admin/purchase-orders" className="hover:text-espresso-700">
          Purchase Orders
        </Link>
        <Link to="/admin/reports" className="hover:text-espresso-700">
          Reports
        </Link>
      </nav>
    </header>
    <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
  </div>
);

const App: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          token ? (
            <Layout>
              <Routes>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="recipes" element={<RecipesPage />} />
                <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default App;

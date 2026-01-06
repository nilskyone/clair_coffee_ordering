import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { KitchenBoard } from "./pages/KitchenBoard";
import { KitchenDisplay } from "./pages/KitchenDisplay";
import { useKitchenSocket } from "./hooks/useKitchenSocket";

const App: React.FC = () => {
  useKitchenSocket();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-espresso-900">Clair Coffee Kitchen</h1>
        <nav className="flex gap-4 text-sm text-slate-600">
          <Link to="/kitchen" className="hover:text-espresso-700">
            Queue
          </Link>
          <Link to="/kitchen/display" className="hover:text-espresso-700">
            Display
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/kitchen" element={<KitchenBoard />} />
          <Route path="/kitchen/display" element={<KitchenDisplay />} />
          <Route path="*" element={<Navigate to="/kitchen" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;

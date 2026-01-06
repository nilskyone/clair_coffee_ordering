import React from "react";
import { Link } from "react-router-dom";
import { Input } from "@claircoffee/ui";
import { useAuthStore } from "../store/auth";
import { getPosMode } from "../hooks/usePosMode";

export const Header: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const mode = getPosMode();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-espresso-900">Clair Coffee {mode}</h1>
        <nav className="flex flex-wrap gap-3 text-sm text-slate-600">
          <Link to="/" className="hover:text-espresso-700">
            Menu
          </Link>
          <Link to="/cart" className="hover:text-espresso-700">
            Cart
          </Link>
          <Link to="/checkout" className="hover:text-espresso-700">
            Checkout
          </Link>
          {mode === "POS" && (
            <>
              <Link to="/shift/open" className="hover:text-espresso-700">
                Open Shift
              </Link>
              <Link to="/shift/close" className="hover:text-espresso-700">
                Close Shift
              </Link>
              <Link to="/orders/search" className="hover:text-espresso-700">
                Order Search
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="min-w-[240px]">
        <Input
          label="Auth Token"
          placeholder="Paste JWT token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
      </div>
    </header>
  );
};

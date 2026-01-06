import React from "react";
import { Card } from "@claircoffee/ui";

export const DashboardPage: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold text-espresso-900">Dashboard</h2>
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { label: "Today's Sales", value: "₱12,500" },
        { label: "Open Orders", value: "18" },
        { label: "Low Stock Alerts", value: "5" }
      ].map((card) => (
        <Card key={card.label}>
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="text-2xl font-semibold text-espresso-900">{card.value}</p>
        </Card>
      ))}
    </div>
  </div>
);

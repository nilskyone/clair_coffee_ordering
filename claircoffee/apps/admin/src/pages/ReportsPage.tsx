import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";
import { useAuthStore } from "../store/auth";

const branchId = 1;

export const ReportsPage: React.FC = () => {
  const api = useApiClient();
  const token = useAuthStore((state) => state.token);
  const { data: sales = [] } = useQuery({
    queryKey: ["reports", "sales"],
    queryFn: () => api.getReportSalesDaily(branchId)
  });

  const downloadCsv = async (path: string, filename: string) => {
    const defaultApiBaseUrl =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? `${window.location.origin}/api`
        : "http://localhost:3001";
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-espresso-900">Reports</h2>
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Daily Sales</h3>
        <ul className="text-sm text-slate-600">
          {sales.map((row: any, index: number) => (
            <li key={index}>
              {row.order_date}: ₱{row.gross_total}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => downloadCsv(`/v1/reports/sales/daily?branchId=${branchId}&format=csv`, "sales.csv")}
          >
            Download Sales CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => downloadCsv(`/v1/reports/best-sellers?branchId=${branchId}&format=csv`, "best-sellers.csv")}
          >
            Best Sellers CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => downloadCsv(`/v1/reports/time-of-day?branchId=${branchId}&format=csv`, "time-of-day.csv")}
          >
            Time of Day CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => downloadCsv(`/v1/reports/inventory-usage?branchId=${branchId}&format=csv`, "inventory-usage.csv")}
          >
            Inventory Usage CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => downloadCsv(`/v1/reports/cogs-margin?branchId=${branchId}&format=csv`, "cogs-margin.csv")}
          >
            COGS & Margin CSV
          </Button>
        </div>
      </Card>
    </div>
  );
};

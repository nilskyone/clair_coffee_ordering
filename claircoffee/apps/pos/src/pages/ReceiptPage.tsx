import React from "react";
import { useParams } from "react-router-dom";
import { Card, Button } from "@claircoffee/ui";
import { computeVatBreakdown } from "../utils/pricing";

export const ReceiptPage: React.FC = () => {
  const { orderId } = useParams();
  const total = 250;
  const { net, vat } = computeVatBreakdown(total);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-espresso-900">Receipt</h2>
      <Card className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">Order ID</p>
          <p className="text-lg font-semibold text-espresso-900">{orderId}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">QR Token</p>
          <div className="mt-2 rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="text-xs text-slate-400">[QR TOKEN PLACEHOLDER]</p>
            <p className="mt-2 text-sm text-slate-600">Show this at pickup.</p>
          </div>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Net of VAT</span>
            <span>₱{net.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>VAT (12%)</span>
            <span>₱{vat.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold text-espresso-900">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>
        <Button onClick={() => window.print()}>Print Receipt</Button>
      </Card>
    </div>
  );
};

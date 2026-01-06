import React, { useState } from "react";
import { Card, Input, Button } from "@claircoffee/ui";

export const OrderSearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-espresso-900">Order Search</h2>
      <Card className="space-y-4">
        <Input
          label="Order ID or Order #"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button>Search</Button>
        <div className="text-sm text-slate-500">Results will appear here for: {query || "-"}</div>
      </Card>
    </div>
  );
};

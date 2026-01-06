import React from "react";
import { Card, Input, Button } from "@claircoffee/ui";

export const ShiftClosePage: React.FC = () => (
  <Card className="space-y-4">
    <h2 className="text-xl font-semibold text-espresso-900">Close Shift</h2>
    <Input label="Closing Cash" type="number" placeholder="0.00" />
    <Button>Close Shift</Button>
  </Card>
);

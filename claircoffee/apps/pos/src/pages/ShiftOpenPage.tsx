import React from "react";
import { Card, Input, Button } from "@claircoffee/ui";

export const ShiftOpenPage: React.FC = () => (
  <Card className="space-y-4">
    <h2 className="text-xl font-semibold text-espresso-900">Open Shift</h2>
    <Input label="Opening Cash" type="number" placeholder="0.00" />
    <Button>Start Shift</Button>
  </Card>
);

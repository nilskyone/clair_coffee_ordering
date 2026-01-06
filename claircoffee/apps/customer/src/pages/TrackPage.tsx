import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input, Modal } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";

export const TrackPage: React.FC = () => {
  const { token = "" } = useParams();
  const api = useApiClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["track", token],
    queryFn: () => api.trackOrder(token),
    enabled: Boolean(token)
  });

  const [identifyOpen, setIdentifyOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const identify = async () => {
    if (!data?.id) return;
    try {
      await api.identifyCustomer(data.id, phone);
      setMessage("Phone attached to your loyalty profile.");
      setIdentifyOpen(false);
    } catch (error) {
      setMessage("Unable to attach phone. Ask staff for help.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-8">
      <h1 className="text-2xl font-semibold text-espresso-900">Order Tracking</h1>
      <Card className="space-y-4">
        {isLoading && <p className="text-sm text-slate-500">Loading...</p>}
        {isError && <p className="text-sm text-rose-500">Unable to load order.</p>}
        {data && (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Order #</p>
              <p className="text-lg font-semibold text-espresso-900">{data.order_no}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-lg font-semibold text-espresso-700">{data.status}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Order Date</p>
              <p className="text-sm text-slate-700">{data.order_date}</p>
            </div>
            <Button variant="secondary" onClick={() => setIdentifyOpen(true)}>
              Add phone for loyalty
            </Button>
          </div>
        )}
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </Card>
      <Modal open={identifyOpen} title="Identify Customer" onClose={() => setIdentifyOpen(false)}>
        <div className="space-y-4">
          <Input label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Button onClick={identify}>Attach</Button>
        </div>
      </Modal>
    </div>
  );
};

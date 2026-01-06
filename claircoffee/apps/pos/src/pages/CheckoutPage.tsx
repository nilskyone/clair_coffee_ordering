import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Modal } from "@claircoffee/ui";
import { useCartStore } from "../store/cart";
import { calculateSubtotal, applyDiscount } from "../utils/pricing";
import { useApiClient } from "../hooks/useApiClient";
import { queueOfflineOrder } from "../data/offlineQueue";
import { getPosMode } from "../hooks/usePosMode";
import { useUiStore } from "../store/ui";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const api = useApiClient();
  const mode = getPosMode();
  const items = useCartStore((state) => state.items);
  const phone = useCartStore((state) => state.phone);
  const coupon = useCartStore((state) => state.couponCode);
  const discountPercent = useCartStore((state) => state.discountPercent);
  const notes = useCartStore((state) => state.notes);
  const setPhone = useCartStore((state) => state.setPhone);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const setNotes = useCartStore((state) => state.setNotes);
  const setDiscountPercent = useCartStore((state) => state.setDiscountPercent);
  const clearCart = useCartStore((state) => state.clear);
  const adminPinOpen = useUiStore((state) => state.adminPinOpen);
  const openAdminPin = useUiStore((state) => state.openAdminPin);
  const closeAdminPin = useUiStore((state) => state.closeAdminPin);
  const pushToast = useUiStore((state) => state.pushToast);

  const [adminPin, setAdminPin] = useState("");
  const [adminDiscount, setAdminDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "GCASH">("CASH");

  const subtotal = calculateSubtotal(items);
  const { total, discount } = applyDiscount(subtotal, discountPercent);

  const submitOrder = async () => {
    const payload = {
      branchId: 1,
      source: mode === "KIOSK" ? "KIOSK" : "POS",
      orderType: "DINEIN",
      phone: phone || null,
      notes: notes || null,
      clientUuid: crypto.randomUUID(),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        options: item.options.map((option) => ({
          optionId: option.optionId,
          priceDelta: option.priceDelta
        }))
      }))
    };

    try {
      const order = await api.createOrder(payload);
      await api.payOrder(order.orderId, paymentMethod);
      clearCart();
      navigate(`/receipt/${order.orderId}`);
    } catch (error) {
      await queueOfflineOrder({
        clientUuid: payload.clientUuid,
        payload,
        paymentMethod
      });
      clearCart();
      pushToast({
        id: `offline-${Date.now()}`,
        message: "Saved offline. Will sync when online.",
        variant: "warning"
      });
      navigate(`/receipt/${payload.clientUuid}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-espresso-900">Checkout</h2>
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="space-y-4">
          <Input label="Phone (optional)" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Input
            label="Coupon Code"
            value={coupon}
            placeholder="Optional coupon"
            onChange={(event) => setCoupon(event.target.value)}
          />
          <Input
            label="Notes"
            value={notes}
            placeholder="Special instructions"
            onChange={(event) => setNotes(event.target.value)}
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600">Payment Method</p>
            <div className="flex gap-2">
              {(["CASH", "CARD", "GCASH"] as const).map((method) => (
                <Button
                  key={method}
                  variant={paymentMethod === method ? "primary" : "secondary"}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>
          {mode === "POS" && (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Manual discount: {discountPercent}%</p>
              <Button variant="secondary" onClick={openAdminPin}>
                Apply Admin Discount
              </Button>
            </div>
          )}
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Discount</span>
            <span>-₱{discount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold text-espresso-900">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          <Button onClick={submitOrder} disabled={items.length === 0}>
            Place Order
          </Button>
        </Card>
      </div>
      <Modal open={adminPinOpen} title="Admin Discount" onClose={closeAdminPin}>
        <div className="space-y-4">
          <Input label="Admin PIN" type="password" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} />
          <Input
            label="Discount %"
            type="number"
            value={adminDiscount}
            onChange={(e) => setAdminDiscount(Number(e.target.value))}
          />
          <Button
            onClick={() => {
              if (adminPin.trim().length < 4) {
                pushToast({
                  id: `pin-${Date.now()}`,
                  message: "PIN too short.",
                  variant: "error"
                });
                return;
              }
              setDiscountPercent(Math.min(Math.max(adminDiscount, 0), 100));
              setAdminPin("");
              setAdminDiscount(0);
              closeAdminPin();
            }}
          >
            Apply
          </Button>
        </div>
      </Modal>
    </div>
  );
};

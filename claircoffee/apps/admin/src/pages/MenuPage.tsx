import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Input } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";

export const MenuPage: React.FC = () => {
  const api = useApiClient();
  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => api.listProducts()
  });
  const { data: options = [], refetch: refetchOptions } = useQuery({
    queryKey: ["admin", "options"],
    queryFn: () => api.listOptions()
  });
  const { data: bundles = [], refetch: refetchBundles } = useQuery({
    queryKey: ["admin", "bundles"],
    queryFn: () => api.listBundles()
  });

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);

  const addProduct = async () => {
    await api.createProduct({
      branchId: 1,
      name: productName,
      price: productPrice,
      isDrink: true
    });
    setProductName("");
    setProductPrice(0);
    refetchProducts();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-espresso-900">Menu Management</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Products</h3>
          <Input label="Name" value={productName} onChange={(event) => setProductName(event.target.value)} />
          <Input
            label="Price"
            type="number"
            value={productPrice}
            onChange={(event) => setProductPrice(Number(event.target.value))}
          />
          <Button onClick={addProduct}>Add Product</Button>
          <ul className="text-sm text-slate-600">
            {products.map((product: any) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Options</h3>
          <Button onClick={refetchOptions} variant="secondary">
            Refresh
          </Button>
          <ul className="text-sm text-slate-600">
            {options.map((option: any) => (
              <li key={option.id}>{option.name}</li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Bundles</h3>
          <Button onClick={refetchBundles} variant="secondary">
            Refresh
          </Button>
          <ul className="text-sm text-slate-600">
            {bundles.map((bundle: any) => (
              <li key={bundle.id}>{bundle.name}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

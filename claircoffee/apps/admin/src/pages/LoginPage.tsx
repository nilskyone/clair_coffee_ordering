import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button } from "@claircoffee/ui";
import { useApiClient } from "../hooks/useApiClient";
import { useAuthStore } from "../store/auth";

export const LoginPage: React.FC = () => {
  const api = useApiClient();
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      const result = await api.login(username, password);
      setToken(result.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-semibold text-espresso-900">Admin Login</h1>
        <Input label="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <Button onClick={submit}>Sign in</Button>
      </Card>
    </div>
  );
};

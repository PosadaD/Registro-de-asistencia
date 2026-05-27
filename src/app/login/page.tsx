"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error de login");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Sistema de Asistencia
          </CardTitle>
          <p className="text-sm text-gray-500">
            Inicia sesión para continuar
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Usuario"
              />
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="contrasena"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 text-white"
              disabled={loading}
            >
              {loading
                ? "Ingresando..."
                : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
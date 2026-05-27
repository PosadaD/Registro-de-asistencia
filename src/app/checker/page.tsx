"use client";

import { useState } from "react";

export default function CheckerPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<any>(null);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage(null);

    const res = await fetch(
      "/api/attendance/checker",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      }
    );

    const data = await res.json();

    setMessage(data);

    setCode("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          Registro de Asistencia
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            placeholder="Código empleado"
            className="w-full border rounded-lg p-4 text-center text-2xl"
            autoFocus
          />

          <button className="w-full bg-black text-white py-4 rounded-lg">
            Registrar
          </button>
        </form>

        {message && (
          <div className="mt-6 p-4 rounded-lg bg-gray-100">
            {message.error ? (
              <p className="text-red-600">
                {message.error}
              </p>
            ) : (
              <div className="space-y-2">
                <p className="font-bold text-lg">
                  {message.employee}
                </p>

                <p>
                  {message.type === "CHECK_IN"
                    ? "Entrada"
                    : "Salida"}
                </p>

                <p>{message.time}</p>

                {message.late && (
                  <p className="text-yellow-600">
                    Retardo
                  </p>
                )}

                {message.workedHours && (
                  <p>
                    Horas: {message.workedHours}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
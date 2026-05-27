"use client";

import { useState } from "react";

export default function EmployeeForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const data = Object.fromEntries(form);

    await fetch("/api/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });

    setOpen(false);
    onCreated();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Nuevo
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl w-[500px] space-y-3"
          >
            <input
              name="name"
              placeholder="Nombre"
              className="w-full border p-2"
            />

            <input
              name="rfc"
              placeholder="RFC"
              className="w-full border p-2"
            />

            <input
              name="educationalInstitution"
              placeholder="Institución"
              className="w-full border p-2"
            />

            <input
              type="date"
              name="startDate"
              className="w-full border p-2"
            />

            <button className="bg-blue-600 text-white w-full py-2 rounded">
              Guardar
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-500"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
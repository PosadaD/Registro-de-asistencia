"use client";

import { useEffect, useState } from "react";

export default function JustificationForm() {
  const [employees, setEmployees] =
    useState<any[]>([]);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then(setEmployees);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const form = new FormData(e.target);

    // upload archivo
    const fileData = new FormData();

    fileData.append(
      "file",
      form.get("file") as File
    );

    const uploadRes = await fetch(
      "/api/uploads",
      {
        method: "POST",
        body: fileData,
      }
    );

    const uploadJson =
      await uploadRes.json();

    // crear justificación
    await fetch("/api/justifications", {
      method: "POST",

      body: JSON.stringify({
        employeeId: form.get("employeeId"),
        attendanceId:
          form.get("attendanceId"),

        type: form.get("type"),

        reason: form.get("reason"),

        fileUrl: uploadJson.url,
      }),
    });

    alert("Justificación creada");
  };

  return (
    <form className="bg-white p-6 rounded-xl shadow space-y-4 max-w-lg">
      <select
        name="employeeId"
        className="w-full border p-2"
      >
        {employees.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name}
          </option>
        ))}
      </select>

      <input
        name="attendanceId"
        placeholder="ID asistencia"
        className="w-full border p-2"
      />

      <select
        name="type"
        className="w-full border p-2"
      >
        <option value="SCHOOL">
          Escuela
        </option>

        <option value="HEALTH">
          Salud
        </option>

        <option value="OTHER">
          Otro
        </option>
      </select>

      <textarea
        name="reason"
        placeholder="Motivo"
        className="w-full border p-2"
      />

      <input
        type="file"
        name="file"
        className="w-full"
      />

      <button className="bg-black text-white px-4 py-2 rounded">
        Guardar
      </button>
    </form>
  );
}
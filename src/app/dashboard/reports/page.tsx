"use client";

import { useEffect, useState } from "react";

import ExportExcelButton from "../../../../src/components/reports/ExportExcelButton";
import ExportPdfButton from "../../../../src/components/reports/ExportPdfButton";

export default function ReportsPage() {
  const [records, setRecords] =
    useState<any[]>([]);

  const [employees, setEmployees] =
    useState<any[]>([]);

  const [filters, setFilters] =
    useState({
      start: "",
      end: "",
      employeeId: "",
    });

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then(setEmployees);
  }, []);

  const loadReports = async () => {
    const params =
      new URLSearchParams(filters);

    const res = await fetch(
      `/api/reports/attendance?${params}`
    );

    const data = await res.json();

    setRecords(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Reportes
      </h1>

      {/* FILTROS */}
      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-4 gap-4">
        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) =>
            setFilters({
              ...filters,
              start: e.target.value,
            })
          }
        />

        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) =>
            setFilters({
              ...filters,
              end: e.target.value,
            })
          }
        />

        <select
          className="border p-2 rounded"
          onChange={(e) =>
            setFilters({
              ...filters,
              employeeId:
                e.target.value,
            })
          }
        >
          <option value="">
            Todos
          </option>

          {employees.map((e) => (
            <option
              key={e._id}
              value={e._id}
            >
              {e.name}
            </option>
          ))}
        </select>

        <button
          onClick={loadReports}
          className="bg-black text-white rounded"
        >
          Buscar
        </button>
      </div>

      {/* EXPORT */}
      <div className="flex gap-4">
        <ExportExcelButton
          data={records}
        />

        <ExportPdfButton
          data={records}
        />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                Empleado
              </th>

              <th className="p-3 text-left">
                Fecha
              </th>

              <th className="p-3 text-left">
                Entrada
              </th>

              <th className="p-3 text-left">
                Salida
              </th>

              <th className="p-3 text-left">
                Horas
              </th>

              <th className="p-3 text-left">
                Estado
              </th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => (
              <tr
                key={r._id}
                className="border-t"
              >
                <td className="p-3">
                  {r.employeeId?.name}
                </td>

                <td className="p-3">
                  {new Date(
                    r.date
                  ).toLocaleDateString()}
                </td>

                <td className="p-3">
                  {r.checkIn || "-"}
                </td>

                <td className="p-3">
                  {r.checkOut || "-"}
                </td>

                <td className="p-3">
                  {r.workedHours}
                </td>

                <td className="p-3">
                  {r.justified
                    ? "Justificado"
                    : r.isAbsent
                    ? "Falta"
                    : r.needsReview
                    ? "Revisión"
                    : "OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
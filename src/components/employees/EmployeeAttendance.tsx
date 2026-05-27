"use client";

import { useEffect, useState } from "react";

export default function EmployeeAttendance({
  employeeId,
}: {
  employeeId: string;
}) {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/attendance?employeeId=${employeeId}`)
      .then((res) => res.json())
      .then(setRecords);
  }, [employeeId]);

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Entrada</th>
            <th className="p-3 text-left">Salida</th>
            <th className="p-3 text-left">Horas</th>
            <th className="p-3 text-left">Estado</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r._id} className="border-t">
              <td className="p-3">
                {new Date(r.date).toLocaleDateString()}
              </td>

              <td className="p-3">
                {r.checkIn || "-"}
              </td>

              <td className="p-3">
                {r.checkOut || "-"}
              </td>

              <td className="p-3">
                {r.workedHours || 0}
              </td>

              <td className="p-3">
                {r.needsReview
                  ? "Revisión"
                  : r.isAbsent
                  ? "Falta"
                  : "OK"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
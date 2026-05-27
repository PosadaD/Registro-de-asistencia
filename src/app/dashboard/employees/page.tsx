"use client";

import { useEffect, useState } from "react";
import EmployeeForm from "../../../components/employees/EmployeeForm";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);

  const load = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Prestadores</h1>

        <EmployeeForm onCreated={load} />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">RFC</th>
              <th className="p-3 text-left">Institución</th>
              <th className="p-3 text-left">Estado</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((e) => (
              <tr key={e._id} className="border-t">
                <td className="p-3">{e.name}</td>
                <td className="p-3">{e.rfc}</td>
                <td className="p-3">{e.educationalInstitution}</td>
                <td className="p-3">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
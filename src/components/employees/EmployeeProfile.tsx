"use client";

import { useState } from "react";
import EmployeeAttendance from "./EmployeeAttendance";
import EmployeeJustifications from "./EmployeeJustifications";
import EmployeeFiles from "./EmployeeFiles";

export default function EmployeeProfile({
  employee,
}: {
  employee: any;
}) {
  const [tab, setTab] = useState("info");

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-6 flex gap-6">
        <div className="w-28 h-28 bg-gray-200 rounded-full overflow-hidden">
          {employee.photo ? (
            <img
              src={employee.photo}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{employee.name}</h1>

          <p className="text-gray-600">
            {employee.educationalInstitution}
          </p>

          <div className="flex gap-2">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
              {employee.status}
            </span>

            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
              Faltas: {employee.absenceCount}
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab("info")}
          className={`px-4 py-2 ${
            tab === "info"
              ? "border-b-2 border-black font-semibold"
              : ""
          }`}
        >
          Información
        </button>

        <button
          onClick={() => setTab("attendance")}
          className={`px-4 py-2 ${
            tab === "attendance"
              ? "border-b-2 border-black font-semibold"
              : ""
          }`}
        >
          Asistencias
        </button>

        <button
          onClick={() => setTab("justifications")}
          className={`px-4 py-2 ${
            tab === "justifications"
              ? "border-b-2 border-black font-semibold"
              : ""
          }`}
        >
          Justificaciones
        </button>

        <button
          onClick={() => setTab("files")}
          className={`px-4 py-2 ${
            tab === "files"
              ? "border-b-2 border-black font-semibold"
              : ""
          }`}
        >
          Archivos
        </button>
      </div>

      {/* CONTENT */}
      {tab === "info" && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-2 gap-4">
            <Info label="RFC" value={employee.rfc} />
            <Info label="CURP" value={employee.curp} />
            <Info label="Semestre" value={employee.semester} />
            <Info
              label="Jefe inmediato"
              value={employee.immediateBoss}
            />

            <Info
              label="Fecha inicio"
              value={new Date(employee.startDate).toLocaleDateString()}
            />

            <Info
              label="Fecha fin"
              value={new Date(employee.endDate).toLocaleDateString()}
            />
          </div>
        </div>
      )}

      {tab === "attendance" && (
        <EmployeeAttendance employeeId={employee._id} />
      )}

      {tab === "justifications" && (
        <EmployeeJustifications employeeId={employee._id} />
      )}

      {tab === "files" && (
        <EmployeeFiles employeeId={employee._id} />
      )}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
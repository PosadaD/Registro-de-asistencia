"use client";

import * as XLSX from "xlsx";

export default function ExportExcelButton({
  data,
}: {
  data: any[];
}) {
  const exportExcel = () => {
    const rows = data.map((r) => ({
      Empleado:
        r.employeeId?.name,

      Fecha: new Date(
        r.date
      ).toLocaleDateString(),

      Entrada: r.checkIn,

      Salida: r.checkOut,

      Horas: r.workedHours,

      Estado: r.justified
        ? "Justificado"
        : r.isAbsent
        ? "Falta"
        : "OK",
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Asistencias"
    );

    XLSX.writeFile(
      workbook,
      "asistencias.xlsx"
    );
  };

  return (
    <button
      onClick={exportExcel}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      Exportar Excel
    </button>
  );
}
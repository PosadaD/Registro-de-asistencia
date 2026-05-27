"use client";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export default function ExportPdfButton({
  data,
}: {
  data: any[];
}) {
  const exportPdf = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [
        [
          "Empleado",
          "Fecha",
          "Entrada",
          "Salida",
          "Horas",
        ],
      ],

      body: data.map((r) => [
        r.employeeId?.name,

        new Date(
          r.date
        ).toLocaleDateString(),

        r.checkIn,

        r.checkOut,

        r.workedHours,
      ]),
    });

    doc.save("asistencias.pdf");
  };

  return (
    <button
      onClick={exportPdf}
      className="bg-red-600 text-white px-4 py-2 rounded"
    >
      Exportar PDF
    </button>
  );
}
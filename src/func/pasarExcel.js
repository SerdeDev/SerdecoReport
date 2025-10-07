import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportToExcel(data, filename = "prueba.xlsx") {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("La data debe ser un arreglo de objetos no vacío.");
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Datos");

  // Encabezados dinámicos
  worksheet.columns = Object.keys(data[0]).map((key) => ({
    header: key,
    key: key,
    width: 20,
  }));

  // Agrega filas
  data.forEach((row) => worksheet.addRow(row));

  // Estilos a encabezados
  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB6D7A8" },
    };
    cell.font = { bold: true };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Bordes a todas las celdas
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}

// Ejemplo de uso:
// exportToExcel([{a:1, b:2}, {a:3, b:4}], "miExcel.xlsx");

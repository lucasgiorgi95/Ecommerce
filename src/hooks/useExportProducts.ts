import { PrismaProduct } from '@/services/prismaProducts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const useExportProducts = () => {
  const exportToPDF = (products: PrismaProduct[]) => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Lista de Productos', 14, 22);
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
    
    // Preparar datos para la tabla
    const tableData = products.map(product => [
      product.name,
      product.category || 'Sin categoría',
      `$${product.price.toFixed(2)}`,
      `${product.stock || 0}`,
      product.status === 'published' ? 'Publicado' : 'Pausado',
      new Date(product.createdAt).toLocaleDateString('es-ES')
    ]);
    
    // Crear tabla
    autoTable(doc, {
      head: [['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Fecha']],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [184, 160, 137], // Color #b8a089
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 247, 245] // Color muy claro
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Producto
        1: { cellWidth: 25 }, // Categoría
        2: { cellWidth: 20 }, // Precio
        3: { cellWidth: 15 }, // Stock
        4: { cellWidth: 20 }, // Estado
        5: { cellWidth: 25 }  // Fecha
      }
    });
    
    // Descargar
    doc.save(`productos_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = (products: PrismaProduct[]) => {
    // Preparar datos para Excel
    const excelData = products.map(product => ({
      'Producto': product.name,
      'Descripción': product.description || '',
      'Categoría': product.category || 'Sin categoría',
      'Precio': product.price,
      'Stock': product.stock || 0,
      'Estado': product.status === 'published' ? 'Publicado' : 'Pausado',
      'Fecha de Creación': new Date(product.createdAt).toLocaleDateString('es-ES'),
      'Última Actualización': new Date(product.updatedAt).toLocaleDateString('es-ES'),
      'Imágenes': product.images.length > 0 ? product.images.join(', ') : 'Sin imágenes'
    }));
    
    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Configurar ancho de columnas
    const colWidths = [
      { wch: 30 }, // Producto
      { wch: 50 }, // Descripción
      { wch: 15 }, // Categoría
      { wch: 10 }, // Precio
      { wch: 8 },  // Stock
      { wch: 12 }, // Estado
      { wch: 15 }, // Fecha de Creación
      { wch: 15 }, // Última Actualización
      { wch: 60 }  // Imágenes
    ];
    ws['!cols'] = colWidths;
    
    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    
    // Descargar
    XLSX.writeFile(wb, `productos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return {
    exportToPDF,
    exportToExcel
  };
};
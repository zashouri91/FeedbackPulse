import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';

type ExportFormat = 'csv' | 'excel' | 'pdf';

export function useExport() {
  return useMutation({
    mutationFn: async ({ data, format, filename }: {
      data: any[];
      format: ExportFormat;
      filename?: string;
    }) => {
      const defaultFilename = `export-${format}-${format(new Date(), 'yyyy-MM-dd')}`;
      const finalFilename = filename || defaultFilename;

      switch (format) {
        case 'csv':
          return exportToCsv(data, finalFilename);
        case 'excel':
          return exportToExcel(data, finalFilename);
        case 'pdf':
          return exportToPdf(data, finalFilename);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    },
  });
}

function exportToCsv(data: any[], filename: string) {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(',')),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

function exportToExcel(data: any[], filename: string) {
  // Implementation for Excel export
  // This would typically use a library like xlsx
  console.log('Excel export not implemented');
}

function exportToPdf(data: any[], filename: string) {
  // Implementation for PDF export
  // This would typically use a library like pdfmake
  console.log('PDF export not implemented');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
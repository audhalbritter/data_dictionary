import * as XLSX from 'xlsx';

export interface DataDictionaryRow {
    columnName: string;
    description: string;
    type: string;
    variableRangeOrLevels?: string;
    units?: string;
    howMeasured?: string;
}

/**
 * Export data dictionary to CSV format
 */
export function exportToCSV(data: DataDictionaryRow[], filename: string = 'data_dictionary.csv'): void {
    // Create CSV headers
    const headers = [
        'Variable name',
        'Description',
        'Variable type',
        'Variable range or levels',
        'Units',
        'How measured'
    ];

    // Map data to rows
    const rows = data.map(item => [
        item.columnName || '',
        item.description || '',
        item.type || '',
        item.variableRangeOrLevels || '',
        item.units || '',
        item.howMeasured || ''
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
}

/**
 * Export data dictionary to XLSX format
 */
export function exportToXLSX(data: DataDictionaryRow[], filename: string = 'data_dictionary.xlsx'): void {
    // Create worksheet data
    const worksheetData = [
        // Header row
        ['Variable name', 'Description', 'Variable type', 'Variable range or levels', 'Units', 'How measured'],
        // Data rows
        ...data.map(item => [
            item.columnName || '',
            item.description || '',
            item.type || '',
            item.variableRangeOrLevels || '',
            item.units || '',
            item.howMeasured || ''
        ])
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    worksheet['!cols'] = [
        { wch: 20 },  // Variable name
        { wch: 50 },  // Description
        { wch: 15 },  // Variable type
        { wch: 25 },  // Variable range or levels
        { wch: 15 },  // Units
        { wch: 15 }   // How measured
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Dictionary');

    // Generate and download file
    XLSX.writeFile(workbook, filename);
}

/**
 * Helper function to trigger file download
 */
function downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

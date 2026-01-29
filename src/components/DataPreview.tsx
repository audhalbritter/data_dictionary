import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface DataPreviewProps {
    headers: string[];
    data: any[][];
    fileName?: string;
}

export function DataPreview({ headers, data, fileName }: DataPreviewProps) {
    const previewRows = data.slice(0, 10);

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>{fileName || "Data Preview"}</span>
                    <span className="text-xs font-normal text-slate-500">
                        {data.length} rows • {headers.length} columns
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                        <tr>
                            {headers.map((header, i) => (
                                <th key={i} className="px-6 py-3 font-medium whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {previewRows.map((row, i) => (
                            <tr
                                key={i}
                                className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
                            >
                                {headers.map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-3 max-w-[200px] truncate text-slate-600 dark:text-slate-300">
                                        {row[colIndex]?.toString() || ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length > 10 && (
                    <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
                        Showing first 10 rows of {data.length}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

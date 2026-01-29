import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Info } from 'lucide-react';

export interface VariableDescription {
    columnName: string;
    type: string;
    description: string;
    variableRangeOrLevels?: string;
    units?: string;
    howMeasured?: string;
    semanticType?: string;
    exampleValues?: any[];
}

interface DataPreviewProps {
    headers: string[];
    data: any[][];
    fileName?: string;
    variableDescriptions?: VariableDescription[] | null;
}

function VariableTooltip({ variable, onClose }: { variable: VariableDescription; onClose: () => void }) {
    return (
        <div
            className="absolute left-0 top-full z-20 mt-1 w-[320px] max-w-[90vw] rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onMouseLeave={onClose}
        >
            <div className="space-y-3 text-sm min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate min-w-0">{variable.columnName}</span>
                    <div className="flex gap-1 shrink-0">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {variable.type}
                        </span>
                        {variable.semanticType && (
                            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                {variable.semanticType}
                            </span>
                        )}
                    </div>
                </div>
                <div className="min-w-0 w-full">
                    <span className="block font-medium text-slate-500 dark:text-slate-400">Description: </span>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-300 whitespace-normal break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {variable.description}
                    </p>
                </div>
                {variable.variableRangeOrLevels && (
                    <div className="min-w-0 w-full">
                        <span className="block font-medium text-slate-500 dark:text-slate-400">Range/Levels: </span>
                        <p className="mt-0.5 text-slate-700 dark:text-slate-300 whitespace-normal break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {variable.variableRangeOrLevels}
                        </p>
                    </div>
                )}
                {variable.units && (
                    <div>
                        <span className="font-medium text-slate-500 dark:text-slate-400">Units: </span>
                        <span className="text-slate-700 dark:text-slate-300">{variable.units}</span>
                    </div>
                )}
                {variable.howMeasured && (
                    <div>
                        <span className="font-medium text-slate-500 dark:text-slate-400">How measured: </span>
                        <span className="text-slate-700 dark:text-slate-300">{variable.howMeasured}</span>
                    </div>
                )}
                {variable.exampleValues && variable.exampleValues.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Examples</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                            {variable.exampleValues.slice(0, 5).map((val, vIdx) => (
                                <span key={vIdx} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                    {val?.toString()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function DataPreview({ headers, data, fileName, variableDescriptions }: DataPreviewProps) {
    const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
    const previewRows = data.slice(0, 10);

    const getDescriptionForHeader = (header: string): VariableDescription | undefined =>
        variableDescriptions?.find(
            (d) => d.columnName.toLowerCase().trim() === header.toLowerCase().trim()
        );

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
                            {headers.map((header, i) => {
                                const description = getDescriptionForHeader(header);
                                const hasDescription = !!description;
                                const isHovered = hoveredColumnIndex === i;
                                return (
                                    <th
                                        key={i}
                                        className="relative px-6 py-3 font-medium whitespace-nowrap"
                                        onMouseEnter={() => hasDescription && setHoveredColumnIndex(i)}
                                        onMouseLeave={() => setHoveredColumnIndex(null)}
                                    >
                                        <span className={hasDescription ? 'cursor-help' : ''}>
                                            {header}
                                            {hasDescription && (
                                                <Info className="inline-block ml-1 h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                                            )}
                                        </span>
                                        {hasDescription && isHovered && description && (
                                            <VariableTooltip variable={description} onClose={() => setHoveredColumnIndex(null)} />
                                        )}
                                    </th>
                                );
                            })}
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

import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { exportToCSV, exportToXLSX } from '../services/exportService';
import { useState, useEffect, useRef } from 'react';

interface ColumnDescription {
    columnName: string;
    type: string;
    description: string;
    variableRangeOrLevels?: string;
    units?: string;
    howMeasured?: string;
    semanticType?: string;
    exampleValues?: any[];
}

interface AnalysisViewProps {
    isLoading: boolean;
    analysisResult: ColumnDescription[] | null;
    error?: string | null;
}

export function AnalysisView({ isLoading, analysisResult, error }: AnalysisViewProps) {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };

        if (showExportMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showExportMenu]);

    const handleExport = (format: 'csv' | 'xlsx') => {
        if (!analysisResult) return;

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `data_dictionary_${timestamp}`;

        if (format === 'csv') {
            exportToCSV(analysisResult, `${filename}.csv`);
        } else {
            exportToXLSX(analysisResult, `${filename}.xlsx`);
        }

        setShowExportMenu(false);
    };

    if (isLoading) {
        return (
            <Card className="w-full mt-6 bg-slate-50 border-dashed dark:bg-slate-900">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                        Analyzing Dataset...
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-2">
                        The AI is reviewing your column headers and sample data to generate standardized descriptions.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full mt-6 border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
                <CardContent className="flex items-center gap-3 p-6 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-6 w-6 shrink-0" />
                    <div>
                        <h3 className="font-semibold">Analysis Failed</h3>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!analysisResult) return null;

    return (
        <div className="w-full mt-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        Analysis Complete
                    </h2>
                </div>

                <div className="relative" ref={menuRef}>
                    <Button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                        data-1p-ignore
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Dictionary
                    </Button>

                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" data-1p-ignore>
                                <button
                                    type="button"
                                    onClick={() => handleExport('csv')}
                                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    role="menuitem"
                                    data-1p-ignore
                                >
                                    Export as CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExport('xlsx')}
                                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    role="menuitem"
                                    data-1p-ignore
                                >
                                    Export as XLSX
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {analysisResult.map((col, idx) => (
                    <Card key={idx} className="flex flex-col hover:border-indigo-200 transition-colors dark:hover:border-indigo-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate pr-2" title={col.columnName}>
                                    {col.columnName}
                                </CardTitle>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                        {col.type}
                                    </span>
                                    {col.semanticType && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                            {col.semanticType}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col pt-0">
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                {col.description}
                            </p>

                            <div className="mt-4 space-y-2 text-xs">
                                {col.variableRangeOrLevels && (
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">Range/Levels: </span>
                                        <span className="text-slate-700 dark:text-slate-300">{col.variableRangeOrLevels}</span>
                                    </div>
                                )}
                                {col.units && (
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">Units: </span>
                                        <span className="text-slate-700 dark:text-slate-300">{col.units}</span>
                                    </div>
                                )}
                                {col.howMeasured && (
                                    <div>
                                        <span className="font-medium text-slate-500 dark:text-slate-400">How Measured: </span>
                                        <span className="text-slate-700 dark:text-slate-300">{col.howMeasured}</span>
                                    </div>
                                )}
                            </div>

                            {col.exampleValues && col.exampleValues.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Examples</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {col.exampleValues.slice(0, 3).map((val, vIdx) => (
                                            <span key={vIdx} className="inline-block max-w-[120px] truncate text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                                                {val?.toString()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

import { Card, CardContent } from './ui/Card';
import { Loader2, CheckCircle, AlertCircle, Download, Pencil } from 'lucide-react';
import { Button } from './ui/Button';
import { VariableEditModal, type VariableEntry } from './VariableEditModal';
import { exportToCSV, exportToXLSX } from '../services/exportService';
import { AnthropicService } from '../services/anthropic';
import { generateVariableRevisionPrompt } from '../services/prompts/columnAnalysis';
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
    setAnalysisResult: (result: ColumnDescription[] | null) => void;
    error?: string | null;
    editingVariableName: string | null;
    setEditingVariableName: (name: string | null) => void;
    apiKey: string;
    model: string;
    contextText?: string;
}

export function AnalysisView({
    isLoading,
    analysisResult,
    setAnalysisResult,
    error,
    editingVariableName,
    setEditingVariableName,
    apiKey,
    model,
    contextText,
}: AnalysisViewProps) {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const editingVariable = analysisResult?.find(
        (col) => col.columnName === editingVariableName
    ) ?? null;

    const handleSaveVariable = (updated: VariableEntry) => {
        if (!analysisResult) return;
        setAnalysisResult(
            analysisResult.map((col) =>
                col.columnName === updated.columnName ? { ...col, ...updated } : col
            )
        );
        setEditingVariableName(null);
    };

    const handleReviseWithAI = async (feedback: string) => {
        if (!editingVariable || !apiKey) return;
        const client = new AnthropicService(apiKey);
        const { system, user } = generateVariableRevisionPrompt(
            editingVariable,
            feedback,
            contextText
        );
        const responseText = await client.generateMessage(system, user, model);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;
        const revised = JSON.parse(jsonString) as VariableEntry;
        if (revised.columnName !== editingVariable.columnName) revised.columnName = editingVariable.columnName;
        handleSaveVariable(revised);
    };

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

            <Card className="w-full overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left table-fixed">
                            <colgroup>
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '38%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '7%' }} />
                            </colgroup>
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3 font-semibold whitespace-nowrap">Variable name</th>
                                    <th className="px-6 py-3 font-semibold">Description</th>
                                    <th className="px-6 py-3 font-semibold whitespace-nowrap">Variable type</th>
                                    <th className="px-6 py-3 font-semibold break-words">Variable range or levels</th>
                                    <th className="px-6 py-3 font-semibold break-words">Units</th>
                                    <th className="px-6 py-3 font-semibold break-words">How measured</th>
                                    <th className="px-6 py-3 font-semibold whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {analysisResult.map((col, idx) => (
                                    <tr key={idx} className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900">
                                        <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                            {col.columnName}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 align-top break-words">
                                            {col.description}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            {col.type}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 align-top break-words">
                                            {col.variableRangeOrLevels || '—'}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 align-top break-words">
                                            {col.units || '—'}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 dark:text-slate-300 align-top break-words">
                                            {col.howMeasured || '—'}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingVariableName(col.columnName)}
                                                className="text-slate-500 hover:text-indigo-600"
                                                title="Edit variable"
                                                data-1p-ignore
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <VariableEditModal
                isOpen={!!editingVariableName}
                variable={editingVariable}
                onClose={() => setEditingVariableName(null)}
                onSave={handleSaveVariable}
                onReviseWithAI={apiKey ? handleReviseWithAI : undefined}
            />
        </div>
    );
}

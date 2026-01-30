import React, { useCallback, useState } from 'react';
import { Upload, FileType, CheckCircle2, X } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { Button } from './ui/Button';

interface FileUploadProps {
    onDataLoaded: (data: any[][], headers: string[], fileName: string) => void;
    fileName?: string;
    onClear?: () => void;
}

export function FileUpload({ onDataLoaded, fileName, onClear }: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const processFile = useCallback(async (file: File) => {
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (jsonData.length > 0) {
                const headers = jsonData[0] as string[];
                const rows = jsonData.slice(1);
                onDataLoaded(rows, headers, file.name);
            }
        } catch (error) {
            console.error("Error parsing file:", error);
            alert("Failed to parse file. Please ensure it is a valid CSV or Excel file.");
        } finally {
            setIsProcessing(false);
        }
    }, [onDataLoaded]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    }, [processFile]);

    if (fileName) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <FileType className="h-4 w-4 text-slate-500 shrink-0" />
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                        {fileName}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    Dataset loaded
                                </p>
                            </div>
                        </div>
                        {onClear && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClear}
                                className="shrink-0 ml-2 text-slate-500 hover:text-red-600"
                                title="Remove file"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full min-h-[240px] border-2 border-dashed rounded-lg transition-colors cursor-pointer",
                        isDragOver
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                            : "border-slate-300 hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-600",
                        isProcessing ? "opacity-50 cursor-wait" : ""
                    )}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileInput}
                        accept=".csv,.xlsx,.xls"
                        disabled={isProcessing}
                    />

                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                            <Upload className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {isProcessing ? "Processing..." : "Upload data"}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Drag & drop or click to select
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <FileType className="w-4 h-4" />
                            <span>Supports .csv, .xlsx</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

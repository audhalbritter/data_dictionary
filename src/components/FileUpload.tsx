import React, { useCallback, useState } from 'react';
import { Upload, FileType, CheckCircle2, X } from 'lucide-react';
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
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900 h-[300px] flex-col justify-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        File Uploaded successfully
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                        {fileName}
                    </p>
                </div>
                {onClear && (
                    <Button
                        variant="outline"
                        onClick={onClear}
                        className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Remove File
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
                "relative flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed rounded-lg transition-colors cursor-pointer",
                isDragOver
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-slate-300 hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-500",
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
                        {isProcessing ? "Processing..." : "Upload your dataset"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Drag & drop or click to select
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FileType className="w-4 h-4" />
                    <span>Supports .CSV, .XLSX</span>
                </div>
            </div>
        </div>
    );
}

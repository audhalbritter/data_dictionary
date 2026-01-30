import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { parseDocument, isSupportedDocumentType, type ParsedDocument } from '../services/documentParser';

interface ContextUploadProps {
    onContextLoaded: (context: ParsedDocument | null) => void;
    existingContext: ParsedDocument | null;
}

export function ContextUpload({ onContextLoaded, existingContext }: ContextUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);
        
        if (!isSupportedDocumentType(file.name)) {
            setError('Please upload a .txt, .md, .docx, or .pdf file');
            return;
        }

        setIsProcessing(true);

        try {
            const parsedDoc = await parseDocument(file);
            onContextLoaded(parsedDoc);
        } catch (err: any) {
            setError(err.message || 'Failed to parse document');
            console.error('Document parsing error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleRemoveContext = () => {
        onContextLoaded(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                {!existingContext ? (
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                        className={`
                            relative flex flex-col items-center justify-center w-full min-h-[240px] border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer
                            ${isDragging 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' 
                                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600'
                            }
                            ${isProcessing ? 'opacity-50 pointer-events-none cursor-wait' : ''}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.md,.docx,.pdf"
                            onChange={handleFileInput}
                            className="hidden"
                            id="context-upload"
                        />

                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center p-6 space-y-3">
                                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Parsing document...
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 space-y-4">
                                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                                    <Upload className="w-8 h-8 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        Update context
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Drag & drop or click to select
                                    </p>
                                </div>
                                <div className="text-xs text-slate-400">
                                    Supports .txt, .md, .docx, .pdf
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                        {existingContext.fileName}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {existingContext.fileType} • {existingContext.text.length} characters
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveContext}
                            className="shrink-0 ml-2 text-slate-500 hover:text-red-600"
                            title="Remove context"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

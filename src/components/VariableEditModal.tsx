import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface VariableEntry {
    columnName: string;
    type: string;
    description: string;
    variableRangeOrLevels?: string;
    units?: string;
    howMeasured?: string;
    semanticType?: string;
    exampleValues?: any[];
}

interface VariableEditModalProps {
    isOpen: boolean;
    variable: VariableEntry | null;
    onClose: () => void;
    onSave: (updated: VariableEntry) => void;
    onReviseWithAI?: (feedback: string) => Promise<void>;
}

export function VariableEditModal({
    isOpen,
    variable,
    onClose,
    onSave,
    onReviseWithAI,
}: VariableEditModalProps) {
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [variableRangeOrLevels, setVariableRangeOrLevels] = useState('');
    const [units, setUnits] = useState('');
    const [howMeasured, setHowMeasured] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [isRevising, setIsRevising] = useState(false);
    const [reviseError, setReviseError] = useState<string | null>(null);

    // Sync form when variable changes
    useEffect(() => {
        if (variable) {
            setDescription(variable.description ?? '');
            setType(variable.type ?? '');
            setVariableRangeOrLevels(variable.variableRangeOrLevels ?? '');
            setUnits(variable.units ?? '');
            setHowMeasured(variable.howMeasured ?? '');
            setFeedbackText('');
            setReviseError(null);
        }
    }, [variable]);

    const handleSave = () => {
        if (!variable) return;
        onSave({
            ...variable,
            description: description.trim(),
            type: type.trim(),
            variableRangeOrLevels: variableRangeOrLevels.trim() || undefined,
            units: units.trim() || undefined,
            howMeasured: howMeasured.trim() || undefined,
        });
        onClose();
    };

    const handleReviseWithAI = async () => {
        if (!onReviseWithAI || !feedbackText.trim()) return;
        setIsRevising(true);
        setReviseError(null);
        try {
            await onReviseWithAI(feedbackText.trim());
            onClose();
        } catch (err: any) {
            setReviseError(err.message ?? 'Failed to revise with AI.');
        } finally {
            setIsRevising(false);
        }
    };

    if (!variable) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit variable: ${variable.columnName}`}
            className="max-w-xl"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Variable name
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-md px-3 py-2">
                        {variable.columnName}
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className={cn(
                            'flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
                            'ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                            'dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-indigo-400'
                        )}
                        placeholder="Description of the variable"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Variable type
                        </label>
                        <Input
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            placeholder="e.g. numeric, date, character"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                            Units
                        </label>
                        <Input
                            value={units}
                            onChange={(e) => setUnits(e.target.value)}
                            placeholder="e.g. mm, °C, yyyy-mm-dd"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Variable range or levels
                    </label>
                    <Input
                        value={variableRangeOrLevels}
                        onChange={(e) => setVariableRangeOrLevels(e.target.value)}
                        placeholder="e.g. 2015 - 2021 or male, female"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        How measured
                    </label>
                    <Input
                        value={howMeasured}
                        onChange={(e) => setHowMeasured(e.target.value)}
                        placeholder="e.g. measured, defined, calculated"
                    />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save changes
                    </Button>
                </div>

                {onReviseWithAI && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Ask AI to revise
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Describe what’s wrong or what should change (e.g. “Use this description: …” or “Units are mm, not cm”). The AI will return a revised entry for this variable.
                        </p>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows={2}
                            placeholder="e.g. The description should say: Soil temperature at 5 cm depth in °C"
                            className={cn(
                                'flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
                                'ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                                'dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-indigo-400'
                            )}
                            disabled={isRevising}
                        />
                        {reviseError && (
                            <p className="text-sm text-red-600 dark:text-red-400">{reviseError}</p>
                        )}
                        <Button
                            variant="secondary"
                            onClick={handleReviseWithAI}
                            disabled={!feedbackText.trim() || isRevising}
                        >
                            {isRevising ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Revising…
                                </>
                            ) : (
                                'Revise with AI'
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}

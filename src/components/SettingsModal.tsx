import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Lock, Check, AlertCircle, Loader2 } from 'lucide-react';
import { AnthropicService } from '../services/anthropic';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveKey: (key: string, model: string) => void;
    existingKey?: string;
    existingModel?: string;
}

export function SettingsModal({ isOpen, onClose, onSaveKey, existingKey, existingModel }: SettingsModalProps) {
    const [key, setKey] = useState('');
    const [model, setModel] = useState('claude-3-5-sonnet-20241022');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (isOpen) {
            setKey(existingKey || '');
            setModel(existingModel || 'claude-3-5-sonnet-20241022');
            setError('');
            setTestStatus('idle');
            setAvailableModels([]); // Reset models on open, could also keep them cached
        }
    }, [isOpen, existingKey, existingModel]);

    const handleTestConnection = async () => {
        if (!key) {
            setError('API Key is required to test');
            return;
        }
        if (!AnthropicService.validateKey(key)) {
            setError('Invalid API Key format');
            return;
        }

        setIsTesting(true);
        setError('');
        setTestStatus('idle');

        try {
            const service = new AnthropicService(key);
            const models = await service.validateKeyAndListModels();
            setAvailableModels(models);
            setTestStatus('success');

            // If current model is not in list (and list is not empty), default to first one
            if (models.length > 0 && !models.includes(model)) {
                setModel(models[0]);
            }
        } catch (err: any) {
            setTestStatus('error');
            console.error(err);
            setError(err.message || 'Failed to connect to Anthropic API');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = () => {
        if (!key) {
            setError('API Key is required');
            return;
        }
        if (testStatus !== 'success' && availableModels.length === 0) {
            // Optional: force test before save? Or just warn?
            // Let's allow saving without testing, but maybe warn if key seems invalid logic
            if (!AnthropicService.validateKey(key)) {
                setError('Invalid API Key format');
                return;
            }
        }
        onSaveKey(key, model);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuration">
            <div className="space-y-6">
                {/* API Key Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Anthropic API Key
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="password"
                                placeholder="sk-ant-..."
                                value={key}
                                onChange={(e) => {
                                    setKey(e.target.value);
                                    setTestStatus('idle'); // Reset test status on edit
                                }}
                                className="pl-9"
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={handleTestConnection}
                            isLoading={isTesting}
                            disabled={!key}
                            className="shrink-0"
                        >
                            {testStatus === 'success' ? <Check className="h-4 w-4 text-green-600" /> : 'Test Key'}
                        </Button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{error}</span>
                        </div>
                    )}
                    {testStatus === 'success' && !error && (
                        <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                            <Check className="h-3 w-3" />
                            <span>Connection successful. Models loaded.</span>
                        </div>
                    )}
                </div>

                {/* Model Selection Section */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Model
                    </label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        disabled={availableModels.length === 0 && testStatus !== 'success'} // Disable if we haven't fetched models yet (or allow manual entry if we wanted)
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-400"
                    >
                        {availableModels.length > 0 ? (
                            availableModels.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))
                        ) : (
                            // Fallback options if test hasn't run yet but user wants to save
                            <>
                                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Default)</option>
                                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                            </>
                        )}
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {availableModels.length > 0
                            ? "Select one of the models available to your API key."
                            : "Test your key to see all available models."}
                    </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Your API key is stored locally in your browser and used directly to communicate with Anthropic using <code>dangerouslyAllowBrowser: true</code>.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>Save Configuration</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

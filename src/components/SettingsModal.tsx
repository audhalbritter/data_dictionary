import { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Lock, Check, AlertCircle, Trash2 } from 'lucide-react';
import { AnthropicService, MODEL_DESCRIPTIONS } from '../services/anthropic';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveKey: (key: string, model: string, storageType: 'local' | 'session') => void;
    onResetKey?: () => void;
    existingKey?: string;
    existingModel?: string;
}

export function SettingsModal({ isOpen, onClose, onSaveKey, onResetKey, existingKey, existingModel }: SettingsModalProps) {
    const [key, setKey] = useState('');
    const [model, setModel] = useState('claude-3-5-sonnet-20241022');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [storageType, setStorageType] = useState<'local' | 'session'>('local');
    const [error, setError] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (isOpen) {
            setKey(existingKey || '');
            setModel(existingModel || 'claude-3-5-sonnet-20241022');
            setError('');
            setTestStatus('idle');
            setAvailableModels([]); // Reset models on open

            // Detect storage type
            const isSession = sessionStorage.getItem('anthropic_api_key') === existingKey;
            setStorageType(isSession ? 'session' : 'local');
        }
    }, [isOpen, existingKey, existingModel]);

    const handleTestConnection = async (saveAfterSuccess = false) => {
        if (!key) {
            setError('API Key is required');
            return;
        }
        if (!AnthropicService.validateKey(key)) {
            setError('Invalid API Key format (should start with sk-ant-)');
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

            // Select best default if current is not in list
            let nextModel = model;
            if (models.length > 0 && !models.includes(model)) {
                // Priority preference: Sonnet 3.5 > Opus > Haiku > First available
                const preferred = [
                    'claude-3-5-sonnet-20241022',
                    'claude-3-opus-20240229',
                    'claude-3-5-haiku-20241022'
                ];
                const found = preferred.find(p => models.includes(p));
                nextModel = found || models[0];
                setModel(nextModel);
            }

            if (saveAfterSuccess) {
                onSaveKey(key, nextModel, storageType);
                onClose();
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

        // Auto-validate if not yet validated
        if (testStatus !== 'success') {
            handleTestConnection(true);
        } else {
            onSaveKey(key, model, storageType);
            onClose();
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to remove your API key?')) {
            onResetKey?.();
            setKey('');
            setTestStatus('idle');
            setAvailableModels([]);
            onClose();
        }
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
                                    setTestStatus('idle');
                                }}
                                className="pl-9"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                }}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => handleTestConnection(false)}
                            isLoading={isTesting}
                            disabled={!key}
                            className="shrink-0"
                        >
                            {testStatus === 'success' ? <Check className="h-4 w-4 text-green-600" /> : 'verify'}
                        </Button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-500 mt-1 animate-in slide-in-from-left-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{error}</span>
                        </div>
                    )}
                    {testStatus === 'success' && !error && (
                        <div className="flex items-center gap-2 text-xs text-green-600 mt-1 animate-in slide-in-from-left-1">
                            <Check className="h-3 w-3" />
                            <span>Connection successful. available models loaded.</span>
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
                        disabled={isTesting}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-400"
                    >
                        {availableModels.length > 0 ? (
                            availableModels.map((m) => (
                                <option key={m} value={m}>
                                    {MODEL_DESCRIPTIONS[m] || m}
                                </option>
                            ))
                        ) : (
                            // Optimistic fallback before load
                            Object.keys(MODEL_DESCRIPTIONS).map((m) => (
                                <option key={m} value={m}>
                                    {MODEL_DESCRIPTIONS[m]}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Storage Preference */}
                <div className="space-y-3 pt-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Storage Preference
                    </label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <input
                                type="radio"
                                name="storageType"
                                value="session"
                                checked={storageType === 'session'}
                                onChange={() => setStorageType('session')}
                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">Session Only</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Key is cleared when you close the browser tab.</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <input
                                type="radio"
                                name="storageType"
                                value="local"
                                checked={storageType === 'local'}
                                onChange={() => setStorageType('local')}
                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">Remember on Device</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Key is saved in your browser's local storage.</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-sm space-y-2">
                    <div className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-slate-600 dark:text-slate-400 text-xs">
                            This project is <span className="font-semibold text-slate-900 dark:text-slate-200">Open Source</span>.
                            Your API key is securely stored in your browser ({storageType === 'local' ? 'Local Storage' : 'Session Storage'}) and communicates directly with Anthropic.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div>
                        {existingKey && (
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2" onClick={handleReset}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Key
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} isLoading={isTesting}>
                            {isTesting ? 'Verifying...' : 'Save Configuration'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

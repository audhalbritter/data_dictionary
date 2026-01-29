import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Lock } from 'lucide-react';
import { AnthropicService } from '../services/anthropic';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveKey: (key: string) => void;
    existingKey?: string;
}

export function SettingsModal({ isOpen, onClose, onSaveKey, existingKey }: SettingsModalProps) {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setKey(existingKey || '');
            setError('');
        }
    }, [isOpen, existingKey]);

    const handleSave = () => {
        if (!key) {
            setError('API Key is required');
            return;
        }
        if (!AnthropicService.validateKey(key)) {
            setError('Invalid API Key format (should start with sk-ant-)');
            return;
        }
        onSaveKey(key);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuration">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Anthropic API Key
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="password"
                            placeholder="sk-ant-..."
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Your API key is stored locally in your browser and used directly to communicate with Anthropic.
                        It is never sent to any other server.
                    </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Key</Button>
                </div>
            </div>
        </Modal>
    );
}

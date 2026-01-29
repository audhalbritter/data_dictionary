import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className={cn(
                "relative w-full max-w-lg transform rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
                className
            )}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none dark:hover:bg-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}

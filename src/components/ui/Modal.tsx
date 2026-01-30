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

            {/* Dialog: max height so it fits on small screens; content area scrolls */}
            <div className={cn(
                "relative flex flex-col w-full max-w-lg max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
                className
            )}>
                <div className="flex shrink-0 items-center justify-between p-6 pb-4">
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100 pr-2 truncate">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none dark:hover:bg-slate-800 shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-y-auto min-h-0 px-6 pb-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

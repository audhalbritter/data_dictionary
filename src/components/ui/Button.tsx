import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 ring-offset-white dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-400',
                    {
                        'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm': variant === 'primary',
                        'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700': variant === 'secondary',
                        'border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800': variant === 'outline',
                        'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100': variant === 'ghost',
                        'bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800': variant === 'destructive',
                        'h-9 px-3 text-sm': size === 'sm',
                        'h-10 px-4 py-2': size === 'md',
                        'h-11 px-8': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };

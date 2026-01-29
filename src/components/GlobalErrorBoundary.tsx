import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { AlertCircle, Github, Copy } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private getIssueUrl = () => {
        const { error, errorInfo } = this.state;
        const title = encodeURIComponent(`Bug: ${error?.message || 'Unknown Error'}`);

        const bodyContent = `
**Describe the bug**
A clear and concise description of what the bug is.

**Error Log**
\`\`\`
${error?.toString()}
${errorInfo?.componentStack}
\`\`\`

**Environment**
- User Agent: ${navigator.userAgent}
    `.trim();

        const body = encodeURIComponent(bodyContent);
        return `https://github.com/audhalbritter/data_dictionary/issues/new?title=${title}&body=${body}`;
    };

    private handleCopy = () => {
        const { error, errorInfo } = this.state;
        const text = `
Error: ${error?.message}

Stack:
${errorInfo?.componentStack}

User Agent: ${navigator.userAgent}
    `.trim();
        navigator.clipboard.writeText(text);
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen grid grid-cols-1 place-items-center bg-slate-50 dark:bg-slate-950 p-4">
                    <Card className="w-full max-w-lg border-red-200 dark:border-red-900 shadow-xl">
                        <CardHeader>
                            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-8 w-8" />
                                <CardTitle>Something went wrong</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-300">
                                An unexpected error occurred. You can help us fix this by reporting it on GitHub.
                            </p>

                            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-auto max-h-48 text-xs font-mono border border-slate-200 dark:border-slate-800">
                                <p className="font-bold text-red-500 mb-2">{this.state.error?.message}</p>
                                <details>
                                    <summary className="cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                        View Stack Trace
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap text-slate-500 dark:text-slate-400">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => window.open(this.getIssueUrl(), '_blank')}
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                                size="lg"
                            >
                                <Github className="mr-2 h-5 w-5" />
                                Report on GitHub
                            </Button>
                            <Button
                                onClick={this.handleCopy}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Details
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="ghost"
                                className="w-full sm:w-auto ml-auto"
                            >
                                Reload Page
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

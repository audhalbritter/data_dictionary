import { useEffect, useState, useRef } from 'react';
import { Settings, Sparkles, Database, FileSpreadsheet, History } from 'lucide-react';
import { Button } from './components/ui/Button';
import { FileUpload } from './components/FileUpload';
import { ContextUpload } from './components/ContextUpload';
import { DataPreview } from './components/DataPreview';
import { SettingsModal } from './components/SettingsModal';
import { AnalysisView } from './components/AnalysisView';
import { AnthropicService } from './services/anthropic';
import { generateColumnAnalysisPrompt, generateRepairPrompt } from './services/prompts/columnAnalysis';
import { computeColumnSummaries, formatSummariesForPrompt } from './services/summaryStatistics';
import { saveToHistory, loadHistory, type HistoryEntry } from './services/historyService';
import { validateAnalysisResult, reconcileAnalysisResult } from './services/resultReconciliation';
import type { ParsedDocument } from './services/documentParser';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Data State
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [contextDoc, setContextDoc] = useState<ParsedDocument | null>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any[] | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // View State
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);
  const [editingVariableName, setEditingVariableName] = useState<string | null>(null);

  // Load key and model from storage (local or session)
  useEffect(() => {
    // Check local storage first
    let storedKey = localStorage.getItem('anthropic_api_key');
    let storedModel = localStorage.getItem('anthropic_model');

    // Fallback to session storage if not in local
    if (!storedKey) {
      storedKey = sessionStorage.getItem('anthropic_api_key');
      storedModel = sessionStorage.getItem('anthropic_model');
    }

    if (storedKey) setApiKey(storedKey);
    if (storedModel) setModel(storedModel);
  }, []);

  const handleSaveKey = (key: string, selectedModel: string, storageType: 'local' | 'session') => {
    setApiKey(key);
    setModel(selectedModel);

    if (storageType === 'local') {
      localStorage.setItem('anthropic_api_key', key);
      localStorage.setItem('anthropic_model', selectedModel);
      // Clear session to avoid confusion
      sessionStorage.removeItem('anthropic_api_key');
      sessionStorage.removeItem('anthropic_model');
    } else {
      sessionStorage.setItem('anthropic_api_key', key);
      sessionStorage.setItem('anthropic_model', selectedModel);
      // Clear local
      localStorage.removeItem('anthropic_api_key');
      localStorage.removeItem('anthropic_model');
    }
  };

  const handleResetKey = () => {
    setApiKey('');
    // Clear both
    localStorage.removeItem('anthropic_api_key');
    localStorage.removeItem('anthropic_model');
    sessionStorage.removeItem('anthropic_api_key');
    sessionStorage.removeItem('anthropic_model');
  };

  const historyEntries = loadHistory();

  const loadFromHistory = (entry: HistoryEntry) => {
    setFileName(entry.fileName);
    setHeaders(entry.headers);
    setRows(entry.rows);
    setAnalysisResult(entry.analysisResult);
    setAnalysisError(null);
    setContextDoc(
      entry.contextText
        ? { text: entry.contextText, fileName: entry.contextFileName ?? 'context', fileType: 'Text' }
        : null
    );
    setShowHistory(false);
    setIsWorkspaceActive(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showHistory && historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    if (showHistory) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showHistory]);

  const handleDataLoaded = (data: any[][], headerList: string[], name: string) => {
    setRows(data);
    setHeaders(headerList);
    setFileName(name);
    setAnalysisResult(null); // Reset analysis on new file
    setAnalysisError(null);
  };

  const handleClearFile = () => {
    setRows([]);
    setHeaders([]);
    setFileName('');
  };

  const runAnalysis = async () => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const client = new AnthropicService(apiKey);
      const sampleRows = rows.slice(0, 10);
      const summaries = computeColumnSummaries(headers, rows);
      const summaryStats = formatSummariesForPrompt(summaries);

      // Initial Prompt
      const { system, user } = generateColumnAnalysisPrompt(
        fileName,
        headers,
        sampleRows,
        contextDoc?.text,
        summaryStats
      );

      let accumulatedJson: any[] = [];
      let currentAttempt = 0;
      const MAX_ATTEMPTS = 3; // Initial + 2 Retries
      let messages: { role: 'user' | 'assistant', content: string }[] = [
        { role: 'user', content: user }
      ];

      // Loop for retries
      while (currentAttempt < MAX_ATTEMPTS) {
        try {
          // On repairs, we need to send the conversation history
          // For the first attempt, we just send the user message.
          // For subsequent, we append the previous assistant reply and the new user repair prompt.

          const responseText = await client.generateMessage(
            system,
            currentAttempt === 0 ? user : messages[messages.length - 1].content,
            model,
            currentAttempt > 0 ? messages.slice(0, -1) : undefined
          );

          // Note: client.generateMessage signature might need update or we handle history differently.
          // checking AnthropicService signature... 
          // it currently takes (system, user, model). It doesn't support full history.
          // I will need to update AnthropicService to support history or hack it here.
          // For now, let's assume I will update AnthropicService or use a concatenated string?
          // Concatenated string is bad for API.
          // Let's rely on a slightly modified loop where we don't need full history support if we don't have it,
          // BUT for repairs to work well, context is good. 
          // However, since generateRepairPrompt repeats the missing columns, maybe we can just treat it as a fresh request?
          // "Here are the missing columns: [A, B]. Generating JSON for them."
          // That might be safer and simpler than refactoring the service right now.
          // The prompt says "The previous analysis was incomplete..." implying context.
          // Actually, looking at generateColumnAnalysisPrompt, it includes everything needed.
          // If I just ask for missing columns, I might need to re-supply context or just hope the model handles it.
          // Better approach: Update AnthropicService to support messages array.
          // Wait, I can't easily update AnthropicService in the same step.
          // Let's assume for this specific retry hack:
          // We treat each repair as a fresh request but we might need to include the data again?
          // OR, since I am editing App.tsx, I can update AnthropicService in a separate tool call if needed.
          // Let's stick to the plan: modify App.tsx. I will assume I can update AnthropicService or pass a giant string.
          // Actually, looking at AnthropicService:
          // async generateMessage(systemPrompt: string, userMessage: string, model: string = 'claude-3-5-sonnet-20241022')
          // I'll make a pragmatic choice: I'll append the previous output and the repair request into a new "user" message if needed, 
          // OR I will simply accept that I need to update AnthropicService to take `messages[]`.

          // New Strategy: Just parse what we got.
          // Attempt to find JSON array in markdown code blocks if present
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          const jsonString = jsonMatch ? jsonMatch[0] : responseText;
          let currentJson: any[] = [];

          try {
            currentJson = JSON.parse(jsonString);
          } catch (e) {
            console.warn("JSON Parse warning", e);
            // If hard fail, we might want to continue or retry?
            // ensuring it is an array
            currentJson = [];
          }

          if (!Array.isArray(currentJson)) currentJson = [];

          accumulatedJson = [...accumulatedJson, ...currentJson];

          // Validate
          const validation = validateAnalysisResult(headers, accumulatedJson);

          if (validation.valid) {
            break; // We are good!
          } else {
            console.log(`Attempt ${currentAttempt + 1} incomplete. Missing: ${validation.missingColumns.join(', ')}`);
            currentAttempt++;

            if (currentAttempt < MAX_ATTEMPTS) {
              // Prepare next prompt
              const repairPrompt = generateRepairPrompt(validation.missingColumns);

              // CRITICAL: We need to pass history or context.
              // Since AnthropicService is simple, let's just create a NEW request 
              // focused ONLY on the missing columns, re-supplying the relevant sample data for those columns?
              // Or just sending the repair prompt as a "User" message.
              // Without history, the model won't know what "The previous analysis" refers to.
              // I will perform a simplified repair: I will ask for the missing columns as if it is a new task, 
              // but I will include the summary stats for those columns to help it.
              // Actually, simply concatenating the previous user Prompt + "\n\nAssistant Response: " + responseText + "\n\nUser: " + repairPrompt
              // and sending that as the "userMessage" to the existing service might work as a poor-man's history.

              // Update for next loop iteration
              // We change the 'user' variable effectively for the generateMessage call
              // But wait, 'user' is const. I need to be careful.

              // Let's refactor the loop to be cleaner.
              messages.push({ role: 'assistant', content: responseText });
              messages.push({ role: 'user', content: repairPrompt });
            }
          }

        } catch (e) {
          console.error("Error in loop", e);
          currentAttempt++;
        }
      }

      // Final Reconciliation
      const finalResult = reconcileAnalysisResult(headers, accumulatedJson);

      setAnalysisResult(finalResult);
      saveToHistory({
        fileName,
        headers,
        rows,
        analysisResult: finalResult,
        contextText: contextDoc?.text,
        contextFileName: contextDoc?.fileName,
      });

    } catch (err: any) {
      setAnalysisError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">

      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Database className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Data Dictionary AI
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={historyRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                title="Recent analyses"
              >
                <History className="h-4 w-4 mr-2" />
                History
                {historyEntries.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-xs">
                    {historyEntries.length}
                  </span>
                )}
              </Button>
              {showHistory && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50 max-h-[70vh] overflow-y-auto">
                  <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Recent analyses</p>
                  </div>
                  <div className="py-1">
                    {historyEntries.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
                        No history yet. Generate a dictionary to see it here.
                      </p>
                    ) : (
                      historyEntries.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => loadFromHistory(entry)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          data-1p-ignore
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {entry.fileName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {entry.rows.length} rows · {new Date(entry.createdAt).toLocaleDateString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className={!apiKey ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : ""}
            >
              <Settings className="h-4 w-4 mr-2" />
              {apiKey ? "Settings" : "Set API Key"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl pb-20">

        {/* Hero / Upload Section */}
        {!isWorkspaceActive ? (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                Turn data into <span className="text-indigo-600 dark:text-indigo-400">clarity</span>
              </h2>
              <ol className="text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside space-y-1 max-w-md mx-auto text-left">
                <li>
                  Set API key in Settings.{' '}
                  <a
                    href="https://github.com/audhalbritter/data_dictionary#how-to-get-a-claude-api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    How to get an API key
                  </a>
                </li>
                <li>Upload data and context (optional)</li>
                <li>AI generates data dictionary</li>
                <li>View, edit, and export</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContextUpload
                onContextLoaded={setContextDoc}
                existingContext={contextDoc}
              />

              <FileUpload
                onDataLoaded={handleDataLoaded}
                fileName={fileName}
                onClear={handleClearFile}
              />
            </div>

            {/* Proceed Button Area */}
            {headers.length > 0 && (
              <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setIsWorkspaceActive(true)}
                >
                  Proceed to Analysis
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Main Workspace */
          <div className="space-y-8 animate-in fade-in duration-500">

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded">
                  <FileSpreadsheet className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{fileName}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500">{rows.length} rows loaded</p>
                    {contextDoc && (
                      <>
                        <span className="text-xs text-slate-400">•</span>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                          Context: {contextDoc.fileName}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setHeaders([]);
                  setRows([]);
                  setAnalysisResult(null);
                  setContextDoc(null);
                  setAnalysisError(null);
                  setFileName('');
                  setIsWorkspaceActive(false);
                }}>
                  New File
                </Button>
                <Button
                  onClick={runAnalysis}
                  isLoading={isAnalyzing}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Dictionary
                </Button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-8">
              <DataPreview
                headers={headers}
                data={rows}
                fileName={fileName}
                variableDescriptions={analysisResult}
                onRequestEditVariable={setEditingVariableName}
              />

              <div id="analysis-section">
                <AnalysisView
                  isLoading={isAnalyzing}
                  analysisResult={analysisResult}
                  setAnalysisResult={setAnalysisResult}
                  error={analysisError}
                  editingVariableName={editingVariableName}
                  setEditingVariableName={setEditingVariableName}
                  apiKey={apiKey}
                  model={model}
                  contextText={contextDoc?.text}
                />
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 mt-auto">
        <div className="container mx-auto px-4 max-w-6xl text-center flex items-center justify-center gap-4">
          <a
            href="https://github.com/audhalbritter/data_dictionary#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
          >
            Documentation
          </a>
          <a
            href="https://github.com/audhalbritter/data_dictionary/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
          >
            Give feedback
          </a>
        </div>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKey={handleSaveKey}
        onResetKey={handleResetKey}
        existingKey={apiKey}
        existingModel={model}
      />
    </div>
  );
}

export default App;

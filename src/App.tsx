import React, { useEffect, useState } from 'react';
import { Settings, Sparkles, Database, FileSpreadsheet } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview';
import { SettingsModal } from './components/SettingsModal';
import { AnalysisView } from './components/AnalysisView';
import { AnthropicService } from './services/anthropic';
import { generateColumnAnalysisPrompt } from './services/prompts/columnAnalysis';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Data State
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any[] | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Load key from storage
  useEffect(() => {
    const storedKey = localStorage.getItem('anthropic_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('anthropic_api_key', key);
  };

  const handleDataLoaded = (data: any[][], headerList: string[], name: string) => {
    setRows(data);
    setHeaders(headerList);
    setFileName(name);
    setAnalysisResult(null); // Reset analysis on new file
    setAnalysisError(null);
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
      const { system, user } = generateColumnAnalysisPrompt(fileName, headers, sampleRows);

      const responseText = await client.generateMessage(system, user);

      // Parse JSON
      try {
        // Attempt to find JSON array in markdown code blocks if present
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;
        const result = JSON.parse(jsonString);
        setAnalysisResult(result);
      } catch (e) {
        console.error("JSON Parse Error", e);
        setAnalysisError("Failed to parse AI response. The model didn't return valid JSON.");
      }

    } catch (err: any) {
      setAnalysisError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">

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

          <div className="flex items-center gap-4">
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
        {!headers.length ? (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                Turn data into <span className="text-indigo-600 dark:text-indigo-400">clarity</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Upload your dataset and let Claude AI automatically generate standardized descriptions and semantic types for your data dictionary.
              </p>
            </div>

            <Card className="p-1 shadow-lg border-indigo-100 dark:border-slate-800">
              <FileUpload onDataLoaded={handleDataLoaded} />
            </Card>
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
                  <p className="text-xs text-slate-500">{rows.length} rows loaded</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setHeaders([]);
                  setRows([]);
                  setAnalysisResult(null);
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
              <DataPreview headers={headers} data={rows} fileName={fileName} />

              <div id="analysis-section">
                <AnalysisView
                  isLoading={isAnalyzing}
                  analysisResult={analysisResult}
                  error={analysisError}
                />
              </div>
            </div>
          </div>
        )}

      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKey={handleSaveKey}
        existingKey={apiKey}
      />
    </div>
  );
}

export default App;

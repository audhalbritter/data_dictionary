const HISTORY_KEY = 'data_dictionary_history';
const MAX_HISTORY_ITEMS = 5;
const MAX_ROWS_PER_ENTRY = 2000; // Cap rows to avoid localStorage quota

export interface HistoryEntry {
  id: string;
  fileName: string;
  headers: string[];
  rows: any[][];
  analysisResult: any[];
  contextText?: string;
  contextFileName?: string;
  createdAt: string;
}

function generateId(): string {
  return `dd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getStoredHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('Could not save history (quota exceeded?):', e);
  }
}

/**
 * Save a completed analysis to history.
 * Trims rows to MAX_ROWS_PER_ENTRY to avoid quota issues.
 */
export function saveToHistory(params: {
  fileName: string;
  headers: string[];
  rows: any[][];
  analysisResult: any[];
  contextText?: string;
  contextFileName?: string;
}): void {
  const rows = params.rows.length > MAX_ROWS_PER_ENTRY
    ? params.rows.slice(0, MAX_ROWS_PER_ENTRY)
    : params.rows;

  const entry: HistoryEntry = {
    id: generateId(),
    fileName: params.fileName,
    headers: params.headers,
    rows,
    analysisResult: params.analysisResult,
    contextText: params.contextText,
    contextFileName: params.contextFileName,
    createdAt: new Date().toISOString(),
  };

  const history = getStoredHistory();
  const filtered = history.filter((e) => e.fileName !== params.fileName || e.createdAt !== entry.createdAt);
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
  setStoredHistory(updated);
}

/**
 * Load all history entries (newest first).
 */
export function loadHistory(): HistoryEntry[] {
  return getStoredHistory();
}

/**
 * Load a single entry by id.
 */
export function getHistoryEntry(id: string): HistoryEntry | undefined {
  return getStoredHistory().find((e) => e.id === id);
}

/**
 * Remove an entry from history.
 */
export function removeFromHistory(id: string): void {
  const history = getStoredHistory().filter((e) => e.id !== id);
  setStoredHistory(history);
}

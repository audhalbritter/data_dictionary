/**
 * Check if a value is considered NA/missing.
 */
function isNA(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const s = String(value).trim().toLowerCase();
  if (s === '' || s === 'na' || s === 'n/a' || s === 'null' || s === 'nan' || s === '.') return true;
  if (typeof value === 'number' && Number.isNaN(value)) return true;
  return false;
}

/**
 * Try to parse a value as a number. Returns null if not numeric.
 */
function asNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n;
}

/**
 * Try to parse a value as a date. Returns null if not parseable.
 * Accepts ISO (yyyy-mm-dd), dd/mm/yyyy, and timestamps.
 */
function asDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Format date for display (yyyy-mm-dd).
 */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface ColumnSummary {
  columnName: string;
  totalCount: number;
  naCount: number;
  nonNaCount: number;
  /** For numeric: min, max (omitting NAs) */
  min?: number | string;
  max?: number | string;
  /** For numeric: mean (omitting NAs) */
  mean?: number;
  /** For numeric/date: inferred from values */
  inferredType: 'numeric' | 'date' | 'character' | 'mixed';
  /** For character/categorical: number of unique values */
  uniqueCount?: number;
  /** Sample of unique values (up to 10) for character/categorical */
  sampleValues?: string[];
}

/**
 * Compute summary statistics for each column of a dataset.
 * Uses the full dataset (all rows) so min/max and types are correct even when
 * early rows are NA.
 */
export function computeColumnSummaries(headers: string[], rows: any[][]): ColumnSummary[] {
  const summaries: ColumnSummary[] = [];

  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const columnName = headers[colIndex];
    const values = rows.map((row) => (colIndex < row.length ? row[colIndex] : undefined));

    const totalCount = values.length;
    const nonNA = values.filter((v) => !isNA(v));
    const naCount = totalCount - nonNA.length;
    const nonNaCount = nonNA.length;

    let inferredType: ColumnSummary['inferredType'] = 'character';
    let min: number | string | undefined;
    let max: number | string | undefined;
    let mean: number | undefined;
    let uniqueCount: number | undefined;
    let sampleValues: string[] | undefined;

    // Try numeric first (all non-NA parse as number)
    const numbers = nonNA.map(asNumber).filter((n): n is number => n !== null);
    if (nonNA.length > 0 && numbers.length === nonNA.length) {
      inferredType = 'numeric';
      min = Math.min(...numbers);
      max = Math.max(...numbers);
      mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    } else {
      // Try date (all non-NA parse as date)
      const dates = nonNA.map(asDate).filter((d): d is Date => d !== null);
      if (nonNA.length > 0 && dates.length === nonNA.length) {
        inferredType = 'date';
        const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
        min = formatDate(minDate);
        max = formatDate(maxDate);
      } else {
        // Character/categorical
        const unique = [...new Set(nonNA.map((v) => String(v).trim()))].filter(Boolean);
        uniqueCount = unique.length;
        sampleValues = unique.slice(0, 10);
        if (numbers.length > 0 || dates.length > 0) inferredType = 'mixed';
        // Do not set min/max for character columns
      }
    }

    summaries.push({
      columnName,
      totalCount,
      naCount,
      nonNaCount,
      min,
      max,
      mean,
      inferredType,
      uniqueCount,
      sampleValues,
    });
  }

  return summaries;
}

/**
 * Format column summaries as a string for the AI prompt.
 */
export function formatSummariesForPrompt(summaries: ColumnSummary[]): string {
  const lines: string[] = [];

  for (const s of summaries) {
    const parts: string[] = [
      `Column: ${s.columnName}`,
      `  Total: ${s.totalCount}, Non-NA: ${s.nonNaCount}, NA: ${s.naCount}`,
      `  Inferred type: ${s.inferredType}`,
    ];
    if (s.min !== undefined && s.max !== undefined) {
      parts.push(`  Range (min - max): ${s.min} - ${s.max}`);
    }
    if (s.mean !== undefined) {
      parts.push(`  Mean: ${s.mean}`);
    }
    if (s.uniqueCount !== undefined) {
      parts.push(`  Unique values: ${s.uniqueCount}`);
    }
    if (s.sampleValues !== undefined && s.sampleValues.length > 0) {
      parts.push(`  Sample values: ${s.sampleValues.join(', ')}`);
    }
    lines.push(parts.join('\n'));
  }

  return lines.join('\n\n');
}

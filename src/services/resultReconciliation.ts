
export interface ColumnDescription {
    columnName: string;
    type: string;
    description: string;
    variableRangeOrLevels?: string;
    units?: string;
    howMeasured?: string;
    semanticType?: string;
    exampleValues?: any[];
}

interface ValidationResult {
    valid: boolean;
    missingColumns: string[];
}

/**
 * Validates if the AI response contains all the expected columns.
 */
export function validateAnalysisResult(originalHeaders: string[], aiOutput: any[]): ValidationResult {
    if (!Array.isArray(aiOutput)) {
        return { valid: false, missingColumns: originalHeaders };
    }

    const aiColumnNames = new Set(aiOutput.map(col => String(col.columnName).trim()));
    const missingColumns = originalHeaders.filter(header => !aiColumnNames.has(header));

    return {
        valid: missingColumns.length === 0,
        missingColumns
    };
}

/**
 * Reconciles the AI output with the original headers.
 * Ensures strict 1:1 mapping and order.
 * Fills in missing columns with placeholder data.
 */
export function reconcileAnalysisResult(originalHeaders: string[], aiOutput: any[]): ColumnDescription[] {
    const aiMap = new Map<string, any>();

    if (Array.isArray(aiOutput)) {
        aiOutput.forEach(col => {
            if (col && col.columnName) {
                aiMap.set(String(col.columnName).trim(), col);
            }
        });
    }

    return originalHeaders.map(header => {
        const match = aiMap.get(header);

        if (match) {
            return {
                columnName: header,
                type: match.type || 'Unknown',
                description: match.description || 'No description provided.',
                variableRangeOrLevels: match.variableRangeOrLevels || undefined,
                units: match.units || undefined,
                howMeasured: match.howMeasured || undefined,
                semanticType: match.semanticType || undefined,
                exampleValues: Array.isArray(match.exampleValues)
                    ? match.exampleValues
                    : typeof match.exampleValues === 'string'
                        ? (match.exampleValues as string).split(',').map(s => s.trim())
                        : undefined
            };
        } else {
            // Fallback for missing columns
            return {
                columnName: header,
                type: 'Unknown',
                description: 'Analysis failed for this column.',
                howMeasured: 'Unknown',
                variableRangeOrLevels: 'N/A'
            };
        }
    });
}

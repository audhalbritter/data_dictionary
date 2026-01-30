export const generateColumnAnalysisPrompt = (
    fileName: string,
    headers: string[],
    sampleRows: any[][],
    contextText?: string,
    summaryStats?: string
): { system: string, user: string } => {
    const systemPrompt = `You are an expert Data Steward and Data Engineer aimed at creating standardized, machine-readable data dictionaries.
Your goal is to analyze the provided dataset preview and summary statistics to generate a comprehensive description for each column.
Output MUST be in strict JSON format as a list of objects, where each object has:
- "columnName": The name of the column (Variable name).
- "description": A clear, concise description of what this column represents. If the variable name or its values contain abbreviations or codes, define all of them in the description (e.g. "F = forbs, G = graminoids, ...").
- "type": inferred data type (e.g., numeric, character, date, logical, categorical). Use "date" for date columns.
- "variableRangeOrLevels": The range of values (e.g., "2015 - 2021", "2015-07-22 - 2021-07-30") for numeric or date data, or levels/categories for categorical data. Use the SUMMARY STATISTICS below for min/max ranges—they are computed over the full dataset (omitting NAs), so they are reliable even when the first rows are NA.
- "units": The unit of measurement if applicable (e.g., "mm", "kg", "°C", "yyyy-mm-dd" for dates). Leave empty string if not applicable.
- "howMeasured": How the data was collected or measured (e.g., "measured", "defined", "calculated", "observed", "self-reported"). Infer from the type of data.
- "exampleValues": A few representative values found in the column (from sample data or summary).
- "semanticType": (Optional) If applicable, a semantic type (e.g., "City", "Currency", "Email").

Important guidelines:
- Use the SUMMARY STATISTICS for each column to infer type and range: min, max, inferredType, NA count, and sample values are computed over the full dataset (NAs omitted for min/max). Prefer these over the sample rows when the sample has many NAs.
- For "variableRangeOrLevels": Use the min and max from the summary statistics for numeric and date columns. For dates use the format "yyyy-mm-dd - yyyy-mm-dd".
- For "type": Use "date" when the summary statistics show inferredType "date"; use "numeric" for numeric; use "character" or "categorical" for character/categorical.
- For "howMeasured": Use terms like "measured" for sensor/instrument data, "defined" for identifiers or predefined values, "calculated" for derived values, "observed" for observational data.
- Be specific and accurate. When summary statistics are provided, rely on them for ranges and types.
- If additional context about the study or data collection is provided, use it to inform your descriptions.

Abbreviations:
- If a variable name or its values contain abbreviations, acronyms, or codes, define every one in the description (e.g. "Cover of plant functional types: F = forbs, G = graminoids, M = mosses").

Experimental design – hierarchical structure:
- If the data appear to be from an experimental or observational design, look for hierarchical structure in the identifiers (e.g. site > block > plot, or region > site > subplot). Infer from column names and values (e.g. siteID, blockID, plotID) and from repeated patterns. In the description of the relevant columns, state the hierarchy and cardinality where possible (e.g. "Site identifier; hierarchy: site (e.g. Alrust) contains blocks, 4 blocks per site; each block contains 8 plots").

Experimental design – redundancy in naming:
- If the design uses composite or encoded IDs, look for redundancy: some variables may repeat or encode information from others. For example, blockID might be site code + block number (e.g. Alr1 from site Alrust), and plotID might be blockID + treatment code (e.g. Alr1GB from block Alr1 and treatment GB). When you detect such patterns, describe them in the description (e.g. "Plot identifier; encodes blockID + treatment code (e.g. Alr1GB = block Alr1, treatment GB). Redundant with blockID and treatment when combined.") so users understand the naming system and avoid double-counting.

Do not include any conversational text, just the JSON array.`;

    let userMessage = '';

    // Add context if provided
    if (contextText && contextText.trim().length > 0) {
        userMessage += `=== STUDY CONTEXT ===\n${contextText.trim()}\n\n`;
    }

    userMessage += `=== SUMMARY STATISTICS (full dataset, NAs omitted for min/max) ===\n`;
    userMessage += summaryStats ?? '(none)\n';
    userMessage += `\n`;

    userMessage += `=== SAMPLE DATA (first ${sampleRows.length} rows only) ===\n`;
    userMessage += `File: "${fileName}"\n\n`;
    userMessage += `Columns: ${headers.join(', ')}\n\n`;
    userMessage += `Sample rows:\n`;
    userMessage += sampleRows.map(row => JSON.stringify(row)).join('\n');
    userMessage += `\n\nPlease analyze this dataset using both the summary statistics and sample data. Provide the column descriptions in JSON format.`;

    if (contextText && contextText.trim().length > 0) {
        userMessage += ` Use the study context provided above to inform your descriptions.`;
    }

    return { system: systemPrompt, user: userMessage };
};

export const generateRepairPrompt = (missingColumns: string[]): string => {
    return `The previous analysis was incomplete. The following columns are missing from the output: ${missingColumns.join(', ')}.

Please provide the JSON objects for ONLY these missing columns. Do not repeat the columns you already analyzed.
Ensure the format is the same JSON array of objects as requested before.`;
};

export interface VariableForRevision {
    columnName: string;
    type: string;
    description: string;
    variableRangeOrLevels?: string;
    units?: string;
    howMeasured?: string;
    semanticType?: string;
    exampleValues?: any[];
}

/**
 * Prompt for revising a single variable based on user feedback.
 * Returns a single JSON object (not an array) with the same keys as the variable.
 */
export const generateVariableRevisionPrompt = (
    variable: VariableForRevision,
    userFeedback: string,
    contextText?: string
): { system: string; user: string } => {
    const systemPrompt = `You are an expert Data Steward. The user is correcting or refining one variable in a data dictionary.
You will receive the current variable entry and the user's feedback. Your task is to output a revised variable as a single JSON object.
Output MUST be strict JSON only, with exactly these keys (use empty string "" where not applicable):
- "columnName": same as the variable name (do not change)
- "description": clear description of what the column represents
- "type": e.g. numeric, character, date, logical, categorical
- "variableRangeOrLevels": range (e.g. "2015 - 2021") or levels for categorical
- "units": unit of measurement or ""
- "howMeasured": e.g. measured, defined, calculated, observed, or ""
- "exampleValues": array of a few example values, or []
- "semanticType": optional semantic type or ""

Apply the user's feedback precisely. If they give a replacement description, use it. If they correct units or range, update those fields.
Do not include any text before or after the JSON object.`;

    let userMessage = `=== CURRENT VARIABLE ===\n${JSON.stringify(variable, null, 2)}\n\n`;
    if (contextText?.trim()) {
        userMessage += `=== STUDY CONTEXT (optional reference) ===\n${contextText.trim()}\n\n`;
    }
    userMessage += `=== USER FEEDBACK ===\n${userFeedback.trim()}\n\n`;
    userMessage += `Return only the revised JSON object for this variable.`;

    return { system: systemPrompt, user: userMessage };
};

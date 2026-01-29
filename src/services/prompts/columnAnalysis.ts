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
- "description": A clear, concise description of what this column represents.
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

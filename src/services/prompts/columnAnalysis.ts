
export const generateColumnAnalysisPrompt = (fileName: string, headers: string[], sampleRows: any[][]): { system: string, user: string } => {
    const systemPrompt = `You are an expert Data Steward and Data Engineer aimed at creating standardized, machine-readable data dictionaries.
Your goal is to analyze the provided dataset preview and generate a comprehensive description for each column.
Output MUST be in strict JSON format as a list of objects, where each object has:
- "columnName": The name of the column (Variable name).
- "description": A clear, concise description of what this column represents.
- "type": inferred data type (e.g., numeric, character, date, logical, categorical).
- "variableRangeOrLevels": The range of values (e.g., "2015 - 2021", "0 - 100") for numeric data, or levels/categories (e.g., "male, female", "low, medium, high") for categorical data. Analyze the sample data to determine the actual range or levels.
- "units": The unit of measurement if applicable (e.g., "mm", "kg", "°C", "yyyy-mm-dd"). Leave empty string if not applicable.
- "howMeasured": How the data was collected or measured (e.g., "measured", "defined", "calculated", "observed", "self-reported"). Infer from the type of data.
- "exampleValues": A few representative values found in the column.
- "semanticType": (Optional) If applicable, a semantic type (e.g., "City", "Currency", "Email").

Important guidelines:
- For "variableRangeOrLevels": Extract the actual min-max range from sample data for numeric columns, or list the unique categorical values found.
- For "howMeasured": Use terms like "measured" for sensor/instrument data, "defined" for identifiers or predefined values, "calculated" for derived values, "observed" for observational data.
- Be specific and accurate based on the sample data provided.

Do not include any conversational text, just the JSON array.`;

    const userMessage = `Here is a preview of the dataset "${fileName}".
  
Columns: ${headers.join(', ')}

Sample Data (First ${sampleRows.length} rows):
${sampleRows.map(row => JSON.stringify(row)).join('\n')}

Please analyze this and provide the column descriptions.`;

    return { system: systemPrompt, user: userMessage };
};

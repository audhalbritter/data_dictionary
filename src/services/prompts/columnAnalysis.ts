
export const generateColumnAnalysisPrompt = (fileName: string, headers: string[], sampleRows: any[][]): { system: string, user: string } => {
    const systemPrompt = `You are an expert Data Steward and Data Engineer aimed at creating standardized, machine-readable data dictionaries.
Your goal is to analyze the provided dataset preview and generate a comprehensive description for each column.
Output MUST be in strict JSON format as a list of objects, where each object has:
- "columnName": The name of the column.
- "type": inferred data type (e.g., String, Integer, Float, Date, Boolean, Categorical).
- "description": A clear, concise description of what this column represents.
- "exampleValues": A few representative values found in the column.
- "semanticType": (Optional) If applicable, a semantic type (e.g., "City", "Currency", "Email").

Do not include any conversational text, just the JSON array.`;

    const userMessage = `Here is a preview of the dataset "${fileName}".
  
Columns: ${headers.join(', ')}

Sample Data (First ${sampleRows.length} rows):
${sampleRows.map(row => JSON.stringify(row)).join('\n')}

Please analyze this and provide the column descriptions.`;

    return { system: systemPrompt, user: userMessage };
};

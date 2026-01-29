
import { reconcileAnalysisResult } from './src/services/resultReconciliation.ts';

const headers = ['col1'];
const badAiOutput = [
    {
        columnName: 'col1',
        type: 'String',
        description: 'Test',
        exampleValues: "val1, val2, val3" // This triggered the bug (it was expected to be an array)
    }
];

const result = reconcileAnalysisResult(headers, badAiOutput);

console.log('Result:', JSON.stringify(result, null, 2));

if (Array.isArray(result[0].exampleValues) && result[0].exampleValues.length === 3) {
    console.log('SUCCESS: exampleValues converted to array.');
    process.exit(0);
} else {
    console.error('FAILURE: exampleValues not converted correctly.');
    process.exit(1);
}

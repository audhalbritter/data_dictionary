import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
// Import worker as a URL to be handled by Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ParsedDocument {
    text: string;
    fileName: string;
    fileType: string;
}

/**
 * Parse a text file
 */
async function parseTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

/**
 * Parse a Word document (.docx)
 */
async function parseWordDocument(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

/**
 * Parse a PDF document
 */
async function parsePdfDocument(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n';
    }

    return fullText.trim();
}

/**
 * Main function to parse a document based on its type
 */
export async function parseDocument(file: File): Promise<ParsedDocument> {
    const fileName = file.name;
    const extension = fileName.toLowerCase().split('.').pop();

    let text = '';
    let fileType = '';

    try {
        switch (extension) {
            case 'txt':
            case 'md':
                text = await parseTextFile(file);
                fileType = 'Text';
                break;

            case 'docx':
                text = await parseWordDocument(file);
                fileType = 'Word Document';
                break;

            case 'pdf':
                text = await parsePdfDocument(file);
                fileType = 'PDF';
                break;

            default:
                throw new Error(`Unsupported file type: .${extension}`);
        }

        if (!text || text.trim().length === 0) {
            throw new Error('No text content found in the document');
        }

        return {
            text: text.trim(),
            fileName,
            fileType
        };

    } catch (error: any) {
        throw new Error(`Failed to parse ${fileName}: ${error.message}`);
    }
}

/**
 * Validate if a file type is supported
 */
export function isSupportedDocumentType(fileName: string): boolean {
    const extension = fileName.toLowerCase().split('.').pop();
    return ['txt', 'md', 'docx', 'pdf'].includes(extension || '');
}

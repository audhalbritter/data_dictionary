# Context Upload Feature

## Overview

The Data Dictionary AI now supports uploading optional context documents to enhance the AI's understanding of your dataset. By providing study methods, experiment details, or data collection information, the AI can generate more accurate and domain-specific variable descriptions.

## Supported File Formats

- **Text Files** (.txt, .md)
- **Word Documents** (.docx)
- **PDF Documents** (.pdf)

## How It Works

### 1. Upload Context (Optional)
Before or after uploading your dataset, you can upload a context document that describes:
- Study methodology
- Experimental design
- Data collection procedures
- Variable definitions
- Domain-specific terminology
- Research objectives

### 2. Context Integration
When you click "Generate Dictionary", the AI receives:
- Your dataset preview (first 10 rows)
- The full text content from your context document (if provided)

### 3. Enhanced Analysis
The AI uses the context to:
- Generate more accurate variable descriptions
- Use appropriate domain-specific terminology
- Better infer measurement methods
- Understand the purpose of each variable
- Provide more meaningful range interpretations

## Example Use Cases

### Research Study
Upload a methods section from your paper describing:
- Study site and conditions
- Sampling protocols
- Measurement equipment and procedures
- Variable definitions

### Experiment Documentation
Upload a protocol document containing:
- Experimental design
- Treatment descriptions
- Response variable definitions
- Control conditions

### Data Collection Notes
Upload field notes or SOPs describing:
- How each measurement was taken
- Units and precision
- Data quality procedures
- Any special considerations

## User Interface

### Upload Section (Pre-Analysis)
- **Context Upload Box** appears above the dataset upload
- Drag-and-drop or click to browse
- Shows file name, type, and character count when loaded
- Can be removed and replaced at any time

### Main Workspace (Post-Upload)
- Context file name displayed next to dataset name
- Visible indicator that context will be used in analysis
- Example: "1000 rows loaded • Context: methods.pdf"

## Technical Details

### Document Parsing
- **Text files**: Direct UTF-8 text extraction
- **Word documents**: Text extraction using `mammoth` library
- **PDF files**: Text extraction using `pdfjs-dist` library

### Context Processing
The context text is prepended to the AI prompt under a "STUDY CONTEXT" section, ensuring the AI considers it while analyzing your dataset.

### Character Limits
- No hard limit on context length
- Very long documents (>100k characters) may be truncated by the AI model's context window
- Recommended: Keep context documents focused and under 10,000 words

## Best Practices

1. **Be Specific**: Include details about measurement methods and variable definitions
2. **Be Concise**: Focus on relevant information that helps describe your variables
3. **Use Standards**: Include any standard protocols or terminology used
4. **Update Context**: If you upload a new dataset from a different study, update the context document
5. **Test First**: Try without context first, then add context to see the improvement

## Example Context Document

```markdown
# Study Methods - Alpine Plant Community Survey

## Study Site
High alpine meadow in the Swiss Alps, elevation 2,400-2,800m

## Sampling Protocol
- Plot size: 1m x 1m quadrats
- Sampling period: June-August 2015-2021
- Variables measured at each plot:
  - Species cover (visual estimation, percentage)
  - Soil temperature (digital thermometer, °C)
  - Soil moisture (TDR probe, volumetric %)
  - Plot elevation (GPS, meters above sea level)

## Variables
- year: Year of sampling (YYYY)
- date: Date of sampling (YYYY-MM-DD)
- plot_id: Unique plot identifier
- species_code: 4-letter species code
- cover: Species cover percentage (0-100%)
- soil_temp: Soil temperature at 5cm depth (°C)
- soil_moisture: Volumetric soil moisture (%)
- elevation: Plot elevation (m a.s.l.)
```

## Files Changed

- **`src/services/documentParser.ts`** (NEW) - Document parsing service
- **`src/components/ContextUpload.tsx`** (NEW) - Context upload component
- **`src/App.tsx`** - Added context state and UI integration
- **`src/services/prompts/columnAnalysis.ts`** - Updated to include context in prompt
- **`package.json`** - Added `mammoth` and `pdfjs-dist` dependencies

## Dependencies Added

```json
{
  "mammoth": "^1.x.x",
  "pdfjs-dist": "^4.x.x"
}
```

# Data Dictionary Export Feature

This document describes the data dictionary export functionality added to the Data Dictionary AI application.

## Overview

The application now supports exporting AI-generated data dictionaries in two formats:
- **CSV** - Comma-separated values format
- **XLSX** - Microsoft Excel format

## Export Format

The exported data dictionary follows a standardized format with the following columns:

| Column Name | Description |
|------------|-------------|
| **Variable name** | The name of the column/variable from your dataset |
| **Description** | A clear, AI-generated description of what the column represents |
| **Variable type** | The inferred data type (numeric, character, date, logical, categorical) |
| **Variable range or levels** | The range of values for numeric data (e.g., "2015 - 2021") or categories for categorical data (e.g., "male, female") |
| **Units** | The unit of measurement if applicable (e.g., "mm", "kg", "°C", "yyyy-mm-dd") |
| **How measured** | How the data was collected (e.g., "measured", "defined", "calculated", "observed") |

## How to Use

1. **Upload your dataset** - Upload a CSV or Excel file containing your data
2. **Generate Dictionary** - Click the "Generate Dictionary" button to analyze your data using Claude AI
3. **Export** - Once the analysis is complete:
   - Click the "Export Dictionary" button
   - Choose your preferred format (CSV or XLSX)
   - The file will be automatically downloaded with a timestamp (e.g., `data_dictionary_2026-01-29.csv`)

## Example

Given a dataset with columns like `year`, `date`, `temperature`, the exported dictionary will look like:

```
Variable name | Description           | Variable type | Variable range or levels | Units      | How measured
year          | Year of sampling      | numeric       | 2015 – 2021               | yyyy       | defined
date          | Date of sampling      | date          | 2015-07-22 – 2021-07-30   | yyyy-mm-dd | defined
temperature   | Temperature recorded  | numeric       | -5.2 – 28.3               | °C         | measured
```

## Technical Details

### AI Prompt Enhancement
The AI prompt has been enhanced to generate all required fields for the standardized data dictionary format. The AI analyzes sample data and summary statistics to:
- Infer data types
- Extract actual value ranges from the data
- Determine appropriate units
- Classify measurement methods

### Export Service
The export functionality is implemented in `src/services/exportService.ts` and provides:
- CSV export with proper escaping of special characters
- XLSX export with optimized column widths
- Automatic filename generation with timestamps

### Dependencies
The export feature uses the `xlsx` library (included in the project) for Excel file generation.

## File Locations

- **Export Service**: `src/services/exportService.ts`
- **Analysis View Component**: `src/components/AnalysisView.tsx`
- **AI Prompt Configuration**: `src/services/prompts/columnAnalysis.ts`

# Data Dictionary AI

A web app that uses **Claude AI** (Anthropic) to generate standardized, machine-readable **data dictionaries** from your datasets. Upload a CSV or Excel file, optionally add study context, and get variable descriptions, types, ranges, units, and measurement methods—ready to export as CSV or XLSX.

---

## What it does

1. **Upload a dataset** (CSV or Excel) and optionally a **context document** (methods, experiment description, etc.).
2. The app computes **summary statistics** (min, max, NA counts, inferred types) over the full dataset and sends them to the AI together with a sample of rows.
3. **Claude** returns a structured data dictionary for each column.
4. You can **view** the dictionary in a table, **hover** over column names in the data preview to see full variable details, and **export** the dictionary as CSV or XLSX.
5. **History** keeps your last analyses so you can reopen them without re-uploading.

---

## Features

### Dataset & context

- **Dataset upload**: CSV or Excel (XLSX). Drag-and-drop or file picker.
- **Context upload (optional)**: Add a document describing your study, methods, or data collection. Supported formats:
  - **Text**: `.txt`, `.md`
  - **Word**: `.docx`
  - **PDF**: `.pdf`  
  Context is sent to the AI to improve variable descriptions and terminology.

### Analysis

- **AI-generated data dictionary** for each variable, with:
  - **Variable name**
  - **Description**
  - **Variable type** (e.g. numeric, date, character, categorical)
  - **Variable range or levels** (min–max for numeric/date, or categories)
  - **Units** (e.g. mm, °C, yyyy-mm-dd)
  - **How measured** (e.g. measured, defined, calculated, observed)
- **Summary statistics** are computed on the **full dataset** (min, max, NA counts, inferred type) and sent to the AI so types and ranges are correct even when the first rows are NA (e.g. date columns).

### Viewing results

- **Data preview table**: First 10 rows of your data. After analysis, column headers show an info icon; **hover** over a header to see the full variable description (description, type, range/levels, units, how measured, examples) in a tooltip.
- **Data dictionary table**: Full dictionary in a table below the preview, with the same columns as the export format.

### Export

- **Export dictionary** as:
  - **CSV**
  - **XLSX** (Excel)  
  Format matches the standard columns: Variable name, Description, Variable type, Variable range or levels, Units, How measured. Filename includes the current date.

### History

- **Recent analyses** are saved in the browser (localStorage). Open the **History** menu in the header to see the last 5 analyses (file name, row count, date).
- **Load** an entry to restore that dataset and its dictionary (and context text if it was saved). No need to re-upload or re-run the AI.

### Settings

- **Anthropic API key**: Stored locally; required to run analysis.
- **Model**: Choose the Claude model used for analysis (e.g. `claude-3-5-sonnet-20241022`).

---

## Options and requirements

- **API key**: You need an [Anthropic](https://www.anthropic.com/) API key. Set it in the app via **Settings** (or “Set API Key” when prompted).
- **Browser**: Modern browser with JavaScript enabled. The app runs in the browser; data and API calls are not sent to any server except Anthropic’s API when you run “Generate Dictionary”.
- **Context and data size**: Very large context documents or datasets may hit model context limits; the app sends summary statistics and a sample of rows to keep usage reasonable.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (build and dev server)
- **Tailwind CSS** for styling
- **Anthropic SDK** for Claude
- **xlsx** for Excel read/write, **mammoth** for Word, **pdfjs-dist** for PDF (context parsing)

---

## Getting started

### Install and run

```bash
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173/`).

### Build for production

```bash
npm run build
```

Output is in `dist/`. Serve that folder with any static host.

### Lint

```bash
npm run lint
```

---

## What we have added (feature summary)

- **Data dictionary generation**: AI prompt and UI for generating a full data dictionary from a dataset.
- **Standardized export format**: CSV and XLSX with columns: Variable name, Description, Variable type, Variable range or levels, Units, How measured.
- **Context upload**: Optional text/Word/PDF context to improve AI descriptions.
- **Summary statistics**: Per-column stats (min, max, NA count, inferred type) over the full dataset, sent to the AI so types and ranges are correct even when the first rows are NA.
- **Hover tooltips**: In the data preview, hover over a column header to see the full variable description (description, type, range, units, how measured, examples).
- **Data dictionary table**: Table view of the generated dictionary below the data preview, matching the export format.
- **History**: Save and load the last 5 analyses (dataset + dictionary + optional context) from localStorage.
- **Settings**: Stored API key and model selection; 1Password-style ignore attributes on export/history UI to avoid credential prompts.

---

## License

See [LICENSE](LICENSE) in this repository.

# Data Dictionary AI

A web app that uses **Claude AI** (Anthropic) to generate standardized, machine-readable **data dictionaries** from your datasets. Upload a CSV or Excel file, optionally add study context, and get variable descriptions, types, ranges, units, and measurement methods—ready to export as CSV or XLSX.

---

## Where to use the tool

- **Online (no install)**: Use the app directly at **[https://audhalbritter.github.io/data_dictionary/](https://audhalbritter.github.io/data_dictionary/)**. You only need an Anthropic API key (see [How to get a Claude API key](#how-to-get-a-claude-api-key)).
- **Local development**: Run `npm run dev` and open **http://localhost:5173/** in your browser if you want to develop or run the app locally.

---

## What it does

1. **Upload a dataset** (CSV or Excel) and optionally a **context document** (methods, experiment description, etc.).
2. The app computes **summary statistics** (min, max, NA counts, inferred types) over the full dataset and sends them to the AI together with a sample of rows.
3. **Claude** returns a structured data dictionary for each column.
4. You can **view** the dictionary in a table, **hover** over column names in the data preview to see full variable details, **edit** any variable (manually or ask the AI to revise it), and **export** the dictionary as CSV or XLSX.
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

- **Data preview table**: First 10 rows of your data. After analysis, column headers show an info icon; **hover** over a header to see the full variable description (description, type, range/levels, units, how measured, examples) in a tooltip. From the tooltip you can click **Edit variable** to open the edit modal for that variable.
- **Data dictionary table**: Full dictionary in a table below the preview, with the same columns as the export format. Each row has an **Edit** (pencil) button to correct that variable.

### Editing the data dictionary

You can correct or refine any variable after the AI has generated the dictionary:

- **Direct edit**: Click **Edit** on a variable (in the table or via **Edit variable** in the hover tooltip). A modal opens with fields for Description, Variable type, Variable range or levels, Units, and How measured. Change the values and click **Save changes**. No API call is made.
- **Ask AI to revise**: In the same edit modal, use the **Ask AI to revise** section. Describe what’s wrong or what should change (e.g. “Use this description: Soil temperature at 5 cm depth in °C” or “Units are mm, not cm”). Click **Revise with AI**. The app sends the current variable and your feedback (and optional study context) to Claude; the returned revised entry replaces that variable. Requires an API key.

Edits (manual or AI) update the in-memory dictionary immediately; **Export** and **History** use the updated data.

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

- **API key**: You need an [Anthropic](https://www.anthropic.com/) API key. Set it in the app via **Settings** (or “Set API Key” when prompted). See [How to get a Claude API key](#how-to-get-a-claude-api-key) below.
- **Browser**: Modern browser with JavaScript enabled. The app runs in the browser; data and API calls are not sent to any server except Anthropic’s API when you run “Generate Dictionary”.
- **Context and data size**: Very large context documents or datasets may hit model context limits; the app sends summary statistics and a sample of rows to keep usage reasonable.

### How to get a Claude API key

1. Go to **[Anthropic](https://www.anthropic.com/)** and sign up or log in.
2. Open the **[Anthropic Console](https://console.anthropic.com/)** (or go to [https://console.anthropic.com/](https://console.anthropic.com/)).
3. In the console, go to **API Keys** (or **Settings → API Keys**).
4. Click **Create Key**, give it a name (e.g. “Data Dictionary”), and create it.
5. Copy the key (it starts with `sk-ant-`). You will not be able to see the full key again after leaving the page.
6. In the Data Dictionary AI app, open **Settings** (or click “Set API Key” when prompted) and paste the key. It is stored only in your browser (localStorage) and is never sent to any server other than Anthropic’s API.

For more details and pricing, see [Anthropic’s documentation](https://docs.anthropic.com/).

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
- **Per-variable edit**: Edit any variable directly (description, type, range/levels, units, how measured) or ask the AI to revise it from natural-language feedback; edits apply to the dictionary and export/history.
- **Settings**: Stored API key and model selection; 1Password-style ignore attributes on export/history UI to avoid credential prompts.

---

## More documentation

Detailed docs are in the **`docs/`** folder:

- **[docs/README_EXPORT.md](docs/README_EXPORT.md)** – Export format and usage (CSV, XLSX)
- **[docs/CONTEXT_FEATURE.md](docs/CONTEXT_FEATURE.md)** – Context upload (text, Word, PDF) and examples
- **[docs/EDIT_FEATURE.md](docs/EDIT_FEATURE.md)** – Editing the data dictionary (direct edit and Ask AI to revise)
- **[docs/CHANGES_SUMMARY.md](docs/CHANGES_SUMMARY.md)** – Development summary of features and file changes

---

## License

See [LICENSE](LICENSE) in this repository.

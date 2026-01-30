# Editing the Data Dictionary

After the AI has generated a data dictionary, you can correct or refine any variable. Two options are available: **direct edit** (no API call) and **Ask AI to revise** (one API call per variable).

---

## How to open the edit modal

- **From the data dictionary table**: Click the **Edit** (pencil) button in the **Actions** column for the variable you want to change.
- **From the data preview**: Hover over a column header that has an info icon, then click **Edit variable** at the bottom of the tooltip.

---

## Direct edit

- In the modal, change any of: **Description**, **Variable type**, **Variable range or levels**, **Units**, **How measured**.
- **Variable name** is read-only (it identifies the column).
- Click **Save changes** to apply. The dictionary is updated immediately; no API call is made.
- Use this when you know the correct values and want a quick fix.

---

## Ask AI to revise

- In the same edit modal, scroll to **Ask AI to revise**.
- In the text area, describe what’s wrong or what should change. Examples:
  - “Use this description: Soil temperature at 5 cm depth in °C”
  - “Units are mm, not cm”
  - “How measured should be ‘measured’, not ‘defined’”
- Click **Revise with AI**. The app sends the current variable and your feedback (and optional study context) to Claude. The AI returns a revised entry for that variable only; the app replaces the variable with the result.
- Requires an **API key** (Settings). If no key is set, the “Ask AI to revise” section is hidden.
- Use this when you prefer to describe the change in words and let the AI update the fields.

---

## After editing

- The table and hover tooltips update immediately.
- **Export** (CSV or XLSX) and **History** use the updated dictionary.
- If you load an analysis from History, you get the last saved state (including any edits made before you left or refreshed).

---

## Technical details

- **VariableEditModal** (`src/components/VariableEditModal.tsx`): Modal with form and optional “Ask AI to revise” section.
- **Revision prompt** (`src/services/prompts/columnAnalysis.ts`): `generateVariableRevisionPrompt(variable, userFeedback, contextText?)` builds the prompt so Claude returns a single revised variable as JSON.
- **AnalysisView** (`src/components/AnalysisView.tsx`): Renders the Edit button per row and the modal; calls the API for “Revise with AI” and updates `analysisResult` for both direct save and AI revision.

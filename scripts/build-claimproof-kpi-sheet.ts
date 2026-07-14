/**
 * Generate the Fleet Claim KPI spreadsheet template (.xlsx) with live formulas.
 *
 * Companion to the in-portal Fleet Claim KPI Dashboard: same eight KPIs, but as
 * an offline, editable spreadsheet a fleet owner keeps in Sheets/Excel. One row
 * per month, computed columns auto-fill. Opens natively in Google Sheets.
 *
 * Output: ~/Sites/bna-claim-proof/assets/claimproof_kpi_template.xlsx
 * Run: node --import tsx scripts/build-claimproof-kpi-sheet.ts
 */
import ExcelJS from "exceljs";
import path from "node:path";
import { homedir } from "node:os";

const OUT = path.join(homedir(), "Sites", "bna-claim-proof", "assets", "claimproof_kpi_template.xlsx");

const INK = "FF27262E";
const GOLD = "FFE19C63";
const CREAM = "FFF8F6F1";
const BLUE = "FF8BA5BE";

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Be Nice Autos - Claim Proof";
  wb.created = new Date(0);

  // ---- Monthly log ----
  const ws = wb.addWorksheet("Monthly Log", {
    views: [{ state: "frozen", ySplit: 3, xSplit: 1 }],
  });

  // Title band
  ws.mergeCells("A1:T1");
  const title = ws.getCell("A1");
  title.value = "Fleet Claim KPI Tracker  ·  Claim Proof";
  title.font = { name: "Arial", size: 15, bold: true, color: { argb: CREAM } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
  title.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(1).height = 30;

  ws.mergeCells("A2:T2");
  const sub = ws.getCell("A2");
  sub.value =
    "Enter one row per month from the left (white) columns. The gold columns compute automatically. Ten months of history make the trends meaningful.";
  sub.font = { name: "Arial", size: 9, italic: true, color: { argb: INK } };
  sub.alignment = { vertical: "middle", indent: 1, wrapText: false };
  ws.getRow(2).height = 20;

  const inputCols = [
    "Month",
    "Trips",
    "Claims opened",
    "Filed <24h",
    "Supplements",
    "Total gap $",
    "Recovered $",
    "Absorbed $",
    "Idle days",
    "Claims closed",
    "Days to close",
    "Response (d)",
    "Repeats",
  ];
  const calcCols = [
    "Claims/100 trips",
    "% filed in window",
    "Avg gap $",
    "% supplements",
    "Recovery rate",
    "Avg idle days",
    "Avg days to close",
  ];
  const headers = [...inputCols, ...calcCols];
  const headerRow = ws.getRow(3);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    const isCalc = i >= inputCols.length;
    cell.font = { name: "Arial", size: 9, bold: true, color: { argb: isCalc ? INK : CREAM } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isCalc ? GOLD : BLUE } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = { bottom: { style: "thin", color: { argb: INK } } };
  });
  headerRow.height = 30;

  // Column widths
  const widths = [12, 8, 12, 9, 11, 11, 11, 11, 9, 12, 12, 11, 9, 13, 13, 11, 12, 12, 11, 14];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  // Data rows: row 4 = worked example, rows 5-16 blank (all with formulas).
  // Column letters: A Month, B Trips, C Claims, D Filed, E Supp, F Gap$, G Rec$,
  // H Abs$, I Idle, J Closed, K CloseDays, L Response, M Repeats,
  // N Claims/100, O %Filed, P AvgGap, Q %Supp, R Recovery, S AvgIdle, T AvgClose
  const example = ["Example month", 128, 7, 6, 3, 4200, 9100, 1600, 41, 5, 96, 0.6, 1];
  for (let r = 4; r <= 16; r++) {
    const row = ws.getRow(r);
    const isExample = r === 4;
    for (let c = 1; c <= 13; c++) {
      const cell = row.getCell(c);
      if (isExample) cell.value = example[c - 1] as string | number;
      cell.font = { name: "Arial", size: 10, italic: isExample, color: { argb: INK } };
      cell.alignment = { horizontal: c === 1 ? "left" : "center" };
      if (c >= 6 && c <= 8) cell.numFmt = '$#,##0';
    }
    // Formula columns (guard divide-by-zero with IF).
    const f: Array<[number, string, string?]> = [
      [14, `IF(B${r}=0,"",C${r}/B${r}*100)`, "0.0"],
      [15, `IF(C${r}=0,"",D${r}/C${r})`, "0%"],
      [16, `IF(C${r}=0,"",F${r}/C${r})`, "$#,##0"],
      [17, `IF(C${r}=0,"",E${r}/C${r})`, "0%"],
      [18, `IF((G${r}+H${r})=0,"",G${r}/(G${r}+H${r}))`, "0%"],
      [19, `IF(C${r}=0,"",I${r}/C${r})`, "0.0"],
      [20, `IF(J${r}=0,"",K${r}/J${r})`, "0.0"],
    ];
    for (const [c, formula, fmt] of f) {
      const cell = row.getCell(c);
      cell.value = { formula, result: undefined } as ExcelJS.CellFormulaValue;
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: INK } };
      cell.alignment = { horizontal: "center" };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFBF3E9" } };
      if (fmt) cell.numFmt = fmt;
    }
    row.height = 18;
  }

  // ---- Read me ----
  const rm = wb.addWorksheet("How to use");
  rm.getColumn(1).width = 100;
  const notes = [
    ["Fleet Claim KPI Tracker"],
    [""],
    ["1. Each month, pull your numbers from the Claim Proof Fleet Tracker export."],
    ["2. Add one row on the Monthly Log tab. Fill only the blue (input) columns."],
    ["3. The gold columns compute for you: claims per 100 trips, % filed in the window,"],
    ["   average valuation gap, % needing supplements, recovery rate, average idle days,"],
    ["   and average days to close."],
    [""],
    ["Reading the numbers:"],
    ["- % filed in the window: aim for 100%. Anything less is a handoff-timing fix."],
    ["- Response (days): keep it under one business day. It is the number you fully control."],
    ["- Repeats: any repeat-incident car or staff member is a lemon forming or a training gap."],
    ["- The rest are trend metrics: watch them move month over month, do not judge one reading."],
    [""],
    ["Ten months of history make these meaningful. Two do not. Keep the log and let the pattern show."],
    [""],
    ["Operational guidance, not legal, insurance, or claims-adjusting advice. Not affiliated with Turo Inc."],
  ];
  notes.forEach((n, i) => {
    const cell = rm.getCell(i + 1, 1);
    cell.value = n[0];
    const isTitle = i === 0;
    const isHead = n[0].endsWith(":");
    cell.font = {
      name: "Arial",
      size: isTitle ? 14 : 10,
      bold: isTitle || isHead,
      color: { argb: INK },
    };
  });

  await wb.xlsx.writeFile(OUT);
  console.log(`✓ wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

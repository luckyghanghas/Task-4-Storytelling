const fs = require("fs");
const path = require("path");

let pptxgen;
try {
  pptxgen = require("pptxgenjs");
} catch {
  pptxgen = require("C:/Users/lucky/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/pptxgenjs@4.0.1/node_modules/pptxgenjs");
}

const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "data", "sales_transactions_cleaned.csv");
const OUTPUT_PATH = path.join(ROOT, "presentation", "task_4_data_storytelling.pptx");

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      cells.push(current);
      current = "";
    } else current += ch;
  }
  cells.push(current);
  return cells;
}

function readCsv(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, idx) => [header, cells[idx]]));
  });
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function group(rows, key) {
  const out = new Map();
  rows.forEach((row) => {
    const name = row[key];
    if (!out.has(name)) out.set(name, []);
    out.get(name).push(row);
  });
  return [...out.entries()].map(([name, items]) => ({ name, rows: items }));
}

function money(value) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function pct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "luckyghanghas";
pptx.company = "ApexPlanet Data Analytics Internship";
pptx.subject = "Task 4 Data Storytelling and Statistical Validation";
pptx.title = "Retail Sales Analytics Story";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineLayout({ name: "LAYOUT_WIDE", width: 13.333, height: 7.5 });

const rows = readCsv(DATA_PATH);
const revenue = sum(rows, "revenue");
const grossProfit = sum(rows, "gross_profit");
const orders = rows.length;
const aov = revenue / orders;
const returnRate = sum(rows, "returned_flag") / orders;
const rating = sum(rows, "customer_rating") / orders;
const channels = group(rows, "sales_channel").map((g) => ({
  name: g.name,
  value: sum(g.rows, "revenue"),
  satisfaction: g.rows.filter((row) => Number(row.customer_rating) >= 4).length / g.rows.length,
})).sort((a, b) => b.value - a.value);
const categories = group(rows, "category").map((g) => ({
  name: g.name,
  revenue: sum(g.rows, "revenue"),
  returnRate: sum(g.rows, "returned_flag") / g.rows.length,
})).sort((a, b) => b.revenue - a.revenue);
const monthly = group(rows, "month").map((g) => ({ name: g.name, value: sum(g.rows, "revenue") })).sort((a, b) => a.name.localeCompare(b.name)).slice(-8);

const COLORS = {
  ink: "172126",
  green: "17343A",
  teal: "2F6F73",
  rust: "A35C2D",
  blue: "5368A6",
  sage: "789262",
  red: "B74D4A",
  bg: "F6F7F4",
  line: "D9DED8",
  muted: "66736D",
};

function title(slide, text, sub) {
  slide.addText(text, { x: 0.55, y: 0.32, w: 9.8, h: 0.38, fontFace: "Aptos Display", fontSize: 20, bold: true, color: COLORS.green, margin: 0 });
  if (sub) slide.addText(sub, { x: 0.55, y: 0.72, w: 9.6, h: 0.24, fontSize: 8.7, color: COLORS.muted, margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.55, y: 1.04, w: 12.1, h: 0, line: { color: COLORS.line, width: 1 } });
}

function footer(slide, n) {
  slide.addText(`Task 4 | ${String(n).padStart(2, "0")}`, { x: 11.3, y: 7.02, w: 1.2, h: 0.18, fontSize: 7.5, color: COLORS.muted, align: "right", margin: 0 });
}

function panel(slide, x, y, w, h, fill = "FFFFFF") {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: COLORS.line, width: 1 } });
}

function metric(slide, x, y, label, value, color) {
  panel(slide, x, y, 2.32, 0.92);
  slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.07, h: 0.92, fill: { color }, line: { color } });
  slide.addText(label, { x: x + 0.18, y: y + 0.14, w: 1.8, h: 0.18, fontSize: 7.5, color: COLORS.muted, margin: 0 });
  slide.addText(value, { x: x + 0.18, y: y + 0.42, w: 1.85, h: 0.32, fontSize: 17, bold: true, color: COLORS.ink, margin: 0, fit: "shrink" });
}

function bullets(slide, items, x, y, w, color = COLORS.ink) {
  slide.addText(items.map((item) => ({ text: item, options: { bullet: { type: "ul" }, breakLine: true } })), {
    x, y, w, h: 2.8, fontSize: 12, color, breakLine: false, fit: "shrink", margin: 0.02, paraSpaceAfterPt: 7,
  });
}

function barChart(slide, data, x, y, w, h, labelKey, valueKey, color, formatter = money) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  const rowH = h / data.length;
  data.forEach((d, idx) => {
    const yy = y + idx * rowH;
    const bw = (w - 1.6) * d[valueKey] / max;
    slide.addText(d[labelKey], { x, y: yy + 0.02, w: 1.18, h: 0.18, fontSize: 7.5, color: COLORS.ink, margin: 0, fit: "shrink" });
    slide.addShape(pptx.ShapeType.roundRect, { x: x + 1.28, y: yy, w: Math.max(0.08, bw), h: 0.16, rectRadius: 0.04, fill: { color }, line: { color } });
    slide.addText(formatter(d[valueKey]), { x: x + 1.36 + bw, y: yy - 0.01, w: 0.78, h: 0.18, fontSize: 6.8, color: COLORS.muted, margin: 0, fit: "shrink" });
  });
}

function statementSlide(n, headline, body, accent = COLORS.teal) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: COLORS.bg }, line: { transparency: 100 } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: accent }, line: { color: accent } });
  slide.addText(headline, { x: 0.72, y: 1.6, w: 9.8, h: 1.05, fontFace: "Aptos Display", fontSize: 31, bold: true, color: COLORS.green, margin: 0, fit: "shrink" });
  slide.addText(body, { x: 0.75, y: 3.08, w: 7.2, h: 0.78, fontSize: 14, color: "40504A", margin: 0, fit: "shrink" });
  footer(slide, n);
  return slide;
}

statementSlide(1, "Retail Sales Analytics: from clean data to growth decisions", "A business storytelling deck for Task 4, using KPI evidence and statistical validation to support recommendations.", COLORS.teal);

let slide = statementSlide(2, "Business question: where should we invest without damaging margin or customer experience?", "The answer is not simply more sales. The strongest path is profitable digital growth with tighter return-rate control.", COLORS.rust);

slide = pptx.addSlide();
slide.background = { color: COLORS.bg };
title(slide, "Dataset and Preparation", "Task 1 created a reliable base for EDA, dashboarding, and statistical testing");
panel(slide, 0.65, 1.38, 5.6, 4.55);
slide.addText("Raw data quality issues handled", { x: 0.95, y: 1.72, w: 4.5, h: 0.24, fontSize: 13, bold: true, color: COLORS.ink, margin: 0 });
bullets(slide, ["Duplicate order records removed", "Mixed date formats standardized", "Missing customer age and payment fields handled", "Revenue outliers corrected and recalculated"], 1.0, 2.22, 4.8);
panel(slide, 6.65, 1.38, 5.85, 4.55, "EAF1EE");
slide.addText("Analysis-ready fields created", { x: 6.95, y: 1.72, w: 4.4, h: 0.24, fontSize: 13, bold: true, color: COLORS.ink, margin: 0 });
bullets(slide, ["gross_profit and gross_margin", "month for trend analysis", "age_group for segmentation", "returned_flag for statistical and dashboard work"], 7.0, 2.22, 4.9);
footer(slide, 3);

slide = pptx.addSlide();
slide.background = { color: COLORS.bg };
title(slide, "Current Performance Snapshot", "KPI view from the cleaned sales transaction dataset");
metric(slide, 0.62, 1.35, "Revenue", money(revenue), COLORS.teal);
metric(slide, 3.02, 1.35, "Orders", orders.toLocaleString("en-US"), COLORS.rust);
metric(slide, 5.42, 1.35, "AOV", money(aov), COLORS.blue);
metric(slide, 7.82, 1.35, "Gross Margin", pct(grossProfit / revenue), COLORS.sage);
metric(slide, 10.22, 1.35, "Return Rate", pct(returnRate), COLORS.red);
panel(slide, 0.72, 2.78, 11.8, 2.8);
slide.addText("What the numbers mean", { x: 1.05, y: 3.08, w: 3.4, h: 0.3, fontSize: 15, bold: true, color: COLORS.ink, margin: 0 });
slide.addText(`The business has a healthy digital sales base, ${pct(grossProfit / revenue)} gross margin, and ${rating.toFixed(2)} average customer rating. The next decision should protect profit and experience while growing revenue.`, { x: 1.05, y: 3.6, w: 10.3, h: 0.62, fontSize: 15, color: "40504A", margin: 0, fit: "shrink" });
footer(slide, 4);

slide = pptx.addSlide();
slide.background = { color: COLORS.bg };
title(slide, "Revenue Mix: digital channels carry the growth story", "Website and Mobile App are the primary engines");
panel(slide, 0.72, 1.35, 6.0, 4.8);
barChart(slide, channels, 1.05, 1.85, 5.15, 2.4, "name", "value", COLORS.teal);
panel(slide, 7.1, 1.35, 5.4, 4.8, "F4E8DD");
slide.addText("Business reading", { x: 7.45, y: 1.78, w: 3.2, h: 0.3, fontSize: 14, bold: true, color: COLORS.ink, margin: 0 });
bullets(slide, ["Website is the largest revenue source.", "Mobile App is close enough to justify focused retention campaigns.", "Retail Store supports the mix but should not be treated as the main growth channel."], 7.5, 2.32, 4.25);
footer(slide, 5);

slide = pptx.addSlide();
slide.background = { color: COLORS.bg };
title(slide, "Product and Category Story", "Revenue strength should be balanced with return risk");
panel(slide, 0.72, 1.32, 5.95, 4.9);
barChart(slide, categories, 1.04, 1.8, 5.1, 2.8, "name", "revenue", COLORS.blue);
panel(slide, 7.0, 1.32, 5.52, 4.9);
slide.addText("Return-rate watchlist", { x: 7.34, y: 1.72, w: 3.2, h: 0.26, fontSize: 13.5, bold: true, color: COLORS.ink, margin: 0 });
categories.sort((a, b) => b.returnRate - a.returnRate).forEach((cat, idx) => {
  const y = 2.22 + idx * 0.64;
  slide.addText(cat.name, { x: 7.38, y, w: 1.7, h: 0.2, fontSize: 9, color: COLORS.ink, margin: 0 });
  slide.addShape(pptx.ShapeType.roundRect, { x: 9.1, y: y + 0.02, w: 2.0 * cat.returnRate / Math.max(...categories.map((c) => c.returnRate)), h: 0.15, rectRadius: 0.04, fill: { color: COLORS.red }, line: { color: COLORS.red } });
  slide.addText(pct(cat.returnRate), { x: 11.28, y: y - 0.01, w: 0.55, h: 0.18, fontSize: 7.5, color: COLORS.muted, margin: 0 });
});
slide.addText("Higher-return categories need better product explanation, expectation setting, and support.", { x: 7.34, y: 5.18, w: 4.45, h: 0.42, fontSize: 9.2, color: "40504A", margin: 0, fit: "shrink" });
footer(slide, 6);

slide = pptx.addSlide();
slide.background = { color: COLORS.bg };
title(slide, "Deep-Dive Finding", "The best strategy combines digital retention with return reduction");
panel(slide, 0.8, 1.55, 3.55, 3.95, "FFFFFF");
panel(slide, 4.9, 1.55, 3.55, 3.95, "EAF1EE");
panel(slide, 9.0, 1.55, 3.55, 3.95, "F4E8DD");
slide.addText("1", { x: 1.08, y: 1.82, w: 0.4, h: 0.3, fontSize: 18, bold: true, color: COLORS.teal, margin: 0 });
slide.addText("Grow digital", { x: 1.1, y: 2.28, w: 2.4, h: 0.3, fontSize: 15, bold: true, color: COLORS.ink, margin: 0 });
slide.addText("Prioritize Website and Mobile App because they carry most revenue.", { x: 1.1, y: 2.85, w: 2.55, h: 0.8, fontSize: 11, color: "40504A", margin: 0, fit: "shrink" });
slide.addText("2", { x: 5.18, y: 1.82, w: 0.4, h: 0.3, fontSize: 18, bold: true, color: COLORS.sage, margin: 0 });
slide.addText("Protect profit", { x: 5.2, y: 2.28, w: 2.4, h: 0.3, fontSize: 15, bold: true, color: COLORS.ink, margin: 0 });
slide.addText("Keep gross margin visible in the same dashboard as revenue.", { x: 5.2, y: 2.85, w: 2.55, h: 0.8, fontSize: 11, color: "40504A", margin: 0, fit: "shrink" });
slide.addText("3", { x: 9.28, y: 1.82, w: 0.4, h: 0.3, fontSize: 18, bold: true, color: COLORS.rust, margin: 0 });
slide.addText("Reduce returns", { x: 9.3, y: 2.28, w: 2.4, h: 0.3, fontSize: 15, bold: true, color: COLORS.ink, margin: 0 });
slide.addText("Target category and region issues before they become customer trust problems.", { x: 9.3, y: 2.85, w: 2.55, h: 0.8, fontSize: 11, color: "40504A", margin: 0, fit: "shrink" });
footer(slide, 7);

slide = pptx.addSlide();
slide.background = { color: COLORS.bg };
title(slide, "Statistical Validation", "Two-proportion z-test comparing high-satisfaction rates");
panel(slide, 0.72, 1.35, 5.85, 4.9);
slide.addText("Hypothesis", { x: 1.05, y: 1.74, w: 2.0, h: 0.28, fontSize: 14, bold: true, color: COLORS.ink, margin: 0 });
slide.addText("H0: Website and Mobile App have the same high-satisfaction rate.\nH1: Mobile App has a different high-satisfaction rate.", { x: 1.05, y: 2.25, w: 4.8, h: 1.0, fontSize: 12, color: "40504A", margin: 0, fit: "shrink" });
slide.addText("High satisfaction = rating 4 or 5", { x: 1.05, y: 4.1, w: 4.1, h: 0.28, fontSize: 11, bold: true, color: COLORS.teal, margin: 0 });
panel(slide, 6.92, 1.35, 5.6, 4.9, "FFFFFF");
[
  ["Website high-satisfaction", "68.9%"],
  ["Mobile App high-satisfaction", "70.6%"],
  ["Z statistic", "0.592"],
  ["P-value", "0.5540"],
  ["95% confidence interval", "-3.9% to 7.3%"],
].forEach((row, idx) => {
  const y = 1.78 + idx * 0.68;
  slide.addText(row[0], { x: 7.25, y, w: 3.1, h: 0.22, fontSize: 9.5, color: COLORS.muted, margin: 0 });
  slide.addText(row[1], { x: 10.58, y: y - 0.03, w: 1.25, h: 0.25, fontSize: 12, bold: true, color: COLORS.ink, margin: 0, fit: "shrink" });
});
slide.addText("Interpretation: p-value is above 0.05, so do not over-claim a statistically significant satisfaction difference between channels.", { x: 7.25, y: 5.25, w: 4.65, h: 0.38, fontSize: 8.8, color: "40504A", margin: 0, fit: "shrink" });
footer(slide, 8);

slide = pptx.addSlide();
slide.background = { color: COLORS.bg };
title(slide, "Recommendations", "Actions that connect revenue, margin, and experience");
const recs = [
  ["Increase digital retention", "Create loyalty and repeat-purchase campaigns for Website and Mobile App customers."],
  ["Fix high-return experience gaps", "Improve product pages, expectation setting, and support in categories with higher returns."],
  ["Make KPI review weekly", "Track revenue, gross margin, return rate, and customer rating in one leadership dashboard."],
];
recs.forEach((rec, idx) => {
  const y = 1.5 + idx * 1.45;
  panel(slide, 0.85, y, 11.5, 0.92, idx === 1 ? "EAF1EE" : "FFFFFF");
  slide.addText(String(idx + 1), { x: 1.18, y: y + 0.22, w: 0.36, h: 0.25, fontSize: 15, bold: true, color: idx === 0 ? COLORS.teal : idx === 1 ? COLORS.sage : COLORS.rust, margin: 0 });
  slide.addText(rec[0], { x: 1.85, y: y + 0.17, w: 2.75, h: 0.3, fontSize: 13.5, bold: true, color: COLORS.ink, margin: 0 });
  slide.addText(rec[1], { x: 5.0, y: y + 0.17, w: 6.15, h: 0.36, fontSize: 10.2, color: "40504A", margin: 0, fit: "shrink" });
});
footer(slide, 9);

slide = pptx.addSlide();
slide.background = { color: COLORS.green };
slide.addText("Next Steps", { x: 0.72, y: 0.62, w: 4.0, h: 0.55, fontFace: "Aptos Display", fontSize: 28, bold: true, color: "FFFFFF", margin: 0 });
[
  "Automate dashboard refresh using the cleaned dataset pipeline.",
  "Add customer lifetime value and repeat-purchase metrics.",
  "Connect marketing spend data to calculate true campaign ROI.",
  "Use the dashboard in weekly review meetings to track both growth and quality.",
].forEach((item, idx) => {
  const y = 1.65 + idx * 0.9;
  slide.addShape(pptx.ShapeType.ellipse, { x: 0.88, y: y + 0.05, w: 0.18, h: 0.18, fill: { color: idx % 2 === 0 ? "F4E8DD" : "DDEAD7" }, line: { transparency: 100 } });
  slide.addText(item, { x: 1.28, y, w: 9.2, h: 0.32, fontSize: 14, color: "FFFFFF", margin: 0, fit: "shrink" });
});
slide.addText("Conclusion: grow digital, protect margin, reduce returns, and validate important claims before making big decisions.", { x: 0.88, y: 6.25, w: 9.8, h: 0.42, fontSize: 11, color: "C8D6D1", margin: 0, fit: "shrink" });
footer(slide, 10);

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
pptx.writeFile({ fileName: OUTPUT_PATH });
console.log(`Task 4 PPTX written to ${OUTPUT_PATH}`);

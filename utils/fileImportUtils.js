// utils/fileImportUtils.js

// ---------- Basic helpers ----------
export const toUpper = (s) => String(s ?? "").trim().toUpperCase();
export const clean = (s) => String(s ?? "")
  .replace(/\r/g, "")
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/\t/g, " ")
  .replace(/\u00A0/g, " ")
  .replace(/[ ]{2,}/g, " ")
  .trim();

export const getExt = (name = "", uri = "", mime = "") => {
  const pick = (v) => (v || "").toLowerCase();
  const byName = pick(name.split(".").pop());
  const byUri = pick(uri.split(".").pop());
  const byMimeMap = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "text/csv": "csv",
    "application/vnd.ms-excel": "csv"
  };
  const byMime = byMimeMap[mime] || "";
  return byName || byUri || byMime || "";
};

export const normalizeAnswer = (val) => {
  const s = toUpper(val);
  if (/^(?:[1Ａ]|A|A\.)$/.test(s)) return "A";
  if (/^(?:[2Ｂ]|B|B\.)$/.test(s)) return "B";
  if (/^(?:[3Ｃ]|C|C\.)$/.test(s)) return "C";
  if (/^(?:[4Ｄ]|D|D\.)$/.test(s)) return "D";
  if (/^(?:[5Ｅ]|E|E\.)$/.test(s)) return "E";
  const m = s.match(/([A-E])/);
  return m ? m[1] : "";
};

// ---------- CSV ----------
export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => { row.push(cell); cell = ""; };
  const pushRow  = () => { rows.push(row); row = []; };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else { inQuotes = false; }
      } else { cell += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") pushCell();
      else if (ch === "\n") { pushCell(); pushRow(); }
      else if (ch === "\r") {}
      else cell += ch;
    }
  }
  pushCell(); pushRow();

  while (rows.length && rows[rows.length - 1].every((c) => String(c).trim() === "")) rows.pop();
  return rows;
};

// ---------- Header detection ----------
const norm = (s) => toUpper(String(s || "")).replace(/[^A-Z0-9]/g, "");
const headerMatch = (h, keys) => keys.some((k) => norm(h).includes(norm(k)));

export const resolveHeaderIndex = (headers = []) => {
  const idx = {
    question: -1, a: -1, b: -1, c: -1, d: -1, answer: -1, soalan_set: -1,
    question_en: -1, a_en: -1, b_en: -1, c_en: -1, d_en: -1
  };

  const qKeys = ["QUESTION_TEXT","QUESTION","SOALAN","Q","ITEM","STEM","TEXT","PERTANYAAN"];
  const qEnKeys = ["QUESTION_EN","QUESTION EN","EN_QUESTION","ENGLISH_QUESTION","SOALAN_EN","ENG_QUESTION"];

  const aKeys = ["OPTION_A","A","JAWAPAN_A","PILIHAN_A","CHOICE_A","OPTION1","OPTION 1","CHOICE1","CHOICE 1"];
  const bKeys = ["OPTION_B","B","JAWAPAN_B","PILIHAN_B","CHOICE_B","OPTION2","OPTION 2","CHOICE2","CHOICE 2"];
  const cKeys = ["OPTION_C","C","JAWAPAN_C","PILIHAN_C","CHOICE_C","OPTION3","OPTION 3","CHOICE3","CHOICE 3"];
  const dKeys = ["OPTION_D","D","JAWAPAN_D","PILIHAN_D","CHOICE_D","OPTION4","OPTION 4","CHOICE4","CHOICE 4"];

  const aEnKeys = aKeys.map(k => k + "_EN").concat(["OPTION_A_EN","CHOICE_A_EN","A_EN"]);
  const bEnKeys = bKeys.map(k => k + "_EN").concat(["OPTION_B_EN","CHOICE_B_EN","B_EN"]);
  const cEnKeys = cKeys.map(k => k + "_EN").concat(["OPTION_C_EN","CHOICE_C_EN","C_EN"]);
  const dEnKeys = dKeys.map(k => k + "_EN").concat(["OPTION_D_EN","CHOICE_D_EN","D_EN"]);

  const ansKeys = ["ANSWER","JAWAPAN","CORRECT","KUNCI","CORRECT_ANSWER","KEY","ANS","CORRECTANSWER"];
  const setKeys = ["SOALAN_SET","SET","QUESTION_SET","SETNAME","CATEGORY","SECTION"];

  headers.forEach((h, i) => {
    if (idx.question < 0 && headerMatch(h, qKeys)) idx.question = i;
    if (idx.question_en < 0 && headerMatch(h, qEnKeys)) idx.question_en = i;

    if (idx.a < 0 && headerMatch(h, aKeys)) idx.a = i;
    if (idx.b < 0 && headerMatch(h, bKeys)) idx.b = i;
    if (idx.c < 0 && headerMatch(h, cKeys)) idx.c = i;
    if (idx.d < 0 && headerMatch(h, dKeys)) idx.d = i;

    if (idx.a_en < 0 && headerMatch(h, aEnKeys)) idx.a_en = i;
    if (idx.b_en < 0 && headerMatch(h, bEnKeys)) idx.b_en = i;
    if (idx.c_en < 0 && headerMatch(h, cEnKeys)) idx.c_en = i;
    if (idx.d_en < 0 && headerMatch(h, dEnKeys)) idx.d_en = i;

    if (idx.answer < 0 && headerMatch(h, ansKeys)) idx.answer = i;
    if (idx.soalan_set < 0 && headerMatch(h, setKeys)) idx.soalan_set = i;
  });

  if (idx.question < 0) idx.question = 0;
  if (idx.a < 0) idx.a = 1;
  if (idx.b < 0) idx.b = 2;
  if (idx.c < 0) idx.c = 3;
  if (idx.d < 0) idx.d = 4;
  if (idx.answer < 0) idx.answer = 5;

  return idx;
};

// ---------- Vertical markers ----------
const isQStart = (s) => /^\s*\d+[\.)]\s+/.test(s);
const optRx   = /^\s*([A-Ea-e])[\.)\:\)]\s*(.*)$/;
const answerRx= /\b(ANSWER|JAWAPAN)\s*[:：]\s*([A-Ea-e])/i;

// ---------- Vertical text grouping (single column) ----------
export const groupVerticalFromLines = (lines = []) => {
  const items = [];
  let cur = null;

  const pushCur = () => { if (cur && clean(cur.question_text)) items.push(cur); cur = null; };

  lines.forEach((raw) => {
    const s = String(raw || "");
    if (isQStart(s)) {
      pushCur();
      cur = { question_text: clean(s.replace(/^\s*\d+[\.)]\s+/, "")), option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "" };
      return;
    }
    if (!cur) return;

    const m = s.match(optRx);
    if (m) {
      const letter = toUpper(m[1]);
      const body = clean(m[2]);
      if (letter === "A") cur.option_a = body;
      if (letter === "B") cur.option_b = body;
      if (letter === "C") cur.option_c = body;
      if (letter === "D") cur.option_d = body;
      return;
    }
    const am = s.match(answerRx);
    if (am) { cur.correct_option = toUpper(am[2]); return; }

    if (cur.option_d) cur.option_d += " " + clean(s);
    else if (cur.option_c) cur.option_c += " " + clean(s);
    else if (cur.option_b) cur.option_b += " " + clean(s);
    else if (cur.option_a) cur.option_a += " " + clean(s);
    else cur.question_text += " " + clean(s);
  });

  pushCur();
  return items;
};

// ---------- Plain-text strategies ----------
export const parseStrictFromText = (text) => parseAllFromText(text);
export const parseLenientFromText = (text) => parseAllFromText(text);
export const parseAllFromText = (text = "") => {
  const lines = String(text || "")
    .split(/\n/)
    .map((s) => s.trim())
    .filter((s) => s !== "");
  return groupVerticalFromLines(lines);
};

// ---------- XML helper ----------
export const xmlToText = (xml = "") =>
  String(xml || "").replace(/<[^>]+>/g, " ").replace(/[ ]{2,}/g, " ").trim();

// ---------- Flexible grid parser (enhanced) ----------
const parseGridFlexible = (grid) => {
  if (!grid || !grid.length) return [];

  const normGrid = grid
    .map(r => (Array.isArray(r) ? r.map(c => (c == null ? "" : String(c))) : []))
    .filter(r => r.some(c => String(c).trim() !== ""));

  if (!normGrid.length) return [];

  // Detect vertical two-column (BM in col A, EN in col B) by pattern ratio on first column
  const firstCol = normGrid.map(r => clean(r[0] || ""));
  const pattCount = firstCol.filter(s => isQStart(s) || optRx.test(s) || answerRx.test(s)).length;
  const verticalTwoColLikely = pattCount / normGrid.length >= 0.3;

  if (verticalTwoColLikely) {
    const items = [];
    let cur = null;

    const pushCur = () => { if (cur && clean(cur.question_text)) items.push(cur); cur = null; };
    const stripNum = (s) => clean(String(s || "").replace(/^\s*\d+[\.)]\s+/, ""));

    for (const row of normGrid) {
      const bm = clean(row[0] || "");
      const en = clean(row[1] || "");

      if (isQStart(bm)) {
        pushCur();
        cur = {
          question_text: stripNum(bm),
          question_text_en: stripNum(en),
          option_a: "", option_b: "", option_c: "", option_d: "",
          option_a_en: "", option_b_en: "", option_c_en: "", option_d_en: "",
          correct_option: ""
        };
        continue;
      }

      if (!cur) continue;

      const mBM = bm.match(optRx);
      const mEN = en.match(optRx);
      if (mBM) {
        const letter = toUpper(mBM[1]);
        const bodyBM = clean(mBM[2]);
        const bodyEN = mEN ? clean(mEN[2]) : clean(en);
        if (letter === "A") { cur.option_a = bodyBM; cur.option_a_en = bodyEN; }
        if (letter === "B") { cur.option_b = bodyBM; cur.option_b_en = bodyEN; }
        if (letter === "C") { cur.option_c = bodyBM; cur.option_c_en = bodyEN; }
        if (letter === "D") { cur.option_d = bodyBM; cur.option_d_en = bodyEN; }
        continue;
      }

      const aBM = bm.match(answerRx);
      const aEN = en.match(answerRx);
      if (aBM || aEN) {
        cur.correct_option = toUpper((aBM?.[2] || aEN?.[2] || "").toString());
        continue;
      }

      // Continuations for BM/EN question stem
      if (bm) cur.question_text += " " + clean(bm);
      if (en) cur.question_text_en = clean((cur.question_text_en || "") + " " + en);
    }

    pushCur();
    return items.filter(q => clean(q.question_text));
  }

  // Single column vertical
  const singleCol = normGrid.every(r => r.length <= 1 || r.slice(1).every(x => !String(x || "").trim()));
  if (singleCol) {
    const lines = normGrid.map(r => String(r[0] || "")).filter(s => String(s).trim() !== "");
    const grouped = groupVerticalFromLines(lines);
    if (grouped.length) return grouped;
  }

  // Headered row-per-question
  const headers = normGrid[0];
  const firstUpper = headers.map((x) => toUpper(x));
  const looksLikeHeader =
    firstUpper.some((x) => ["QUESTION","SOALAN","Q","QUESTION_TEXT","ITEM","STEM","TEXT"].includes(x)) ||
    firstUpper.some((x) => ["A","OPTION_A","JAWAPAN_A","PILIHAN_A","CHOICE_A","OPTION1","OPTION 1"].includes(x));

  if (looksLikeHeader) {
    const idx = resolveHeaderIndex(headers);
    const body = normGrid.slice(1);
    return body.map((row) => ({
      question_text: clean(row[idx.question] || ""),
      option_a: clean(row[idx.a] || ""),
      option_b: clean(row[idx.b] || ""),
      option_c: clean(row[idx.c] || ""),
      option_d: clean(row[idx.d] || ""),
      correct_option: normalizeAnswer(row[idx.answer] || ""),
      soalan_set: clean(idx.soalan_set >= 0 ? (row[idx.soalan_set] || "") : ""),
      question_text_en: clean(idx.question_en >= 0 ? (row[idx.question_en] || "") : ""),
      option_a_en: clean(idx.a_en >= 0 ? (row[idx.a_en] || "") : ""),
      option_b_en: clean(idx.b_en >= 0 ? (row[idx.b_en] || "") : ""),
      option_c_en: clean(idx.c_en >= 0 ? (row[idx.c_en] || "") : ""),
      option_d_en: clean(idx.d_en >= 0 ? (row[idx.d_en] || "") : "")
    })).filter(r => r.question_text || r.question_text_en);
  }

  // Bare rows → positional fallback
  return normGrid.map((row) => {
    const cells = row.map((x) => clean(x)).filter((x) => x !== "");
    return {
      question_text: cells[0] || "",
      option_a: cells[1] || "",
      option_b: cells[2] || "",
      option_c: cells[3] || "",
      option_d: cells[4] || "",
      correct_option: normalizeAnswer(cells[5] || "")
    };
  }).filter(r => r.question_text);
};

// ---------- XLSX parser: BM sheet + optional EN sheet merge ----------
export const parseXLSX_base64 = async (b64) => {
  try {
    const mod = await import("xlsx");
    const XLSX = mod?.default || mod;
    const wb = XLSX.read(b64, { type: "base64" });

    const names = wb.SheetNames || [];
    if (!names.length) return [];

    const pickBm = () => {
      const i = names.findIndex(n => /pre[-\s_]*test/i.test(String(n)));
      return i >= 0 ? names[i] : names[0];
    };
    const pickEn = () => {
      const i = names.findIndex(n => /(pre[-\s_]*test.*(en|english))|\benglish\b|\ben\b/i.test(String(n)));
      return i >= 0 ? names[i] : null;
    };

    const sheetToGrid = (name) => {
      const ws = wb.Sheets[name];
      if (!ws) return [];
      const grid = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, raw: false });
      return (grid || [])
        .map(r => (Array.isArray(r) ? r.map(c => (c == null ? "" : String(c))) : []))
        .filter(r => r.some(c => String(c).trim() !== ""));
    };

    const bmName = pickBm();
    const enName = pickEn();

    const bmGrid = sheetToGrid(bmName);
    const enGrid = enName ? sheetToGrid(enName) : [];

    const bmRows = parseGridFlexible(bmGrid);
    const enRowsRaw = parseGridFlexible(enGrid);

    const enRows = enRowsRaw.map(r => ({
      question_text_en: r.question_text || "",
      option_a_en: r.option_a || "",
      option_b_en: r.option_b || "",
      option_c_en: r.option_c || "",
      option_d_en: r.option_d || ""
    }));

    const merged = bmRows.map((r, i) => ({ ...r, ...(enRows[i] || {}) }));
    const limited = /pre[-\s_]*test/i.test(String(bmName)) ? merged.slice(0, 30) : merged;
    return limited;
  } catch (e) {
    console.warn("[fileImportUtils] XLSX parse error:", e?.message || e);
    return [];
  }
};

// ---------- DOCX/PPTX placeholders ----------
export const parseDOCX_base64 = async (_b64) => {
  console.warn("[fileImportUtils] DOCX parsing not implemented. Returning empty rows.");
  return [];
};
export const parsePPTX_base64 = async (_b64) => {
  console.warn("[fileImportUtils] PPTX parsing not implemented. Returning empty rows.");
  return [];
};

// ---------- PDF helpers ----------
export const pdfTextFromBase64_webOnly = async (_b64) => {
  console.warn("[fileImportUtils] pdfTextFromBase64_webOnly not wired; returning empty text.");
  return "";
};

export const webPdfHtml = (pdfBase64) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>html,body{margin:0;padding:0;background:#121212;color:#eee;font-family:system-ui}</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    (function(){
      const post = (msg) => {
        try {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(msg));
          } else if (window.parent && window.parent.postMessage) {
            window.parent.postMessage(JSON.stringify(msg), "*");
          }
        } catch(e) {}
      };
      const b64 = "${pdfBase64}";
      function b64ToUint8(b64) {
        const raw = atob(b64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        return arr;
      }
      async function run(){
        try{
          const data = b64ToUint8(b64);
          const pdf = await window["pdfjsLib"].getDocument({ data }).promise;
          let text = "";
          const num = pdf.numPages;
          for (let i = 1; i <= num; i++){
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const items = content.items || [];
            text += items.map(x => x.str || "").join("\\n") + "\\n";
          }
          post({ ok: true, text });
        }catch(err){
          post({ ok: false, error: String(err && err.message || err) });
        }
      }
      document.addEventListener("DOMContentLoaded", run);
    })();
  </script>
</head>
<body>
  <div style="padding:12px;font-size:14px">Parsing PDF…</div>
</body>
</html>
`;

// ---------- Errors ----------
export const getFormatSpecificError = (ext, language = "ms") => {
  const ms = {
    pdf: "PDF tidak boleh diekstrak. Cuba DOCX/CSV atau muat naik versi teks.",
    docx: "DOCX memerlukan parser. Sila cuba CSV/teks buat sementara.",
    xlsx: "XLSX memerlukan parser. Sila cuba CSV buat sementara.",
    pptx: "PPTX memerlukan parser. Sila cuba CSV/teks buat sementara.",
    csv: "CSV tidak dikenali. Sila semak format lajur atau cuba versi lain.",
    default: "Format tidak disokong atau kandungan tidak boleh diimport."
  };
  const en = {
    pdf: "PDF text could not be extracted. Try DOCX/CSV or a text version.",
    docx: "DOCX parsing is not available yet. Please try CSV/text for now.",
    xlsx: "XLSX parsing is not available yet. Please try CSV for now.",
    pptx: "PPTX parsing is not available yet. Please try CSV/text for now.",
    csv: "CSV not recognized. Check column layout or try a different export.",
    default: "Format not supported or content could not be imported."
  };
  return (language === "en" ? en : ms)[ext] || (language === "en" ? en : ms).default;
};

// ---------- Utilities ----------
export const safeImport = async (imp) => { try { return await imp(); } catch (e) { console.warn(e); return null; } };

export const processLargeFileInChunks = async (items = [], chunkSize = 500, fn = async () => {}) => {
  for (let i = 0; i < items.length; i += chunkSize) {
    const slice = items.slice(i, i + chunkSize);
    // eslint-disable-next-line no-await-in-loop
    await fn(slice, i / chunkSize);
  }
};
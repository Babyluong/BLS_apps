import React, { useRef, useState, useMemo, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator,
  ScrollView, Alert, Platform, TextInput
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import LuxuryShell from "../components/LuxuryShell";
import { BRAND1, BRAND2 } from "../constants";
import supabase from "../services/supabase";

import {
  toUpper, clean, getExt, normalizeAnswer,
  parseCsv, resolveHeaderIndex,
  parseStrictFromText, parseLenientFromText, parseAllFromText,
  xmlToText, groupVerticalFromLines,
  parseXLSX_base64, parseDOCX_base64, parsePPTX_base64,
  pdfTextFromBase64_webOnly, webPdfHtml,
  getFormatSpecificError, safeImport, processLargeFileInChunks
} from "../utils/fileImportUtils";

const TARGET_TABLE = "questions";

const strings = {
  en: {
    title: "Import Questions",
    subtitle: "Supports: PDF, DOCX, XLSX, PPTX, CSV. Select file, preview, then save.",
    noQuestions: "No questions found in the file or format could not be extracted.",
    selectFile: "Select File",
    selectAnother: "Select Another File",
    saveAll: "Save All Questions",
    showText: "Show Text",
    hideText: "Hide Text",
    questionSet: "Question Set:",
    setNamePlaceholder: "Enter question set name",
    setNameHelp: "This set name will be used for all imported questions",
    preview: "Preview",
    saveLog: "Save Log",
    failedRecords: "Failed Records",
    confirmSave: "Are you sure you want to save all questions?",
    success: "Completed",
    processing: "Processing...",
    showingFirst: "Showing first",
    of: "of",
    saving: "Saving"
  },
  ms: {
    title: "Import Soalan",
    subtitle: "Sokong: PDF, DOCX, XLSX, PPTX, CSV. Pilih fail, semak pratonton, kemudian simpan.",
    noQuestions: "Tiada soalan ditemui dalam fail atau format tidak dapat diekstrak.",
    selectFile: "Pilih Fail",
    selectAnother: "Pilih Fail Lain",
    saveAll: "Simpan Semua Soalan",
    showText: "Tunjuk Teks",
    hideText: "Sembunyi Teks",
    questionSet: "Set Soalan:",
    setNamePlaceholder: "Masukkan nama set soalan",
    setNameHelp: "Nama set ini akan digunakan untuk semua soalan yang diimport",
    preview: "Pratonton",
    saveLog: "Log Simpan",
    failedRecords: "Rekod Gagal",
    confirmSave: "Anda pasti mahu simpan semua soalan?",
    success: "Selesai",
    processing: "Memproses...",
    showingFirst: "Menunjukkan",
    of: "daripada",
    saving: "Menyimpan"
  }
};

const OneTapImportQuestionsScreen = ({ onBack, onSignOut }) => {
  const [language, setLanguage] = useState("ms");
  const t = useMemo(() => strings[language] || strings.ms, [language]);

  const [picked, setPicked] = useState(null);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [busy, setBusy] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [okCount, setOkCount] = useState(0);
  const [errCount, setErrCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [saveLog, setSaveLog] = useState([]);
  const [rawText, setRawText] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const fileInputRef = useRef(null);
  const [pdfB64ForWeb, setPdfB64ForWeb] = useState(null);
  const webResolveRef = useRef(null);
  const webRejectRef = useRef(null);

  const [soalanSet, setSoalanSet] = useState(`Soalan_Set_${Date.now()}`);
  const [showSetInput, setShowSetInput] = useState(false);

  // New state for tracking existing records and set name changes
  const [hasExistingRecords, setHasExistingRecords] = useState(false);
  const [originalSetName, setOriginalSetName] = useState("");

  const canSave = allRows.length > 0 && !busy;

  const log = useCallback((s) => setSaveLog((v) => [...v, s]), []);
  const generateUniqueSetName = useCallback(() => `Soalan_Set_${Date.now()}`, []);
  const resetSetName = useCallback(() => setSoalanSet(generateUniqueSetName()), [generateUniqueSetName]);

  const ensureBilingual = useCallback((q) => {
    const bm = {
      question_text: q.question_text || q.question_text_en || "",
      option_a: q.option_a || q.option_a_en || "",
      option_b: q.option_b || q.option_b_en || "",
      option_c: q.option_c || q.option_c_en || "",
      option_d: q.option_d || q.option_d_en || ""
    };
    const en = {
      question_text_en: q.question_text_en || q.question_text || "",
      option_a_en: q.option_a_en || q.option_a || "",
      option_b_en: q.option_b_en || q.option_b || "",
      option_c_en: q.option_c_en || q.option_c || "",
      option_d_en: q.option_d_en || q.option_d || ""
    };
    return { ...q, ...bm, ...en };
  }, []);

  const isDifferent = useCallback((enVal, bmVal) => {
    const a = clean(enVal || ""); const b = clean(bmVal || "");
    return a !== "" && a !== b;
  }, []);

  const getSupabaseError = (e) => {
    if (!e) return "Unknown error";
    return [e.code && `code=${e.code}`, e.details && `details=${e.details}`, e.hint && `hint=${e.hint}`, e.message && `message=${e.message}`]
      .filter(Boolean).join(" | ");
  };

  // Add function to update existing records when set name changes
  const updateExistingRecords = useCallback(async (oldSetName, newSetName) => {
    if (!oldSetName || !newSetName || oldSetName === newSetName) return;

    try {
      const { data: uData, error: uErr } = await supabase.auth.getUser();
      if (uErr || !uData?.user) {
        Alert.alert(language === 'ms' ? "Belum log masuk" : "Not signed in", 
                   language === 'ms' ? "Sila log masuk semula sebelum mengemas kini." : "Please sign in again before updating.");
        return;
      }

      const { error } = await supabase
        .from(TARGET_TABLE)
        .update({ soalan_set: newSetName })
        .eq('soalan_set', oldSetName);

      if (error) {
        console.error('Error updating set name:', error);
        Alert.alert(language === 'ms' ? "Gagal mengemas kini" : "Update failed", 
                   `${language === 'ms' ? 'Tidak dapat mengemas kini nama set' : 'Cannot update set name'}: ${getSupabaseError(error)}`);
      } else {
        log(`${language === 'ms' ? 'Berjaya mengemas kini nama set' : 'Successfully updated set name'}: ${oldSetName} → ${newSetName}`);
      }
    } catch (e) {
      console.error('Error in updateExistingRecords:', e);
      Alert.alert(language === 'ms' ? "Ralat" : "Error", String(e?.message || e));
    }
  }, [language, log]);

  /* ---- pick ---- */
  const doPick = async () => {
    setErrors([]); setSaveLog([]); setPreview([]); setAllRows([]);
    setPicked(null); setRawText(""); setShowRaw(false); setStatus("");
    setHasExistingRecords(false);
    setOriginalSetName("");
    resetSetName();

    if (Platform.OS === "web") {
      if (fileInputRef.current) fileInputRef.current.value = "";
      fileInputRef.current?.click();
      return;
    }

    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: false, copyToCacheDirectory: true,
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "text/csv",
          "application/vnd.ms-excel",
        ],
      });
      if (res.canceled) return;
      const file = res.assets?.[0];
      if (!file) return;

      const ext = getExt(file.name, file.uri, file.mimeType);
      setPicked(file);
      setStatus(`${language === 'ms' ? 'Memilih fail' : 'Selected file'}: ${file.name} (${ext})`);
      setBusy(true);

      const { rows, text } = await parseByTypeNative(file.uri, ext);
      setRawText(text || "");
      if (!rows.length) {
        Alert.alert(language === 'ms' ? "Tiada soalan ditemui" : "No questions found", getFormatSpecificError(ext, language));
      }
      
      // Check if any rows have existing set names
      const hasExistingSet = rows.some(row => row.soalan_set && row.soalan_set.trim() !== "");
      if (hasExistingSet) {
        const firstSetName = rows.find(row => row.soalan_set && row.soalan_set.trim() !== "")?.soalan_set;
        setOriginalSetName(firstSetName);
        setHasExistingRecords(true);
        setSoalanSet(firstSetName); // Use the existing set name from the file
      }

      const rowsWithSet = rows.map(row => ensureBilingual({
        ...row,
        soalan_set: row.soalan_set || soalanSet
      }));
      setAllRows(rowsWithSet);
      setPreview(rowsWithSet.slice(0, 10));
      setStatus(rowsWithSet.length ? `${language === 'ms' ? 'Soalan ditemui' : 'Questions found'}: ${rowsWithSet.length}` : "");
    } catch (e) {
      setStatus("");
      Alert.alert(language === 'ms' ? "Ralat import" : "Import Error", String(e?.message || e));
    } finally { setBusy(false); }
  };

  const onWebFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const name = f.name || "file";
    const ext = getExt(name, "", f.type);
    setPicked({ name, uri: name, mimeType: f.type });
    setErrors([]); setSaveLog([]); setPreview([]); setAllRows([]);
    setRawText(""); setShowRaw(false); setBusy(true);
    setHasExistingRecords(false);
    setOriginalSetName("");
    resetSetName();
    setStatus(`${language === 'ms' ? 'Memilih fail' : 'Selected file'}: ${name} (${ext})`);

    try {
      const { rows, text } = await parseByTypeWeb(f, ext);
      setRawText(text || "");
      if (!rows.length) {
        Alert.alert(language === 'ms' ? "Tiada soalan ditemui" : "No questions found", getFormatSpecificError(ext, language));
      }
      
      // Check if any rows have existing set names
      const hasExistingSet = rows.some(row => row.soalan_set && row.soalan_set.trim() !== "");
      if (hasExistingSet) {
        const firstSetName = rows.find(row => row.soalan_set && row.soalan_set.trim() !== "")?.soalan_set;
        setOriginalSetName(firstSetName);
        setHasExistingRecords(true);
        setSoalanSet(firstSetName); // Use the existing set name from the file
      }

      const rowsWithSet = rows.map(row => ensureBilingual({
        ...row,
        soalan_set: row.soalan_set || soalanSet
      }));
      setAllRows(rowsWithSet);
      setPreview(rowsWithSet.slice(0, 10));
      setStatus(rowsWithSet.length ? `${language === 'ms' ? 'Soalan ditemui' : 'Questions found'}: ${rowsWithSet.length}` : "");
    } catch (err) {
      setStatus("");
      Alert.alert(language === 'ms' ? "Ralat import" : "Import Error", String(err?.message || err));
    } finally { setBusy(false); }
  };

  /* ---- native parse ---- */
  const parseByTypeNative = async (uri, ext) => {
    if (ext === "csv") {
      const text = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
      return { rows: await parseCSV_text(text), text };
    }
    if (ext === "xlsx") {
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      return { rows: await parseXLSX_base64(b64), text: "" };
    }
    if (ext === "docx") {
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      return { rows: await parseDOCX_base64(b64), text: "" };
    }
    if (ext === "pptx") {
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      return { rows: await parsePPTX_base64(b64), text: "" };
    }
    if (ext === "pdf") {
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      return await new Promise((resolve, reject) => {
        webResolveRef.current = (rows2, text2) => resolve({ rows: rows2, text: text2 || "" });
        webRejectRef.current = reject;
        setPdfB64ForWeb(b64);
      });
    }
    throw new Error(`${language === 'ms' ? 'Format tidak disokong' : 'Format not supported'}: .${ext}`);
  };

  /* ---- csv ---- */
  const parseCSV_text = async (text) => {
    const grid = parseCsv(text);
    if (!grid.length) return [];
    const singleCol = grid.every(r => r.length <= 1 || r.slice(1).every(x => !String(x || "").trim()));
    if (singleCol) {
      const lines = grid.map(r => String(r[0] || "")).filter(s => String(s).trim() !== "");
      const grouped = groupVerticalFromLines(lines);
      if (grouped.length) return grouped;
    }
    const first = grid[0].map((x) => toUpper(x));
    const looksLikeHeader =
      first.some((x) => ["QUESTION", "SOALAN", "Q", "QUESTION_TEXT"].includes(x)) ||
      first.some((x) => ["A", "OPTION_A", "JAWAPAN_A", "PILIHAN_A"].includes(x));
    if (!looksLikeHeader) {
      return grid.map((row) => ({
        question_text: clean(row[0] || ""),
        option_a: clean(row[1] || ""),
        option_b: clean(row[2] || ""),
        option_c: clean(row[3] || ""),
        option_d: clean(row[4] || ""),
        correct_option: normalizeAnswer(row[5] || ""),
      })).filter((r) => r.question_text);
    }
    const headers = grid[0];
    const idx = resolveHeaderIndex(headers);
    const body = grid.slice(1);
    return body.map((row) => ({
      question_text: clean(row[idx.question] || ""),
      option_a: clean(row[idx.a] || ""),
      option_b: clean(row[idx.b] || ""),
      option_c: clean(row[idx.c] || ""),
      option_d: clean(row[idx.d] || ""),
      correct_option: normalizeAnswer(row[idx.answer] || ""),
      soalan_set: clean(row[idx.soalan_set] || ""),
      question_text_en: clean(row[idx.question_en] || ""),
      option_a_en: clean(row[idx.a_en] || ""),
      option_b_en: clean(row[idx.b_en] || ""),
      option_c_en: clean(row[idx.c_en] || ""),
      option_d_en: clean(row[idx.d_en] || "")
    })).filter((r) => r.question_text || r.question_text_en);
  };

  /* ---- web parse ---- */
  const parseByTypeWeb = async (file, ext) => {
    const readAsText = () =>
      new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onerror = () => rej(new Error(language === 'ms' ? "Gagal membaca teks" : "Failed to read text"));
        fr.onload = () => res(String(fr.result || ""));
        fr.readAsText(file);
      });
    const readAsBase64 = () =>
      new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onerror = () => rej(new Error(language === 'ms' ? "Gagal membaca fail" : "Failed to read file"));
        fr.onload = () => {
          const dataURL = String(fr.result || "");
          const b64 = dataURL.split(",")[1] || "";
          res(b64);
        };
        fr.readAsDataURL(file);
      });

    if (ext === "csv") {
      const text = await readAsText();
      return { rows: await parseCSV_text(text), text };
    }
    if (ext === "xlsx") {
      const b64 = await readAsBase64();
      return { rows: await parseXLSX_base64(b64), text: "" };
    }
    if (ext === "docx") {
      const b64 = await readAsBase64();
      return { rows: await parseDOCX_base64(b64), text: "" };
    }
    if (ext === "pptx") {
      const b64 = await readAsBase64();
      return { rows: await parsePPTX_base64(b64), text: "" };
    }
    if (ext === "pdf") {
      const b64 = await readAsBase64();
      const text = await pdfTextFromBase64_webOnly(b64);
      const rows = parseAllFromText(text);
      return { rows, text };
    }
    throw new Error(`${language === 'ms' ? 'Format tidak disokong' : 'Format not supported'}: .${ext}`);
  };

  /* ---- WebView callback (native PDF) ---- */
  const onWebMessage = (ev) => {
    try {
      const msg = JSON.parse(ev?.nativeEvent?.data || "{}");
      if (msg.ok) {
        const text = String(msg.text || "");
        const rows = parseAllFromText(text);
        const rowsWithSet = rows.map(row => ensureBilingual({
          ...row,
          soalan_set: row.soalan_set || soalanSet
        }));
        webResolveRef.current && webResolveRef.current(rowsWithSet, text);
      } else {
        webRejectRef.current && webRejectRef.current(new Error(msg.error || (language === 'ms' ? "Gagal PDF dalam WebView" : "PDF failed in WebView")));
      }
    } catch (e) {
      webRejectRef.current && webRejectRef.current(e);
    } finally {
      setPdfB64ForWeb(null);
      webResolveRef.current = null;
      webRejectRef.current = null;
      setStatus("");
    }
  };

  /* ---- save to Supabase (static table) ---- */
  const makePayload = (rows) =>
    rows.map((q) => ({
      question_text: q.question_text || null, 
      option_a: q.option_a || null, 
      option_b: q.option_b || null, 
      option_c: q.option_c || null, 
      option_d: q.option_d || null, 
      correct_option: q.correct_option || null,
      soalan_set: q.soalan_set || soalanSet,
      question_text_en: q.question_text_en || null,
      option_a_en: q.option_a_en || null,
      option_b_en: q.option_b_en || null,
      option_c_en: q.option_c_en || null,
      option_d_en: q.option_d_en || null,
    }));

  const runSave = async () => {
    if (!allRows.length) {
      Alert.alert(language === 'ms' ? "Tiada data" : "No data", 
                 language === 'ms' ? "Pilih fail dan pastikan pratonton muncul sebelum menyimpan." : "Select a file and ensure preview appears before saving.");
      return;
    }

    const { data: uData, error: uErr } = await supabase.auth.getUser();
    if (uErr || !uData?.user) {
      Alert.alert(language === 'ms' ? "Belum log masuk" : "Not signed in", 
                 language === 'ms' ? "Sila log masuk semula sebelum menyimpan." : "Please sign in again before saving.");
      return;
    }

    setConfirmOpen(false);
    setBusy(true); setErrors([]); setSaveLog([]); setProgress({ done: 0, total: allRows.length });

    let ok = 0, fail = 0; const errs = [];

    // If set name changed and we have existing records, update them first
    if (hasExistingRecords && originalSetName && originalSetName !== soalanSet) {
      log(`${language === 'ms' ? 'Mengemas kini nama set sedia ada' : 'Updating existing set name'}: ${originalSetName} → ${soalanSet}`);
      await updateExistingRecords(originalSetName, soalanSet);
    }

    // preflight insert (one row) to surface RLS/grant errors immediately
    try {
      const probe = makePayload([allRows[0]])[0];
      const pre = await supabase.from(TARGET_TABLE).insert(probe).select('id').single();
      if (pre.error) throw pre.error;
      if (pre.data?.id) await supabase.from(TARGET_TABLE).delete().eq('id', pre.data.id);
      log(`${language === 'ms' ? 'Ujian insert berjaya' : 'Insert preflight ok'}`);
    } catch (e) {
      const em = `${language === 'ms' ? 'Tidak boleh simpan (RLS/izin)' : 'Cannot save (RLS/grants)'}: ${getSupabaseError(e)}`;
      log(em); errs.push(em);
      setBusy(false); setErrors(errs);
      Alert.alert(language === 'ms' ? "Gagal simpan" : "Save failed", em);
      return;
    }

    const chunk = 100;
    for (let i = 0; i < allRows.length; i += chunk) {
      const slice = allRows.slice(i, i + chunk);
      const payload = makePayload(slice);
      const res = await supabase.from(TARGET_TABLE).insert(payload);
      if (res.error) {
        fail += slice.length;
        const msg = `[${TARGET_TABLE}] batch ${Math.floor(i / chunk) + 1} failed: ${getSupabaseError(res.error)}`;
        errs.push(msg); log(msg);
      } else {
        ok += slice.length;
        log(`[${TARGET_TABLE}] batch ${Math.floor(i / chunk) + 1}: OK +${slice.length}`);
      }
      setProgress({ done: Math.min(i + slice.length, allRows.length), total: allRows.length });
    }

    setOkCount(ok);
    setErrCount(fail);
    setErrors(errs);
    setBusy(false);
    setSuccessOpen(true);

    if (fail > 0) {
      const combined = errs.join("\n");
      Alert.alert(language === 'ms' ? "Sebahagian gagal" : "Partial failure", combined.slice(0, 900) + (combined.length > 900 ? "…" : ""));
    } else {
      Alert.alert(language === 'ms' ? "Selesai" : "Completed", 
                 `${language === 'ms' ? 'Berjaya simpan' : 'Successfully saved'} ${ok} ${language === 'ms' ? 'soalan' : 'questions'} ${language === 'ms' ? 'ke jadual' : 'to table'} ${TARGET_TABLE}.`);
    }
  };

  const title = picked ? `${t.title} — ${picked.name}` : t.title;

  return (
    <LuxuryShell title={title} onSignOut={onSignOut}>
      {Platform.OS === "web" && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.xlsx,.pptx,.csv"
          style={{ display: "none" }}
          onChange={onWebFile}
        />
      )}

      <View style={styles.languageToggle}>
        <TouchableOpacity onPress={() => setLanguage("ms")} style={[styles.langBtn, language === "ms" && styles.langBtnActive]}>
          <Text style={[styles.langText, language === "ms" && styles.langTextActive]}>BM</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLanguage("en")} style={[styles.langBtn, language === "en" && styles.langBtnActive]}>
          <Text style={[styles.langText, language === "en" && styles.langTextActive]}>EN</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
        <Text style={styles.backText}>{language === 'ms' ? 'Kembali' : 'Back'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.card}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
          {!!status && <Text style={{ color: "#d7ccb7", marginTop: 8 }}>{String(status)}</Text>}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
            <Text style={{ color: '#d7ccb7', marginRight: 8 }}>{t.questionSet}</Text>
            <TouchableOpacity onPress={() => setShowSetInput(!showSetInput)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#e9ddc4', fontWeight: 'bold' }}>{soalanSet}</Text>
              <MaterialCommunityIcons name={showSetInput ? "chevron-up" : "chevron-down"} size={20} color="#e9ddc4" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {showSetInput && (
            <View style={{ marginBottom: 12 }}>
              <TextInput
                value={soalanSet}
                onChangeText={setSoalanSet}
                placeholder={t.setNamePlaceholder}
                placeholderTextColor="#9b907b"
                style={{
                  color: '#e9ddc4',
                  borderWidth: 1,
                  borderColor: 'rgba(230,210,150,0.5)',
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
              />
              <Text style={{ color: '#9b907b', fontSize: 12, marginTop: 4 }}>{t.setNameHelp}</Text>
              {hasExistingRecords && originalSetName && originalSetName !== soalanSet && (
                <Text style={{ color: '#c3e88d', fontSize: 12, marginTop: 4 }}>
                  {language === 'ms' ? 'Nama set akan dikemas kini untuk semua soalan sedia ada' : 'Set name will be updated for all existing questions'}
                </Text>
              )}
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <TouchableOpacity onPress={doPick} style={styles.browseBtn} activeOpacity={0.9} disabled={busy}
              accessible={true} accessibilityLabel={picked ? t.selectAnother : t.selectFile}>
              <MaterialCommunityIcons name="file-search-outline" size={18} color="#1c1710" />
              <Text style={styles.browseTxt}>{picked ? t.selectAnother : t.selectFile}</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={() => setConfirmOpen(true)} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.6 }}
              accessible={true} accessibilityLabel={t.saveAll}>
              <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn]}>
                {busy ? <ActivityIndicator size="small" color="#1c1710" /> : <Text style={styles.btnText}>{t.saveAll} {allRows.length ? `(${allRows.length})` : ""}</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {rawText ? (
              <TouchableOpacity onPress={() => setShowRaw(v => !v)} style={[styles.browseBtn, { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(230,210,150,0.28)" }]}>
                <MaterialCommunityIcons name={showRaw ? "eye-off-outline" : "eye-outline"} size={18} color="#e9ddc4" />
                <Text style={{ color: "#e9ddc4", fontWeight: "900" }}>{showRaw ? t.hideText : t.showText}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {!!(busy && progress.total > 0) && (
            <Text style={{ color: "#cfc5ae", marginTop: 8 }}>
              {t.saving}: {progress.done}/{progress.total}
            </Text>
          )}
        </View>

        {picked && (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.title}>{t.preview}</Text>
            {preview.length === 0 ? (
              <Text style={{ color: "#d7ccb7", marginTop: 6 }}>{t.noQuestions}</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {preview.map((q, idx) => (
                  <View key={idx} style={styles.qCard}>
                    <Text style={styles.qTitle}>{idx + 1}. {q.question_text || "-"}</Text>
                    {isDifferent(q.question_text_en, q.question_text) && (
                      <Text style={styles.qTitleEn}>{q.question_text_en}</Text>
                    )}
                    <View style={styles.optRow}>
                      <Text style={styles.optBullet}>A.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.optText}>{q.option_a || "-"}</Text>
                        {isDifferent(q.option_a_en, q.option_a) && <Text style={styles.optTextEn}>{q.option_a_en}</Text>}
                      </View>
                    </View>
                    <View style={styles.optRow}>
                      <Text style={styles.optBullet}>B.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.optText}>{q.option_b || "-"}</Text>
                        {isDifferent(q.option_b_en, q.option_b) && <Text style={styles.optTextEn}>{q.option_b_en}</Text>}
                      </View>
                    </View>
                    <View style={styles.optRow}>
                      <Text style={styles.optBullet}>C.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.optText}>{q.option_c || "-"}</Text>
                        {isDifferent(q.option_c_en, q.option_c) && <Text style={styles.optTextEn}>{q.option_c_en}</Text>}
                      </View>
                    </View>
                    <View style={styles.optRow}>
                      <Text style={styles.optBullet}>D.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.optText}>{q.option_d || "-"}</Text>
                        {isDifferent(q.option_d_en, q.option_d) && <Text style={styles.optTextEn}>{q.option_d_en}</Text>}
                      </View>
                    </View>
                  </View>
                ))}
                {allRows.length > preview.length && (
                  <Text style={{ color: "#9b907b", marginTop: 6 }}>
                    {language === 'ms'
                      ? `${t.showingFirst} ${preview.length} ${t.of} ${allRows.length}`
                      : `${t.showingFirst} ${preview.length} ${t.of} ${allRows.length}`
                    }
                  </Text>
                )}
              </View>
            )}

            {showRaw && !!rawText && (
              <View style={styles.rawBox}>
                <ScrollView horizontal={true} contentContainerStyle={{ paddingBottom: 8 }}>
                  <Text selectable={true} style={styles.rawText}>{rawText}</Text>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {!!saveLog.length && (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.title}>{t.saveLog}</Text>
            <View style={styles.logBox}>
              {saveLog.map((line, i) => (
                <Text key={i} style={styles.logText}>• {line}</Text>
              ))}
            </View>
          </View>
        )}

        {!!errors.length && (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.title}>{t.failedRecords}</Text>
            <View style={styles.logBox}>
              {errors.map((line, i) => (
                <Text key={i} style={[styles.logText, { color: "#ffb4a2" }]}>• {line}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.saveAll}</Text>
            <Text style={styles.modalText}>{t.confirmSave}</Text>
            {hasExistingRecords && originalSetName && originalSetName !== soalanSet && (
              <Text style={[styles.modalText, { color: "#c3e88d", marginTop: 8, fontSize: 14 }]}>
                {language === 'ms' 
                  ? `Nama set akan dikemas kini dari "${originalSetName}" ke "${soalanSet}" untuk semua soalan sedia ada.`
                  : `Set name will be updated from "${originalSetName}" to "${soalanSet}" for all existing questions.`
                }
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setConfirmOpen(false)} style={[styles.modalBtn, { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(230,210,150,0.35)" }]}>
                <Text style={styles.modalBtnText}>{language === 'ms' ? 'Batal' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={runSave} style={styles.modalBtn}>
                <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalBtnGrad}>
                  <Text style={[styles.modalBtnText, { color: "#1c1710" }]}>{language === 'ms' ? 'Simpan' : 'Save'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={successOpen} transparent animationType="fade" onRequestClose={() => setSuccessOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.success}</Text>
            <Text style={styles.modalText}>
              {language === 'ms' ? 'Berjaya' : 'OK'}: {okCount}   •   {language === 'ms' ? 'Gagal' : 'Failed'}: {errCount}
            </Text>
            <TouchableOpacity onPress={() => setSuccessOpen(false)} style={[styles.modalBtn, { marginTop: 12 }]}>
              <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalBtnGrad}>
                <Text style={[styles.modalBtnText, { color: "#1c1710" }]}>{language === 'ms' ? 'Tutup' : 'Close'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {busy && (
        <View style={styles.busyOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#e9ddc4" />
          <Text style={{ color: "#d7ccb7", marginTop: 8 }}>
            {t.processing} {progress.total ? `(${progress.done}/${progress.total})` : ""}
          </Text>
        </View>
      )}
    </LuxuryShell>
  );
};

// ... existing code ...

const styles = StyleSheet.create({
  languageToggle: { flexDirection: "row", gap: 8, alignSelf: "flex-end", paddingHorizontal: 16, paddingTop: 8 },
  langBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(230,210,150,0.35)", backgroundColor: "transparent" },
  langBtnActive: { backgroundColor: "rgba(230,210,150,0.18)" },
  langText: { color: "#d7ccb7", fontWeight: "700" },
  langTextActive: { color: "#e9ddc4" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  backText: { color: "#e9ddc4", fontWeight: "700" },
  card: { marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(230,210,150,0.15)" },
  title: { color: "#e9ddc4", fontSize: 18, fontWeight: "900" },
  subtitle: { color: "#9b907b", marginTop: 6 },
  browseBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#e9ddc4", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  browseTxt: { color: "#1c1710", fontWeight: "900" },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, minWidth: 180, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#1c1710", fontWeight: "900" },
  qCard: { padding: 12, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(230,210,150,0.12)", marginBottom: 8 },
  qTitle: { color: "#e9ddc4", fontWeight: "800" },
  qTitleEn: { color: "#cfc5ae", fontStyle: "italic", marginTop: 2 },
  optRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  optBullet: { color: "#d7ccb7", fontWeight: "800", width: 18 },
  optText: { color: "#d7ccb7" },
  optTextEn: { color: "#cfc5ae", fontStyle: "italic", marginTop: 2 },
  correctLabel: { marginTop: 8, color: "#c3e88d", fontWeight: "800" },
  setLabel: { marginTop: 2, color: "#9b907b", fontStyle: "italic" },
  rawBox: { marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.25)", borderWidth: 1, borderColor: "rgba(230,210,150,0.12)", maxHeight: 220 },
  rawText: { color: "#d7ccb7", fontFamily: Platform.select({ ios: "Courier", android: "monospace", web: "monospace" }) },
  logBox: { marginTop: 8, gap: 6 },
  logText: { color: "#d7ccb7" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16 },
  modalCard: { width: "100%", maxWidth: 420, backgroundColor: "rgba(28,23,16,0.98)", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "rgba(230,210,150,0.15)" },
  modalTitle: { color: "#e9ddc4", fontWeight: "900", fontSize: 18 },
  modalText: { color: "#d7ccb7", marginTop: 8 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "flex-end" },
  modalBtn: { borderRadius: 8, overflow: "hidden" },
  modalBtnGrad: { paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  modalBtnText: { color: "#e9ddc4", fontWeight: "900" },
  webviewBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", padding: 16, justifyContent: "center" },
  webviewCard: { height: "70%", backgroundColor: "rgba(28,23,16,0.98)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(230,210,150,0.15)", padding: 12 },
  busyOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" }
});

export default OneTapImportQuestionsScreen;
// screens/OneTapImportUsersScreen.js
import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator,
  ScrollView, Alert, FlatList, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import LuxuryShell from "../components/LuxuryShell";
import { BRAND1, BRAND2 } from "../../constants";
import supabase from "../services/supabase";

/* ===================== Normalization Helpers ===================== */
const currentYear = new Date().getFullYear();
const toUpperName = (s = "") => String(s).trim().replace(/\s+/g, " ").toUpperCase();
const norm = (s = "") => String(s).trim();

const mapTempat = (raw) => {
  const u = String(raw || "").toUpperCase();
  if (u.includes("LIMBANG")) return "Hospital Limbang";
  if (u.includes("KK LAWAS")) return "KK Lawas";
  if (u.includes("KLINIK PERGIGIAN")) return "Klinik Pergigian Lawas";
  return "Hospital Lawas";
};

const yesNo = (v) => {
  const u = String(v || "").trim().toUpperCase();
  return u === "YA" || u === "YES";
};

const parseBlsYear = (v) => {
  const s = String(v || "").trim().toUpperCase();
  if (s.includes("PERTAMA")) return null; // “Pertama Kali”
  const m = s.match(/(19|20)\d{2}/);
  if (!m) return null;
  const y = parseInt(m[0], 10);
  return y >= 2015 && y <= currentYear ? y : null;
};

const composeJawatanGred = (job_positionRaw, gredRaw) => {
  const j = String(job_positionRaw || "").toUpperCase().trim();
  const g = String(gredRaw || "").toUpperCase().replace(/\s+/g, " ").trim();
  return g ? `${j} GRED ${g}` : j;
};

/* ---------- Flexible header picking (accept many header variants) ---------- */
const NK = (k) => String(k || "").toUpperCase().replace(/[^A-Z0-9]+/g, "");
function bySyn(row, syns) {
  const idx = {};
  Object.keys(row || {}).forEach((k) => { idx[NK(k)] = k; });
  for (const s of syns) {
    const hit = idx[NK(s)];
    if (hit != null) return row[hit];
  }
  const wantSet = new Set(syns.map(NK));
  const keys = Object.keys(idx);
  for (const w of wantSet) {
    const fuzzy = keys.find((k) => k.includes(w));
    if (fuzzy) return row[idx[fuzzy]];
  }
  return undefined;
}

const SYNS = {
  name: ["NAMA PENUH", "NAMA", "FULL NAME", "NAME"],
  ic: ["NO.KAD PENGENALAN","NO KAD PENGENALAN","NO KP","NO. KP","IC","NO.IC","NO IC","KAD PENGENALAN"],
  email: ["EMAIL","E-MEL","EMEL"],
  tempat: ["TEMPAT BERTUGAS","TEMPAT","LOKASI","TEMPATBERTUGAS","HOSPITAL","FACILITY"],
  job_position: ["JAWATAN","POSITION","JAWATAN PENUH"],
  gred: ["GRED","GRADE"],
  bls: ["TAHUN TERAKHIR MENGHADIRI KURSUS BLS","TAHUN TERAKHIR KURSUS BLS","BLS TAHUN","TAHUN BLS","BLS"],
  alergik: ["ALERGIK","ALERGI","ALLERGY"],
  alergikTo: ["ALERGIK TERHADAP","DETAIL ALERGIK","ALLERGY TO","ALERGI TERHADAP"],
  asma: ["MENGHADAPI MASALAH LELAH (ASTHMA)","ASMA","ASTHMA"],
  hamil: ["SEDANG HAMIL","HAMIL","PREGNANT"],
};

function normalizeRow(row) {
  const full_name = toUpperName(bySyn(row, SYNS.name) || "");
  const ic = norm(bySyn(row, SYNS.ic) || "");
  const email = norm(bySyn(row, SYNS.email) || "");
  const tempat_bertugas = mapTempat(bySyn(row, SYNS.tempat) || "");
  const job_positionOnly = bySyn(row, SYNS.job_position) || "";
  const gred = bySyn(row, SYNS.gred) || "";
  const job_position = composeJawatanGred(job_positionOnly, gred);
  const bls_last_year = parseBlsYear(bySyn(row, SYNS.bls) || "");

  const alergik = yesNo(bySyn(row, SYNS.alergik) || "");
  const alergik_details_raw = String(bySyn(row, SYNS.alergikTo) || "").trim();
  const alergik_details_upper = alergik_details_raw.toUpperCase();
  const alergik_details =
    alergik && alergik_details_raw &&
    !["TIADA","NIL","NONE","N/A","-"].includes(alergik_details_upper)
      ? alergik_details_raw
      : null;

  const asma = yesNo(bySyn(row, SYNS.asma) || "");
  const hamil = yesNo(bySyn(row, SYNS.hamil) || "");
  const hamil_weeks = null;

  if (!full_name || !ic || !tempat_bertugas || !job_positionOnly) {
    throw new Error("Data tidak lengkap (nama / IC / tempat / job_position).");
  }

  return {
    full_name, ic, email: email || null, phone_number: null,
    tempat_bertugas, job_position, bls_last_year,
    alergik, alergik_details, asma, hamil, hamil_weeks,
  };
}

/* ===================== XLSX helpers ===================== */
function sheetToJson(XLSX, ws) {
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

// Native: copy content:// to cache; Web: not used
async function copyToCache(uri, nameHint = "import") {
  const safeName = (nameHint || "import").replace(/[^a-zA-Z0-9._-]/g, "_");
  const dest = FileSystem.cacheDirectory + `${Date.now()}_${safeName}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

/* ===================== Screen ===================== */
export default function OneTapImportUsersScreen({ onBack, onSignOut }) {
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [okCount, setOkCount] = useState(0);
  const [errCount, setErrCount] = useState(0);
  const [errors, setErrors] = useState([]);

  const [fileName, setFileName] = useState("");

  // Sheets & rows
  const [sheetNames, setSheetNames] = useState([]); // string[]
  const [sheetRows, setSheetRows] = useState([]);   // Array<Array<object>>
  const [sheetIndex, setSheetIndex] = useState(0);

  const workingRows = useMemo(() => sheetRows[sheetIndex] || [], [sheetRows, sheetIndex]);

  const previewAll = useMemo(() => {
    if (workingRows.length === 0) return [];
    return workingRows.map((row) => {
      try { return { ok: true, n: normalizeRow(row) }; }
      catch (e) { return { ok: false, err: String(e?.message || e) }; }
    });
  }, [workingRows]);
  const validCount = useMemo(() => previewAll.filter(p => p.ok).length, [previewAll]);

  // ---- Pick & Parse file (handles Web + Native) ----
  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
          "application/csv",
          "text/plain",
        ],
        multiple: false, copyToCacheDirectory: true,
      });
      if (res?.canceled) return;

      // Normalize asset payload across platforms
      const asset =
        (Array.isArray(res?.assets) && res.assets[0]) ||
        (res?.type === "success" ? { uri: res.uri, name: res.name, mimeType: res.mimeType || "", file: res.file } : null);

      if (!asset?.uri && !asset?.file) {
        Alert.alert("Ralat", "Tidak dapat membaca fail yang dipilih.");
        return;
      }

      setFileName(asset.name || "import.xlsx");

      // Load xlsx
      let XLSXmod;
      try { XLSXmod = require("xlsx"); }
      catch { Alert.alert("Perlu 'xlsx'", "Sila pasang: npm i xlsx"); return; }

      let wb;
      const isCsv =
        (asset.mimeType || "").includes("csv") ||
        (asset.mimeType || "").includes("text/plain") ||
        (asset.name || "").toLowerCase().endsWith(".csv") ||
        (asset.name || "").toLowerCase().endsWith(".txt");

      if (Platform.OS === "web") {
        // Web: use File object if provided; else fetch the blob
        let fileObj = asset.file || null;
        if (!fileObj) {
          const resp = await fetch(asset.uri);
          const blob = await resp.blob();
          fileObj = blob;
        }

        if (isCsv) {
          const text = await fileObj.text();
          wb = XLSXmod.read(text, { type: "string" });
        } else {
          const ab = await fileObj.arrayBuffer();
          wb = XLSXmod.read(new Uint8Array(ab), { type: "array" });
        }
      } else {
        // Native: make sure we have a file:// path
        const localPath = asset.uri.startsWith("file://")
          ? asset.uri
          : await copyToCache(asset.uri, asset.name || "import");

        if (isCsv) {
          const text = await FileSystem.readAsStringAsync(localPath, { encoding: FileSystem.EncodingType.UTF8 });
          wb = XLSXmod.read(text, { type: "string" });
        } else {
          const b64 = await FileSystem.readAsStringAsync(localPath, { encoding: FileSystem.EncodingType.Base64 });
          wb = XLSXmod.read(b64, { type: "base64" });
        }
      }

      const names = wb.SheetNames || [];
      const rowsPerSheet = names.map((nm) => sheetToJson(XLSXmod, wb.Sheets[nm]));

      setSheetNames(names);
      setSheetRows(rowsPerSheet);

      // auto-pick first non-empty sheet
      const firstNonEmpty = Math.max(0, rowsPerSheet.findIndex((a) => Array.isArray(a) && a.length > 0));
      setSheetIndex(firstNonEmpty);

      Alert.alert(
        "Berjaya",
        `Fail dimuat: ${asset.name}\nSheet: ${names.length}\nRekod pada sheet dipilih: ${rowsPerSheet[firstNonEmpty]?.length || 0}`
      );
    } catch (e) {
      Alert.alert("Ralat", String(e?.message || e));
    }
  };

  // ---- Import run ----
  const run = async () => {
    if (workingRows.length === 0) {
      Alert.alert("Tiada data", "Sila pilih fail/sheet yang mempunyai rekod.");
      return;
    }
    setConfirmOpen(false);
    setBusy(true);
    let ok = 0, fail = 0;
    const errs = [];

    for (let i = 0; i < workingRows.length; i++) {
      try {
        const payload = normalizeRow(workingRows[i]);
        const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "ic" });
        if (error) throw error;
        ok++;
      } catch (e) {
        fail++; errs.push(`Row ${i + 1} — ${String(e?.message || e)}`);
      }
    }

    setOkCount(ok); setErrCount(fail); setErrors(errs);
    setBusy(false); setSuccessOpen(true);
  };

  const PreviewItem = ({ item, index }) => {
    if (item.ok) {
      const p = item.n;
      return (
        <View style={styles.previewRow}>
          <Text style={styles.previewTxt}>
            {index + 1}. {p.full_name} • {p.ic} • {p.tempat_bertugas} • {p.job_position}
            {"  "}• BLS: {p.bls_last_year ? p.bls_last_year : "Pertama Kali/—"}
            {"  "}• Alergik: {p.alergik ? (p.alergik_details || "Ya") : "Tidak"}
            {"  "}• Asma: {p.asma ? "Ya" : "Tidak"}
            {"  "}• Hamil: {p.hamil ? "Ya" : "Tidak"}
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.previewRow, { borderColor: "rgba(255,130,130,0.35)" }]}>
        <Text style={[styles.previewTxt, { color: "#ffb3b3" }]}>
          {index + 1}. (Invalid) {item.err}
        </Text>
      </View>
    );
  };

  return (
    <LuxuryShell title="Tambah Peserta (One-Tap)" onSignOut={onSignOut}>
      {/* Back */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Import User</Text>
          <Text style={styles.subtitle}>
            Semua data akan disimpan ke jadual <Text style={{ fontWeight: "900", color: "#f5ead1" }}>users</Text> mengikut kriteria borang Add User.
          </Text>

          {/* Browse File */}
          <TouchableOpacity activeOpacity={0.9} onPress={pickFile} style={{ marginTop: 12 }} disabled={busy}>
            <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, busy && { opacity: 0.7 }]}>
              <MaterialCommunityIcons name="folder-open-outline" size={18} color="#1c1710" />
              <Text style={[styles.btnText, { marginLeft: 8 }]}>Pilih Fail (Excel/CSV)</Text>
            </LinearGradient>
          </TouchableOpacity>

          {!!fileName && (
            <Text style={{ color: "#d7ccb7", marginTop: 6 }}>
              Fail dipilih: <Text style={{ color: "#f5ead1", fontWeight: "800" }}>{fileName}</Text>
            </Text>
          )}

          {/* Sheet selector (if more than 1) */}
          {sheetNames.length > 1 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {sheetNames.map((nm, i) => {
                const on = i === sheetIndex;
                return (
                  <TouchableOpacity key={nm + i} onPress={() => setSheetIndex(i)} style={[styles.tabChip, on && styles.tabChipOn]}>
                    <Text style={[styles.tabTxt, on && styles.tabTxtOn]}>{nm}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Preview AFTER a file was parsed */}
          {sheetNames.length > 0 && (
            <>
              <Text style={{ color: "#f5ead1", fontWeight: "900", marginTop: 14 }}>
                Pratonton Import — Sheet: {sheetNames[sheetIndex] || "(?)"} • Rekod: {workingRows.length}
                {workingRows.length > 0 ? ` (Sah: ${validCount}, Tidak Sah: ${workingRows.length - validCount})` : ""}
              </Text>

              {workingRows.length === 0 ? (
                <Text style={{ color: "#d7ccb7", marginTop: 6 }}>Tiada rekod pada sheet ini. Sila pilih sheet lain.</Text>
              ) : (
                <View style={{ marginTop: 8, maxHeight: 420 }}>
                  <FlatList
                    data={previewAll}
                    keyExtractor={(_it, idx) => String(idx)}
                    renderItem={({ item, index }) => <PreviewItem item={item} index={index} />}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                  />
                </View>
              )}
            </>
          )}

          {/* Save */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setConfirmOpen(true)}
            style={{ marginTop: 14 }}
            disabled={busy || workingRows.length === 0}
          >
            <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, (busy || workingRows.length === 0) && { opacity: 0.6 }]}>
              {busy ? <ActivityIndicator size="small" color="#1c1710" /> : <Text style={styles.btnText}>Simpan Semua Peserta{workingRows.length > 0 ? ` (${workingRows.length})` : ""}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {errors.length > 0 && (
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.title}>Rekod Gagal</Text>
            {errors.map((e, i) => (
              <Text key={i} style={{ color: "#ffb3b3", fontSize: 12, marginTop: 4 }}>{e}</Text>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Confirm modal */}
      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { alignItems: "center" }]}>
            <MaterialCommunityIcons name="alert-decagram" size={48} color="#e8c17a" />
            <Text style={[styles.modalTitle, { marginTop: 6 }]}>Anda pasti mahu simpan semua peserta?</Text>
            <Text style={{ color: "#d7ccb7", marginTop: 6, textAlign: "center" }}>Jumlah rekod: {workingRows.length}</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity onPress={() => setConfirmOpen(false)} style={styles.cancelBtn} disabled={busy}>
                <Text style={{ color: "#e9ddc4", fontWeight: "900" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={run} style={[styles.okBtn, busy && { opacity: 0.6 }]} disabled={busy} activeOpacity={0.9}>
                {busy ? <ActivityIndicator color="#1c1710" /> : <Text style={{ color: "#1c1710", fontWeight: "900" }}>Teruskan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success popup */}
      <Modal visible={successOpen} transparent animationType="fade" onRequestClose={() => setSuccessOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { alignItems: "center" }]}>
            <MaterialCommunityIcons name="check-decagram" size={48} color="#e8c17a" />
            <Text style={[styles.modalTitle, { marginTop: 6 }]}>Pendaftaran Berjaya. Terima Kasih</Text>
            <Text style={{ color: "#d7ccb7", marginTop: 6, textAlign: "center" }}>Berjaya: {okCount} • Gagal: {errCount}</Text>
            <TouchableOpacity onPress={() => setSuccessOpen(false)} style={[styles.okBtn, { marginTop: 14 }]}>
              <Text style={{ color: "#1c1710", fontWeight: "900" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {busy && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
          <Text style={{ color: "#f5ead1", fontWeight: "800", marginTop: 12 }}>Menyimpan…</Text>
        </View>
      )}
    </LuxuryShell>
  );
}

/* ===================== Styles (unchanged look) ===================== */
const styles = StyleSheet.create({
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "#e9ddc4", marginLeft: 6, fontWeight: "700" },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.65)",
    padding: 16,
  },
  title: { color: "#f5ead1", fontSize: 18, fontWeight: "900" },
  subtitle: { color: "#d7ccb7", marginTop: 6 },

  btn: { borderRadius: 999, paddingVertical: 12, alignItems: "center", marginTop: 4, flexDirection: "row", justifyContent: "center" },
  btnText: { color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 },

  previewRow: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    padding: 10,
  },
  previewTxt: { color: "#d7ccb7", fontSize: 12 },

  tabChip: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  tabChipOn: { backgroundColor: "rgba(230,210,150,0.22)" },
  tabTxt: { color: "#d7ccb7", fontWeight: "800", fontSize: 12 },
  tabTxtOn: { color: "#1c1710" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 16 },
  modalSheet: {
    width: 520, maxWidth: "95%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.96)",
    padding: 16,
  },
  modalTitle: { color: "#f5ead1", fontSize: 18, fontWeight: "900", textAlign: "center" },
  okBtn: { backgroundColor: "#e9ddc4", borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  cancelBtn: { borderWidth: 1, borderColor: "rgba(230,210,150,0.28)", borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
});

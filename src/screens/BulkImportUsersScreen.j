// screens/BulkImportUsersScreen.js
import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ActivityIndicator, FlatList, Alert, ScrollView
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";
import { BRAND1, BRAND2 } from "../../constants";
import participants from "../data/participants";

// ===== Helpers =====
const currentYear = new Date().getFullYear();

function tCase(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/\b(\p{L})/gu, (m) => m.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function mapTempat(raw) {
  const u = String(raw || "").toUpperCase();
  if (u.includes("LIMBANG")) return "Hospital Limbang";
  if (u.includes("KK LAWAS")) return "KK Lawas";
  if (u.includes("KLINIK PERGIGIAN")) return "Klinik Pergigian Lawas";
  return "Hospital Lawas"; // default
}

function yesNo(val) {
  const u = String(val || "").trim().toUpperCase();
  return u === "YA" || u === "YES";
}

function parseBlsYear(v) {
  const s = String(v || "").trim();
  const m = s.match(/(20\d{2}|19\d{2})/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  if (y >= 2015 && y <= currentYear) return y;
  return null;
}

function normalizeOne(p) {
  // Accepts either Malay or lowercase keys
  const full_name =
    p["NAMA PENUH"] || p.name || "";
  const ic =
    p["NO.KAD PENGENALAN"] || p.ic || "";
  const email =
    p["EMAIL"] || p.email || "";
  const tempatRaw =
    p["TEMPAT BERTUGAS"] || p.tempatBertugas || "";
  const jawatanTitle =
    p["JAWATAN"] || p.jawatan || "";
  const gred =
    p["GRED"] || p.gred || "";
  const blsRaw =
    p["TAHUN TERAKHIR MENGHADIRI KURSUS BLS"] || p.tahunTerakhirBLS || "";
  const alergikRaw =
    p["ALERGIK"] || p.alergik || "";
  const alergikTerhadap =
    p["ALERGIK TERHADAP"] || p.alergikTerhadap || "";
  const asmaRaw =
    p["MENGHADAPI MASALAH LELAH (ASTHMA)"] || p.asma || "";
  const hamilRaw =
    p["SEDANG HAMIL"] || p.hamil || "";

  const tempat_bertugas = mapTempat(tempatRaw);

  // Compose jawatan with gred if present
  const jawatanBase = String(jawatanTitle || "").toUpperCase().trim();
  const grade = String(gred || "").toUpperCase().replace(/\s+/g, " ").trim();
  const jawatan = grade ? `${jawatanBase} GRED ${grade}` : jawatanBase;

  const bls_last_year = parseBlsYear(blsRaw);

  // alergik details: ignore "TIADA" / "NIL" / empty
  const ad = String(alergikTerhadap || "").trim().toUpperCase();
  const alergik_details = ad && !["TIADA", "NIL", "NONE", "N/A"].includes(ad) ? alergikTerhadap.trim() : null;

  const payload = {
    full_name: tCase(full_name).toUpperCase(),  // your login list uses uppercase names
    ic: String(ic || "").trim(),
    email: email ? String(email).trim() : null,
    phone_number: null, // list has no phone
    tempat_bertugas: tempat_bertugas,
    jawatan: jawatan,
    bls_last_year: bls_last_year,
    alergik: yesNo(alergikRaw),
    alergik_details: yesNo(alergikRaw) ? alergik_details : null,
    asma: yesNo(asmaRaw),
    hamil: yesNo(amilOrHamil(hamilRaw)),
    hamil_weeks: null, // not provided in list
  };

  // guard required
  if (!payload.full_name || !payload.ic || !payload.tempat_bertugas || !jawatanBase) {
    throw new Error("Missing required fields (name/ic/tempat/jawatan)");
  }
  return payload;
}

function amilOrHamil(v){ return v; } // helps keep normalizeOne readable

export default function BulkImportUsersScreen({ onBack, onSignOut }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [okCount, setOkCount] = useState(0);
  const [errCount, setErrCount] = useState(0);

  const preview = useMemo(() => {
    return participants.slice(0, 5).map((p, i) => {
      try {
        const n = normalizeOne(p);
        return { idx: i, ok: true, full_name: n.full_name, ic: n.ic, jawatan: n.jawatan, tempat: n.tempat_bertugas };
      } catch (e) {
        return { idx: i, ok: false, error: String(e?.message || e) };
      }
    });
  }, []);

  const startImport = async () => {
    setConfirmOpen(false);
    setRunning(true);
    const out = [];
    let oks = 0, errs = 0;

    for (let i = 0; i < participants.length; i++) {
      const row = participants[i];
      try {
        const payload = normalizeOne(row);

        // Insert (one-by-one so a failure doesn't stop all)
        // If you have a unique constraint on ic, you can use upsert:
        // await supabase.from("users").upsert(payload, { onConflict: "ic" });
        const { error } = await supabase.from("users").insert(payload);
        if (error) throw error;

        out.push({ i, ic: payload.ic, name: payload.full_name, status: "OK" });
        oks++;
      } catch (e) {
        out.push({ i, status: "ERROR", error: String(e?.message || e) });
        errs++;
      }
    }

    setResults(out);
    setOkCount(oks);
    setErrCount(errs);
    setRunning(false);
    setDoneOpen(true);
  };

  const Row = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.meta}>IC: {item.ic || "—"}</Text>
        <Text style={styles.meta}>Jawatan: {item.jawatan}</Text>
        <Text style={styles.meta}>Tempat: {item.tempat}</Text>
      </View>
    </View>
  );

  return (
    <LuxuryShell title="Bulk Import Peserta" onSignOut={onSignOut}>
      {/* Back */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pratonton (5 pertama)</Text>

          <View style={{ marginTop: 8 }}>
            {preview.map((p) =>
              p.ok ? (
                <View key={p.idx} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{p.full_name}</Text>
                    <Text style={styles.meta}>IC: {p.ic}</Text>
                    <Text style={styles.meta}>Jawatan: {p.jawatan}</Text>
                    <Text style={styles.meta}>Tempat: {p.tempat}</Text>
                  </View>
                </View>
              ) : (
                <View key={p.idx} style={[styles.row, { borderColor: "rgba(255,130,130,0.35)" }]}>
                  <Text style={[styles.meta, { color: "#ffb3b3" }]}>Row {p.idx + 1} invalid: {p.error}</Text>
                </View>
              )
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setConfirmOpen(true)}
            style={{ marginTop: 16 }}
            disabled={running}
          >
            <LinearGradient
              colors={[BRAND1, BRAND2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.btn, running && { opacity: 0.55 }]}
            >
              {running ? (
                <ActivityIndicator color="#1c1710" />
              ) : (
                <Text style={styles.btnText}>Mula Import Semua ({participants.length})</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {results.length > 0 && (
          <View style={[styles.card, { marginTop: 14 }]}>
            <Text style={styles.cardTitle}>Keputusan</Text>
            <Text style={{ color: "#d7ccb7", marginBottom: 8 }}>
              Berjaya: <Text style={{ color: "#f5ead1", fontWeight: "900" }}>{okCount}</Text> • Gagal:{" "}
              <Text style={{ color: "#ffb3b3", fontWeight: "900" }}>{errCount}</Text>
            </Text>
            <FlatList
              data={results}
              keyExtractor={(it, idx) => String(idx)}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.row,
                    item.status === "ERROR" && { borderColor: "rgba(255,130,130,0.35)" },
                  ]}
                >
                  <Text
                    style={{
                      color: item.status === "ERROR" ? "#ffb3b3" : "#d7ccb7",
                      fontSize: 12,
                    }}
                  >
                    {item.status} — Row #{item.i + 1} {item.name ? `(${item.name})` : ""}{" "}
                    {item.error ? `: ${item.error}` : ""}
                  </Text>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </View>
        )}
      </ScrollView>

      {/* Confirm modal */}
      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { alignItems: "center" }]}>
            <MaterialCommunityIcons name="alert-decagram" size={48} color="#e8c17a" />
            <Text style={[styles.modalTitle, { marginTop: 6 }]}>Anda pasti mahu import semua data?</Text>
            <Text style={{ color: "#d7ccb7", marginTop: 6, textAlign: "center" }}>
              Jumlah rekod: {participants.length}
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity onPress={() => setConfirmOpen(false)} style={[styles.cancelBtn]}>
                <Text style={{ color: "#e9ddc4", fontWeight: "900" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={startImport} style={[styles.okBtn]} activeOpacity={0.9}>
                <Text style={{ color: "#1c1710", fontWeight: "900" }}>Teruskan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Done modal */}
      <Modal visible={doneOpen} transparent animationType="fade" onRequestClose={() => setDoneOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { alignItems: "center" }]}>
            <MaterialCommunityIcons name="check-decagram" size={48} color="#e8c17a" />
            <Text style={[styles.modalTitle, { marginTop: 6 }]}>Selesai Import</Text>
            <Text style={{ color: "#d7ccb7", marginTop: 6, textAlign: "center" }}>
              Berjaya: {okCount} • Gagal: {errCount}
            </Text>
            <TouchableOpacity onPress={() => setDoneOpen(false)} style={[styles.okBtn, { marginTop: 14 }]}>
              <Text style={{ color: "#1c1710", fontWeight: "900" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {running && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
          <Text style={{ color: "#f5ead1", fontWeight: "800", marginTop: 12 }}>Mengimport…</Text>
        </View>
      )}
    </LuxuryShell>
  );
}

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
  cardTitle: { color: "#f5ead1", fontSize: 18, fontWeight: "900", marginBottom: 8 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    padding: 12,
  },
  name: { color: "#f5ead1", fontWeight: "900", fontSize: 15 },
  meta: { color: "#d7ccb7", marginTop: 2, fontSize: 12 },

  btn: { borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 16 },
  modalSheet: {
    width: 520,
    maxWidth: "95%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.96)",
    padding: 16,
  },
  modalTitle: { color: "#f5ead1", fontSize: 18, fontWeight: "900", textAlign: "center" },
  okBtn: {
    backgroundColor: "#e9ddc4",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelBtn: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.28)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
});

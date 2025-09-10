// screens/ListUsersScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";

// ===== Jawatan quick-filter options (exactly as requested) =====
const JAWATAN_FILTERS = [
  "PEGAWAI PERUBATAN",
  "PEGAWAI FARMASI",
  "PENOLONG PEGAWAI PERUBATAN",
  "JURURAWAT",
  "PENOLONG PEGAWAI FARMASI",
  "JURUTEKNOLOGI MAKMAL PERUBATAN",
  "JURUPULIH PERUBATAN CARAKERJA",
  "JURUPULIH FISIOTERAPI",
  "JURU-XRAY",
  "PENOLONG PEGAWAI TADBIR",
  "PEMBANTU KHIDMAT AM",
  "PEMBANTU PERAWATAN KESIHATAN",
  "PEMBANTU TADBIR",
  "JURURAWAT MASYARAKAT",
  "PENOLONG JURUTERA",
  "PEMBANTU PENYEDIAAN MAKANAN",
];

// Extract base title from a stored "jawatan" like "JURURAWAT GRED U 5"
const baseJawatanTitle = (raw = "") => {
  const t = String(raw).toUpperCase().trim();
  const cut = t.indexOf(" GRED ");
  return cut >= 0 ? t.slice(0, cut) : t;
};

// Compare chosen filter against stored "jawatan" title
const matchesJawatan = (chosen, raw) =>
  baseJawatanTitle(raw) === String(chosen || "").toUpperCase();

export default function ListUsersScreen({ onBack, onSignOut, navigation, goToAdminMenu }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Filters & search
  const [q, setQ] = useState("");
  const [jawatan, setJawatan] = useState("");
  const [alergik, setAlergik] = useState(""); // "", "YA", "TIDAK"
  const [hamil, setHamil] = useState("");     // "", "YA", "TIDAK"

  // Default: show all
  const [showAll, setShowAll] = useState(true);

  // Jawatan picker modal
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleBack = () => {
    if (typeof goToAdminMenu === "function") return goToAdminMenu();
    if (typeof onBack === "function") return onBack();
    if (navigation?.canGoBack?.() && navigation.canGoBack()) return navigation.goBack();
  };

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, full_name, ic, email, tempat_bertugas, jawatan, bls_last_year, alergik, alergik_details, asma, hamil"
              .replace("tempat_bertugas","tempat_bertugas") // keep exact column name
          )
          .order("full_name", { ascending: true });
        if (error) throw error;
        if (!on) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!on) return;
        setErr(String(e?.message || e));
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toUpperCase();

    return rows.filter((r) => {
      // Text match
      const okText =
        !term ||
        [r.full_name, r.ic, r.email, r.tempat_bertugas, r.jawatan]
          .filter(Boolean)
          .map((v) => String(v).toUpperCase())
          .some((v) => v.includes(term));

      // Jawatan quick filter (exact titles only)
      const okJawatan = !jawatan || matchesJawatan(jawatan, r.jawatan);

      // Health toggles
      const al = r.alergik ? "YA" : "TIDAK";
      const hm = r.hamil ? "YA" : "TIDAK";
      const okAlergik = !alergik || al === alergik;
      const okHamil = !hamil || hm === hamil;

      // Show list even without filters if showAll=true
      return (showAll || term || jawatan || alergik || hamil)
        ? okText && okJawatan && okAlergik && okHamil
        : false;
    });
  }, [rows, q, jawatan, alergik, hamil, showAll]);

  const clearFilters = () => {
    setQ("");
    setJawatan("");
    setAlergik("");
    setHamil("");
    setShowAll(true); // keep showing everything
  };

  const Cell = ({ children, style }) => (
    <View style={[styles.cell, style]}>
      <Text style={styles.cellTxt} numberOfLines={2}>{children ?? "—"}</Text>
    </View>
  );

  return (
    <LuxuryShell title="Senarai Peserta" onSignOut={onSignOut}>
      {/* Back */}
      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>

      {/* Filters bar */}
      <View style={styles.filtersBar}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={18} color="#e7e3d6" />
          <TextInput
            placeholder="Cari nama / IC / emel / tempat / jawatan…"
            placeholderTextColor="#9a917e"
            value={q}
            onChangeText={setQ}
            style={{ color: "#efe7d2", marginLeft: 8, flex: 1 }}
          />
        </View>

        <TouchableOpacity onPress={() => setPickerOpen(true)} style={styles.filterBtn}>
          <MaterialCommunityIcons name="briefcase-outline" size={16} color="#e7e3d6" />
          <Text style={styles.filterTxt}>{jawatan || "Jawatan (pilihan pantas)"}</Text>
        </TouchableOpacity>

        <TriToggle label="Alergik" value={alergik} onChange={setAlergik} />
        <TriToggle label="Hamil" value={hamil} onChange={setHamil} />

        <TouchableOpacity onPress={clearFilters} style={[styles.filterBtn, { paddingHorizontal: 12 }]}>
          <MaterialCommunityIcons name="filter-remove-outline" size={16} color="#e7e3d6" />
          <Text style={styles.filterTxt}>Bersih</Text>
        </TouchableOpacity>

        {showAll ? (
          <TouchableOpacity onPress={() => setShowAll(false)} style={[styles.filterBtn, { paddingHorizontal: 12 }]}>
            <MaterialCommunityIcons name="eye-off-outline" size={16} color="#e7e3d6" />
            <Text style={styles.filterTxt}>Sembunyi Semua</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowAll(true)} style={[styles.filterBtn, { paddingHorizontal: 12 }]}>
            <MaterialCommunityIcons name="eye-outline" size={16} color="#e7e3d6" />
            <Text style={styles.filterTxt}>Tunjuk Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ padding: 18, alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#d7ccb7", marginTop: 8 }}>Memuatkan…</Text>
        </View>
      ) : err ? (
        <Text style={styles.error}>{err}</Text>
      ) : filtered.length === 0 ? (
        <View style={styles.placeholder}>
          <MaterialCommunityIcons name="table-search" size={42} color="#e9ddc4" />
          <Text style={styles.placeholderTitle}>Tiada paparan</Text>
          <Text style={styles.placeholderText}>
            Tiada rekod sepadan dengan tapisan semasa.
          </Text>
        </View>
      ) : (
        <View style={styles.tableWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.row, styles.headerRow]}>
                <Cell style={{ width: 240 }}><Text style={styles.headTxt}>FULL NAME</Text></Cell>
                <Cell style={{ width: 160 }}><Text style={styles.headTxt}>IC</Text></Cell>
                <Cell style={{ width: 240 }}><Text style={styles.headTxt}>EMAIL</Text></Cell>
                <Cell style={{ width: 220 }}><Text style={styles.headTxt}>TEMPAT BERTUGAS</Text></Cell>
                <Cell style={{ width: 300 }}><Text style={styles.headTxt}>JAWATAN</Text></Cell>
                <Cell style={{ width: 180 }}><Text style={styles.headTxt}>TAHUN TERAKHIR KURSUS BLS</Text></Cell>
                <Cell style={{ width: 120 }}><Text style={styles.headTxt}>ALERGIK</Text></Cell>
                <Cell style={{ width: 240 }}><Text style={styles.headTxt}>ALERGIK TERHADAP</Text></Cell>
                <Cell style={{ width: 120 }}><Text style={styles.headTxt}>ASMA</Text></Cell>
                <Cell style={{ width: 120 }}><Text style={styles.headTxt}>HAMIL</Text></Cell>
              </View>

              {/* Body */}
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id || item.ic || Math.random())}
                renderItem={({ item }) => (
                  <View style={styles.row}>
                    <Cell style={{ width: 240 }}>{item.full_name}</Cell>
                    <Cell style={{ width: 160 }}>{item.ic}</Cell>
                    <Cell style={{ width: 240 }}>{item.email}</Cell>
                    <Cell style={{ width: 220 }}>{item.tempat_bertugas}</Cell>
                    <Cell style={{ width: 300 }}>{item.jawatan}</Cell>
                    <Cell style={{ width: 180 }}>{item.bls_last_year || "—"}</Cell>
                    <Cell style={{ width: 120 }}>{item.alergik ? "YA" : "TIDAK"}</Cell>
                    <Cell style={{ width: 240 }}>{item.alergik ? (item.alergik_details || "—") : "—"}</Cell>
                    <Cell style={{ width: 120 }}>{item.asma ? "YA" : "TIDAK"}</Cell>
                    <Cell style={{ width: 120 }}>{item.hamil ? "YA" : "TIDAK"}</Cell>
                  </View>
                )}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {/* Jawatan quick-filter picker */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
        statusBarTranslucent
        hardwareAccelerated
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tapisan Jawatan</Text>
              <TouchableOpacity onPress={() => setPickerOpen(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#e9ddc4" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={["(Semua)", ...JAWATAN_FILTERS]}
              keyExtractor={(item, idx) => item + "_" + idx}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              style={{ maxHeight: 420 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setJawatan(item === "(Semua)" ? "" : item);
                    setPickerOpen(false);
                    setShowAll(true);
                  }}
                  activeOpacity={0.9}
                  style={styles.resultRow}
                >
                  <Text style={{ color: "#efe7d2", fontWeight: "800" }}>{item}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#e7e3d6" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </LuxuryShell>
  );
}

function TriToggle({ label, value, onChange }) {
  const options = ["", "YA", "TIDAK"];
  const labels = ["Semua", "Ya", "Tidak"];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Text style={{ color: "#d7ccb7", fontSize: 12 }}>{label}:</Text>
      <View style={styles.toggleWrap}>
        {options.map((opt, i) => {
          const on = value === opt;
          return (
            <TouchableOpacity
              key={opt || "all"}
              onPress={() => onChange(opt)}
              style={[styles.toggleChip, on && styles.toggleChipOn]}
            >
              <Text style={[styles.toggleTxt, on && styles.toggleTxtOn]}>{labels[i]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "#e9ddc4", marginLeft: 6, fontWeight: "700" },

  filtersBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 260,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  filterTxt: { color: "#efe7d2", fontWeight: "800" },

  toggleWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 999,
    overflow: "hidden",
  },
  toggleChip: { paddingHorizontal: 12, paddingVertical: 8 },
  toggleChipOn: { backgroundColor: "rgba(230,210,150,0.22)" },
  toggleTxt: { color: "#d7ccb7", fontWeight: "800", letterSpacing: 0.3, fontSize: 12 },
  toggleTxtOn: { color: "#1c1710" },

  tableWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.65)",
    overflow: "hidden",
  },
  table: { minWidth: 2140 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(230,210,150,0.12)",
  },
  headerRow: { backgroundColor: "rgba(255,255,255,0.06)" },
  headTxt: { color: "#f5ead1", fontWeight: "900" },
  cell: { paddingVertical: 10, paddingHorizontal: 10, justifyContent: "center" },
  cellTxt: { color: "#efe7d2", fontSize: 13 },

  placeholder: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.65)",
    padding: 22,
    alignItems: "center",
  },
  placeholderTitle: { color: "#f5ead1", fontWeight: "900", fontSize: 18, marginTop: 8 },
  placeholderText: { color: "#d7ccb7", textAlign: "center", marginTop: 4 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalSheet: {
    width: 520,
    maxWidth: "95%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.96)",
    padding: 16,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  modalTitle: { color: "#f5ead1", fontSize: 18, fontWeight: "900" },
  modalCloseBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)" },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    padding: 12,
  },

  error: { color: "#ffb3b3", marginTop: 8, textAlign: "center" },
});

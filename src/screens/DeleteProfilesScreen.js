// screens/DeleteProfilesScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";
import { BRAND1, BRAND2 } from "../../constants";

export default function DeleteProfilesScreen({ onBack, onSignOut }) {
  const [tab, setTab] = useState("peserta"); // peserta | staff
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  // For confirmation + success
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState(null); // { ...row, source: 'users'|'profiles' }

  async function load() {
    setLoading(true);
    setErr("");
    try {
      if (tab === "peserta") {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, ic, email, tempat_bertugas, jawatan")
          .order("full_name", { ascending: true });
        if (error) throw error;
        const mapped = (Array.isArray(data) ? data : []).map((r) => ({ ...r, source: "users" }));
        setRows(mapped);
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "staff")
          .order("full_name", { ascending: true });
        if (error) throw error;
        const mapped = (Array.isArray(data) ? data : []).map((r) => ({
          id: r.id,
          full_name: r.full_name,
          ic: r.ic || null,
          email: r.email || null,
          tempat_bertugas: r.tempat_bertugas || "—",
          jawatan: r.jawatan || r.gred || "—",
          source: "profiles",
        }));
        setRows(mapped);
      }
    } catch (e) {
      setErr(String(e?.message || e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tab]);

  const filtered = useMemo(() => {
    const term = q.trim().toUpperCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [
        r.full_name || "",
        r.ic || "",
        r.email || "",
        r.tempat_bertugas || "",
        r.jawatan || "",
      ]
        .map((s) => String(s).toUpperCase())
        .some((s) => s.includes(term))
    );
  }, [rows, q]);

  const askDelete = (item) => {
    setSelected(item);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!selected) return;
    setPending(true);
    try {
      if (selected.source === "users") {
        const { error: delErr } = await supabase.from("profiles").delete().eq("id", selected.id);
        if (delErr) throw delErr;

        // best-effort cleanup of matching profile entry
        if (selected.email || selected.ic) {
          try {
            const orParts = [];
            if (selected.email) orParts.push(`email.eq.${selected.email}`);
            if (selected.ic) orParts.push(`ic.eq.${selected.ic}`);
            if (orParts.length > 0) await supabase.from("profiles").delete().or(orParts.join(","));
          } catch {}
        }
      } else {
        // delete staff row in profiles
        const { error: delErr } = await supabase.from("profiles").delete().eq("id", selected.id);
        if (delErr) throw delErr;

        // best-effort cleanup of matching user
        if (selected.email || selected.ic) {
          try {
            const orParts = [];
            if (selected.email) orParts.push(`email.eq.${selected.email}`);
            if (selected.ic) orParts.push(`ic.eq.${selected.ic}`);
            if (orParts.length > 0) await supabase.from("profiles").delete().or(orParts.join(","));
          } catch {}
        }
      }

      await load();
      setConfirmOpen(false);
      setSuccessOpen(true);
      setSelected(null);
    } catch (e) {
      Alert.alert("Ralat", String(e?.message || e));
    } finally {
      setPending(false);
    }
  };

  const Row = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.meta}>IC: {item.ic || "—"}</Text>
        <Text style={styles.meta}>Email: {item.email || "—"}</Text>
        <Text style={styles.meta}>Tempat: {item.tempat_bertugas || "—"}</Text>
        <Text style={styles.meta}>Jawatan: {item.jawatan || "—"}</Text>
        <Text style={[styles.meta, { opacity: 0.7 }]}>Sumber: {item.source === "users" ? "Peserta" : "Staff"}</Text>
      </View>

      <TouchableOpacity onPress={() => askDelete(item)} style={styles.deleteBtn} activeOpacity={0.9}>
        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#1c1710" />
        <Text style={styles.deleteTxt}>Padam</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LuxuryShell title="Padam Profil" onSignOut={onSignOut}>
      {/* Back */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {["peserta", "staff"].map((t) => {
          const on = tab === t;
          return (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabChip, on && styles.tabChipOn]}>
              <Text style={[styles.tabTxt, on && styles.tabTxtOn]}>{t === "peserta" ? "Peserta" : "Staff"}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search + count */}
      <View style={styles.toolbar}>
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
        <Text style={styles.count}>
          {loading ? "Memuatkan…" : `Jumlah: ${filtered.length}`}
        </Text>
        <TouchableOpacity onPress={load} style={styles.reloadBtn}>
          <MaterialCommunityIcons name="refresh" size={18} color="#1c1710" />
          <Text style={styles.reloadTxt}>Muat Semula</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.card}>
        {loading ? (
          <View style={{ padding: 18, alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ color: "#d7ccb7", marginTop: 8 }}>Memuatkan…</Text>
          </View>
        ) : err ? (
          <Text style={styles.error}>{err}</Text>
        ) : filtered.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#d7ccb7" }}>Tiada rekod.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => `${item.source}-${item.id}`}
            renderItem={({ item }) => <Row item={item} />}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ padding: 10 }}
          />
        )}
      </View>

      {/* Confirm delete */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { alignItems: "center" }]}>
            <MaterialCommunityIcons name="alert-decagram" size={48} color="#e8c17a" />
            <Text style={[styles.modalTitle, { marginTop: 6 }]}>
              Are you sure want to delete?
            </Text>
            <Text style={{ color: "#d7ccb7", marginTop: 6, textAlign: "center" }}>
              {selected?.full_name}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                onPress={() => setConfirmOpen(false)}
                style={[styles.cancelBtn]}
                disabled={pending}
              >
                <Text style={{ color: "#e9ddc4", fontWeight: "900" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={doDelete}
                style={[styles.okBtn, pending && { opacity: 0.6 }]}
                disabled={pending}
                activeOpacity={0.9}
              >
                {pending ? (
                  <ActivityIndicator color="#1c1710" />
                ) : (
                  <Text style={{ color: "#1c1710", fontWeight: "900" }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success popup */}
      <Modal
        visible={successOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { alignItems: "center" }]}>
            <MaterialCommunityIcons name="check-decagram" size={48} color="#e8c17a" />
            <Text style={[styles.modalTitle, { marginTop: 6 }]}>Delete Successful</Text>
            <TouchableOpacity
              onPress={() => setSuccessOpen(false)}
              style={[styles.okBtn, { marginTop: 14 }]}
            >
              <Text style={{ color: "#1c1710", fontWeight: "900" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LuxuryShell>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "#e9ddc4", marginLeft: 6, fontWeight: "700" },

  tabBar: { flexDirection: "row", gap: 8, marginBottom: 10 },
  tabChip: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  tabChipOn: { backgroundColor: "rgba(230,210,150,0.22)" },
  tabTxt: { color: "#d7ccb7", fontWeight: "800", fontSize: 12 },
  tabTxtOn: { color: "#1c1710" },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    flexWrap: "wrap",
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
    flex: 1,
  },
  count: { color: "#d7ccb7", fontWeight: "800" },
  reloadBtn: {
    backgroundColor: "#e9ddc4",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reloadTxt: { color: "#1c1710", fontWeight: "900" },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.65)",
    overflow: "hidden",
    minHeight: 140,
  },

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

  deleteBtn: {
    backgroundColor: "#e9ddc4",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteTxt: { color: "#1c1710", fontWeight: "900" },

  error: { color: "#ffb3b3", margin: 16, textAlign: "center" },

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
});

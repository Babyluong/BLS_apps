// screens/ListStaffScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";

export default function ListStaffScreen({
  onSignOut,
  onBack,            // legacy callback
  navigation,        // react-navigation (if present)
  goToAdminMenu,     // preferred: explicit go to Admin Menu
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  // Back handler works in all setups
  const handleBack = () => {
    if (typeof goToAdminMenu === "function") return goToAdminMenu();
    if (typeof onBack === "function") return onBack();
    if (navigation?.canGoBack?.() && navigation.canGoBack()) return navigation.goBack();
  };

  async function load() {
    setLoading(true);
    setErr("");
    try {
      // ✅ STAFF ONLY — select only known columns (no 'phone', no 'gred')
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, ic, email, role")
        .eq("role", "staff")
        .order("full_name", { ascending: true });

      if (error) throw error;

      const shaped = (Array.isArray(data) ? data : []).map((r) => ({
        id: r.id,
        full_name: r.full_name,
        ic: r.ic,
        email: r.email,
        // Show a label; if you later add a grade field, you can stitch it here.
        jawatan: "STAFF",
      }));
      setRows(shaped);
    } catch (e) {
      setErr(String(e?.message || e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Optional: live refresh
    const ch = supabase
      .channel("list_staff_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .subscribe();
    return () => {
      try { supabase.removeChannel(ch); } catch {}
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toUpperCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.full_name, r.ic, r.email, r.jawatan]
        .filter(Boolean)
        .map(String)
        .map((s) => s.toUpperCase())
        .some((s) => s.includes(term))
    );
  }, [rows, q]);

  const Row = ({ item }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.meta}>IC: {item.ic || "—"}</Text>
        <Text style={styles.meta}>Email: {item.email || "—"}</Text>
        <Text style={styles.meta}>Jawatan: {item.jawatan || "—"}</Text>
      </View>
    </View>
  );

  return (
    <LuxuryShell onSignOut={onSignOut} title="BLS Administrator">
      {/* Back */}
      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>

      {/* Search */}
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={18} color="#e7e3d6" />
        <TextInput
          placeholder="Cari nama / IC / emel..."
          placeholderTextColor="#9a917e"
          value={q}
          onChangeText={setQ}
          style={{ color: "#efe7d2", marginLeft: 8, flex: 1 }}
        />
      </View>

      {/* List */}
      <View style={styles.card}>
        {loading ? (
          <View style={{ padding: 18, alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ color: "#d7ccb7", marginTop: 8 }}>Memuatkan…</Text>
          </View>
        ) : err ? (
          <View style={{ padding: 14 }}>
            <Text style={styles.error}>{err}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#d7ccb7" }}>Tiada rekod.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <Row item={item} />}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ padding: 10 }}
          />
        )}
      </View>
    </LuxuryShell>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "#e9ddc4", marginLeft: 6, fontWeight: "700" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },

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

  error: { color: "#ffb3b3", textAlign: "center" },
});

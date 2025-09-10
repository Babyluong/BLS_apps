// components/SelectField.js
import React, { useMemo, useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet, Dimensions
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function SelectField({
  label = "Select",
  placeholder = "Select…",
  options = [],
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toUpperCase();
    if (!t) return options;
    return options.filter((o) => String(o).toUpperCase().includes(t));
  }, [q, options]);

  return (
    <View style={{ marginTop: 6 }}>
      <Text style={styles.label}>{label}</Text>

      {/* Display field */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => { setQ(""); setOpen(true); }}
        style={[styles.input, { flexDirection: "row", alignItems: "center" }]}
      >
        <Text style={{ color: value ? "#efe7d2" : "#9a917e", flex: 1 }}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color="#e7e3d6" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Choose {label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#e9ddc4" />
              </TouchableOpacity>
            </View>

            {/* Search box */}
            <View style={[styles.input, { flexDirection: "row", alignItems: "center", marginBottom: 10 }]}>
              <MaterialCommunityIcons name="magnify" size={18} color="#e7e3d6" />
              <TextInput
                style={{ color: "#efe7d2", marginLeft: 8, flex: 1 }}
                placeholder={`Search ${label.toLowerCase()}…`}
                placeholderTextColor="#9a917e"
                value={q}
                onChangeText={setQ}
                autoCapitalize="characters"
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item, idx) => String(item) + "_" + idx}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => { onChange?.(item); setOpen(false); }}
                  style={styles.row}
                >
                  <MaterialCommunityIcons name="briefcase-outline" size={20} color="#e7e3d6" />
                  <Text style={{ color: "#efe7d2", fontWeight: "800", marginLeft: 8 }}>{String(item)}</Text>
                  <MaterialCommunityIcons name="check" size={18} color={value === item ? "#e7e3d6" : "transparent"} style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ color: "#d7ccb7", textAlign: "center", marginTop: 8 }}>No matches</Text>}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: "#d7ccb7", fontSize: 13, marginTop: 6 },
  input: {
    color: "#efe7d2",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 16 },
  sheet: { width: Math.min(560, width - 24), borderRadius: 20, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", backgroundColor: "rgba(18,18,22,0.96)", padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  headerTitle: { color: "#f5ead1", fontSize: 18, fontWeight: "900" },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", borderRadius: 12, padding: 10 },
});

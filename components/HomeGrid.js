// components/HomeGrid.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeGrid({ heading, chips = [], actions = [] }) {
  return (
    <View style={{ gap: 14 }}>
      <Text style={styles.heading}>{heading}</Text>
      <View style={styles.chipsRow}>
        {chips.map((c, i) => (
          <View key={i} style={styles.chip}>
            <MaterialCommunityIcons name="check-decagram" size={14} color="#e9ddc4" style={{ marginRight: 6 }} />
            <Text style={styles.chipText}>{c}</Text>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {actions.map((a, i) => (
          <TouchableOpacity key={i} onPress={a.onPress} activeOpacity={0.9} style={{ width: width > 700 ? (width - 16 * 2 - 12 * 2) / 3 : (width - 16 * 2 - 12) / 2 }}>
            <View style={styles.tile}>
              <MaterialCommunityIcons name={a.icon} size={26} color="#e7e3d6" />
              <Text style={styles.tileLabel}>{a.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: "#f5ead1", fontSize: 24, fontWeight: "900", textAlign: "center" },
  chipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(60,50,30,0.35)", borderWidth: 1, borderColor: "rgba(220, 200, 150, 0.22)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  chipText: { color: "#e9ddc4", fontSize: 12, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  tile: { height: 110, borderRadius: 18, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", backgroundColor: "rgba(18,18,22,0.65)", padding: 14, justifyContent: "space-between", shadowColor: "#a38852", shadowOpacity: 0.15, shadowRadius: 16 },
  tileLabel: { color: "#efe7d2", fontWeight: "800" },
});

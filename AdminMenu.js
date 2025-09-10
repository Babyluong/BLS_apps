// AdminMenu.js — BLS Administrator menu (luxury style)
// Props:
// - onBack()
// - onAddStaff()
// - onAddUser()
// - onEditProfiles()
// - onDeleteProfiles()
// - onAdminTools()

import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const BRAND1 = "#c8aa6e";
const BRAND2 = "#e7d6a8";
const BRAND3 = "#a38852";

export default function AdminMenu({
  onBack,
  onAddStaff,
  onAddUser,
  onEditProfiles,
  onDeleteProfiles,
  onAdminTools,
}) {
  const actions = [
    { icon: "account-plus-outline", label: "Add New Staff", onPress: onAddStaff },
    { icon: "account-multiple-plus-outline", label: "Add New User", onPress: onAddUser },
    { icon: "account-edit-outline", label: "Edit Profiles", onPress: onEditProfiles },
    { icon: "account-remove-outline", label: "Delete Profiles", onPress: onDeleteProfiles },
    { icon: "cog-outline", label: "More Admin Tools", onPress: onAdminTools },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Top bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#e9ddc4" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <LinearGradient
            colors={[BRAND1, BRAND2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.monogramDisc}
          >
            <Text style={{ color: "#1c1710", fontWeight: "900" }}>BLS</Text>
          </LinearGradient>
          <Text style={styles.title}>Administrator Menu</Text>
        </View>

        {/* spacer */}
        <View style={{ width: 68 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.heading}>Welcome Mr. Administrator</Text>

        <View style={styles.grid}>
          {actions.map((a, i) => (
            <TouchableOpacity
              key={i}
              onPress={a.onPress}
              activeOpacity={0.9}
              style={{ width: width > 700 ? (width - 16 * 2 - 12 * 2) / 3 : (width - 16 * 2 - 12) / 2 }}
            >
              <View style={styles.card}>
                <MaterialCommunityIcons name={a.icon} size={26} color="#e7e3d6" />
                <Text style={styles.cardLabel}>{a.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <Text style={{ color: "#8a7f6a", fontSize: 12 }}>
            © {new Date().getFullYear()} Hospital Lawas • Private Access
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
  },
  backText: { color: "#e9ddc4", marginLeft: 6, fontWeight: "700" },
  monogramDisc: {
    width: 28,
    height: 28,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: { color: "#f5ead1", fontSize: 18, fontWeight: "900" },
  heading: { color: "#f5ead1", fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  card: {
    height: 110,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.65)",
    padding: 14,
    justifyContent: "space-between",
    shadowColor: BRAND3,
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  cardLabel: { color: "#efe7d2", fontWeight: "800" },
});

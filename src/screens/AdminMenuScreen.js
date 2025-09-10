// screens/AdminMenuScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LuxuryShell from "../components/LuxuryShell";

export default function AdminMenuScreen({ onSignOut, onBack, onNavigate }) {
  const Tile = ({ icon, label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.tile} activeOpacity={0.9}>
      <MaterialCommunityIcons name={icon} size={22} color="#e9ddc4" />
      <Text style={styles.tileTitle}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <LuxuryShell title="Admin Menu" onSignOut={onSignOut}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.grid}>
          <Tile icon="arrow-left" label="Kembali" onPress={onBack} />

          <Tile icon="account-plus-outline" label="Add New Staff" onPress={() => onNavigate("addStaff")} />
          <Tile icon="account-plus" label="Add New User" onPress={() => onNavigate("addUser")} />

          <Tile icon="account-group-outline" label="List Staff" onPress={() => onNavigate("listStaff")} />
          <Tile icon="account-multiple" label="List Users" onPress={() => onNavigate("listUsers")} />

          {/* Edit/Delete profiles */}
          <Tile icon="pencil-outline" label="Edit Profiles" onPress={() => onNavigate("editProfiles")} />
          <Tile icon="account-remove-outline" label="Delete Profiles" onPress={() => onNavigate("deleteProfiles")} />

          <Tile icon="tools" label="Admin Tools" onPress={() => onNavigate("adminTools")} />
          <Tile icon="history" label="Activity Logs" onPress={() => onNavigate("activityLogs")} />

          <Tile icon="file-import-outline" label="One-Tap Import Users" onPress={() => onNavigate("oneTapImportUsers")} />

          {/* Questions */}
          <Tile icon="file-question-outline" label="One-Tap Import Questions" onPress={() => onNavigate("importQuestions")} />
          <Tile icon="comment-edit-outline" label="Edit Questions" onPress={() => onNavigate("editQuestions")} />

          {/* BLS Checklist Management */}
          <Tile icon="clipboard-list-outline" label="BLS Checklist Editor" onPress={() => onNavigate("blsChecklistEdit")} />

          {/* ⛔ BLS Test removed from here */}
        </View>
      </ScrollView>
    </LuxuryShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "flex-start" },
  tile: {
    width: 260, maxWidth: "100%",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.65)", padding: 16, gap: 8,
  },
  tileTitle: { color: "#e9ddc4", fontWeight: "800" },
});

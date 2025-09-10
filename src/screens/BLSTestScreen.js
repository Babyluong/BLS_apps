import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LuxuryShell from "../components/LuxuryShell";

export default function BLSTestScreen({ onBack, onSignOut, onNavigate }) {
  const Tile = ({ icon, label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.tile} activeOpacity={0.9}>
      <MaterialCommunityIcons name={icon} size={22} color="#e9ddc4" />
      <Text style={styles.tileTitle}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <LuxuryShell title="BLS Test" onSignOut={onSignOut}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.grid}>
          <Tile icon="arrow-left" label="Kembali" onPress={onBack} />
          <Tile
            icon="clipboard-text-outline"
            label="Pre Test Question"
            onPress={() => onNavigate("preTestQuestions")}
          />
          <Tile
            icon="clipboard-check-outline"
            label="Post Test Question"
            onPress={() => onNavigate("postTestQuestions")}
          />
          <Tile
            icon="chart-line"
            label="Quiz Results"
            onPress={() => onNavigate("quizResults")}
          />
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

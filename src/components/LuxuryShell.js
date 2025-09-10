// components/LuxuryShell.js
import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND1, BRAND2 } from "../constants";

export default function LuxuryShell({ title, children, onSignOut, onBack }) {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#06070a", "#0b0f18", "#090d15"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topbar}>
          <View style={styles.brandRow}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            )}
            <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
              <Text style={styles.logoText}>BLS</Text>
            </LinearGradient>
            <Text style={styles.title}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onSignOut} style={styles.signoutBtn}>
            <Text style={styles.signoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>{children}</ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center" },
  backButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", marginRight: 12 },
  backText: { color: "#e9ddc4", fontWeight: "700", fontSize: 14 },
  logo: { width: 28, height: 28, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 8 },
  logoText: { color: "#1c1710", fontWeight: "900" },
  title: { color: "#f5ead1", fontSize: 18, fontWeight: "900" },
  signoutBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)" },
  signoutText: { color: "#e9ddc4", fontWeight: "700" },
});

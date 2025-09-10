// components/StubCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND1, BRAND2 } from "../constants";

const { width } = Dimensions.get("window");

export default function StubCard({ title, text, button, onPress }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{text}</Text>
      {button ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ marginTop: 12 }}>
          <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
            <Text style={styles.btnText}>{button}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: Math.min(560, width - 24), borderRadius: 20, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", backgroundColor: "rgba(18,18,22,0.65)", padding: 16, overflow: "hidden" },
  title: { color: "#f5ead1", fontSize: 22, fontWeight: "900", textAlign: "center" },
  body: { color: "#d7ccb7", marginTop: 8 },
  btn: { borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 },
});

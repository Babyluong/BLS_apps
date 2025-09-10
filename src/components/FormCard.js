// components/FormCard.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND1, BRAND2 } from "../constants";

const { width } = Dimensions.get("window");

export default function FormCard({ title, fields = [], onSubmit, submitLabel = "Save" }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(f => [f.label, ""])));
  const set = (label, v) => setValues(prev => ({ ...prev, [label]: v }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {fields.map((f, i) => (
        <View key={i} style={{ marginTop: 6 }}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            placeholder={f.placeholder}
            placeholderTextColor="#9a917e"
            value={values[f.label]}
            onChangeText={(t) => set(f.label, t)}
            style={styles.input}
            keyboardType={f.keyboardType || "default"}
            autoCapitalize={f.autoCapitalize || "none"}
          />
        </View>
      ))}
      <TouchableOpacity onPress={onSubmit} activeOpacity={0.9} style={{ marginTop: 12 }}>
        <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
          <Text style={styles.btnText}>{submitLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: Math.min(560, width - 24), borderRadius: 20, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", backgroundColor: "rgba(18,18,22,0.65)", padding: 16, overflow: "hidden" },
  title: { color: "#f5ead1", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  label: { color: "#d7ccb7", fontSize: 13, marginTop: 6 },
  input: { color: "#efe7d2", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 4 },
  btn: { borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 },
});

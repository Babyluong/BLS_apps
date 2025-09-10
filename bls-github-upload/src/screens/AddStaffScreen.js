// screens/AddStaffScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";
import { BRAND1, BRAND2 } from "../constants";
import ModalFixed from "../components/ModalFixed";

// ===== GRED lists =====
const UD_GRADES = ["UD 9", "UD 10", "UD 11", "UD 12", "UD 13"];
const UG_GRADES = ["UG 9", "UG 10", "UG 11", "UG 12", "UG 13"];
const UF_GRADES = ["UF 9", "UF 10", "UF 11", "UF 12", "UF 13"];
const OTHER_GRADES = [
  "N1","N2","N3","N4","N5","N6",
  "U1","U2","U3","U4","U5","U6","U7","U8",
  "W1","W2","W3","W4","W5","W6","W7",
];
const ALL_GRADES = [...UD_GRADES, ...UG_GRADES, ...UF_GRADES, ...OTHER_GRADES];

export default function AddStaffScreen({ onBack, onSignOut }) {
  // Form state
  const [fullName, setFullName] = useState("");
  const [ic, setIc] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gred, setGred] = useState("");

  // Picker
  const [pickerGred, setPickerGred] = useState(false);

  // Success modal
  const [successOpen, setSuccessOpen] = useState(false);

  const canSave = useMemo(() => {
    return fullName.trim() && ic.trim();
  }, [fullName, ic]);

  const resetForm = () => {
    setFullName(""); setIc(""); setEmail(""); setPhone(""); setGred("");
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert("Medan wajib", "Nama penuh dan IC diperlukan.");
      return;
    }
    try {
      const payload = {
        full_name: fullName.trim(),
        ic: ic.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        gred: gred || null,
        role: "staff",
      };

      // Upsert by IC so repeated entries update instead of failing
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "ic" });

      if (error) throw error;

      setSuccessOpen(true);
      resetForm();
    } catch (e) {
      Alert.alert("Ralat simpan", String(e?.message || e));
    }
  };

  const Field = ({ label, children, required }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>
        {label} {required ? <Text style={{ color: "#e8c17a" }}>*</Text> : null}
      </Text>
      {children}
    </View>
  );

  const OpenPickerRow = ({ value, placeholder, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.input}>
      <Text style={{ color: value ? "#efe7d2" : "#9a917e", fontWeight: value ? "800" : "400" }}>
        {value || placeholder}
      </Text>
      <MaterialCommunityIcons name="chevron-down" size={18} color="#e7e3d6" style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );

  return (
    <LuxuryShell title="Tambah Staff" onSignOut={onSignOut}>
      {/* Back */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Maklumat Staff</Text>

          <Field label="Full Name" required>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholder="Nama penuh"
              placeholderTextColor="#9a917e"
              autoCapitalize="characters"
            />
          </Field>

          <Field label="IC" required>
            <TextInput
              value={ic}
              onChangeText={setIc}
              style={styles.input}
              placeholder="Contoh: 990101011234"
              placeholderTextColor="#9a917e"
              keyboardType="number-pad"
            />
          </Field>

          <Field label="Email">
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="contoh@domain.com"
              placeholderTextColor="#9a917e"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Field>

          <Field label="Phone Number">
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="0123456789"
              placeholderTextColor="#9a917e"
              keyboardType="phone-pad"
            />
          </Field>

          <Field label="GRED (pilihan)">
            <OpenPickerRow
              value={gred}
              placeholder="Pilih gred (UD/UG/UF atau N/U/W)"
              onPress={() => setPickerGred(true)}
            />
          </Field>

          {/* Save button */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleSave} disabled={!canSave} style={{ marginTop: 16 }}>
            <LinearGradient
              colors={[BRAND1, BRAND2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.btn, !canSave && { opacity: 0.55 }]}
            >
              <Text style={styles.btnText}>Simpan Staff</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ===== Gred Picker (ModalFixed for web compatibility) ===== */}
      <ModalFixed
        visible={pickerGred}
        animationType="fade"
        transparent
        onRequestClose={() => setPickerGred(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih GRED</Text>
              <TouchableOpacity onPress={() => setPickerGred(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#e9ddc4" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={ALL_GRADES}
              keyExtractor={(item, idx) => item + "_" + idx}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setGred(item); setPickerGred(false); }}
                  activeOpacity={0.9}
                  style={styles.resultRow}
                >
                  <Text style={{ color: "#efe7d2", fontWeight: "800" }}>{item}</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#e7e3d6"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>
              )}
              ListHeaderComponent={
                <TouchableOpacity
                  onPress={() => { setGred(""); setPickerGred(false); }}
                  activeOpacity={0.9}
                  style={[styles.resultRow, { marginBottom: 6 }]}
                >
                  <Text style={{ color: "#d7ccb7" }}>(Tiada gred)</Text>
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={20}
                    color="#e7e3d6"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </ModalFixed>

      {/* Success popup */}
      <ModalFixed
        visible={successOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setSuccessOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { alignItems: "center" }]}>
            <MaterialCommunityIcons name="check-decagram" size={48} color="#e8c17a" />
            <Text style={[styles.modalTitle, { marginTop: 6 }]}>Pendaftaran Staff Berjaya</Text>
            <TouchableOpacity onPress={() => setSuccessOpen(false)} style={[styles.okBtn, { marginTop: 14 }]}>
              <Text style={{ color: "#1c1710", fontWeight: "900" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalFixed>
    </LuxuryShell>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { color: "#e9ddc4", marginLeft: 6, fontWeight: "700" },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    backgroundColor: "rgba(18,18,22,0.65)",
    padding: 16,
  },
  cardTitle: { color: "#f5ead1", fontSize: 18, fontWeight: "900", marginBottom: 10 },

  label: { color: "#d7ccb7", fontSize: 13, marginBottom: 4 },

  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  btn: { borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 },

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
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  modalTitle: { color: "#f5ead1", fontSize: 18, fontWeight: "900" },
  modalCloseBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)" },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 12,
    padding: 12,
  },

  okBtn: {
    backgroundColor: "#e9ddc4",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

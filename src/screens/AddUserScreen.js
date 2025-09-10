// screens/AddUserScreen.js
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
import { BRAND1, BRAND2 } from "../../constants";
import ModalFixed from "../components/ModalFixed";

// ===== Master lists =====
const TEMPAT_OPTS = [
  "Hospital Lawas",
  "KK Lawas",
  "Hospital Limbang",
  "Klinik Pergigian Lawas",
];

const FULL_JAWATAN_LIST = [
  // Officer level
  "PEGAWAI PERUBATAN",
  "PEGAWAI PERGIGIAN",
  "PEGAWAI FARMASI",

  // Others
  "PENOLONG PEGAWAI PERUBATAN",
  "JURURAWAT",
  "PENOLONG PEGAWAI FARMASI",
  "JURUTEKNOLOGI MAKMAL PERUBATAN",
  "JURUPULIH PERUBATAN CARAKERJA",
  "JURUPULIH FISIOTERAPI",
  "JURU-XRAY",
  "PENOLONG PEGAWAI TADBIR",
  "PEMBANTU KHIDMAT AM",
  "PEMBANTU TADBIR",
  "PEMBANTU PERAWATAN KESIHATAN",
  "JURURAWAT MASYARAKAT",
  "PEMBANTU PENYEDIAAN MAKANAN",
  "PENOLONG JURUTERA",
];

// Officer grades (unchanged)
const UD_GRADES = ["UD 9", "UD 10", "UD 11", "UD 12", "UD 13"];
const UG_GRADES = ["UG 9", "UG 10", "UG 11", "UG 12", "UG 13"];
const UF_GRADES = ["UF 9", "UF 10", "UF 11", "UF 12", "UF 13"];

// New grouped grades
const G_U5_7 = ["U5", "U6", "U7"];
const G_U1_4 = ["U1", "U2", "U3", "U4"];
const G_H1_4 = ["H1", "H2", "H3", "H4"];
const G_N1_4 = ["N1", "N2", "N3", "N4"];
const G_J5_7 = ["J5", "J6", "J7"];

// Title groups → grade families
const TITLES_U5_7 = [
  "PENOLONG PEGAWAI PERUBATAN",
  "JURURAWAT",
  "PENOLONG PEGAWAI FARMASI",
  "JURUTEKNOLOGI MAKMAL PERUBATAN",
  "JURUPULIH PERUBATAN CARAKERJA",
  "JURUPULIH FISIOTERAPI",
  "JURU-XRAY",
];

const TITLES_H1_4_OR_N1_4 = [
  "PENOLONG PEGAWAI TADBIR",
  "PEMBANTU KHIDMAT AM",
  "PEMBANTU TADBIR",
];

const TITLES_U1_4 = [
  "PEMBANTU PERAWATAN KESIHATAN",
  "JURURAWAT MASYARAKAT",
  "PEMBANTU PENYEDIAAN MAKANAN",
];

const TITLES_J5_7 = ["PENOLONG JURUTERA"];

// Tahun BLS 2015 → current year (+ “Pertama Kali” at top)
const currentYear = new Date().getFullYear();
const BLS_YEARS = Array.from({ length: currentYear - 2015 + 1 }, (_, i) => String(2015 + i));
const BLS_OPTIONS = ["Pertama Kali", ...BLS_YEARS];

export default function AddUserScreen({ onBack, onSignOut }) {
  // Form state
  const [fullName, setFullName] = useState("");
  const [ic, setIc] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [tempat, setTempat] = useState("");
  const [job_positionTitle, setJawatanTitle] = useState("");  // e.g. "PEGAWAI PERUBATAN"
  const [job_positionGrade, setJawatanGrade] = useState("");  // e.g. "UD 10" / "N4" etc.

  const [blsYear, setBlsYear] = useState("");

  const [alergik, setAlergik] = useState(""); // "", "YA", "TIDAK"
  const [alergikDetails, setAlergikDetails] = useState("");

  const [asma, setAsma] = useState(""); // "", "YA", "TIDAK"

  const [hamil, setHamil] = useState(""); // "", "YA", "TIDAK"
  const [hamilWeeks, setHamilWeeks] = useState("");

  // Pickers
  const [pickerTempat, setPickerTempat] = useState(false);
  const [pickerJawatan, setPickerJawatan] = useState(false);
  const [pickerGrade, setPickerGrade] = useState(false);
  const [pickerBls, setPickerBls] = useState(false);

  // Success modal
  const [successOpen, setSuccessOpen] = useState(false);

  // Determine which grade list to show
  const gradeOptions = useMemo(() => {
    const t = (job_positionTitle || "").toUpperCase();

    // Officer-level keep UD/UG/UF (9–13)
    if (t === "PEGAWAI PERUBATAN") return UD_GRADES;
    if (t === "PEGAWAI PERGIGIAN") return UG_GRADES;
    if (t === "PEGAWAI FARMASI")   return UF_GRADES;

    // New group rules
    if (TITLES_U5_7.includes(t)) return G_U5_7;
    if (TITLES_H1_4_OR_N1_4.includes(t)) return [...G_H1_4, ...G_N1_4];
    if (TITLES_U1_4.includes(t)) return G_U1_4;
    if (TITLES_J5_7.includes(t)) return G_J5_7;

    // Default: no specific grade options
    return [];
  }, [job_positionTitle]);

  // Compose final JAWATAN string to save
  const composedJawatan = useMemo(() => {
    if (!job_positionTitle) return "";
    if (!job_positionGrade) return job_positionTitle; // grade optional
    return `${job_positionTitle} GRED ${job_positionGrade}`;
  }, [job_positionTitle, job_positionGrade]);

  // Validations
  const canSave = useMemo(() => {
    return (
      fullName.trim() &&
      ic.trim() &&
      tempat &&
      job_positionTitle &&
      blsYear && // must pick a value (year or "Pertama Kali")
      (alergik !== "") &&
      (asma !== "") &&
      (hamil !== "") &&
      (hamil === "TIDAK" || (hamil === "YA" && /^\d+$/.test(hamilWeeks || "0")))
    );
  }, [fullName, ic, tempat, job_positionTitle, blsYear, alergik, asma, hamil, hamilWeeks]);

  const resetForm = () => {
    setFullName(""); setIc(""); setEmail(""); setPhone("");
    setTempat(""); setJawatanTitle(""); setJawatanGrade("");
    setBlsYear("");
    setAlergik(""); setAlergikDetails("");
    setAsma("");
    setHamil(""); setHamilWeeks("");
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert("Medan wajib", "Sila lengkapkan semua medan wajib.");
      return;
    }
    try {
      // Prepare payload for users table
      const payload = {
        full_name: fullName.trim(),
        ic: ic.trim(),
        email: email.trim() || null,
        phone_number: phone.trim() || null,
        tempat_bertugas: tempat,
        job_position: composedJawatan,             // combined title + grade
        // Save null when "Pertama Kali" is chosen, else numeric year
        bls_last_year: /^\d{4}$/.test(String(blsYear)) ? Number(blsYear) : null,
        alergik: alergik === "YA",
        alergik_details: alergik === "YA" ? (alergikDetails.trim() || null) : null,
        asma: asma === "YA",
        hamil: hamil === "YA",
        hamil_weeks: hamil === "YA" ? Number(hamilWeeks || 0) : null,
      };

      const { error } = await supabase.from("profiles").insert(payload);
      if (error) throw error;

      setSuccessOpen(true);      // show success popup
      resetForm();               // clear form for next
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

  const Toggle3 = ({ label, value, onChange }) => {
    const options = ["", "YA", "TIDAK"];
    const labels = ["—", "Ya", "Tidak"];
    return (
      <View>
        <Text style={styles.label}>{label} <Text style={{ color: "#e8c17a" }}>*</Text></Text>
        <View style={styles.toggleWrap}>
          {options.map((opt, i) => {
            const on = value === opt;
            return (
              <TouchableOpacity
                key={opt || "ALL"}
                onPress={() => onChange(opt)}
                style={[styles.toggleChip, on && styles.toggleChipOn]}
              >
                <Text style={[styles.toggleTxt, on && styles.toggleTxtOn]}>{labels[i]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <LuxuryShell title="Daftar Peserta Baharu" onSignOut={onSignOut}>
      {/* Back */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Maklumat Peserta</Text>

          <Field label="Full Name" required>
            <TextInput value={fullName} onChangeText={setFullName} style={styles.input} placeholder="Nama penuh" placeholderTextColor="#9a917e" autoCapitalize="characters" />
          </Field>

          <Field label="IC" required>
            <TextInput value={ic} onChangeText={setIc} style={styles.input} placeholder="Contoh: 990101011234" placeholderTextColor="#9a917e" keyboardType="number-pad" />
          </Field>

          <Field label="Email">
            <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="contoh@domain.com" placeholderTextColor="#9a917e" keyboardType="email-address" autoCapitalize="none" />
          </Field>

          <Field label="Phone Number">
            <TextInput value={phone} onChangeText={setPhone} style={styles.input} placeholder="0123456789" placeholderTextColor="#9a917e" keyboardType="phone-pad" />
          </Field>

          <Field label="Tempat Bertugas" required>
            <OpenPickerRow value={tempat} placeholder="Pilih tempat bertugas" onPress={() => setPickerTempat(true)} />
          </Field>

          {/* Jawatan + Grade */}
          <Field label="Jawatan" required>
            <OpenPickerRow value={job_positionTitle} placeholder="Pilih job_position" onPress={() => setPickerJawatan(true)} />
          </Field>

          <Field label="Jawatan GRED (pilihan)" required={false}>
            <OpenPickerRow value={job_positionGrade} placeholder="Pilih gred (UD/UG/UF atau mengikut kategori)" onPress={() => setPickerGrade(true)} />
            {!!composedJawatan && (
              <Text style={{ color: "#bfb7a5", fontSize: 12, marginTop: 6 }}>
                Akan disimpan sebagai: <Text style={{ color: "#f5ead1", fontWeight: "800" }}>{composedJawatan}</Text>
              </Text>
            )}
          </Field>

          <Field label="Tahun Terakhir Kursus BLS" required>
            <OpenPickerRow value={blsYear} placeholder="Pilih tahun" onPress={() => setPickerBls(true)} />
          </Field>

          <View style={{ height: 12 }} />

          <Text style={styles.sectionTitle}>Maklumat Kesihatan</Text>

          <Toggle3 label="Alergik" value={alergik} onChange={setAlergik} />
          {alergik === "YA" && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Jika Ya, nyatakan alahan kepada</Text>
              <TextInput value={alergikDetails} onChangeText={setAlergikDetails} style={styles.input} placeholder="Contoh: ubat penahan sakit / makanan / lain-lain" placeholderTextColor="#9a917e" />
            </View>
          )}

          <View style={{ height: 8 }} />

          <Toggle3 label="Menghadapi Masalah Lelah (Asthma)" value={asma} onChange={setAsma} />

          <View style={{ height: 8 }} />

          <Toggle3 label="Sedang Hamil" value={hamil} onChange={setHamil} />
          {hamil === "YA" && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Jika Ya, berapa minggu?</Text>
              <TextInput
                value={hamilWeeks}
                onChangeText={setHamilWeeks}
                style={styles.input}
                placeholder="cth: 24"
                placeholderTextColor="#9a917e"
                keyboardType="number-pad"
              />
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleSave} disabled={!canSave} style={{ marginTop: 16 }}>
            <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, !canSave && { opacity: 0.55 }]}>
              <Text style={styles.btnText}>Simpan Peserta</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ===== Pickers (using ModalFixed) ===== */}

      {/* Tempat */}
      <ModalFixed visible={pickerTempat} animationType="fade" transparent onRequestClose={() => setPickerTempat(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tempat Bertugas</Text>
              <TouchableOpacity onPress={() => setPickerTempat(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#e9ddc4" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={TEMPAT_OPTS}
              keyExtractor={(item, idx) => item + "_" + idx}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setTempat(item); setPickerTempat(false); }}
                  activeOpacity={0.9}
                  style={styles.resultRow}
                >
                  <Text style={{ color: "#efe7d2", fontWeight: "800" }}>{item}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#e7e3d6" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </ModalFixed>

      {/* Jawatan */}
      <ModalFixed visible={pickerJawatan} animationType="fade" transparent onRequestClose={() => setPickerJawatan(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Jawatan</Text>
              <TouchableOpacity onPress={() => setPickerJawatan(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#e9ddc4" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={FULL_JAWATAN_LIST}
              keyExtractor={(item, idx) => item + "_" + idx}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setJawatanTitle(item); setPickerJawatan(false); }}
                  activeOpacity={0.9}
                  style={styles.resultRow}
                >
                  <Text style={{ color: "#efe7d2", fontWeight: "800" }}>{item}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#e7e3d6" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </ModalFixed>

      {/* Grade */}
      <ModalFixed visible={pickerGrade} animationType="fade" transparent onRequestClose={() => setPickerGrade(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih GRED</Text>
              <TouchableOpacity onPress={() => setPickerGrade(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#e9ddc4" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={gradeOptions}
              keyExtractor={(item, idx) => item + "_" + idx}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setJawatanGrade(item); setPickerGrade(false); }}
                  activeOpacity={0.9}
                  style={styles.resultRow}
                >
                  <Text style={{ color: "#efe7d2", fontWeight: "800" }}>{item}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#e7e3d6" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              )}
              ListHeaderComponent={
                <TouchableOpacity
                  onPress={() => { setJawatanGrade(""); setPickerGrade(false); }}
                  activeOpacity={0.9}
                  style={[styles.resultRow, { marginBottom: 6 }]}
                >
                  <Text style={{ color: "#d7ccb7" }}>(Tiada gred)</Text>
                  <MaterialCommunityIcons name="close-circle-outline" size={20} color="#e7e3d6" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              }
              ListEmptyComponent={
                <View style={{ paddingVertical: 8 }}>
                  <Text style={{ color: "#d7ccb7", fontSize: 12 }}>Tiada gred untuk job_position ini.</Text>
                </View>
              }
            />
          </View>
        </View>
      </ModalFixed>

      {/* Tahun BLS */}
      <ModalFixed visible={pickerBls} animationType="fade" transparent onRequestClose={() => setPickerBls(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tahun Terakhir Kursus BLS</Text>
              <TouchableOpacity onPress={() => setPickerBls(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#e9ddc4" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BLS_OPTIONS}
              keyExtractor={(item, idx) => item + "_" + idx}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setBlsYear(item); setPickerBls(false); }}
                  activeOpacity={0.9}
                  style={styles.resultRow}
                >
                  <Text style={{ color: "#efe7d2", fontWeight: "800" }}>{item}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#e7e3d6" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </ModalFixed>

      {/* Success Popup */}
      <ModalFixed visible={successOpen} animationType="fade" transparent onRequestClose={() => setSuccessOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { alignItems: "center" }]}>
            <MaterialCommunityIcons name="check-decagram" size={48} color="#e8c17a" />
            <Text style={[styles.modalTitle, { marginTop: 6 }]}>Pendaftaran Berjaya</Text>
            <Text style={{ color: "#d7ccb7", marginTop: 6, textAlign: "center" }}>
              Terima kasih. Maklumat peserta telah disimpan.
            </Text>
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

  sectionTitle: { color: "#f5ead1", fontSize: 16, fontWeight: "900", marginBottom: 6 },

  toggleWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(230,210,150,0.18)",
    borderRadius: 999,
    overflow: "hidden",
  },
  toggleChip: { paddingHorizontal: 12, paddingVertical: 8 },
  toggleChipOn: { backgroundColor: "rgba(230,210,150,0.22)" },
  toggleTxt: { color: "#d7ccb7", fontWeight: "800", letterSpacing: 0.3, fontSize: 12 },
  toggleTxtOn: { color: "#1c1710" },

  btn: { borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 16 },
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

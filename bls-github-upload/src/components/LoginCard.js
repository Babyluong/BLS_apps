// components/LoginCard.js — uses RPC list_directory_names (works under RLS/anon)
import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions,
  KeyboardAvoidingView, Platform, Modal, FlatList, Animated, Easing,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import supabase from "../services/supabase";
import { BRAND1, BRAND2, ADMIN } from "../../constants";

const { width } = Dimensions.get("window");

export default function LoginCard({ onSubmit, loading = false }) {
  const [name, setName] = useState("");
  const [ic, setIc] = useState("");
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [directory, setDirectory] = useState([{ name: ADMIN.name, ic: ADMIN.ic }]);
  const [query, setQuery] = useState("");
  const [loadingDir, setLoadingDir] = useState(false);

  // Load users from users table and staff from profiles table
  const loadDirectory = async () => {
    setLoadingDir(true);
    try {
      // Load all users from profiles table (both staff and regular users)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('full_name, ic, role')
        .order('full_name');
      
      if (profilesError) throw profilesError;

      // Filter and combine all profiles
      const allProfiles = Array.isArray(profilesData) ? profilesData : [];
      const combinedList = allProfiles;

      const mapped = combinedList
        .filter(r => r?.full_name)
        .map(r => ({ name: String(r.full_name).toUpperCase(), ic: r?.ic ? String(r.ic) : "" }));

      // ensure admin entry on top
      if (!mapped.find(x => x.name === ADMIN.name)) {
        mapped.unshift({ name: ADMIN.name, ic: ADMIN.ic });
      }

      // de-dupe by name
      const seen = new Set();
      const deduped = mapped.filter(x => x?.name && !seen.has(x.name) && seen.add(x.name));

      console.log("📋 LoginCard Directory Loaded:", deduped);
      setDirectory(deduped.length ? deduped : [{ name: ADMIN.name, ic: ADMIN.ic }]);
    } catch (e) {
      // keep admin fallback
      setDirectory([{ name: ADMIN.name, ic: ADMIN.ic }]);
      console.warn("Directory load failed:", e?.message || e);
    } finally {
      setLoadingDir(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  // Animations (entry + glow + shimmer) — unchanged
  const entry = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entry, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })).start();
  }, [entry, glow, shimmer]);

  const translateY = entry.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const opacity = entry.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.5] });
  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-200, 200] });

  // Submit
  const submit = () => {
    const n = String(name || "").trim();
    const p = String(ic || "").trim();
    if (!n || !p) {
      setErr("Please select a User ID and enter the User Password.");
      return;
    }
    setErr("");
    onSubmit?.({ name: n, ic: p });
  };

  // Picker behaviour
  const userIdRef = useRef(null);
  const hasSelection = !!name;
  const openPicker = () => { if (loading) return; setQuery(""); setPickerOpen(true); setTimeout(() => userIdRef.current?.blur(), 0); };
  const handleUserIdFocus = () => { if (!hasSelection && !loading) openPicker(); };
  const handleUserIdTouch = (e) => { if (!hasSelection && !loading) { e?.preventDefault?.(); openPicker(); } };

  // Search results (by name or IC - more flexible search)
  const results = query.trim()
    ? directory.filter(u => {
        const q = query.trim().toUpperCase();
        const name = (u.name || "").toUpperCase();
        const ic = (u.ic || "").toUpperCase();
        
        // Search by partial name match, IC match, or any part of the name
        return name.includes(q) || 
               ic.includes(q) || 
               name.split(' ').some(part => part.includes(q)) ||
               name.split(' ').some(part => part.startsWith(q));
      })
    : [];

  const selectUser = (u) => {
    setName(u.name || "");
    setPickerOpen(false);
    setQuery("");
    setErr("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: Math.min(560, width - 24) }}>
      <Animated.View style={[styles.card, { transform: [{ translateY }, { scale: glowScale }], opacity }]}>

        {/* Shimmer band */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: "hidden", borderRadius: 20, opacity: 0.35 }]}>
          <Animated.View style={{ position: "absolute", top: -40, left: shimmerX, width: 140, height: 240, transform: [{ rotate: "20deg" }], backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20 }} />
        </Animated.View>

        <View style={{ padding: 2 }}>
          <Text style={styles.title}>Sign in</Text>

          {/* USER ID */}
          <Text style={styles.label}>User ID</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={userIdRef}
              value={name}
              placeholder="Tap to search name / IC"
              placeholderTextColor="#9a917e"
              style={[styles.input, { paddingRight: 72 }]}
              autoCapitalize="characters"
              onFocus={handleUserIdFocus}
              onTouchStart={handleUserIdTouch}
              showSoftInputOnFocus={false}
              caretHidden
              editable={!loading}
            />
            {/* open picker icon */}
            {!hasSelection && (
              <MaterialCommunityIcons name="account-search-outline" size={18} color="#e7e3d6" style={styles.inputIcon} onPress={openPicker} />
            )}
            {/* reload icon */}
            <TouchableOpacity onPress={loadDirectory} style={[styles.inputIcon, { right: 38 }]} disabled={loadingDir}>
              {loadingDir
                ? <ActivityIndicator size="small" color="#e7e3d6" />
                : <MaterialCommunityIcons name="refresh" size={18} color="#e7e3d6" />
              }
            </TouchableOpacity>
          </View>

          {hasSelection && (
            <TouchableOpacity disabled={loading} onPress={() => { setName(""); setErr(""); openPicker(); }} style={{ alignSelf: "flex-end", marginTop: 6 }}>
              <Text style={{ color: "#e9ddc4", textDecorationLine: "underline", fontSize: 12 }}>Change user</Text>
            </TouchableOpacity>
          )}

          {/* PASSWORD */}
          <Text style={styles.label}>User Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g. 990925135959"
              placeholderTextColor="#9a917e"
              value={ic}
              onChangeText={setIc}
              style={[styles.input, { paddingRight: 36 }]}
              keyboardType="number-pad"
              secureTextEntry={!showPass}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity style={styles.inputIcon} onPress={() => setShowPass(v => !v)} disabled={loading}>
              <MaterialCommunityIcons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#e7e3d6" />
            </TouchableOpacity>
          </View>

          {!!err && <Text style={styles.error}>{err}</Text>}

          <TouchableOpacity activeOpacity={0.9} onPress={submit} disabled={loading} style={{ marginTop: 10 }}>
            <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, loading && { opacity: 0.6 }]}>
              {loading ? <ActivityIndicator size="small" color="#1c1710" /> : <Text style={styles.btnText}>Enter To Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Soft glow border */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 20, opacity: glowOpacity, borderWidth: 1, borderColor: "rgba(230,210,150,0.28)" }]} />
      </Animated.View>

      {/* Picker modal */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select User</Text>
              <TouchableOpacity onPress={() => setPickerOpen(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#e9ddc4" />
              </TouchableOpacity>
            </View>

            <View style={[styles.input, { flexDirection: "row", alignItems: "center", marginBottom: 10 }]}>
              <MaterialCommunityIcons name="magnify" size={18} color="#e7e3d6" />
              <TextInput
                style={{ color: "#efe7d2", marginLeft: 8, flex: 1 }}
                placeholder="Search by name, IC, or any part of name…"
                placeholderTextColor="#9a917e"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="characters"
              />
            </View>

            <FlatList
              data={results}
              keyExtractor={(item, idx) => (item.name || "U") + "_" + idx}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.85} onPress={() => selectUser(item)} style={styles.resultRow}>
                  <MaterialCommunityIcons name="account" size={20} color="#e7e3d6" />
                  <Text style={{ color: "#efe7d2", fontWeight: "800", marginLeft: 8 }}>{item.name}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#e7e3d6" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={query.trim()
                ? <Text style={{ color: "#d7ccb7", textAlign: "center", marginTop: 8 }}>No matches</Text>
                : <Text style={{ color: "#d7ccb7", textAlign: "center", marginTop: 8 }}>Tiada data. Tekan ikon refresh.</Text>}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { width: Math.min(560, width - 24), borderRadius: 20, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", backgroundColor: "rgba(18,18,22,0.65)", padding: 16, overflow: "hidden" },
  title: { color: "#f5ead1", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  label: { color: "#d7ccb7", fontSize: 13, marginTop: 6 },
  inputWrapper: { position: "relative" },
  inputIcon: { position: "absolute", right: 12, top: 14 },
  input: { color: "#efe7d2", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 4 },
  btn: { borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 },
  error: { color: "#ffb3b3", marginTop: 6, textAlign: "center" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 16 },
  modalSheet: { width: Math.min(560, width - 24), borderRadius: 20, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", backgroundColor: "rgba(18,18,22,0.96)", padding: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  modalTitle: { color: "#f5ead1", fontSize: 18, fontWeight: "900" },
  modalCloseBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)" },
  resultRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", borderRadius: 12, padding: 10 },
});

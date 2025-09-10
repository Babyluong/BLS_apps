// screens/LoginScreen.js — your original style, with working fallback submit
import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LoginCard from "../components/LoginCard";
import supabase from "../services/supabase";
import { BRAND1, BRAND2, ADMIN } from "../constants";

const { width } = Dimensions.get("window");

export default function LoginScreen({ onSubmit, loading = false, navigation, errorMessage, clearError }) {
  const [localLoading, setLocalLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const fallbackSubmit = async ({ name, ic }) => {
    setErr(""); setInfo(""); setLocalLoading(true);
    clearError?.(); // Clear any existing error from App.js
    
    // Debug: Let's test the database connection first
    console.log("🧪 Testing database connection...");
    try {
      const { data: testData, error: testError } = await supabase
        .from("users")
        .select("full_name, ic")
        .limit(3);
      console.log("📋 Sample users data:", testData);
    } catch (e) {
      console.log("❌ Database test failed:", e);
    }
    
    try {
      // Admin bypass (optional)
      if (name === ADMIN.name && ic === ADMIN.ic) {
        navigation?.replace?.("AdminHome", {
          user: { id: "admin-local", full_name: ADMIN.name, role: "admin" },
        });
        return;
      }

      // Use the same login logic as App.js
      const norm = (s = "") => String(s || "").trim().replace(/\s+/g, " ");
      const fullName = norm(name);
      const passwordIC = norm(ic);
      const email = `${passwordIC}@hospital-lawas.local`;
      
      // Check if it's admin
      const isAdmin = (
        fullName.toUpperCase() === ADMIN.name.toUpperCase() ||
        passwordIC === ADMIN.ic ||
        email.toLowerCase() === `${ADMIN.ic}@hospital-lawas.local`.toLowerCase()
      );

      // Try normal sign-in first
      console.log("🔐 Attempting Supabase auth:", { email, passwordIC });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: passwordIC });
      
      if (!error && data?.user) {
        console.log("✅ Supabase auth successful");
        // Check if user is staff in profiles table
        const { data: staffData } = await supabase
          .from("profiles")
          .select("role")
          .eq("ic", passwordIC)
          .eq("role", "staff")
          .single();
        
        console.log("👥 Staff check result:", staffData);
        
        const userRole = isAdmin ? "admin" : staffData ? "staff" : "user";
        
        const homeScreen = userRole === "admin" ? "AdminHome" : 
                          userRole === "staff" ? "StaffHome" : "UserHome";
        
        console.log("🏠 Navigating to:", homeScreen);
        
        navigation?.replace?.(homeScreen, { 
          user: { id: data.user.id, full_name: fullName, email, role: userRole } 
        });
        return;
      } else {
        console.log("❌ Supabase auth failed:", error?.message);
      }

      // Check users table for regular users
      const wantName = fullName.toUpperCase();
      const { data: userData, error: userCheckError } = await supabase
        .from("users")
        .select("full_name, ic, jawatan")
        .eq("ic", passwordIC)
        .single();

      // Check profiles table for staff members
      const { data: staffData, error: staffCheckError } = await supabase
        .from("profiles")
        .select("full_name, ic, role")
        .eq("ic", passwordIC)
        .eq("role", "staff")
        .single();

      // Check if user exists in either table and name matches
      const userExists = userData && String(userData.full_name || "").toUpperCase() === wantName;
      const staffExists = staffData && String(staffData.full_name || "").toUpperCase() === wantName;

      if (!userExists && !staffExists) {
        setErr("Invalid User ID or User Password.");
        return;
      }

      // Determine user role based on which table they exist in
      const userRole = staffExists ? "staff" : "user";

      // Provision new user and sign in
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: passwordIC,
      });

      if (signUpError && !signUpError.message.includes("already registered")) {
        throw signUpError;
      }

      // Sign in after provisioning
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password: passwordIC 
      });

      if (signInError || !signInData?.user) {
        throw new Error(signInError?.message || "Cannot sign in after provisioning");
      }

      // Create profile
      const finalRole = isAdmin ? "admin" : userRole;
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: signInData.user.id,
        full_name: fullName,
        ic: passwordIC,
        email: email,
        role: finalRole,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.warn("Profile creation failed:", profileError);
      }

      // Navigate to appropriate home screen
      const homeScreen = finalRole === "admin" ? "AdminHome" : 
                        finalRole === "staff" ? "StaffHome" : "UserHome";
      navigation?.replace?.(homeScreen, { 
        user: { id: signInData.user.id, full_name: fullName, email, role: finalRole } 
      });
    } catch (e) {
      const msg = e?.message || "Sign in failed.";
      setErr(msg);
      Alert.alert("Sign in error", msg);
    } finally {
      setLocalLoading(false);
    }
  };

  const handler = onSubmit || fallbackSubmit;
  const busy = loading || localLoading;

  return (
    <View style={styles.shell}>
      {/* Welcome panel (unchanged style) */}
      <View style={[styles.brandPanel, styles.column]}>
        <View style={styles.brandInner}>
          <View style={styles.monogramWrap}>
            <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.monogramDisc}>
              <Text style={styles.monogram}>BLS</Text>
            </LinearGradient>
            <Text style={styles.brandName}>Basic Life Support</Text>
          </View>
          <Text style={styles.h1}>Hospital Lawas</Text>
          <Text style={styles.tagline}>Every Second Counts</Text>
        </View>
      </View>

      {/* Login card (unchanged positioning) */}
      <View style={styles.column}>
        <LoginCard onSubmit={handler} loading={busy} />
        {(!!err || !!errorMessage) && (
          <Text style={{ color: "#ffb3b3", marginTop: 8, textAlign: "center" }}>
            {err || errorMessage}
          </Text>
        )}
        {!!info && !err && !errorMessage && <Text style={{ color: "#a6f3c1", marginTop: 8, textAlign: "center" }}>{info}</Text>}
      </View>
    </View>
  );
}

/* ------------------------ Styles (kept exactly) ------------------------ */
const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, gap: 22 },
  column: { minHeight: 180, justifyContent: "center", alignItems: "center", width: Math.min(560, width - 24) },
  brandPanel: { width: Math.min(560, width - 24), paddingHorizontal: 6 },
  brandInner: { alignItems: "center", justifyContent: "center" },
  monogramWrap: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  monogramDisc: { width: 34, height: 34, borderRadius: 20, alignItems: "center", justifyContent: "center", shadowOpacity: 0.6, shadowRadius: 12, marginRight: 8 },
  monogram: { color: "#1c1710", fontWeight: "900", letterSpacing: 1 },
  brandName: { color: "#e9ddc4", fontSize: 16, letterSpacing: 3, fontWeight: "700", textAlign: "center" },
  h1: { color: "#f5ead1", fontSize: 38, fontWeight: "900", letterSpacing: 0.2, textAlign: "center" },
  tagline: { color: "#bfb7a5", marginTop: 6, fontSize: 15, textAlign: "center" },
});

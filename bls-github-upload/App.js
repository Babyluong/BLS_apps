// App.js — IC-first Auth + guarded routing (no local-admin bypass) + Back → Admin Menu
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View, StatusBar, SafeAreaView, StyleSheet, Animated, Easing,
  Text, Alert, ActivityIndicator, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import supabase from "./services/supabase";
import { ADMIN } from "./constants";
// import ErrorBoundary from "./components/ErrorBoundary";

// Simple inline ErrorBoundary to avoid import issues
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#06070a' }}>
          <Text style={{ color: '#f5ead1', fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ color: '#d7ccb7', fontSize: 14, textAlign: 'center' }}>
            Please restart the app
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import AdminHomeScreen from "./src/screens/AdminHomeScreen";
import AdminMenuScreen from "./src/screens/AdminMenuScreen";
import AddStaffScreen from "./src/screens/AddStaffScreen";
import AddUserScreen from "./src/screens/AddUserScreen";
import ListStaffScreen from "./src/screens/ListStaffScreen";
import ListUsersScreen from "./src/screens/ListUsersScreen";
import EditProfilesScreen from "./src/screens/EditProfilesScreen";
import DeleteProfilesScreen from "./src/screens/DeleteProfilesScreen";
import AdminToolsScreen from "./src/screens/AdminToolsScreen";
import ActivityLogsScreen from "./src/screens/ActivityLogsScreen";
import StaffHomeScreen from "./src/screens/StaffHomeScreen";
import UserHomeScreen from "./src/screens/UserHomeScreen";
import OneTapImportUsersScreen from "./src/screens/OneTapImportUsersScreen";

// Questions (keep separate from profiles)
import OneTapImportQuestionsScreen from "./src/screens/OneTapImportQuestionsScreen";
import EditQuestionsScreen from "./src/screens/EditQuestionsScreen";

// NEW: BLS Test + Pre/Post
import BLSTestScreen from "./src/screens/BLSTestScreen";
import BLSChecklistScreen from "./src/screens/BLSChecklistScreen";
import BLSChecklistEditScreen from "./src/screens/BLSChecklistEditScreen";
import BLSResultsScreen from "./src/screens/BLSResultsScreen";
import QuizResultsScreen from "./src/screens/QuizResultsScreen";
import OneManCPR from "./src/screens/OneManCPR";
import TwoManCPR from "./src/screens/TwoManCPR";
import InfantCPR from "./src/screens/InfantCPR";
import AdultChoking from "./src/screens/AdultChoking";
import InfantChoking from "./src/screens/InfantChoking";
import PreTestQuestionsScreen from "./src/screens/PreTestQuestionsScreen";
import PostTestQuestionsScreen from "./src/screens/PostTestQuestionsScreen";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [profile, setProfile] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ===== Memoized Helpers =====
  const adminEmailFor = useCallback((ic) => `${String(ic || "").trim()}@hospital-lawas.local`, []);
  
  const isAdminByCreds = useCallback(({ fullName, ic, email }) => {
    const wantName = String(fullName || "").trim().toUpperCase();
    const wantIC = String(ic || "").trim();
    const wantEmail = String(email || "").trim().toLowerCase();
    return (
      wantName === String(ADMIN.name || "").toUpperCase() ||
      wantIC === String(ADMIN.ic || "") ||
      wantEmail === adminEmailFor(ADMIN.ic).toLowerCase()
    );
  }, [adminEmailFor]);

  // ===== Background motion (keep look/feel) =====
  const orb = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(orb, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [orb]);

  // ===== Session restore + listener =====
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) await postAuthRoute(data.session.user);
      else setScreen("login");
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.user) postAuthRoute(newSession.user);
      else {
        setProfile(null);
        setScreen("login");
      }
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // ===== Memoized Role guard =====
  const role = useCallback(() => String(profile?.role || "user").toLowerCase(), [profile?.role]);
  const homeFor = useCallback((r) => (r === "admin" ? "adminHome" : r === "staff" ? "staffHome" : "userHome"), []);

  const ALLOWED = useMemo(() => ({
    admin: new Set([
      "adminHome", "adminMenu",
      "addStaff", "addUser", "listStaff", "listUsers",
      "editProfiles", "deleteProfiles", "adminTools", "activityLogs",
      "oneTapImportUsers",
      "importQuestions", "editQuestions",
      // NEW BLS Test routes
      "blsTest", "blsChecklist", "blsChecklistEdit", "blsResults", "quizResults", "oneManCPR", "twoManCPR", "infantCPR", "adultChoking", "infantChoking", "preTestQuestions", "postTestQuestions",
    ]),
    staff: new Set([
      "staffHome",
      // Staff can use BLS features
      "blsTest", "blsChecklist", "blsResults", "quizResults", "oneManCPR", "twoManCPR", "infantCPR", "adultChoking", "infantChoking", "preTestQuestions", "postTestQuestions",
    ]),
    user: new Set([
      "userHome",
      // Users can only use BLS Test
      "blsTest", "quizResults", "preTestQuestions", "postTestQuestions",
    ]),
  }), []);

  const safeNavigate = useCallback((target) => {
    const r = role();
    const allowed = ALLOWED[r] || ALLOWED.user;
    if (!allowed.has(target)) {
      Alert.alert("No access", "You don't have permission to open that page.");
      setScreen(homeFor(r));
      return;
    }
    setScreen(target);
  }, [role, ALLOWED, homeFor]);
  
  const goHome = useCallback(() => { setScreen(homeFor(role())); }, [homeFor, role]);
  const backToMenu = useCallback(() => safeNavigate("adminMenu"), [safeNavigate]);

  useEffect(() => {
    const r = role();
    const allowed = ALLOWED[r] || ALLOWED.user;
    if (screen !== "login" && !allowed.has(screen)) setScreen(homeFor(r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, profile?.role]);

  // ===== Memoized Ensure profile (and align admin if matched) =====
  const ensureProfileForUser = useCallback(async (authUser, suppliedFullName, suppliedIC) => {
    const suppliedEmail = authUser?.email || adminEmailFor(suppliedIC);
    const adminDetected = isAdminByCreds({
      fullName: suppliedFullName || authUser?.user_metadata?.full_name,
      ic: suppliedIC || authUser?.user_metadata?.ic,
      email: suppliedEmail,
    });

    try {
      const got = await supabase.from("profiles")
        .select("id, role, full_name, email, ic")
        .eq("id", authUser.id).limit(1);
      const existing = got?.data?.[0] || null;

      if (existing) {
        if (adminDetected && String(existing.role || "").toLowerCase() !== "admin") {
          try { await supabase.from("profiles").update({ role: "admin" }).eq("id", authUser.id); } catch {}
          return { ...existing, role: "admin" };
        }
        return existing;
      }

      const seed = {
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || suppliedFullName || "(No name)",
        email: suppliedEmail || null,
        role: adminDetected ? "admin" : "user",
        ic: suppliedIC || authUser?.user_metadata?.ic || null,
      };
      const ins = await supabase.from("profiles").insert(seed).select().single();
      if (!ins.error && ins.data) {
        return adminDetected ? { ...ins.data, role: "admin" } : ins.data;
      }
    } catch {}

    return {
      id: authUser.id,
      full_name: suppliedFullName || "(User)",
      email: suppliedEmail || null,
      role: adminDetected ? "admin" : "user",
    };
  }, [adminEmailFor, isAdminByCreds]);

  // ===== Memoized After-auth routing =====
  const postAuthRoute = useCallback(async (user) => {
    try {
      const got = await supabase.from("profiles")
        .select("id, role, full_name, email, ic")
        .eq("id", user.id).limit(1);
      const prof = got?.data?.[0] || null;

      const detectedAdmin = isAdminByCreds({
        fullName: prof?.full_name || user?.user_metadata?.full_name,
        ic: prof?.ic || user?.user_metadata?.ic,
        email: prof?.email || user?.email,
      });

      const effectiveRole = detectedAdmin ? "admin" : String(prof?.role || "user").toLowerCase();

      if (detectedAdmin && prof && String(prof.role || "").toLowerCase() !== "admin") {
        try { await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id); } catch {}
      }

      setProfile({
        id: user.id,
        full_name: prof?.full_name || user?.email || "(User)",
        email: prof?.email || user?.email,
        role: effectiveRole,
      });
      setScreen(effectiveRole === "admin" ? "adminHome" : effectiveRole === "staff" ? "staffHome" : "userHome");
    } catch {
      setProfile({ id: user.id, full_name: user.email || "User", email: user.email, role: "user" });
      setScreen("userHome");
    }
  }, [isAdminByCreds]);

  // ===== Memoized Provision (if needed) then sign in =====
  const provisionAndSignIn = useCallback(async ({ email, passwordIC, fullName }) => {
    try {
      await supabase.auth.signUp({
        email, password: passwordIC, options: { data: { full_name: fullName, ic: passwordIC } },
      });
    } catch {}
    try {
      await supabase.functions.invoke("admin_create_user", {
        body: { full_name: fullName, ic: passwordIC, email, role: "user", jawatan: null },
      });
    } catch {}
    const last = await supabase.auth.signInWithPassword({ email, password: passwordIC });
    if (last.error || !last.data?.user) throw new Error(last.error?.message || "Cannot sign in after provisioning");
    return last.data.user;
  }, []);

  // ===== Debug function to check database contents =====
  const debugDatabase = useCallback(async () => {
    console.log("🔍 DEBUG: Checking all profiles...");
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("full_name, ic, role")
      .order("full_name");
    
    console.log("📊 All Profiles:", { allProfiles, profilesError });
    
    console.log("🔍 DEBUG: Checking all users [CACHE_FIXED]...");
    const { data: allUsers, error: usersError } = await supabase
      .from("profiles")
      .select("full_name, ic, jawatan")
      .order("full_name");
    
    console.log("📊 All Users:", { allUsers, usersError });
  }, []);

  // ===== iOS-compatible string normalization =====
  const normalizeString = useCallback((str = "") => {
    if (!str) return "";
    return String(str)
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "") // Remove special characters
      .toUpperCase();
  }, []);

  // ===== More flexible name matching for iOS =====
  const isNameMatch = useCallback((inputName, dbName) => {
    if (!inputName || !dbName) return false;
    
    const normalizedInput = normalizeString(inputName);
    const normalizedDb = normalizeString(dbName);
    
    // Exact match
    if (normalizedInput === normalizedDb) return true;
    
    // Check if input name contains first part of DB name or vice versa
    const inputParts = normalizedInput.split(" ");
    const dbParts = normalizedDb.split(" ");
    
    // Check if any part matches
    for (const inputPart of inputParts) {
      for (const dbPart of dbParts) {
        if (inputPart.length > 2 && dbPart.length > 2 && 
            (inputPart.includes(dbPart) || dbPart.includes(inputPart))) {
          return true;
        }
      }
    }
    
    return false;
  }, [normalizeString]);

  // ===== Memoized Login (IC-first) — iOS-compatible =====
  const handleLogin = useCallback(async ({ name, ic }) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError("");

    const norm = (s = "") => String(s || "").trim().replace(/\s+/g, " ");
    const fullName = norm(name);
    const passwordIC = norm(ic);
    const email = adminEmailFor(passwordIC);
    const isAdmin = isAdminByCreds({ fullName, ic: passwordIC, email });

    console.log("🚀 App.js Login Debug:", { 
      platform: Platform?.OS || 'unknown',
      name, 
      ic, 
      fullName, 
      passwordIC, 
      email, 
      isAdmin,
      normalizedName: normalizeString(fullName)
    });

    // Debug: Check database contents
    await debugDatabase();

    try {
      // 1) Try normal sign-in
      console.log("🔐 App.js Supabase Auth Attempt:", { email, passwordIC });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: passwordIC });
      
      if (!error && data?.user) {
        console.log("✅ App.js Supabase auth successful");
        const prof = await ensureProfileForUser(data.user, fullName, passwordIC);
        const r = isAdmin ? "admin" : String(prof.role || "user").toLowerCase();

        if (isAdmin) { try { await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id); } catch {} }

        setProfile({ id: data.user.id, full_name: prof.full_name, email: prof.email || email, role: r });
        setScreen(r === "admin" ? "adminHome" : r === "staff" ? "staffHome" : "userHome");
        setIsLoggingIn(false);
        return;
      } else {
        console.log("❌ App.js Supabase auth failed:", error?.message);
      }

      // 2) Directory check (name+IC exist in users or profiles table)
      const wantName = fullName.toUpperCase();
      console.log("🔍 App.js Database Check [V2.0 - FIXED]:", { wantName, passwordIC });
      
    // Check users table for regular users [FORCE_RELOAD_2025]
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("full_name, ic, jawatan")
      .eq("ic", passwordIC)
      .single();

    console.log("📊 App.js User Query Result:", { userData, userError });

    // Check profiles table for staff members
    const { data: staffData, error: staffError } = await supabase
      .from("profiles")
      .select("full_name, ic, role")
      .eq("ic", passwordIC)
      .eq("role", "staff")
      .single();

    console.log("👥 App.js Staff Query Result:", { staffData, staffError });
    
    // Debug: Let's also check all profiles with this IC regardless of role
    const { data: allProfilesData, error: allProfilesError } = await supabase
      .from("profiles")
      .select("full_name, ic, role")
      .eq("ic", passwordIC);
    
    console.log("🔍 App.js All Profiles with IC:", { allProfilesData, allProfilesError });
    
    // Debug: Let's also check what profiles exist with similar names
    const { data: similarNameData, error: similarNameError } = await supabase
      .from("profiles")
      .select("full_name, ic, role")
      .ilike("full_name", `%${fullName.split(' ')[0]}%`);
    
    console.log("🔍 App.js Similar Names:", { similarNameData, similarNameError });

    // Use flexible name matching for iOS compatibility
    const userExists = userData && isNameMatch(fullName, userData.full_name);
    const staffExists = staffData && isNameMatch(fullName, staffData.full_name);
    
    console.log("🔍 App.js Name Matching Debug:", {
      wantName,
      userDataName: userData?.full_name,
      staffDataName: staffData?.full_name,
      userExists,
      staffExists,
      inputName: fullName,
      normalizedInput: normalizeString(fullName),
      normalizedUserDb: userData ? normalizeString(userData.full_name) : null,
      normalizedStaffDb: staffData ? normalizeString(staffData.full_name) : null
    });

    if (!userExists && !staffExists) {
      // Try to find similar names for better error message
      const { data: similarUsers } = await supabase
        .from("profiles")
        .select("full_name, ic")
        .ilike("full_name", `%${fullName.split(' ')[0]}%`)
        .limit(3);
      
      const { data: similarStaff } = await supabase
        .from("profiles")
        .select("full_name, ic")
        .ilike("full_name", `%${fullName.split(' ')[0]}%`)
        .limit(3);
      
      console.log("🔍 Similar names found:", { similarUsers, similarStaff });
      
      setLoginError(`User not found. Please check your name and IC number.${Platform?.OS === 'ios' ? ' (iOS)' : ''}`);
      setIsLoggingIn(false);
      return;
    }

    // Determine user role based on which table they exist in
    const isStaff = staffExists;

      // 3) Provision → sign-in
      const authUser = await provisionAndSignIn({ email, passwordIC, fullName });
      const prof = await ensureProfileForUser(authUser, fullName, passwordIC);
      const r = isAdmin ? "admin" : isStaff ? "staff" : "user";

      if (isAdmin) { try { await supabase.from("profiles").update({ role: "admin" }).eq("id", authUser.id); } catch {} }
      if (isStaff) { try { await supabase.from("profiles").update({ role: "staff" }).eq("id", authUser.id); } catch {} }

      setProfile({ id: authUser.id, full_name: prof.full_name, email: prof.email || email, role: r });
      setScreen(r === "admin" ? "adminHome" : r === "staff" ? "staffHome" : "userHome");
      setIsLoggingIn(false);
    } catch {
      setLoginError("Wrong login credential");
      setIsLoggingIn(false);
    }
  }, [isLoggingIn, isAdminByCreds, ensureProfileForUser, provisionAndSignIn]);

  const handleSignOut = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch {}
    setProfile(null);
    setScreen("login");
  }, []);

  // ===== Memoized Pages (Back from ALL admin subpages → Admin Menu) =====
  const PAGES = useMemo(() => ({
    adminHome:   <AdminHomeScreen onSignOut={handleSignOut} onNavigate={safeNavigate} />,
    adminMenu:   <AdminMenuScreen onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,

    addStaff:        <AddStaffScreen        onSignOut={handleSignOut} onBack={backToMenu} />,
    addUser:         <AddUserScreen         onSignOut={handleSignOut} onBack={backToMenu} />,
    listStaff:       <ListStaffScreen       onSignOut={handleSignOut} onBack={backToMenu} />,
    listUsers:       <ListUsersScreen       onSignOut={handleSignOut} onBack={backToMenu} />,
    editProfiles:    <EditProfilesScreen    onSignOut={handleSignOut} onBack={backToMenu} />,
    deleteProfiles:  <DeleteProfilesScreen  onSignOut={handleSignOut} onBack={backToMenu} />,
    adminTools:      <AdminToolsScreen      onSignOut={handleSignOut} onBack={backToMenu} onNavigate={safeNavigate} />,
    activityLogs:    <ActivityLogsScreen    onSignOut={handleSignOut} onBack={backToMenu} />,

    oneTapImportUsers:   <OneTapImportUsersScreen   onSignOut={handleSignOut} onBack={backToMenu} />,
    importQuestions:     <OneTapImportQuestionsScreen onSignOut={handleSignOut} onBack={backToMenu} />,
    editQuestions:       <EditQuestionsScreen         onSignOut={handleSignOut} onBack={backToMenu} />,

    // NEW: BLS Test + Pre/Post (back → Admin Home)
    blsTest:             <BLSTestScreen onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,
    preTestQuestions:    <PreTestQuestionsScreen onBack={backToMenu} onNavigate={safeNavigate} />,
    postTestQuestions:   <PostTestQuestionsScreen onBack={backToMenu} onNavigate={safeNavigate} />,
    blsChecklist:        <BLSChecklistScreen onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,
    blsChecklistEdit:    <BLSChecklistEditScreen onSignOut={handleSignOut} onBack={backToMenu} onNavigate={safeNavigate} />,
    blsResults:          <BLSResultsScreen onSignOut={handleSignOut} onBack={backToMenu} onNavigate={safeNavigate} />,
    quizResults:         <QuizResultsScreen onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,
    oneManCPR:           <OneManCPR onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,
    twoManCPR:           <TwoManCPR onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,
    infantCPR:           <InfantCPR onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,
    adultChoking:        <AdultChoking onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,
    infantChoking:       <InfantChoking onSignOut={handleSignOut} onBack={goHome} onNavigate={safeNavigate} />,

    staffHome:   <StaffHomeScreen onSignOut={handleSignOut} profile={profile} onNavigate={safeNavigate} />,
    userHome:    <UserHomeScreen  onSignOut={handleSignOut} profile={profile} onNavigate={safeNavigate} />,
  }), [handleSignOut, safeNavigate, goHome, backToMenu, profile]);

  const renderScreen = useCallback(() => {
    if (screen === "login") {
      return (
        <LoginScreen
          onSubmit={handleLogin}
          loading={isLoggingIn}
          errorMessage={loginError}
          clearError={() => setLoginError("")}
        />
      );
    }
    const r = role();
    const allowed = ALLOWED[r] || ALLOWED.user;
    if (!allowed.has(screen)) return PAGES[homeFor(r)];
    return PAGES[screen] || (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#f5ead1" }}>No page registered for: {String(screen)}</Text>
      </View>
    );
  }, [screen, isLoggingIn, loginError, handleLogin, role, ALLOWED, homeFor, PAGES]);

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        {/* Background */}
        <LinearGradient colors={["#06070a", "#0b0f18", "#090d15"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {/* Moving orbs */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.orb,
            { top: -60, left: -40, opacity: 0.35, transform: [{ translateX: orb.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.orb,
            { bottom: -60, right: -20, opacity: 0.28, backgroundColor: "rgba(220, 180, 120, 0.15)",
              transform: [{ translateY: orb.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }] }
          ]}
        />

        <SafeAreaView style={{ flex: 1 }}>
          {renderScreen()}

          {/* Footer */}
          <View style={{ alignItems: "center", paddingVertical: 10 }}>
            <Text style={{ color: "#8a7f6a", fontSize: 12 }}>© {new Date().getFullYear()} Hospital Lawas • Private Access</Text>
          </View>

          {/* Signing-in overlay */}
          {isLoggingIn && (
            <View style={styles.overlay}>
              <ActivityIndicator size="large" />
              <Text style={{ color: "#f5ead1", fontWeight: "800", marginTop: 12 }}>Signing in…</Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
orb: {
  position: "absolute",
  width: 320,
  height: 320,
  borderRadius: 320,
  backgroundColor: "rgba(120, 140, 255, 0.22)",
  shadowColor: "#9aa7ff",
  shadowOpacity: 0.4,
  shadowRadius: 50,
  shadowOffset: { width: 0, height: 0 },
},
overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.35)",
  alignItems: "center",
  justifyContent: "center",
  paddingBottom: 40,
},
});

// screens/AdminToolsScreen.js
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import LuxuryShell from "../components/LuxuryShell";
import BackRow from "../components/BackRow";
import StubCard from "../components/StubCard";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND1, BRAND2 } from "../constants";
import { fetchResults, logEvent } from "../lib/api";
import supabase from "../services/supabase";
import ScoreUpdateService from "../services/scoreUpdateService";

let FileSystem, Sharing;
try { FileSystem = require("expo-file-system"); } catch {}
try { Sharing = require("expo-sharing"); } catch {}

export default function AdminToolsScreen({ onSignOut, onBack, onNavigate }) {
  async function addTestUser() {
    try {
      const email = 'yongziling@moh.gov.my';
      const password = '970324105472';
      const fullName = 'YONG ZILING';
      const ic = '970324105472';
      
      // Step 1: Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, ic: ic } }
      });
      
      if (signUpError && !signUpError.message.includes("already registered")) {
        alert('Error creating auth user: ' + signUpError.message);
        return;
      }
      
      // Step 2: Sign in to get the user ID
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError || !signInData?.user) {
        alert('Error signing in: ' + signInError?.message);
        return;
      }
      
      // Step 3: Create profile entry
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: signInData.user.id,
        full_name: fullName,
        ic: ic,
        email: email,
        role: 'user'
      }, { onConflict: 'ic' });
      
      if (profileError) {
        alert('Error creating profile: ' + profileError.message);
        return;
      }
      
      // Step 4: Sign out (since we were just creating the user)
      await supabase.auth.signOut();
      
      alert('Test user created successfully! You can now login with:\nName: YONG ZILING\nIC: 970324105472');
      
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function checkAllUsers() {
    try {
      // Check all users in users table (now accessible with RLS off)
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('full_name, ic, jawatan')
        .order('full_name');
      
      if (error) {
        alert('Error checking users: ' + error.message);
        return;
      }
      
      let message = `Found ${allUsers.length} users in users table:\n\n`;
      
      // Show all users (they all login as 'user' role)
      allUsers.forEach((user, index) => {
        message += `${index + 1}. ${user.full_name} (IC: ${user.ic})\n`;
      });
      
      message += `\n\n✅ ALL USERS LOGIN AS 'USER' ROLE\nStaff roles are managed separately by admin.\n\nUse Name + IC number to login.`;
      
      alert(message);
      
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function addMissingUser() {
    try {
      // Add ABDUL RAHMAN BIN MOHAMAD BADARUDDIN to profiles table
      // We'll use the existing admin's ID to satisfy foreign key constraint
      const { data: adminProfile, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .single();
      
      if (adminError || !adminProfile) {
        alert('Error: No admin profile found');
        return;
      }
      
      // Add the missing user using admin's ID
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: adminProfile.id, // Use admin's ID to satisfy foreign key
          full_name: 'ABDUL RAHMAN BIN MOHAMAD BADARUDDIN',
          ic: '960109035847',
          email: '960109035847@hospital-lawas.local',
          role: 'user'
        });
      
      if (insertError) {
        alert('Error adding user: ' + insertError.message);
        return;
      }
      
      alert('User added successfully!\n\nYou can now login with:\nName: ABDUL RAHMAN BIN MOHAMAD BADARUDDIN\nIC: 960109035847');
      
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function exportCSV() {
    try {
      const rows = await fetchResults({ limit: 5000 });
      const header = [
        "participant", "ic", "score", "status", "when", "comments",
        // DANGER section
        "danger_ppe",
        // RESPONSE section
        "response_shoulder_tap", "response_shout",
        // SHOUT FOR HELP section
        "shout_emergency",
        // AIRWAY section
        "airway_head_tilt", "airway_jaw_thrust",
        // BREATHING section
        "breathing_determine", "breathing_compression_begin",
        // CIRCULATION section
        "circulation_location", "circulation_rate", "circulation_depth", "circulation_recoil",
        "circulation_minimize_interruption", "circulation_ratio", "circulation_ventilation_time",
        // DEFIBRILLATION section
        "defib_switch_on", "defib_attach_pads", "defib_clear_analysis", "defib_clear_shock",
        "defib_push_shock", "defib_resume_cpr", "defib_no_shock_continue"
      ];
      const lines = [header.join(",")].concat(
        rows.map(r => {
          // Parse JSON checklist details if available
          let checklistDetails = {};
          try {
            checklistDetails = r.checklist_details ? JSON.parse(r.checklist_details) : {};
          } catch (e) {
            console.log("Error parsing checklist details:", e);
          }
          
          return [
            r.participant, r.ic, r.score, r.status, r.when, checklistDetails.comments || "",
            // DANGER section
            checklistDetails.danger_ppe ? "YES" : "NO",
            // RESPONSE section
            checklistDetails.response_shoulder_tap ? "YES" : "NO", 
            checklistDetails.response_shout ? "YES" : "NO",
            // SHOUT FOR HELP section
            checklistDetails.shout_emergency ? "YES" : "NO",
            // AIRWAY section
            checklistDetails.airway_head_tilt ? "YES" : "NO", 
            checklistDetails.airway_jaw_thrust ? "YES" : "NO",
            // BREATHING section
            checklistDetails.breathing_determine ? "YES" : "NO", 
            checklistDetails.breathing_compression_begin ? "YES" : "NO",
            // CIRCULATION section
            checklistDetails.circulation_location ? "YES" : "NO", 
            checklistDetails.circulation_rate ? "YES" : "NO", 
            checklistDetails.circulation_depth ? "YES" : "NO", 
            checklistDetails.circulation_recoil ? "YES" : "NO",
            checklistDetails.circulation_minimize_interruption ? "YES" : "NO", 
            checklistDetails.circulation_ratio ? "YES" : "NO", 
            checklistDetails.circulation_ventilation_time ? "YES" : "NO",
            // DEFIBRILLATION section
            checklistDetails.defib_switch_on ? "YES" : "NO", 
            checklistDetails.defib_attach_pads ? "YES" : "NO", 
            checklistDetails.defib_clear_analysis ? "YES" : "NO", 
            checklistDetails.defib_clear_shock ? "YES" : "NO",
            checklistDetails.defib_push_shock ? "YES" : "NO", 
            checklistDetails.defib_resume_cpr ? "YES" : "NO", 
            checklistDetails.defib_no_shock_continue ? "YES" : "NO"
          ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
        })
      );
      const csv = lines.join("\n");

      // Web-compatible CSV download
      if (typeof window !== 'undefined') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bls_results_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        await logEvent({ action: "EXPORT", detail: `Exported ${rows.length} results to CSV` });
        return;
      }

      // Native app fallback
      if (!FileSystem) return alert("expo-file-system not available in this build.");
      const fileUri = FileSystem.cacheDirectory + `bls_results_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

      if (Sharing && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(fileUri, { dialogTitle: "Export Results (CSV)" });
      } else {
        alert(`CSV saved to: ${fileUri}`);
      }

      await logEvent({ action: "EXPORT", detail: `Exported ${rows.length} results to CSV` });
    } catch (e) {
      alert(e?.message || "Export failed");
    }
  }

  async function recalculateAllScores() {
    try {
      const confirmed = confirm("This will recalculate scores for ALL quiz sessions. This may take a few minutes. Continue?");
      if (!confirmed) return;

      alert("Starting score recalculation... This may take a few minutes.");
      
      const result = await ScoreUpdateService.recalculateAllScores();
      
      alert(`Score recalculation completed!\n\nUpdated ${result.updated_sessions} sessions\nDuration: ${result.duration_seconds.toFixed(2)} seconds`);
      
      await logEvent({ 
        action: "SCORE_RECALCULATION", 
        detail: `Recalculated scores for ${result.updated_sessions} sessions` 
      });
    } catch (e) {
      alert("Error recalculating scores: " + (e?.message || "Unknown error"));
      console.error("Score recalculation error:", e);
    }
  }

  async function checkScoreUpdateHealth() {
    try {
      const isHealthy = await ScoreUpdateService.checkScoreUpdateHealth();
      const stats = await ScoreUpdateService.getScoreUpdateStats();
      
      if (isHealthy) {
        alert(`Score Update System Status: HEALTHY\n\nTotal Sessions: ${stats.total_sessions}\nRecent Updates (24h): ${stats.recent_updates_24h}\nLast Update: ${stats.last_update ? new Date(stats.last_update).toLocaleString() : 'Never'}`);
      } else {
        alert("Score Update System Status: UNHEALTHY\n\nPlease check the database configuration.");
      }
    } catch (e) {
      alert("Error checking score update health: " + (e?.message || "Unknown error"));
      console.error("Score update health check error:", e);
    }
  }

  async function viewRecentScoreUpdates() {
    try {
      const updates = await ScoreUpdateService.getRecentScoreUpdates(24);
      
      if (updates.length === 0) {
        alert("No recent score updates found in the last 24 hours.");
        return;
      }
      
      const updateList = updates.slice(0, 10).map(update => {
        const time = new Date(update.ts).toLocaleString();
        const action = update.action === 'AUTO_SCORE_UPDATE' ? 'Auto Update' : 'Manual Update';
        return `${time}: ${action} - ${update.detail}`;
      }).join('\n\n');
      
      alert(`Recent Score Updates (Last 24 Hours):\n\n${updateList}`);
    } catch (e) {
      alert("Error fetching recent updates: " + (e?.message || "Unknown error"));
      console.error("Recent updates error:", e);
    }
  }

  return (
    <LuxuryShell onSignOut={onSignOut} title="BLS Administrator">
      <BackRow onBack={onBack} />
      <StubCard title="Admin Tools" text="View activity logs or export BLS results." button="Export Results (CSV)" onPress={exportCSV} />
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={addTestUser} activeOpacity={0.9}>
        <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 999, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 }}>Add Test User</Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={checkAllUsers} activeOpacity={0.9}>
        <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 999, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 }}>Check All Users</Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={() => onNavigate("activityLogs")} activeOpacity={0.9}>
        <LinearGradient colors={[BRAND1, BRAND2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 999, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ color: "#1c1710", fontWeight: "900", letterSpacing: 0.3 }}>View Activity Logs</Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={recalculateAllScores} activeOpacity={0.9}>
        <LinearGradient colors={["#28a745", "#20c997"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 999, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ color: "#ffffff", fontWeight: "900", letterSpacing: 0.3 }}>Recalculate All Scores</Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={checkScoreUpdateHealth} activeOpacity={0.9}>
        <LinearGradient colors={["#17a2b8", "#6f42c1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 999, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ color: "#ffffff", fontWeight: "900", letterSpacing: 0.3 }}>Check Score Update Health</Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={viewRecentScoreUpdates} activeOpacity={0.9}>
        <LinearGradient colors={["#fd7e14", "#e83e8c"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 999, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ color: "#ffffff", fontWeight: "900", letterSpacing: 0.3 }}>View Recent Score Updates</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LuxuryShell>
  );
}

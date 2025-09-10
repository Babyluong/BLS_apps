// screens/AdminHomeScreen.js
import React from "react";
import LuxuryShell from "../components/LuxuryShell";
import HomeGrid from "../components/HomeGrid";
import { logEvent } from "../lib/api";

export default function AdminHomeScreen({ onSignOut, onNavigate }) {
  return (
    <LuxuryShell onSignOut={onSignOut} title="BLS Administrator">
      <HomeGrid
        heading="Welcome Mr. Administrator"
        actions={[
          {
            icon: "view-dashboard-outline",
            label: "Admin Menu",
            onPress: async () => {
              await logEvent({ action: "NAVIGATE", detail: "Opened Admin Menu" });
              onNavigate("adminMenu");
            },
          },
          {
            icon: "clipboard-check-outline",
            label: "BLS Checklist (view)",
            onPress: async () => {
              await logEvent({ action: "NAVIGATE", detail: "Opened BLS Checklist" });
              onNavigate("blsChecklist");
            },
          },
          {
            icon: "database-eye-outline",
            label: "BLS Results (view)",
            onPress: async () => {
              await logEvent({ action: "NAVIGATE", detail: "Opened BLS Results" });
              onNavigate("blsResults");
            },
          },
          // NEW: BLS Test on the Welcome Admin page
          {
            icon: "heart-pulse",
            label: "BLS Test",
            onPress: async () => {
              await logEvent({ action: "NAVIGATE", detail: "Opened BLS Test" });
              onNavigate("blsTest"); // or use "preTestQuestions" to jump straight into the quiz
            },
          },
        ]}
      />
    </LuxuryShell>
  );
}

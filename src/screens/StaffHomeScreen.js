// screens/StaffHomeScreen.js
import React from "react";
import LuxuryShell from "../components/LuxuryShell";
import HomeGrid from "../components/HomeGrid";
import { logEvent } from "../lib/api";

export default function StaffHomeScreen({ onSignOut, profile, onNavigate }) {
  const who = profile?.full_name || profile?.email || "Staff";
  return (
    <LuxuryShell onSignOut={onSignOut} title="Staff Console">
      <HomeGrid
        heading={`Hello, ${who}`}
        chips={["BLS Certified", "Medical Staff"]}
        actions={[
          {
            icon: "clipboard-check-outline",
            label: "BLS Checklist",
            onPress: async () => {
              await logEvent({ action: "NAVIGATE", detail: "Opened BLS Checklist" });
              onNavigate?.("blsChecklist");
            },
          },
          {
            icon: "heart-pulse",
            label: "BLS Test",
            onPress: async () => {
              await logEvent({ action: "NAVIGATE", detail: "Opened BLS Test" });
              onNavigate?.("blsTest");
            },
          },
          {
            icon: "database-eye-outline",
            label: "BLS Results",
            onPress: async () => {
              await logEvent({ action: "NAVIGATE", detail: "Opened BLS Results" });
              onNavigate?.("blsResults");
            },
          },
        ]}
      />
    </LuxuryShell>
  );
}

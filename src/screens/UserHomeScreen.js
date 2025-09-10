// screens/UserHomeScreen.js
import React from "react";
import LuxuryShell from "../components/LuxuryShell";
import HomeGrid from "../components/HomeGrid";
import { logEvent } from "../lib/api";

export default function UserHomeScreen({ onSignOut, profile, onNavigate }) {
  const who = profile?.full_name || profile?.email || "Member";
  return (
    <LuxuryShell onSignOut={onSignOut} title="Member Area">
      <HomeGrid
        heading={`Hello, ${who}`}
        chips={["BLS Training", "Basic Access"]}
        actions={[
          {
            icon: "heart-pulse",
            label: "BLS Test",
            onPress: async () => {
              await logEvent({ action: "NAVIGATE", detail: "Opened BLS Test" });
              onNavigate?.("blsTest");
            },
          },
        ]}
      />
    </LuxuryShell>
  );
}

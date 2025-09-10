// screens/ActivityLogsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import LuxuryShell from "../components/LuxuryShell";
import BackRow from "../components/BackRow";
import { fetchLogs } from "../lib/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ActivityLogsScreen({ onSignOut, onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const rows = await fetchLogs({ limit: 300 });
      setLogs(rows);
    } catch (e) {
      alert(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    try { setRefreshing(true); await load(); }
    finally { setRefreshing(false); }
  };

  return (
    <LuxuryShell onSignOut={onSignOut} title="BLS Administrator">
      <BackRow onBack={onBack} />
      <View style={styles.card}>
        <Text style={styles.title}>Activity Logs</Text>
        {loading ? (
          <Text style={{ color: "#d7ccb7", marginTop: 8 }}>Loading…</Text>
        ) : (
          <FlatList
            data={logs}
            onRefresh={onRefresh}
            refreshing={refreshing}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={styles.logRow}>
                <MaterialCommunityIcons name="history" size={18} color="#e7e3d6" />
                <Text style={styles.logText}>
                  [{new Date(item.ts).toLocaleString()}] {item.actor} — {item.action} — {item.detail || ""}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </LuxuryShell>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", backgroundColor: "rgba(18,18,22,0.65)", padding: 16 },
  title: { color: "#f5ead1", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  logRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(230,210,150,0.18)", borderRadius: 12, padding: 10 },
  logText: { color: "#e9ddc4", marginLeft: 8, flexShrink: 1 },
});

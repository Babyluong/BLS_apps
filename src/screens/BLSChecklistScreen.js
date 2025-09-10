// screens/BLSChecklistScreen.js
import React from "react";
import { Text, View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import LuxuryShell from "../components/LuxuryShell";

export default function BLSChecklistScreen({ onBack, onSignOut, onNavigate }) {
  const menuItems = [
    { id: 'one-man-cpr', title: 'One Man CPR' },
    { id: 'two-man-cpr', title: 'Two Man CPR' },
    { id: 'infant-cpr', title: 'Infant CPR' },
    { id: 'adult-choking', title: 'Adult Choking' },
    { id: 'infant-choking', title: 'Infant Choking' }
  ];

  const handleMenuPress = (itemId) => {
    const procedureNames = {
      'one-man-cpr': 'One Man CPR',
      'two-man-cpr': 'Two Man CPR', 
      'infant-cpr': 'Infant CPR',
      'adult-choking': 'Adult Choking',
      'infant-choking': 'Infant Choking'
    };
    
    const procedureName = procedureNames[itemId] || 'Unknown Procedure';
    
    // Navigate to specific checklist screens
    if (itemId === 'one-man-cpr') {
      onNavigate('oneManCPR');
    } else if (itemId === 'two-man-cpr') {
      onNavigate('twoManCPR');
    } else if (itemId === 'infant-cpr') {
      onNavigate('infantCPR');
    } else if (itemId === 'adult-choking') {
      onNavigate('adultChoking');
    } else if (itemId === 'infant-choking') {
      onNavigate('infantChoking');
    } else {
      // For other procedures, show alert for now
      alert(`${procedureName} checklist will be implemented soon!`);
    }
  };

  return (
    <LuxuryShell title="BLS Checklist (view)" onSignOut={onSignOut} onBack={onBack}>
      <View style={styles.container}>
        <Text style={styles.title}>Select a Procedure:</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.id)}
          >
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LuxuryShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: "#e9ddc4",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  menuItem: {
    backgroundColor: "rgba(233, 221, 196, 0.1)",
    borderColor: "#e9ddc4",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  menuItemText: {
    color: "#e9ddc4",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});

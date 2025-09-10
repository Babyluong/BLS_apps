// components/BackRow.js
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Back behaviour (in order of priority):
 * 1) goToAdminMenu()  // explicit prop from parent – always lands on Admin Menu
 * 2) navigation.goBack() if available
 * 3) onBack() legacy callback if provided
 * (No navigation to WelcomeAdmin anywhere here.)
 */
export default function BackRow({ goToAdminMenu, navigation, onBack }) {
  const handleBack = () => {
    if (typeof goToAdminMenu === "function") {
      goToAdminMenu();
      return;
    }
    if (navigation?.canGoBack?.() && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (typeof onBack === "function") {
      onBack();
    }
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={handleBack} style={styles.btn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#e9ddc4" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  btn: { flexDirection: "row", alignItems: "center" },
});

// components/BackIcon.js
import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BackIcon({ onPress, size = 28, color = undefined }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
      accessibilityRole="button"
      accessibilityLabel="Back"
    >
      <MaterialCommunityIcons name="arrow-left" size={size} color={color} />
    </TouchableOpacity>
  );
}

// components/ModalFixed.js
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { Modal } from "react-native";

export default function ModalFixed({
  visible,
  children,
  onRequestClose,
  animationType = "fade",
  transparent = true,
}) {
  if (Platform.OS !== "web") {
    return (
      <Modal
        visible={visible}
        transparent={transparent}
        animationType={animationType}
        onRequestClose={onRequestClose}
        statusBarTranslucent
        hardwareAccelerated
      >
        {children}
      </Modal>
    );
  }
  // Web fallback: inline overlay with same visuals as your modal usage
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
      {children}
    </View>
  );
}

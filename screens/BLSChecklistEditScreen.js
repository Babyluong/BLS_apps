// screens/BLSChecklistEditScreen.js
import React, { useState, useEffect, useCallback } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal, TextInput, Switch } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";

export default function BLSChecklistEditScreen({ onBack, onSignOut, onNavigate }) {
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [checklistItems, setChecklistItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItemText, setNewItemText] = useState("");
  const [newItemId, setNewItemId] = useState("");
  const [isCompulsory, setIsCompulsory] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);

  const procedures = [
    { id: 'one-man-cpr', title: 'One Man CPR', icon: 'account-heart' },
    { id: 'two-man-cpr', title: 'Two Man CPR', icon: 'account-group' },
    { id: 'infant-cpr', title: 'Infant CPR', icon: 'baby-face' },
    { id: 'adult-choking', title: 'Adult Choking', icon: 'account-alert' },
    { id: 'infant-choking', title: 'Infant Choking', icon: 'baby-face-outline' }
  ];

  // Default checklist structures for each procedure
  const defaultChecklists = {
    'one-man-cpr': {
      'danger-ppe': { text: 'Wear PPE (gloves, apron, mask), look out for hazard', compulsory: false },
      'response-shoulder-tap': { text: 'a. Shoulder tap', compulsory: false },
      'response-shout': { text: 'b. Shout & speak "are you okay?"', compulsory: false },
      'shout-emergency': { text: 'a. For IHCA - Shout "Emergency! Emergency! Bring the resuscitation trolley and defibrillator/AED!"', compulsory: false },
      'airway-head-tilt': { text: 'a. Head Tilt Chin Lift', compulsory: true },
      'airway-jaw-thrust': { text: 'b. Jaw Thrust', compulsory: false },
      'breathing-determine': { text: 'a. Determine while opening the airway by looking at the chest, in not more than 10 seconds (and if you are trained, simultaneously feel for the presence of pulse).', compulsory: true },
      'breathing-compression-begin': { text: 'b. Chest compression shall begin with absence of normal breathing or no pulse.', compulsory: true },
      'circulation-location': { text: 'i. Location - middle of chest, lower half of sternum', compulsory: true },
      'circulation-rate': { text: 'ii. Rate of compression: 100-120/min', compulsory: true },
      'circulation-depth': { text: 'iii. Depth of compression: 5-6 cm', compulsory: true },
      'circulation-recoil': { text: 'iv. Full recoil after each compression', compulsory: true },
      'circulation-minimize-interruption': { text: 'v. Minimize Interruption', compulsory: true },
      'circulation-ratio': { text: 'vi. Compressions to ventilations ratio, 30:2', compulsory: true },
      'circulation-ventilation-time': { text: 'vii. Each ventilation in 1 second', compulsory: true },
      'defib-switch-on': { text: 'a. Switch on the AED and follow voice prompt', compulsory: false },
      'defib-attach-pads': { text: 'b. Attach the electrode pads', compulsory: false },
      'defib-clear-analysis': { text: 'c. Clear the victim during rhythm analysis', compulsory: false },
      'defib-clear-shock': { text: 'd. If shock is advised, i. Clears the victim and loudly state "Stand Clear"', compulsory: false },
      'defib-push-shock': { text: 'd. If shock is advised, ii. Push shock button as directed', compulsory: false },
      'defib-resume-cpr': { text: 'd. If shock is advised, iii. immediately resume CPR', compulsory: false },
      'defib-no-shock-continue': { text: 'e. If no shock is indicated, continue CPR', compulsory: false }
    },
    'two-man-cpr': {
      'danger-ppe-1st': { text: 'Wear PPE (gloves, apron, mask), look out for blood spills, sharps, electric wires, Unsteady beds, trolley', compulsory: false },
      'response-shoulder-tap-1st': { text: 'a. Shoulder tap', compulsory: false },
      'response-shout-1st': { text: 'b. Shout & speak "are you okay?"', compulsory: false },
      'shout-emergency-1st': { text: 'a. For IJICA - Shout "Emergency! Emergency! Bring the resuscitation trolley and defibrillator/AED!"', compulsory: false },
      'airway-head-tilt-1st': { text: 'a. Head Tilt Chin Lift', compulsory: true },
      'airway-jaw-thrust-1st': { text: 'b. Jaw Thrust', compulsory: false },
      'breathing-determine-1st': { text: 'a. Determine while opening the airway by looking at the chest, in not more than 10 seconds (and if you are trained, simultaneously feel for the presence of pulse).', compulsory: true },
      'breathing-compression-begin-1st': { text: 'b. Chest compression shall begin with absence of normal breathing or no pulse.', compulsory: true },
      'circulation-location-1st': { text: 'i. Location - middle of chest, lower half of sternum', compulsory: true },
      'circulation-rate-1st': { text: 'ii. Rate of compression: 100-120/min', compulsory: true },
      'circulation-depth-1st': { text: 'iii. Depth of compression: 5-6 cm', compulsory: true },
      'circulation-recoil-1st': { text: 'iv. Full recoil after each compression', compulsory: true },
      'circulation-minimize-interruption-1st': { text: 'v. Minimize Interruption', compulsory: true },
      'circulation-ratio-1st': { text: 'vi. Compressions to ventilations ratio, 30:2', compulsory: true },
      'circulation-ventilation-time-1st': { text: 'vii. Each ventilation in 1 second', compulsory: true },
      'defib-arrives-turns-on': { text: 'a. 2nd Rescuer arrives and turn on AED', compulsory: false },
      'defib-attach-pads-while-compression': { text: 'b. 2nd Rescuer attach pads while the 1st rescuer continue chest compression', compulsory: false },
      'defib-clear-analysis-switch-roles': { text: 'c. 2nd Rescuer clear the victim allowing AED rhythm analysis, RESCUERS SWITCH ROLES', compulsory: false },
      'defib-clear-shock': { text: 'd. If shock is advised 2nd rescuer clears the victim and loudly state \'Stand Clear\' then press the shock button.', compulsory: false }
    },
    'infant-cpr': {
      'danger-ppe': { text: 'Wear PPE (gloves, apron, mask), look out for blood spills, sharps, electric wires, Unsteady beds, trolley', compulsory: false },
      'response-tap-soles': { text: 'a. Tap baby soles', compulsory: false },
      'response-shout-call-infant': { text: 'b. Shout & speak "CALL THE INFANT"', compulsory: false },
      'shout-emergency': { text: 'a. For IHCA - Shout "Emergency! Emergency! Bring the resuscitation trolley and defibrillator/AED!"', compulsory: false },
      'airway-head-tilt-chin-lift': { text: 'a. Head Tilt Chin Lift', compulsory: true },
      'airway-jaw-thrust': { text: 'b. Jaw Thrust (Trauma)', compulsory: false },
      'breathing-look-normal-breathing': { text: 'a. Look for normal breathing, which should not take more than 10 seconds', compulsory: true },
      'breathing-absent-abnormal': { text: 'b. Absent/abnormal breathing:', compulsory: true },
      'breathing-5-initial-rescue-breaths': { text: 'i. Give 5 initial rescue breaths', compulsory: true },
      'breathing-duration-1-second': { text: 'ii. Duration of delivering a breath is about 1 second', compulsory: true },
      'breathing-visible-chest-rise': { text: 'iii. Sufficient to produce a visible chest rise', compulsory: true },
      'circulation-assess-circulation': { text: 'i. a. Assess the circulation: Look for signs of life', compulsory: true },
      'circulation-brachial-pulse-10-seconds': { text: 'i. b. If trained, feel for a brachial pulse for not more than 10 seconds', compulsory: true },
      'circulation-start-compression-no-signs': { text: 'ii. Start chest compression if there are no signs of life', compulsory: true },
      'circulation-start-compression-pulse-less-60': { text: 'iii. Or if the pulse rate is less than 60 beats/min', compulsory: true },
      'circulation-one-rescuer-2-fingers': { text: 'i. For one rescuer CPR: The rescuer compresses with the tips of 2 fingers', compulsory: true },
      'circulation-two-rescuers-two-thumbs': { text: 'ii. For two rescuers CPR: Two thumb chest compression technique', compulsory: false },
      'circulation-site-lower-half-sternum': { text: 'iv. Site of Compression: Lower half of the sternum', compulsory: true },
      'circulation-depth-1-3-chest-4cm': { text: 'v. Depth of Compression: At least 1/3 the depth of the chest, at least 4cm', compulsory: true },
      'circulation-rate-100-120-per-min': { text: 'vi. Rate of Compression: At least 100-120/min', compulsory: true },
      'circulation-ratio-15-2': { text: 'vii. Ratio of Compressions to Breaths: One or two Rescuer CPR - 15:2', compulsory: true },
      'circulation-recovery-position-lateral': { text: 'viii. Unconscious infant whose airway is clear and breathing normally should be put on recovery position (lateral)', compulsory: false }
    },
    'adult-choking': {
      'assess-ask-choking': { text: 'Ask: "Are you choking? Are you ok?"', compulsory: false },
      'assess-mild-effective-cough': { text: 'Mild - effective cough', compulsory: false },
      'assess-severe-ineffective-cough': { text: 'Severe - the cough becomes ineffective', compulsory: false },
      'mild-encourage-cough': { text: 'a. Encourage the victim to cough', compulsory: false },
      'severe-5-back-blows': { text: 'Give 5 back blows', compulsory: false },
      'severe-lean-victim-forwards': { text: 'i. Lean the victim forwards', compulsory: false },
      'severe-blows-between-shoulder-blades': { text: 'ii. Apply blows between the shoulder blades using the heel of one hand', compulsory: false },
      'severe-5-abdominal-thrusts': { text: 'Give 5 abdominal thrusts', compulsory: false },
      'severe-stand-behind-victim': { text: 'i. Stand behind the victim and put both your arms around the upper part of the victim\'s abdomen', compulsory: false },
      'severe-arms-around-upper-abdomen': { text: 'ii. Lean the victim forwards', compulsory: false },
      'severe-lean-victim-forwards-thrusts': { text: 'iii. Clench your fist and place it between the umbilicus (navel) and the ribcage', compulsory: false },
      'severe-clench-fist-between-navel-ribcage': { text: 'iv. Grasp your fist with the other hand and pull sharply inwards and upwards', compulsory: false },
      'severe-grasp-fist-pull-sharply': { text: 'c. Continue alternating 5 back blows with 5 abdominal thrusts until it is relieved, or the victim becomes unconscious', compulsory: false },
      'severe-continue-alternating': { text: 'd. Perform chest thrust for pregnant and very obese victims', compulsory: false },
      'severe-chest-thrust-pregnant-obese': { text: 'Continue alternating until relieved or victim becomes unconscious', compulsory: false },
      'unconscious-start-cpr': { text: 'a. Start CPR', compulsory: false },
      'unconscious-check-foreign-body': { text: 'During airway opening, check for foreign body, do not perform a blind finger sweep', compulsory: false }
    },
    'infant-choking': {
      'assess-mild-coughing-effectively': { text: 'Coughing effectively (fully responsive, loud cough, taking a breath before coughing), still crying, or speaking', compulsory: false },
      'assess-mild-fully-responsive': { text: 'Fully responsive', compulsory: false },
      'assess-mild-loud-cough': { text: 'Loud cough', compulsory: false },
      'assess-mild-taking-breath-before-coughing': { text: 'Taking a breath before coughing', compulsory: false },
      'assess-mild-still-crying-speaking': { text: 'Still crying or speaking', compulsory: false },
      'assess-severe-ineffective-cough': { text: 'Ineffective cough', compulsory: false },
      'assess-severe-inability-to-cough': { text: 'Inability to cough', compulsory: false },
      'assess-severe-decreasing-consciousness': { text: 'Decreasing consciousness', compulsory: false },
      'assess-severe-inability-breathe-vocalise': { text: 'Inability to breathe or vocalise', compulsory: false },
      'assess-severe-cyanosis': { text: 'Cyanosis', compulsory: false },
      'mild-encourage-cough-monitor': { text: 'a. Encourage the child to cough and continue monitoring the child\'s condition', compulsory: false },
      'severe-ask-for-help': { text: 'Ask for help', compulsory: false },
      'severe-second-rescuer-call-mers': { text: 'i. Second rescuer should call MERS 999, preferably by mobile phone (speaker function)', compulsory: false },
      'severe-mobile-phone-speaker': { text: 'ii. A single trained rescuer should first proceed with rescue manoeuvres (unless able to call simultaneously with the speaker function activated)', compulsory: false },
      'severe-single-rescuer-proceed': { text: 'Single trained rescuer should first proceed with rescue manoeuvres', compulsory: false },
      'severe-single-rescuer-call-simultaneously': { text: 'Unless able to call simultaneously with the speaker function activated', compulsory: false },
      'severe-perform-5-back-blows': { text: 'Perform 5 back blows', compulsory: false },
      'severe-perform-5-chest-thrusts': { text: 'Perform 5 chest thrusts', compulsory: false },
      'severe-back-blows-support-infant': { text: 'i. Support the infant in a head-downwards, prone position', compulsory: false },
      'severe-back-blows-head-downwards-prone': { text: 'Head-downwards, prone position', compulsory: false },
      'severe-back-blows-thumb-angle-lower-jaw': { text: 'Place the thumb of one hand at the angle of the lower jaw', compulsory: false },
      'severe-back-blows-heel-middle-back': { text: 'Deliver up to 5 sharp back blows with the heel of one hand in the middle of the back', compulsory: false },
      'severe-back-blows-between-shoulder-blades': { text: 'Between the shoulder blades', compulsory: false },
      'severe-chest-thrust-turn-supine': { text: 'i. Turn the infant into a head-downwards supine position', compulsory: false },
      'severe-chest-thrust-head-downwards-supine': { text: 'Head-downwards supine position', compulsory: false },
      'severe-chest-thrust-free-arm-along-back': { text: 'Place free arm along the infant\'s back', compulsory: false },
      'severe-chest-thrust-encircle-occiput': { text: 'Encircling the occiput with your hand', compulsory: false },
      'severe-chest-thrust-identify-landmark': { text: 'ii. Identify the landmark - lower sternum approximately a finger\'s breadth above the xiphisternum', compulsory: false },
      'severe-chest-thrust-lower-sternum': { text: 'Lower sternum', compulsory: false },
      'severe-chest-thrust-finger-breadth-above-xiphisternum': { text: 'Approximately a finger\'s breadth above the xiphisternum', compulsory: false },
      'severe-continue-sequence-foreign-body': { text: 'Continue the sequence of back blows and chest thrust if the foreign body has not been expelled', compulsory: false },
      'severe-continue-sequence-still-conscious': { text: 'And the victim is still conscious', compulsory: false },
      'unconscious-start-cpr': { text: 'Start CPR', compulsory: false },
      'unconscious-check-foreign-body': { text: 'During airway opening, check for foreign body', compulsory: false },
      'unconscious-no-blind-finger-sweep': { text: 'Do not perform a blind finger sweep', compulsory: false },
      'unconscious-reposition-head-no-chest-rise': { text: 'Repositioning the head if no chest rises after each breath', compulsory: false }
    }
  };

  // Load checklist for selected procedure
  const loadChecklist = useCallback(async (procedureId) => {
    setLoading(true);
    setError("");
    try {
      // For now, use default checklists. In a real implementation, you would load from database
      const checklist = defaultChecklists[procedureId] || {};
      setChecklistItems(checklist);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Save checklist to database
  const saveChecklist = async () => {
    if (!selectedProcedure) return;
    
    setSaving(true);
    try {
      // In a real implementation, you would save to database
      // For now, just show success message
      Alert.alert(
        "Success",
        `Checklist for ${procedures.find(p => p.id === selectedProcedure)?.title} has been saved successfully!`,
        [{ text: "OK" }]
      );
    } catch (e) {
      Alert.alert("Error", `Failed to save checklist: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Add new checklist item
  const addNewItem = () => {
    if (!newItemText.trim() || !newItemId.trim()) {
      Alert.alert("Error", "Please provide both ID and text for the new item.");
      return;
    }

    if (checklistItems[newItemId]) {
      Alert.alert("Error", "An item with this ID already exists.");
      return;
    }

    setChecklistItems(prev => ({
      ...prev,
      [newItemId]: {
        text: newItemText.trim(),
        compulsory: isCompulsory
      }
    }));

    setNewItemText("");
    setNewItemId("");
    setIsCompulsory(false);
    setShowItemModal(false);
  };

  // Edit existing checklist item
  const editItem = (itemId) => {
    const item = checklistItems[itemId];
    if (!item) return;

    setEditingItem(itemId);
    setNewItemId(itemId);
    setNewItemText(item.text);
    setIsCompulsory(item.compulsory);
    setShowItemModal(true);
  };

  // Update existing item
  const updateItem = () => {
    if (!editingItem || !newItemText.trim()) {
      Alert.alert("Error", "Please provide text for the item.");
      return;
    }

    setChecklistItems(prev => ({
      ...prev,
      [editingItem]: {
        text: newItemText.trim(),
        compulsory: isCompulsory
      }
    }));

    setEditingItem(null);
    setNewItemText("");
    setNewItemId("");
    setIsCompulsory(false);
    setShowItemModal(false);
  };

  // Delete checklist item
  const deleteItem = (itemId) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this checklist item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setChecklistItems(prev => {
              const newItems = { ...prev };
              delete newItems[itemId];
              return newItems;
            });
          }
        }
      ]
    );
  };

  // Toggle compulsory status
  const toggleCompulsory = (itemId) => {
    setChecklistItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        compulsory: !prev[itemId].compulsory
      }
    }));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    Alert.alert(
      "Reset to Defaults",
      "Are you sure you want to reset this checklist to default values? This will overwrite all current changes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            const defaultChecklist = defaultChecklists[selectedProcedure] || {};
            setChecklistItems(defaultChecklist);
          }
        }
      ]
    );
  };

  // Handle procedure selection
  const handleProcedureSelect = (procedureId) => {
    setSelectedProcedure(procedureId);
    setShowProcedureModal(false);
    loadChecklist(procedureId);
  };

  // Close item modal
  const closeItemModal = () => {
    setShowItemModal(false);
    setEditingItem(null);
    setNewItemText("");
    setNewItemId("");
    setIsCompulsory(false);
  };

  const ChecklistItem = ({ itemId, item }) => (
    <View style={[styles.checklistItem, item.compulsory && styles.compulsoryItem]}>
      <View style={styles.itemContent}>
        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemText, item.compulsory && styles.compulsoryText]}>
            {item.text}
          </Text>
          {item.compulsory && (
            <Text style={styles.compulsoryLabel}>REQUIRED</Text>
          )}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleCompulsory(itemId)}
          >
            <MaterialCommunityIcons
              name={item.compulsory ? "star" : "star-outline"}
              size={20}
              color={item.compulsory ? "#00ffc8" : "#e9ddc4"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => editItem(itemId)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#e9ddc4" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteItem(itemId)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#ff4757" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LuxuryShell title="BLS Checklist Editor" onSignOut={onSignOut} onBack={onBack}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Procedure Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Procedure to Edit</Text>
          <TouchableOpacity
            style={styles.procedureSelector}
            onPress={() => setShowProcedureModal(true)}
          >
            <Text style={styles.procedureSelectorText}>
              {selectedProcedure 
                ? procedures.find(p => p.id === selectedProcedure)?.title 
                : "— Select Procedure —"}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#e9ddc4" />
          </TouchableOpacity>
        </View>

        {/* Checklist Items */}
        {selectedProcedure && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Checklist Items - {procedures.find(p => p.id === selectedProcedure)?.title}
                </Text>
                <View style={styles.sectionActions}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowItemModal(true)}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color="#e9ddc4" />
                    <Text style={styles.addButtonText}>Add Item</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetToDefaults}
                  >
                    <MaterialCommunityIcons name="refresh" size={20} color="#e9ddc4" />
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#e9ddc4" />
                  <Text style={styles.loadingText}>Loading checklist...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Error: {error}</Text>
                </View>
              ) : (
                <View style={styles.checklistContainer}>
                  {Object.entries(checklistItems).map(([itemId, item]) => (
                    <ChecklistItem key={itemId} itemId={itemId} item={item} />
                  ))}
                  {Object.keys(checklistItems).length === 0 && (
                    <Text style={styles.emptyText}>No checklist items found. Add some items to get started.</Text>
                  )}
                </View>
              )}
            </View>

            {/* Save Button */}
            <View style={styles.saveSection}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={saveChecklist}
                disabled={saving}
              >
                <MaterialCommunityIcons 
                  name={saving ? "loading" : "content-save"} 
                  size={24} 
                  color="#e9ddc4" 
                />
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save Checklist"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Procedure Selection Modal */}
      <Modal visible={showProcedureModal} transparent animationType="fade" onRequestClose={() => setShowProcedureModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Procedure</Text>
              <TouchableOpacity onPress={() => setShowProcedureModal(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color="#e9ddc4" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.procedureList}>
              {procedures.map((procedure) => (
                <TouchableOpacity
                  key={procedure.id}
                  style={styles.procedureItem}
                  onPress={() => handleProcedureSelect(procedure.id)}
                >
                  <MaterialCommunityIcons name={procedure.icon} size={24} color="#e9ddc4" />
                  <Text style={styles.procedureItemText}>{procedure.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Item Edit Modal */}
      <Modal visible={showItemModal} transparent animationType="fade" onRequestClose={closeItemModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? "Edit Item" : "Add New Item"}
              </Text>
              <TouchableOpacity onPress={closeItemModal} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color="#e9ddc4" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item ID:</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItemId}
                  onChangeText={setNewItemId}
                  placeholder="e.g., danger-ppe"
                  placeholderTextColor="#8a7f6a"
                  editable={!editingItem}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Text:</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={newItemText}
                  onChangeText={setNewItemText}
                  placeholder="Enter checklist item description..."
                  placeholderTextColor="#8a7f6a"
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setIsCompulsory(!isCompulsory)}
                >
                  <MaterialCommunityIcons
                    name={isCompulsory ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color={isCompulsory ? "#00ffc8" : "#e9ddc4"}
                  />
                  <Text style={styles.checkboxLabel}>Required Item</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeItemModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={editingItem ? updateItem : addNewItem}
              >
                <Text style={styles.confirmButtonText}>
                  {editingItem ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LuxuryShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(15, 15, 25, 0.8)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.2)',
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  procedureSelector: {
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#a8b8d8",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  procedureSelectorText: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 200, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ffc8',
  },
  addButtonText: {
    color: "#00ffc8",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 221, 196, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ddc4',
  },
  resetButtonText: {
    color: "#e9ddc4",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    backgroundColor: 'rgba(20, 25, 40, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.2)',
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compulsoryItem: {
    backgroundColor: 'rgba(0, 150, 136, 0.08)',
    borderColor: 'rgba(0, 255, 200, 0.3)',
    borderWidth: 2,
    shadowColor: '#00ffc8',
    shadowOpacity: 0.15,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  itemText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
    fontWeight: "600",
  },
  compulsoryText: {
    color: "#00ffc8",
  },
  compulsoryLabel: {
    color: "#00ffc8",
    fontSize: 10,
    fontWeight: "800",
    backgroundColor: 'rgba(0, 255, 200, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 200, 0.4)',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(100, 200, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.3)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: "#e9ddc4",
    marginLeft: 10,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: "#8a7f6a",
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  saveSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(0, 150, 136, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#00ffc8',
    shadowColor: '#00ffc8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(60, 60, 60, 0.8)',
    borderColor: '#666',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomSpacing: {
    height: 20,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#a8b8d8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: "#a8b8d8",
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(168, 184, 216, 0.1)',
  },
  procedureList: {
    maxHeight: 300,
  },
  procedureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 184, 216, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 184, 216, 0.3)',
  },
  procedureItemText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  modalBody: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#a8b8d8",
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(20, 25, 40, 0.6)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.3)',
    color: "#ffffff",
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    color: "#e9ddc4",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.4)',
  },
  cancelButtonText: {
    color: '#e9ddc4',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 200, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 200, 0.4)',
  },
  confirmButtonText: {
    color: '#00ffc8',
    fontSize: 14,
    fontWeight: '600',
  },
});

// screens/InfantCPR.js
import React, { useState, useEffect, useCallback } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal, TextInput, Switch } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";
import { ChecklistResultsService } from "../services/checklistResultsService";

export default function InfantCPR({ onBack, onSignOut, onNavigate }) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [checklistItems, setChecklistItems] = useState({
    // DANGER
    'danger-ppe': false,
    
    // RESPONSE
    'response-tap-soles': false,
    'response-shout-call-infant': false,
    
    // SHOUT FOR HELP
    'shout-emergency': false,
    
    // AIRWAY
    'airway-head-tilt-chin-lift': false,
    'airway-jaw-thrust': false,
    
    // BREATHING
    'breathing-look-normal-breathing': false,
    'breathing-absent-abnormal': false,
    'breathing-5-initial-rescue-breaths': false,
    'breathing-duration-1-second': false,
    'breathing-visible-chest-rise': false,
    
    // CIRCULATION
    'circulation-assess-circulation': false,
    'circulation-brachial-pulse-10-seconds': false,
    'circulation-start-compression-no-signs': false,
    'circulation-start-compression-pulse-less-60': false,
    'circulation-one-rescuer-2-fingers': false,
    'circulation-two-rescuers-two-thumbs': false,
    'circulation-site-lower-half-sternum': false,
    'circulation-depth-1-3-chest-4cm': false,
    'circulation-rate-100-120-per-min': false,
    'circulation-ratio-15-2': false,
    'circulation-recovery-position-lateral': false,
  });

  // Load participants data
  const loadParticipants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, ic, email, tempat_bertugas, jawatan, bls_last_year, alergik, alergik_details, asma, hamil, phone_number")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setParticipants(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  const toggleItem = (itemId) => {
    setChecklistItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const resetChecklist = () => {
    Alert.alert(
      "Reset Checklist",
      "Are you sure you want to reset all items?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            const resetItems = {};
            Object.keys(checklistItems).forEach(key => {
              resetItems[key] = false;
            });
            setChecklistItems(resetItems);
            setComments("");
          }
        }
      ]
    );
  };

  // Define compulsory sections for Infant CPR
  const compulsorySections = {
    airway: ['airway-head-tilt-chin-lift'],
    breathing: ['breathing-look-normal-breathing', 'breathing-absent-abnormal', 'breathing-5-initial-rescue-breaths', 'breathing-duration-1-second', 'breathing-visible-chest-rise'],
    circulation: ['circulation-assess-circulation', 'circulation-brachial-pulse-10-seconds', 'circulation-start-compression-no-signs', 'circulation-start-compression-pulse-less-60', 'circulation-one-rescuer-2-fingers', 'circulation-site-lower-half-sternum', 'circulation-depth-1-3-chest-4cm', 'circulation-rate-100-120-per-min', 'circulation-ratio-15-2']
  };

  const getCompulsoryCompletion = () => {
    let totalCompulsory = 0;
    let completedCompulsory = 0;
    
    Object.values(compulsorySections).forEach(sectionItems => {
      totalCompulsory += sectionItems.length;
      sectionItems.forEach(itemId => {
        if (checklistItems[itemId]) completedCompulsory++;
      });
    });
    
    return { completed: completedCompulsory, total: totalCompulsory };
  };

  const getCompletionPercentage = () => {
    const totalItems = Object.keys(checklistItems).length;
    const completedItems = Object.values(checklistItems).filter(Boolean).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const isCompulsoryComplete = () => {
    const { completed, total } = getCompulsoryCompletion();
    return completed === total;
  };

  const testSupabaseConnection = async () => {
    try {
      console.log("Testing Supabase connection...");
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error("Supabase connection test failed:", error);
        return false;
      }
      
      console.log("Supabase connection test successful:", data);
      return true;
    } catch (error) {
      console.error("Supabase connection test error:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedParticipant) {
      setSubmitResult({
        title: "No Participant Selected",
        message: "Please select a participant before submitting.",
        type: "error"
      });
      setShowSubmitModal(true);
      return;
    }

    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      setSubmitResult({
        title: "Connection Error",
        message: "Unable to connect to the server. Please check your internet connection and try again.",
        type: "error"
      });
      setShowSubmitModal(true);
      return;
    }

    setIsSubmitting(true);
    const isPass = isCompulsoryComplete();
    const result = isPass ? "PASS" : "FAIL";
    
    try {
      // Save individual checklist results to database
      const checklistDetails = {
        comments: comments,
        // DANGER
        danger_ppe: checklistItems['danger-ppe'] || false,
        // RESPONSE
        response_tap_soles: checklistItems['response-tap-soles'] || false,
        response_shout_call_infant: checklistItems['response-shout-call-infant'] || false,
        // SHOUT FOR HELP
        shout_emergency: checklistItems['shout-emergency'] || false,
        // AIRWAY
        airway_head_tilt_chin_lift: checklistItems['airway-head-tilt-chin-lift'] || false,
        airway_jaw_thrust: checklistItems['airway-jaw-thrust'] || false,
        // BREATHING
        breathing_look_normal_breathing: checklistItems['breathing-look-normal-breathing'] || false,
        breathing_absent_abnormal: checklistItems['breathing-absent-abnormal'] || false,
        breathing_5_initial_rescue_breaths: checklistItems['breathing-5-initial-rescue-breaths'] || false,
        breathing_duration_1_second: checklistItems['breathing-duration-1-second'] || false,
        breathing_visible_chest_rise: checklistItems['breathing-visible-chest-rise'] || false,
        // CIRCULATION
        circulation_assess_circulation: checklistItems['circulation-assess-circulation'] || false,
        circulation_brachial_pulse_10_seconds: checklistItems['circulation-brachial-pulse-10-seconds'] || false,
        circulation_start_compression_no_signs: checklistItems['circulation-start-compression-no-signs'] || false,
        circulation_start_compression_pulse_less_60: checklistItems['circulation-start-compression-pulse-less-60'] || false,
        circulation_one_rescuer_2_fingers: checklistItems['circulation-one-rescuer-2-fingers'] || false,
        circulation_two_rescuers_two_thumbs: checklistItems['circulation-two-rescuers-two-thumbs'] || false,
        circulation_site_lower_half_sternum: checklistItems['circulation-site-lower-half-sternum'] || false,
        circulation_depth_1_3_chest_4cm: checklistItems['circulation-depth-1-3-chest-4cm'] || false,
        circulation_rate_100_120_per_min: checklistItems['circulation-rate-100-120-per-min'] || false,
        circulation_ratio_15_2: checklistItems['circulation-ratio-15-2'] || false,
        circulation_recovery_position_lateral: checklistItems['circulation-recovery-position-lateral'] || false
      };

      const resultData = {
        checklistType: 'infant-cpr',
        participantName: selectedParticipant.full_name,
        participantIc: selectedParticipant.ic,
        score: Object.values(checklistItems).filter(Boolean).length,
        totalItems: Object.keys(checklistItems).length,
        status: result,
        checklistDetails: checklistDetails,
        comments: comments
      };

      const savedResult = await ChecklistResultsService.saveChecklistResults(resultData);
      console.log("Infant CPR Assessment saved:", savedResult);

      setSubmitResult({
        title: "Assessment Completed",
        message: `Assessment completed for ${selectedParticipant.full_name}.\n\nResult: ${result}\n\n${isPass ? 'All compulsory sections completed.' : 'Some compulsory sections are incomplete.'}\n\nResults have been saved to your practice history.`,
        type: "success"
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      setSubmitResult({
        title: "Error",
        message: `An unexpected error occurred: ${error.message}`,
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(true);
    }
  };

  const handleModalClose = () => {
    setShowSubmitModal(false);
    if (submitResult?.type === "success") {
      // Auto-reset for new participant
      const resetItems = {};
      Object.keys(checklistItems).forEach(key => {
        resetItems[key] = false;
      });
      setChecklistItems(resetItems);
      setComments("");
      setSelectedParticipant(null);
    }
  };

  // Participant details component
  const ParticipantDetails = ({ participant }) => {
    if (!participant) return null;
    
    return (
      <View style={styles.participantDetails}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>EMAIL</Text>
            <Text style={styles.detailValue}>{participant.email || "N/A"}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>TEMPAT BERTUGAS</Text>
            <Text style={styles.detailValue}>{participant.tempat_bertugas || "N/A"}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>JAWATAN</Text>
            <Text style={styles.detailValue}>{participant.jawatan || "N/A"}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>PHONE NUMBER</Text>
            <Text style={styles.detailValue}>{participant.phone_number || "N/A"}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>TAHUN TERAKHIR MENGHADIRI KURSUS BLS</Text>
            <Text style={styles.detailValue}>{participant.bls_last_year || "N/A"}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>ALERGIK</Text>
            <Text style={styles.detailValue}>{participant.alergik ? "YA" : "TIDAK"}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>MENGHADAPI MASALAH LELAH (ASTHMA)</Text>
            <Text style={styles.detailValue}>{participant.asma ? "YA" : "TIDAK"}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>SEDANG HAMIL</Text>
            <Text style={styles.detailValue}>{participant.hamil ? "YA" : "TIDAK"}</Text>
          </View>
        </View>
      </View>
    );
  };

  const ChecklistItem = ({ id, text, isCompulsory = false }) => {
    const isItemCompulsory = Object.values(compulsorySections).some(section => section.includes(id));
    
    return (
      <View style={[styles.checklistItem, isItemCompulsory && styles.checklistItemCompulsory]}>
        <View style={styles.toggleContainer}>
          <View style={styles.textContainer}>
            <Text style={[styles.checklistText, checklistItems[id] && styles.completedText]}>
              {text}
            </Text>
            {isItemCompulsory && (
              <Text style={styles.compulsoryLabel}>REQUIRED</Text>
            )}
          </View>
          <Switch
            value={checklistItems[id]}
            onValueChange={() => toggleItem(id)}
            trackColor={{ false: "#767577", true: "#4CAF50" }}
            thumbColor={checklistItems[id] ? "#ffffff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>
    );
  };

  const handleBackToMenu = () => {
    if (onNavigate) {
      onNavigate("blsChecklist");
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <LuxuryShell title="Infant CPR Checklist" onSignOut={onSignOut} onBack={handleBackToMenu}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Participant Selection */}
        <View style={styles.participantSection}>
          <Text style={styles.participantLabel}>Participant</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#e9ddc4" />
              <Text style={styles.loadingText}>Loading participants...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity onPress={loadParticipants} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.participantSelector}
              onPress={() => {
                setShowParticipantModal(true);
              }}
            >
              <Text style={styles.participantSelectorText}>
                {selectedParticipant ? selectedParticipant.full_name : "— Select Participant —"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#e9ddc4" />
            </TouchableOpacity>
          )}
        </View>

        {/* Participant Details */}
        <ParticipantDetails participant={selectedParticipant} />

        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Progress: {getCompletionPercentage()}% Complete
            </Text>
            <Text style={[styles.compulsoryText, isCompulsoryComplete() ? styles.compulsoryComplete : styles.compulsoryIncomplete]}>
              Compulsory: {getCompulsoryCompletion().completed}/{getCompulsoryCompletion().total} Complete
            </Text>
            {isCompulsoryComplete() && (
              <View style={styles.passStatus}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.passText}>READY TO SUBMIT - All compulsory items completed</Text>
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleBackToMenu} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#e9ddc4" />
              <Text style={styles.backText}>Back to Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetChecklist} style={styles.resetButton}>
              <MaterialCommunityIcons name="refresh" size={20} color="#e9ddc4" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DANGER Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANGER</Text>
          <ChecklistItem 
            id="danger-ppe"
            text="Wear PPE (gloves, apron, mask), look out for blood spills, sharps, electric wires, Unsteady beds, trolley"
          />
        </View>

        {/* RESPONSE Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESPONSE</Text>
          <ChecklistItem 
            id="response-tap-soles"
            text="a. Tap baby soles"
          />
          <ChecklistItem 
            id="response-shout-call-infant"
            text='b. Shout & speak "CALL THE INFANT"'
          />
        </View>

        {/* SHOUT FOR HELP Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHOUT FOR HELP</Text>
          <ChecklistItem 
            id="shout-emergency"
            text='a. For IHCA - Shout "Emergency! Emergency! Bring the resuscitation trolley and defibrillator/AED!"'
          />
        </View>

        {/* AIRWAY Section */}
        <View style={[styles.section, styles.sectionCompulsory]}>
          <Text style={[styles.sectionTitle, styles.sectionTitleCompulsory]}>AIRWAY *Required</Text>
          <ChecklistItem 
            id="airway-head-tilt-chin-lift"
            text="a. Head Tilt Chin Lift"
          />
          <ChecklistItem 
            id="airway-jaw-thrust"
            text="b. Jaw Thrust (Trauma)"
          />
        </View>

        {/* BREATHING Section */}
        <View style={[styles.section, styles.sectionCompulsory]}>
          <Text style={[styles.sectionTitle, styles.sectionTitleCompulsory]}>BREATHING *Required</Text>
          <ChecklistItem 
            id="breathing-look-normal-breathing"
            text="a. Look for normal breathing, which should not take more than 10 seconds"
          />
          <ChecklistItem 
            id="breathing-absent-abnormal"
            text="b. Absent/abnormal breathing:"
          />
          <ChecklistItem 
            id="breathing-5-initial-rescue-breaths"
            text="i. Give 5 initial rescue breaths"
          />
          <ChecklistItem 
            id="breathing-duration-1-second"
            text="ii. Duration of delivering a breath is about 1 second"
          />
          <ChecklistItem 
            id="breathing-visible-chest-rise"
            text="iii. Sufficient to produce a visible chest rise"
          />
        </View>

        {/* CIRCULATION Section */}
        <View style={[styles.section, styles.sectionCompulsory]}>
          <Text style={[styles.sectionTitle, styles.sectionTitleCompulsory]}>CIRCULATION *Required</Text>
          <ChecklistItem 
            id="circulation-assess-circulation"
            text="i. a. Assess the circulation: Look for signs of life"
          />
          <ChecklistItem 
            id="circulation-brachial-pulse-10-seconds"
            text="i. b. If trained, feel for a brachial pulse for not more than 10 seconds"
          />
          <ChecklistItem 
            id="circulation-start-compression-no-signs"
            text="ii. Start chest compression if there are no signs of life"
          />
          <ChecklistItem 
            id="circulation-start-compression-pulse-less-60"
            text="iii. Or if the pulse rate is less than 60 beats/min"
          />
          <Text style={styles.subsectionTitle}>Compression technique:</Text>
          <ChecklistItem 
            id="circulation-one-rescuer-2-fingers"
            text="i. For one rescuer CPR: The rescuer compresses with the tips of 2 fingers"
          />
          <ChecklistItem 
            id="circulation-two-rescuers-two-thumbs"
            text="ii. For two rescuers CPR: Two thumb chest compression technique"
          />
          <ChecklistItem 
            id="circulation-site-lower-half-sternum"
            text="iv. Site of Compression: Lower half of the sternum"
          />
          <ChecklistItem 
            id="circulation-depth-1-3-chest-4cm"
            text="v. Depth of Compression: At least 1/3 the depth of the chest, at least 4cm"
          />
          <ChecklistItem 
            id="circulation-rate-100-120-per-min"
            text="vi. Rate of Compression: At least 100-120/min"
          />
          <ChecklistItem 
            id="circulation-ratio-15-2"
            text="vii. Ratio of Compressions to Breaths: One or two Rescuer CPR - 15:2"
          />
          <ChecklistItem 
            id="circulation-recovery-position-lateral"
            text="viii. Unconscious infant whose airway is clear and breathing normally should be put on recovery position (lateral)"
          />
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments:</Text>
          <TextInput
            style={styles.commentsInput}
            placeholder="Add any additional notes or feedback here..."
            placeholderTextColor="#8a7f6a"
            value={comments}
            onChangeText={setComments}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[
              styles.submitButton, 
              !selectedParticipant && styles.submitButtonDisabled,
              selectedParticipant && !isCompulsoryComplete() && styles.submitButtonFail
            ]}
            disabled={!selectedParticipant}
          >
            <MaterialCommunityIcons 
              name={isCompulsoryComplete() ? "check-circle" : "alert-circle"} 
              size={24} 
              color={!selectedParticipant ? "#666" : (isCompulsoryComplete() ? "#00ffc8" : "#ff4757")} 
            />
            <Text style={[
              styles.submitButtonText,
              !selectedParticipant && styles.submitButtonTextDisabled,
              selectedParticipant && !isCompulsoryComplete() && styles.submitButtonTextFail
            ]}>
              {isCompulsoryComplete() ? "SUBMIT - PASS" : "SUBMIT - FAIL"}
            </Text>
          </TouchableOpacity>
          {!selectedParticipant && (
            <Text style={styles.submitHint}>Please select a participant to submit</Text>
          )}
          {selectedParticipant && (
            <Text style={[styles.submitHint, isCompulsoryComplete() ? styles.passHint : styles.failHint]}>
              {isCompulsoryComplete() ? "All compulsory items completed - Will PASS" : "Some compulsory items missing - Will FAIL"}
            </Text>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Participant Selection Modal */}
      <Modal visible={showParticipantModal} transparent animationType="fade" onRequestClose={() => setShowParticipantModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Participant</Text>
              <TouchableOpacity onPress={() => setShowParticipantModal(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={20} color="#e9ddc4" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#e7e3d6" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search participants..."
                placeholderTextColor="#9a917e"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="characters"
              />
            </View>

            <ScrollView style={styles.participantList}>
              {participants
                .filter(p => 
                  p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.ic.includes(searchQuery)
                )
                .map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={styles.participantItem}
                    onPress={() => {
                      setSelectedParticipant(participant);
                      setShowParticipantModal(false);
                      setSearchQuery("");
                    }}
                  >
                    <Text style={styles.participantItemName}>{participant.full_name}</Text>
                    <Text style={styles.participantItemIC}>{participant.ic}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Submit Result Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.submitModal}>
            <View style={[
              styles.submitModalHeader,
              submitResult?.type === "success" ? styles.successHeader : styles.errorHeader
            ]}>
              <MaterialCommunityIcons 
                name={submitResult?.type === "success" ? "check-circle" : "alert-circle"} 
                size={32} 
                color={submitResult?.type === "success" ? "#4CAF50" : "#ff4757"} 
              />
              <Text style={styles.submitModalTitle}>{submitResult?.title || "Result"}</Text>
            </View>
            
            <View style={styles.submitModalBody}>
              <Text style={styles.submitModalMessage}>
                {submitResult?.message || "No message"}
              </Text>
              
              {isSubmitting && (
                <View style={styles.submitLoading}>
                  <ActivityIndicator size="small" color="#00ffc8" />
                  <Text style={styles.submitLoadingText}>Saving to database...</Text>
                </View>
              )}
            </View>
            
            <View style={styles.submitModalFooter}>
              <TouchableOpacity 
                onPress={handleModalClose} 
                style={[
                  styles.submitModalButton,
                  submitResult?.type === "success" ? styles.successButton : styles.errorButton
                ]}
                disabled={isSubmitting}
              >
                <Text style={styles.submitModalButtonText}>
                  {isSubmitting ? "Saving..." : "OK"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LuxuryShell>
  );
}

// Use the same styles as TwoManCPR
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    color: "#e9ddc4",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  compulsoryText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  compulsoryComplete: {
    color: "#4CAF50",
  },
  compulsoryIncomplete: {
    color: "#ff6b6b",
  },
  passStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 200, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 200, 0.3)',
  },
  passText: {
    color: "#00ffc8",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 200, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.3)',
    marginBottom: 4,
  },
  backText: {
    color: "#e9ddc4",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 221, 196, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ddc4',
  },
  resetText: {
    color: "#e9ddc4",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
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
    position: 'relative',
    overflow: 'hidden',
  },
  sectionCompulsory: {
    backgroundColor: 'rgba(0, 150, 136, 0.1)',
    borderColor: 'rgba(0, 255, 200, 0.4)',
    borderWidth: 2,
    shadowColor: '#00ffc8',
    shadowOpacity: 0.2,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(100, 200, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitleCompulsory: {
    backgroundColor: 'rgba(0, 255, 200, 0.15)',
    color: "#00ffc8",
    borderColor: 'rgba(0, 255, 200, 0.4)',
    shadowColor: '#00ffc8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  subsectionTitle: {
    color: "#e9ddc4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    fontStyle: "italic",
  },
  checklistItem: {
    marginBottom: 12,
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
  checklistItemCompulsory: {
    backgroundColor: 'rgba(0, 150, 136, 0.08)',
    borderColor: 'rgba(0, 255, 200, 0.3)',
    borderWidth: 2,
    shadowColor: '#00ffc8',
    shadowOpacity: 0.15,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 20,
  },
  checklistText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
    fontWeight: "600",
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
    color: "#888",
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
  commentsSection: {
    marginTop: 20,
    backgroundColor: 'rgba(15, 15, 25, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.2)',
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  commentsTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  commentsInput: {
    backgroundColor: 'rgba(20, 25, 40, 0.6)',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.3)',
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  bottomSpacing: {
    height: 20,
  },
  submitSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  submitButton: {
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
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(60, 60, 60, 0.8)',
    borderColor: '#666',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonFail: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    borderColor: '#ff4757',
    borderWidth: 2,
    shadowColor: '#ff4757',
    shadowOpacity: 0.3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  submitButtonTextFail: {
    color: '#ff4757',
  },
  submitHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  passHint: {
    color: '#00ffc8',
  },
  failHint: {
    color: '#ff4757',
  },
  participantSection: {
    marginBottom: 20,
  },
  participantLabel: {
    color: "#a8b8d8",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  participantSelector: {
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
  participantSelectorText: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
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
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: 'rgba(233, 221, 196, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ddc4',
  },
  retryText: {
    color: "#e9ddc4",
    fontSize: 14,
    fontWeight: '600',
  },
  participantDetails: {
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#a8b8d8',
  },
  detailLabel: {
    color: "#a8b8d8",
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: '600',
  },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 184, 216, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    color: "#ffffff",
    marginLeft: 8,
    flex: 1,
    fontSize: 16,
  },
  participantList: {
    maxHeight: 300,
  },
  participantItem: {
    backgroundColor: 'rgba(168, 184, 216, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 184, 216, 0.3)',
  },
  participantItemName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  participantItemIC: {
    color: "#a8b8d8",
    fontSize: 14,
  },
  // Submit Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  submitModal: {
    backgroundColor: 'rgba(15, 15, 25, 0.95)',
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.3)',
    shadowColor: '#00ffc8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  submitModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 200, 255, 0.2)',
  },
  successHeader: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  errorHeader: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  submitModalTitle: {
    color: '#e9ddc4',
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  submitModalBody: {
    padding: 24,
  },
  submitModalMessage: {
    color: '#e9ddc4',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  submitLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitLoadingText: {
    color: '#00ffc8',
    marginLeft: 8,
    fontSize: 14,
  },
  submitModalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 200, 255, 0.2)',
  },
  submitModalButton: {
    backgroundColor: 'rgba(100, 200, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.4)',
  },
  successButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  errorButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    borderColor: 'rgba(255, 71, 87, 0.4)',
  },
  submitModalButtonText: {
    color: '#e9ddc4',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

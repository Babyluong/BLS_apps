// components/QuizCertificate.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GOLD = "#e9ddc4";
const BORDER = "rgba(230,210,150,0.18)";
const BG = "rgba(18,18,22,0.65)";
const GREEN = "#4caf50";
const RED = "#ff6b6b";
const YELLOW = "#ffd54f";
const BLUE = "#2196f3";

export default function QuizCertificate({ result, userProfile }) {
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return GREEN;
      case 'B': return YELLOW;
      case 'C': return YELLOW;
      case 'D': return BLUE;
      case 'F': return RED;
      default: return GOLD;
    }
  };

  const getGradeDescription = (grade) => {
    const descriptions = {
      'A': 'Cemerlang | Excellent',
      'B': 'Baik | Good', 
      'C': 'Memuaskan | Satisfactory',
      'D': 'Lulus | Pass',
      'F': 'Gagal | Fail'
    };
    return descriptions[grade] || 'Tidak Diketahui | Unknown';
  };

  const getCategoryDisplay = (category) => {
    return category === 'clinical' ? 'Klinikal | Clinical' : 'Bukan Klinikal | Non-Clinical';
  };

  const getPassStatus = (passed) => {
    return passed ? 'LULUS | PASS' : 'GAGAL | FAIL';
  };

  const getPassStatusColor = (passed) => {
    return passed ? GREEN : RED;
  };

  return (
    <View style={styles.certificateContainer}>
      {/* Certificate Header */}
      <View style={styles.certificateHeader}>
        <View style={styles.certificateBorder}>
          <MaterialCommunityIcons name="certificate" size={40} color={GOLD} />
        </View>
        <Text style={styles.certificateTitle}>Sijil Penyempurnaan Kuiz</Text>
        <Text style={styles.certificateSubtitle}>Quiz Completion Certificate</Text>
      </View>

      {/* Certificate Body */}
      <View style={styles.certificateBody}>
        {/* Participant Information */}
        <View style={styles.participantSection}>
          <Text style={styles.sectionTitle}>Maklumat Peserta | Participant Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama | Name:</Text>
            <Text style={styles.infoValue}>{userProfile?.full_name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jawatan | Position:</Text>
            <Text style={styles.infoValue}>{userProfile?.jawatan || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kategori | Category:</Text>
            <Text style={styles.infoValue}>{getCategoryDisplay(result.category || 'non-clinical')}</Text>
          </View>
        </View>

        {/* Quiz Information */}
        <View style={styles.quizSection}>
          <Text style={styles.sectionTitle}>Maklumat Kuiz | Quiz Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jenis Kuiz | Quiz Type:</Text>
            <Text style={styles.infoValue}>{result.quizType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tarikh | Date:</Text>
            <Text style={styles.infoValue}>{result.submittedAt}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tempoh | Duration:</Text>
            <Text style={styles.infoValue}>{result.duration} minit | minutes</Text>
          </View>
        </View>

        {/* Score Information */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Keputusan | Results</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Skor | Score</Text>
              <Text style={styles.scoreValue}>{result.score}/{result.totalQuestions}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Peratusan | Percentage</Text>
              <Text style={[styles.scoreValue, { color: getGradeColor(result.grade || 'F') }]}>
                {result.percentage}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Gred | Grade</Text>
              <Text style={[styles.scoreValue, { color: getGradeColor(result.grade || 'F') }]}>
                {result.grade || 'F'}
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Status</Text>
              <Text style={[styles.scoreValue, { color: getPassStatusColor(result.passed || false) }]}>
                {getPassStatus(result.passed || false)}
              </Text>
            </View>
          </View>
        </View>

        {/* Grade Description */}
        <View style={styles.gradeSection}>
          <Text style={styles.gradeDescription}>
            {getGradeDescription(result.grade || 'F')}
          </Text>
        </View>

        {/* Certificate Footer */}
        <View style={styles.certificateFooter}>
          <Text style={styles.footerText}>
            Sijil ini dikeluarkan secara automatik oleh Sistem BLS
          </Text>
          <Text style={styles.footerText}>
            This certificate is automatically generated by the BLS System
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  certificateContainer: {
    backgroundColor: BG,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BORDER,
    padding: 20,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  certificateHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  certificateBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  certificateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: GOLD,
    textAlign: "center",
    marginBottom: 5,
  },
  certificateSubtitle: {
    fontSize: 16,
    color: "#c9c0aa",
    textAlign: "center",
    fontStyle: "italic",
  },
  certificateBody: {
    flex: 1,
  },
  participantSection: {
    marginBottom: 20,
  },
  quizSection: {
    marginBottom: 20,
  },
  scoreSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: GOLD,
    marginBottom: 15,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(230,210,150,0.1)",
  },
  infoLabel: {
    fontSize: 14,
    color: "#c9c0aa",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: GOLD,
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  scoreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  scoreItem: {
    width: "48%",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(230,210,150,0.1)",
    borderRadius: 12,
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#c9c0aa",
    textAlign: "center",
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: GOLD,
    textAlign: "center",
  },
  gradeSection: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "rgba(230,210,150,0.1)",
    borderRadius: 12,
  },
  gradeDescription: {
    fontSize: 18,
    fontWeight: "bold",
    color: GOLD,
    textAlign: "center",
  },
  certificateFooter: {
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerText: {
    fontSize: 12,
    color: "#c9c0aa",
    textAlign: "center",
    marginBottom: 5,
  },
});

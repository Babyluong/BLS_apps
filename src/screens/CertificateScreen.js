// screens/CertificateScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, Alert, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { generateBLSCertificate, shareCertificate } from "../services/certificateService";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CertificateScreen({ participantData, onBack }) {
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    
    try {
      const certificateResult = await generateBLSCertificate(participantData);
      
      if (certificateResult.success) {
        Alert.alert(
          "Certificate Generated", 
          "PDF certificate has been generated successfully!",
          [
            { text: "Share", onPress: () => shareCertificate(certificateResult.filePath) },
            { text: "OK", style: "default" }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to generate PDF: " + certificateResult.error);
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#e9ddc4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BLS Course Certificate</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Certificate Container */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.certificateContainer}>
          {/* Elegant Professional Certificate */}
          <View style={styles.certificateCard}>
            
            {/* Ornate Border */}
            <View style={styles.ornateBorder}>
              <View style={styles.contentArea}>
                
                {/* Gold Foil Seal Emblem */}
                <View style={styles.sealSection}>
                  <View style={styles.goldSeal}>
                    <View style={styles.heartIcon}>
                      <Text style={styles.heartSymbol}>♥</Text>
                    </View>
                    <View style={styles.ekgLine}>
                      <View style={styles.ekg1} />
                      <View style={styles.ekg2} />
                      <View style={styles.ekg3} />
                      <View style={styles.ekg4} />
                    </View>
                  </View>
                </View>

                {/* Ornate Title */}
                <View style={styles.titleSection}>
                  <Text style={styles.ornateTitle}>Certificate of Completion</Text>
                  <View style={styles.titleUnderline} />
                </View>

                {/* Course Title */}
                <Text style={styles.courseTitle}>Basic Life Support (BLS) Course</Text>

                {/* Main Content */}
                <View style={styles.mainContent}>
                  <Text style={styles.presentationText}>
                    This is to certify that
                  </Text>
                  
                  <Text style={styles.studentName}>
                    {participantData.participantName}
                  </Text>
                  
                  <Text style={styles.achievementText}>
                    has successfully completed the Basic Life Support (BLS) training course 
                    and demonstrated competency in all required assessments.
                  </Text>
                </View>

                {/* Signature Section */}
                <View style={styles.signatureSection}>
                  <View style={styles.signatureRow}>
                    <View style={styles.signatureBox}>
                      <View style={styles.signatureLine} />
                      <Text style={styles.signatureLabel}>Instructor Signature</Text>
                    </View>
                    <View style={styles.signatureBox}>
                      <View style={styles.signatureLine} />
                      <Text style={styles.signatureLabel}>Date</Text>
                    </View>
                  </View>
                </View>

                {/* Certificate ID */}
                <View style={styles.certificateIdSection}>
                  <Text style={styles.certificateId}>
                    Certificate ID: BLS-{Date.now().toString().slice(-6)}
                  </Text>
                </View>

                {/* Decorative Elements */}
                <View style={styles.decorativeElements}>
                  <View style={styles.cornerTopLeft} />
                  <View style={styles.cornerTopRight} />
                  <View style={styles.cornerBottomLeft} />
                  <View style={styles.cornerBottomRight} />
                </View>

              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={handleDownloadPDF}
          disabled={generatingPDF}
        >
          {generatingPDF ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <MaterialCommunityIcons name="file-pdf-box" size={20} color="#ffffff" />
              <Text style={styles.downloadButtonText}>Download PDF</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={onBack}
        >
          <MaterialCommunityIcons name="close" size={20} color="#1a1a2e" />
          <Text style={styles.shareButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f3f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#1a365d',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f3f0',
  },
  certificateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: screenHeight - 200,
  },
  certificateCard: {
    width: '100%',
    maxWidth: 800,
    backgroundColor: '#f5f0e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  // Ornate Border
  ornateBorder: {
    borderWidth: 8,
    borderColor: '#d4af37',
    backgroundColor: '#f5f0e8',
    position: 'relative',
    borderRadius: 4,
  },
  contentArea: {
    padding: 60,
    backgroundColor: '#f5f0e8',
    position: 'relative',
  },
  // Gold Foil Seal
  sealSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  goldSeal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#d4af37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#b8941f',
  },
  heartIcon: {
    marginBottom: 8,
  },
  heartSymbol: {
    fontSize: 24,
    color: '#ffffff',
    textShadowColor: '#b8941f',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ekgLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ekg1: {
    width: 8,
    height: 2,
    backgroundColor: '#ffffff',
    marginHorizontal: 1,
  },
  ekg2: {
    width: 4,
    height: 8,
    backgroundColor: '#ffffff',
    marginHorizontal: 1,
  },
  ekg3: {
    width: 12,
    height: 2,
    backgroundColor: '#ffffff',
    marginHorizontal: 1,
  },
  ekg4: {
    width: 6,
    height: 6,
    backgroundColor: '#ffffff',
    marginHorizontal: 1,
  },
  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ornateTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'serif',
    textShadowColor: '#d4af37',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleUnderline: {
    width: 200,
    height: 3,
    backgroundColor: '#d4af37',
    marginTop: 10,
    borderRadius: 2,
  },
  courseTitle: {
    fontSize: 22,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1,
  },
  // Main Content
  mainContent: {
    alignItems: 'center',
    marginBottom: 50,
  },
  presentationText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  studentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    textShadowColor: '#d4af37',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  achievementText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: 600,
  },
  // Signature Section
  signatureSection: {
    marginBottom: 40,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  signatureBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 30,
  },
  signatureLine: {
    width: 180,
    height: 2,
    backgroundColor: '#1a365d',
    marginBottom: 10,
  },
  signatureLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Certificate ID
  certificateIdSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  certificateId: {
    fontSize: 16,
    color: '#1a365d',
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Decorative Elements
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#d4af37',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#d4af37',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#d4af37',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#d4af37',
    borderBottomRightRadius: 8,
  },
  awardedSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  awardedText: {
    fontSize: 20,
    color: '#FFD700',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  participantNameContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 30,
    paddingHorizontal: 40,
    backgroundColor: '#000000',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#FFD700',
    borderStyle: 'double',
  },
  participantName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(255,215,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    fontStyle: 'italic',
    letterSpacing: 2,
  },
  participantId: {
    fontSize: 20,
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  courseDetailsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  courseDetailsText: {
    fontSize: 18,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 2,
    textShadowColor: 'rgba(255,215,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  courseDescription: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  dateLabel: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 5,
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 1,
  },
  sealContainer: {
    position: 'absolute',
    top: '50%',
    right: 30,
    transform: [{ translateY: -40 }],
  },
  officialSeal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFD700',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  sealText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 1,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 30,
  },
  signatureBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  signatureLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#FFD700',
    marginBottom: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  signatureLabel: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  certificateFooter: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#d4af37',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4af37',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#1a365d',
  },
  shareButtonText: {
    color: '#1a365d',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

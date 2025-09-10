// Simplified BLS App for Expo Snack
import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");

  const HomeScreen = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>BLS Training System</Text>
            <Text style={styles.subtitle}>Basic Life Support</Text>
          </View>
          
          <ScrollView style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setCurrentScreen("login")}
            >
              <Text style={styles.menuText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setCurrentScreen("cpr")}
            >
              <Text style={styles.menuText}>CPR Training</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setCurrentScreen("quiz")}
            >
              <Text style={styles.menuText}>Quiz</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setCurrentScreen("results")}
            >
              <Text style={styles.menuText}>Results</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const LoginScreen = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>Login</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentScreen("home")}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Login functionality would be here
            </Text>
            <Text style={styles.loginSubtext}>
              This is a simplified version for online access
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const CPRScreen = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>CPR Training</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentScreen("home")}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>CPR Techniques</Text>
            <Text style={styles.contentText}>
              • One Man CPR
            </Text>
            <Text style={styles.contentText}>
              • Two Man CPR
            </Text>
            <Text style={styles.contentText}>
              • Infant CPR
            </Text>
            <Text style={styles.contentText}>
              • Adult Choking
            </Text>
            <Text style={styles.contentText}>
              • Infant Choking
            </Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const QuizScreen = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>Quiz</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentScreen("home")}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Quiz Options</Text>
            <Text style={styles.contentText}>
              • Pre-Test Questions
            </Text>
            <Text style={styles.contentText}>
              • Post-Test Questions
            </Text>
            <Text style={styles.contentText}>
              • BLS Checklist
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const ResultsScreen = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>Results</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setCurrentScreen("home")}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>View Results</Text>
            <Text style={styles.contentText}>
              • BLS Results
            </Text>
            <Text style={styles.contentText}>
              • Quiz Results
            </Text>
            <Text style={styles.contentText}>
              • Certificates
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const renderScreen = () => {
    switch(currentScreen) {
      case "login": return <LoginScreen />;
      case "cpr": return <CPRScreen />;
      case "quiz": return <QuizScreen />;
      case "results": return <ResultsScreen />;
      default: return <HomeScreen />;
    }
  };

  return renderScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5ead1',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#d7ccb7',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    padding: 10,
  },
  backButtonText: {
    color: '#f5ead1',
    fontSize: 16,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuText: {
    color: '#f5ead1',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5ead1',
    marginBottom: 20,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 18,
    color: '#d7ccb7',
    marginVertical: 8,
    paddingLeft: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginText: {
    fontSize: 20,
    color: '#f5ead1',
    textAlign: 'center',
    marginBottom: 10,
  },
  loginSubtext: {
    fontSize: 16,
    color: '#d7ccb7',
    textAlign: 'center',
  },
});

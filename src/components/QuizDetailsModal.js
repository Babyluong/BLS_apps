import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const QuizDetailsModal = ({ 
  visible, 
  onClose, 
  quizData 
}) => {
  if (!quizData) return null;

  const { participantName, participantId, testType, score, totalQuestions, answers, questions, setIdentifier } = quizData;

  const renderQuestion = (questionData, questionNumber) => {
    if (!questionData) return null;

    const { question, questionEn, choices, choicesEn, correctAnswer, userAnswer, isCorrect } = questionData;
    
    // Debug logging
    console.log(`Q${questionNumber}:`, {
      correctAnswer,
      userAnswer,
      isCorrect,
      choices: choices.length
    });

    return (
      <View key={questionNumber} style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Q{questionNumber}</Text>
          <View style={[
            styles.statusIcon, 
            { backgroundColor: isCorrect ? '#28a745' : '#dc3545' }
          ]}>
            <MaterialCommunityIcons 
              name={isCorrect ? "check" : "close"} 
              size={16} 
              color="#ffffff" 
            />
          </View>
        </View>
        
        <Text style={styles.questionText}>{question}</Text>
        {questionEn && (
          <Text style={styles.questionTextEn}>{questionEn}</Text>
        )}
        
        <View style={styles.choicesContainer}>
          {choices.map((choice, index) => {
            const isUserChoice = index === userAnswer;
            const isCorrectChoice = index === correctAnswer;
            
            // Debug logging for each choice
            console.log(`  Choice ${index}:`, {
              choice: choice.substring(0, 30) + '...',
              isUserChoice,
              isCorrectChoice,
              userAnswer,
              correctAnswer
            });
            
            let choiceStyle = styles.choice;
            let choiceTextStyle = styles.choiceText;
            
            if (isCorrectChoice) {
              choiceStyle = [styles.choice, styles.correctChoice];
              choiceTextStyle = [styles.choiceText, styles.correctChoiceText];
            } else if (isUserChoice && !isCorrect) {
              choiceStyle = [styles.choice, styles.wrongChoice];
              choiceTextStyle = [styles.choiceText, styles.wrongChoiceText];
            } else if (isUserChoice) {
              // User's choice (even if correct, show it differently)
              choiceStyle = [styles.choice, styles.userChoice];
              choiceTextStyle = [styles.choiceText, styles.userChoiceText];
            }
            
            return (
              <View key={index} style={choiceStyle}>
                <Text style={styles.choiceLabel}>
                  {String.fromCharCode(65 + index)}.
                </Text>
                <View style={styles.choiceTextContainer}>
                  <Text style={choiceTextStyle}>{choice}</Text>
                  {choicesEn && choicesEn[index] && (
                    <Text style={[choiceTextStyle, styles.choiceTextEn]}>{choicesEn[index]}</Text>
                  )}
                </View>
                {isCorrectChoice && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#28a745" />
                )}
                {isUserChoice && !isCorrect && (
                  <MaterialCommunityIcons name="close-circle" size={20} color="#dc3545" />
                )}
                {isUserChoice && isCorrect && (
                  <MaterialCommunityIcons name="account-circle" size={20} color="#ffc107" />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderQuestions = () => {
    if (!questions || questions.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.noDataText}>No question details available</Text>
        </View>
      );
    }

    return (
      <View style={styles.questionsContainer}>
        {questions.map((question, index) => renderQuestion(question, index + 1))}
      </View>
    );
  };

  const getScoreColor = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    return '#dc3545';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="help-circle" size={24} color="#00ffc8" />
              <Text style={styles.headerTitle}>
                {testType === 'preTest' ? 'Pre-Test' : 'Post-Test'} Details
                {setIdentifier && (
                  <Text style={styles.setIdentifier}> (Set {setIdentifier})</Text>
                )}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#8a7f6a" />
            </TouchableOpacity>
          </View>

          {/* Participant Info */}
          <View style={styles.participantInfo}>
            <Text style={styles.participantName}>{participantName}</Text>
            <Text style={styles.participantId}>IC: {participantId}</Text>
          </View>

          {/* Score Summary */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={[styles.scoreText, { color: getScoreColor() }]}>
                {score}/{totalQuestions}
              </Text>
              <Text style={styles.percentageText}>
                ({Math.round((score / totalQuestions) * 100)}%)
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Correct Answers</Text>
              <Text style={styles.summaryText}>{score}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Wrong Answers</Text>
              <Text style={styles.summaryText}>{totalQuestions - score}</Text>
            </View>
          </View>

          {/* Questions */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            {renderQuestions()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '95%',
    maxHeight: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  setIdentifier: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#00ffc8',
  },
  closeButton: {
    padding: 5,
  },
  participantInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  participantId: {
    fontSize: 14,
    color: '#8a7f6a',
  },
  scoreContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#8a7f6a',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 14,
    color: '#8a7f6a',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    marginLeft: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8a7f6a',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollContainer: {
    maxHeight: 400,
  },
  questionsContainer: {
    padding: 20,
  },
  questionContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffc8',
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 15,
    lineHeight: 20,
  },
  choicesContainer: {
    gap: 8,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#3a3a3a',
  },
  correctChoice: {
    backgroundColor: '#28a74520',
    borderWidth: 1,
    borderColor: '#28a745',
  },
  wrongChoice: {
    backgroundColor: '#dc354520',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  userChoice: {
    backgroundColor: '#ffc10720',
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8a7f6a',
    marginRight: 10,
    minWidth: 20,
  },
  choiceText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  correctChoiceText: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  wrongChoiceText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  userChoiceText: {
    color: '#ffc107',
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#8a7f6a',
    marginTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  doneButton: {
    backgroundColor: '#00ffc8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // New styles for bilingual support
  questionTextEn: {
    fontSize: 14,
    color: '#8a7f6a',
    marginTop: 5,
    fontStyle: 'italic',
  },
  choiceTextContainer: {
    flex: 1,
  },
  choiceTextEn: {
    fontSize: 12,
    color: '#8a7f6a',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default QuizDetailsModal;

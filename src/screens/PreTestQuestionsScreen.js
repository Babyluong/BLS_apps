import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, FlatList
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";
import { calculateComprehensiveScore } from "../utils/scoreUtils";

const GOLD   = "#e9ddc4";
const BORDER = "rgba(230,210,150,0.18)";
const BG     = "rgba(18,18,22,0.65)";
const RED    = "#ff6b6b";
const GREEN  = "#4caf50";
const WHITE  = "#ffffff";
const YELLOW = "#ffd54f";

const QUIZ_KEY = "pretest";
const DURATION_MINUTES = 30;
const TEN_MINUTES = 10 * 60;

// Loading states for better user feedback
const LOADING_STATES = {
  INITIALIZING: 'Memulakan kuiz… | Initializing quiz…',
  AUTHENTICATING: 'Mengesahkan pengguna… | Authenticating user…',
  LOADING_QUESTIONS: 'Memuat soalan… | Loading questions…',
  PROCESSING_QUESTIONS: 'Memproses soalan… | Processing questions…',
  CREATING_SESSION: 'Menyediakan sesi… | Preparing session…',
  RESTORING_SESSION: 'Memulihkan sesi sebelumnya… | Restoring previous session…'
};

export default function PreTestQuizScreen({ onBack, onSignOut }) {
  // core
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    status: 'initializing',
    error: null
  });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  // timer
  const [remaining, setRemaining] = useState(null);
  const warnedRef = useRef(false);
  const timerRef = useRef(null);

  // paging (1 page = 1 question)
  const [idx, setIdx] = useState(0);
  const [visited, setVisited] = useState(new Set());

  // ====== boot ======
  useEffect(() => {
    initializeQuiz();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  const initializeQuiz = async () => {
    setLoadingState({ isLoading: true, status: 'initializing', error: null });
    try {
      // Check online status first
      const online = await checkOnlineStatus();
      setIsOnline(online);
      
      if (!online) {
        setLoadingState({ 
          isLoading: false, 
          status: 'error', 
          error: "Tidak ada sambungan internet. Sila semak rangkaian anda. | No internet connection. Please check your network." 
        });
        return;
      }

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const me = authData?.user ?? null;
      setUser(me);

      // 1) Load raw questions from DB
      setLoadingState({ isLoading: true, status: 'loading_questions', error: null });
      const rawQs = await loadQuestions();
      if (rawQs.length === 0) {
        setLoadingState({ 
          isLoading: false, 
          status: 'error', 
          error: "No Pre Test questions found. Please import questions first." 
        });
        return;
      }

      // 2) Ensure (or create) a session row
      setLoadingState({ isLoading: true, status: 'creating_session', error: null });
      const sess = await ensureSession(me?.id, rawQs);
      setSession(sess);

      // 3) Deterministically randomize order per user
      setLoadingState({ isLoading: true, status: 'processing_questions', error: null });
      const ordered = orderQuestions(rawQs, sess?.id);
      setQuestions(ordered);

      // 4) Restore or initialize answers
      if (sess?.answers && typeof sess.answers === "object") {
        setAnswers(sess.answers);
      } else {
        const init = {};
        for (const q of ordered) init[q.id] = null;
        setAnswers(init);
      }

      // 5) Start countdown to expires_at
      if (sess?.expires_at) {
        startTimer(sess.expires_at);
      }

      setLoadingState({ isLoading: false, status: 'ready', error: null });
    } catch (e) {
      setLoadingState({ 
        isLoading: false, 
        status: 'error', 
        error: String(e?.message || e) 
      });
    }
  };

  const checkOnlineStatus = async () => {
    try {
      const { data, error } = await supabase.from('questions').select('count').limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  };

  const startTimer = (expiryDate) => {
    try {
      const expiry = new Date(expiryDate).getTime();
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const tick = () => {
        const now = Date.now();
        const remain = Math.max(0, Math.floor((expiry - now) / 1000));
        setRemaining(remain);
        
        // Auto-submit when time runs out
        if (remain === 0 && session?.status === "in_progress") {
          handleSubmit(true);
        }
      };
      
      tick();
      timerRef.current = setInterval(tick, 1000);
    } catch (error) {
      console.error("Timer error:", error);
    }
  };

  // mark first question visited when ready
  useEffect(() => {
    if (questions.length > 0) {
      const firstId = questions[0].id;
      setVisited((s) => new Set(s).add(firstId));
    }
  }, [questions.length]);

  // 10-min warning
  useEffect(() => {
    if (remaining == null) return;
    if (remaining <= TEN_MINUTES && !warnedRef.current && session?.status === "in_progress") {
      warnedRef.current = true;
      Alert.alert(
        "Perhatian | Attention",
        "Masa Tinggal 10 Minit Sahaja Lagi\nOnly 10 Minutes Remaining",
        [{ text: "Okey | OK" }],
        { cancelable: true }
      );
    }
  }, [remaining, session?.status]);

  async function loadQuestions() {
    try {
      console.log("Loading Pre Test questions from Supabase...");
      
      // First, let's try to get all columns to see what's available
      const { data: allData, error: allError } = await supabase
        .from('questions')
        .select('*')
        .limit(1);

      if (allError) {
        console.error("Error accessing questions table:", allError);
        return [];
      }

      if (!allData || allData.length === 0) {
        console.log("No data found in questions table");
        return [];
      }

      console.log("Available columns:", Object.keys(allData[0] || {}));
      
      // Try different possible column names
      const possibleColumns = ['soalan_set', 'question_set', 'scaler_text', 'question_type', 'type', 'category'];
      let filterColumn = null;
      
      for (const col of possibleColumns) {
        if (allData[0] && allData[0][col]) {
          filterColumn = col;
          console.log(`Found filter column: ${col} with value: ${allData[0][col]}`);
          break;
        }
      }
      
      if (!filterColumn) {
        console.log("No suitable filter column found, fetching all questions");
        const { data: questionData, error } = await supabase
          .from('questions')
          .select('*')
          .limit(30);
          
        if (error) {
          console.error("Error fetching all questions:", error);
          return [];
        }
        
        return processQuestionsFromDatabase(questionData || []);
      }
      
      // Fetch questions with the found filter column
      const { data: questionData, error } = await supabase
        .from('questions')
        .select('*')
        .eq(filterColumn, 'Pre_Test')
        .limit(30);

      if (error) {
        console.error("Error fetching Pre Test questions:", error);
        return [];
      }
      
      if (!questionData || questionData.length === 0) {
        console.log("No Pre Test questions found in database");
        return [];
      }
      
      console.log(`Found ${questionData.length} Pre Test questions`);
      return processQuestionsFromDatabase(questionData);
    } catch (error) {
      console.error("Error in loadQuestions:", error);
      return [];
    }
  }

  function processQuestionsFromDatabase(data) {
    if (!data || data.length === 0) return [];
    
    const processedQuestions = [];
    
    for (let i = 0; i < data.length; i++) {
      const question = data[i];
      
      // Validate question has required fields - FIXED COLUMN NAMES
      if (!question || !question.question_text_en || !question.question_text) {
        console.warn('Skipping invalid question:', question);
        continue;
      }
      
      // Create bilingual question text - FIXED COLUMN NAMES
      const bilingualText = `${question.question_text}\n${question.question_text_en}`;
      
      // Create bilingual choices - FIXED COLUMN NAMES
      const bilingualChoices = [];
      const options = ['option_a', 'option_b', 'option_c', 'option_d'];
      const optionsEn = ['option_a_en', 'option_b_en', 'option_c_en', 'option_d_en'];
      
      for (let j = 0; j < 4; j++) {
        const malayOption = question[options[j]];
        const englishOption = question[optionsEn[j]];
        
        if (englishOption && malayOption) {
          bilingualChoices.push(`${malayOption}\n${englishOption}`);
        }
      }
      
      // Only add if we have at least 2 valid choices
      if (bilingualChoices.length >= 2) {
        processedQuestions.push({
          id: `pre-test-${question.id}`,
          raw: { 
            malay: {
              id: `malay-${question.id}`,
              question: question.question_text,
              a: question.option_a,
              b: question.option_b,
              c: question.option_c,
              d: question.option_d
            },
            english: {
              id: `english-${question.id}`,
              question: question.question_text_en,
              a: question.option_a_en,
              b: question.option_b_en,
              c: question.option_c_en,
              d: question.option_d_en
            },
            correct_option: question.correct_option || question.correct_option_en
          },
          text: bilingualText,
          choices: bilingualChoices,
          questionSet: "Pre Test",
          correctAnswer: question.correct_option || question.correct_option_en
        });
      }
    }
    
    console.log(`Processed ${processedQuestions.length} bilingual questions`);
    return processedQuestions;
  }

  function validateQuestion(q) {
    if (!q || typeof q !== 'object') return false;
    if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') return false;
    
    // Check if we have at least 2 valid options
    const options = [q.a, q.b, q.c, q.d];
    const validOptions = options.filter(opt => opt && typeof opt === 'string' && opt.trim() !== '');
    return validOptions.length >= 2;
  }

  async function ensureSession(userId, qs) {
    if (!userId) return null;

    // Get participant information from profile
    let participantName = null;
    let participantIC = null;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, ic")
        .eq("id", userId)
        .single();
      
      if (profile) {
        participantName = profile.full_name;
        participantIC = profile.ic;
      }
    } catch (error) {
      console.warn("Could not fetch participant info:", error);
    }

    // Check for existing session
    const { data: existing, error: fetchError } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("quiz_key", QUIZ_KEY)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching session:", fetchError);
    }

    if (existing) {
      // Check if session is still valid
      const now = new Date();
      const expiresAt = new Date(existing.expires_at);
      
      if (existing.status === "submitted") {
        return existing; // Already submitted
      }
      
      if (now > expiresAt) {
        // Session expired, auto-submit
        const { data: updatedSession } = await supabase
          .from("quiz_sessions")
          .update({ 
            status: "submitted",
            updated_at: now.toISOString()
          })
          .eq("id", existing.id)
          .select()
          .single();
          
        return updatedSession;
      }
      
      return existing;
    }

    // Create new session
    const started = new Date();
    const expires = new Date(started.getTime() + DURATION_MINUTES * 60 * 1000);
    const initAnswers = {};
    for (const q of qs) initAnswers[q.id] = null;

    const { data: created, error: insErr } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: userId,
        quiz_key: QUIZ_KEY,
        started_at: started.toISOString(),
        expires_at: expires.toISOString(),
        status: "in_progress",
        answers: initAnswers,
        total_questions: qs.length,
        participant_name: participantName,
        participant_ic: participantIC,
      })
      .select()
      .single();

    if (insErr) {
      console.error("Error creating session:", insErr);
      throw new Error(insErr.message);
    }
    
    return created;
  }

  // ===== deterministic per-session shuffle =====
  function xfnv1aHash(str) {
    // 32-bit FNV-1a hash
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }
  
  function mulberry32(seed) {
    return function() {
      let t = (seed += 0x6D2B79F5) | 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  
  function orderQuestions(qs, sessionId) {
    if (!sessionId || qs.length <= 1) return qs;
    const seed = xfnv1aHash(`${sessionId}|${QUIZ_KEY}`);
    const rng = mulberry32(seed);
    const a = qs.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const isSubmitted = session?.status === "submitted";

  // Network resilience with retry logic
  const saveWithRetry = async (answersToSave, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const { error } = await supabase
          .from("quiz_sessions")
          .update({ 
            answers: answersToSave, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", session.id)
          .eq("user_id", user.id)
          .eq("quiz_key", QUIZ_KEY);
          
        if (error) throw error;
        
        setLastSaved(new Date());
        return true;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  // autosave (debounced)
  const saveTimer = useRef(null);
  function scheduleSave(nextAnswers) {
    if (!user?.id || !session) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveWithRetry(nextAnswers);
      } catch (e) {
        setLoadingState(prev => ({ 
          ...prev, 
          error: `Autosave gagal: ${String(e.message || e)}` 
        }));
      }
    }, 1000);
  }

  function setCurrentIndex(newIdx) {
    const bounded = Math.max(0, Math.min(newIdx, questions.length - 1));
    setIdx(bounded);
    const qid = questions[bounded]?.id;
    if (qid) setVisited((s) => new Set(s).add(qid));
  }

  function selectAnswer(qid, letter) {
    if (isSubmitted) return;
    
    const question = questions.find(q => q.id === qid);
    if (question && question.raw && question.raw.malay && question.raw.english) {
      // For bilingual questions, we need to record the answer for both language versions
      const next = { 
        ...(answers || {}), 
        [question.raw.malay.id]: letter,
        [question.raw.english.id]: letter
      };
      setAnswers(next);
      scheduleSave(next);
    } else if (question && question.id) {
      // For regular questions
      const next = { ...(answers || {}), [qid]: letter };
      setAnswers(next);
      scheduleSave(next);
    }
  }

  // ===== score calculation =====
  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = 0;

    questions.forEach(question => {
      totalQuestions++;
      
      // Get user's answer for this question
      let userAnswer = null;
      if (question.raw && question.raw.malay && question.raw.english) {
        // For bilingual questions, check both language versions
        userAnswer = answers?.[question.raw.malay.id] || answers?.[question.raw.english.id];
      } else if (question.id) {
        // For regular questions
        userAnswer = answers?.[question.id];
      }

      // Get correct answer - try multiple possible field names
      const correctAnswer = question.correctAnswer || 
                           question.raw?.correct_option || 
                           question.raw?.correct_option_en ||
                           question.raw?.correct_answer;
      
      // Debug logging to help identify the issue
      console.log(`Question ${question.id}:`, {
        userAnswer,
        correctAnswer,
        isCorrect: userAnswer && correctAnswer && userAnswer === correctAnswer,
        questionText: question.text?.substring(0, 50) + '...'
      });
      
      // Check if answer is correct
      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    console.log(`Score calculation: ${correctAnswers}/${totalQuestions}`);
    return {
      score: correctAnswers,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    };
  };

  // ===== comprehensive score calculation =====
  const calculateComprehensiveScoreData = async () => {
    const basicScore = calculateScore();
    
    // Get user's jawatan from profile
    let userJawatan = '';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('jawatan')
          .eq('id', user.id)
          .single();
        userJawatan = profile?.jawatan || '';
      }
    } catch (error) {
      console.warn('Could not fetch user jawatan:', error);
    }
    
    return calculateComprehensiveScore(basicScore.score, basicScore.total, userJawatan);
  };

  // ===== submit =====
  async function handleSubmit(isAuto = false) {
    if (!session || !user?.id) return;
    if (session.status === "submitted") return;

    // Gate: block manual submit if not all answered
    if (!isAuto && !allAnswered) {
      Alert.alert(
        "Belum Lengkap | Incomplete",
        "Sila jawab semua soalan sebelum menghantar.\nPlease answer all questions before submitting."
      );
      return;
    }

    try {
      // Calculate comprehensive score before submitting
      const comprehensiveScore = await calculateComprehensiveScoreData();
      
      console.log("=== QUIZ SUBMISSION DEBUG ===");
      console.log("Comprehensive Score:", comprehensiveScore);
      console.log("Answers:", answers);
      console.log("Session ID:", session.id);
      
      await saveWithRetry(answers);
      
      console.log("Updating quiz_sessions with score:", comprehensiveScore.score);
      
      const { error } = await supabase
        .from("quiz_sessions")
        .update({
          answers,
          status: "submitted",
          updated_at: new Date().toISOString(),
          score: comprehensiveScore.score,
          total_questions: comprehensiveScore.total,
          percentage: comprehensiveScore.percentage
        })
        .eq("id", session.id)
        .eq("user_id", user.id)
        .eq("quiz_key", QUIZ_KEY);
        
      if (error) throw error;

      setSession((s) => ({ ...(s || {}), status: "submitted" }));

      // Show success message first
      Alert.alert(
        "Selamat Maju Jaya!",
        "Tahniah! Anda telah berjaya menyelesaikan kuiz Pre Test.\n\nCongratulations! You have successfully completed the Pre Test quiz.",
        [{ text: "Terima Kasih | Thank You" }],
        { cancelable: false }
      );

      // Then show results with comprehensive score
      setTimeout(() => {
        const resultMessage = `Skor | Score: ${comprehensiveScore.score}/${comprehensiveScore.total}\nPeratusan | Percentage: ${comprehensiveScore.percentage}%\nKategori | Category: ${comprehensiveScore.category}\nGred | Grade: ${comprehensiveScore.grade} (${comprehensiveScore.gradeDescription})\nStatus: ${comprehensiveScore.passed ? 'LULUS | PASS' : 'GAGAL | FAIL'}`;
        
        Alert.alert(
          "Keputusan | Results",
          resultMessage,
          [{ text: "Tutup | Close", onPress: onBack }],
          { cancelable: false }
        );
      }, 1000);
    } catch (e) {
      Alert.alert("Ralat Hantar | Submit Error", String(e?.message || e));
    }
  }

  // ===== derived =====
  const current = questions[idx] || null;
  const unansweredCount = useMemo(
    () => questions.filter(q => {
      // Add safety checks for q.raw
      if (q.raw && q.raw.malay && q.raw.english) {
        // For bilingual questions, check if either language version is answered
        return !answers || (answers[q.raw.malay.id] == null && answers[q.raw.english.id] == null);
      } else if (q.id) {
        // For regular questions (like demo questions)
        return !answers || answers[q.id] == null;
      }
      // Skip invalid questions
      return false;
    }).length,
    [questions, answers]
  );
  const allAnswered = unansweredCount === 0 && questions.length > 0;

  function CountdownBadge() {
    if (remaining == null) return null;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const critical = remaining <= TEN_MINUTES;
    const color = critical ? RED : GREEN;

    return (
      <View style={[styles.countdown, { borderColor: color }]}>
        <MaterialCommunityIcons name="timer-outline" size={18} color={color} />
        <Text style={[styles.countdownTxt, { color }]}>
          Masa | Time: {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </Text>
        {critical && (
          <Text style={[styles.countdownSubtext, { color }]}>
            {Math.ceil(remaining / 60)} minit lagi | {Math.ceil(remaining / 60)} minutes left
          </Text>
        )}
      </View>
    );
  }

  // tile color logic: White (never opened), Yellow (visited but no answer), Green (answered)
  function tileColors(q) {
    const id = q.id;
    // Add safety checks for q.raw
    if (q.raw && q.raw.malay && q.raw.english) {
      // For bilingual questions, check if either language version is answered
      const malayId = q.raw.malay.id;
      const englishId = q.raw.english.id;
      const ans = (answers?.[malayId] ?? null) || (answers?.[englishId] ?? null);
      if (ans) return { bg: GREEN, border: "rgba(0,0,0,0.45)" };
    } else if (id) {
      // For regular questions
      const ans = answers?.[id];
      if (ans) return { bg: GREEN, border: "rgba(0,0,0,0.45)" };
    }
    
    if (visited.has(id)) return { bg: YELLOW, border: "rgba(0,0,0,0.35)" };
    return { bg: WHITE, border: "rgba(0,0,0,0.25)" };
  }

  // Compact question tile component for FlatList
  const CompactQuestionTile = useCallback(({ item, index }) => {
    const { bg, border } = tileColors(item);
    const isCurrent = index === idx;
    
    return (
      <TouchableOpacity
        onPress={() => setCurrentIndex(index)}
        activeOpacity={0.8}
        style={[
          styles.compactTile,
          { backgroundColor: bg, borderColor: isCurrent ? "#000" : border },
        ]}
        accessibilityLabel={`Soalan ${index + 1} | Question ${index + 1}`}
        accessibilityHint="Pilih untuk navigasi ke soalan ini | Select to navigate to this question"
        accessibilityRole="button"
        accessibilityState={{ 
          selected: isCurrent,
          checked: answers?.[item.id] ? true : false
        }}
      >
        <Text style={styles.compactNum}>{index + 1}</Text>
      </TouchableOpacity>
    );
  }, [idx, answers, visited]);

  // Save indicator component
  const SaveIndicator = useCallback(() => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    
    if (diff < 3) {
      return (
        <View style={styles.saveIndicator}>
          <MaterialCommunityIcons name="check-circle" size={14} color={GREEN} />
          <Text style={styles.saveIndicatorText}>Disimpan | Saved</Text>
        </View>
      );
    } else if (diff < 10) {
      return (
        <View style={styles.saveIndicator}>
          <MaterialCommunityIcons name="cloud-check" size={14} color={GOLD} />
          <Text style={styles.saveIndicatorText}>Selamat | Secure</Text>
        </View>
      );
    }
    
    return null;
  }, [lastSaved]);

  // Show review summary before submission
  const showReviewSummary = () => {
    // For now, go directly to submission since Alert dialog has compatibility issues
    // TODO: Implement proper review dialog for web compatibility
    handleSubmit(false);
  };

  return (
    <LuxuryShell title="Pre Test — Kuiz | Quiz" onSignOut={onSignOut}>
      {loadingState.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={GOLD} />
          <Text style={styles.stateTxt}>
            {loadingState.status === 'initializing' && LOADING_STATES.INITIALIZING}
            {loadingState.status === 'loading_questions' && LOADING_STATES.LOADING_QUESTIONS}
            {loadingState.status === 'creating_session' && LOADING_STATES.CREATING_SESSION}
            {loadingState.status === 'processing_questions' && LOADING_STATES.PROCESSING_QUESTIONS}
          </Text>
        </View>
      ) : !questions.length ? (
        <View style={styles.stateBox}>
          <MaterialCommunityIcons name="file-question-outline" size={22} color={GOLD} />
          <Text style={styles.stateTxt}>
            Tiada soalan Pre Test ditemui dalam pangkalan data.{"\n"}
            Sila pastikan:{"\n"}
            1. Jadual mengandungi soalan dengan 'soalan_set' = 'Pre_Test'{"\n"}
            2. Soalan mempunyai teks dalam bahasa Melayu dan Inggeris{"\n"}
            3. Terdapat sekurang-kurangnya 30 soalan dalam set ini{"\n\n"}
            No Pre Test questions found in the database.{"\n"}
            Please ensure:{"\n"}
            1. Table contains questions with 'soalan_set' = 'Pre_Test'{"\n"}
            2. Questions have text in both Malay and English{"\n"}
            3. There are at least 30 questions in this set
          </Text>
          <TouchableOpacity onPress={initializeQuiz} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Cuba Lagi | Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {/* Top controls */}
          <View style={styles.topRow}>
            <TouchableOpacity 
              onPress={onBack} 
              style={styles.backBtn} 
              activeOpacity={0.9}
              accessibilityLabel="Kembali ke menu utama | Back to main menu"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="arrow-left" size={18} color={GOLD} />
              <Text style={styles.backTxt}>Kembali | Back</Text>
            </TouchableOpacity>

            <CountdownBadge />

            {/* Submit button */}
            <TouchableOpacity
              disabled={isSubmitted || !allAnswered}
              onPress={showReviewSummary}
              style={[
                styles.submitBtn,
                (isSubmitted || !allAnswered) && { opacity: 0.45 }
              ]}
              activeOpacity={0.9}
              accessibilityLabel={isSubmitted ? "Sudah dihantar | Already submitted" : allAnswered ? "Hantar jawapan | Submit answers" : "Lengkapkan semua soalan dahulu | Complete all questions first"}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="send-check-outline" size={18} color={GOLD} />
              <Text style={styles.backTxt}>
                {isSubmitted ? "Sudah Dihantar | Submitted" : allAnswered ? "Hantar | Submit" : "Lengkapkan Dulu | Complete First"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save indicator */}
          <SaveIndicator />

          {/* Online status indicator */}
          {!isOnline && (
            <View style={styles.offlineBanner}>
              <MaterialCommunityIcons name="wifi-off" size={18} color={YELLOW} />
              <Text style={{ color: YELLOW, fontWeight: "700" }}>
                Mod luar talian | Offline mode
              </Text>
            </View>
          )}

          {/* Lock & error banners */}
          {session?.status === "submitted" && (
            <View style={styles.lockBanner}>
              <MaterialCommunityIcons name="lock-check-outline" size={18} color={GOLD} />
              <Text style={{ color: GOLD, fontWeight: "700" }}>
                Penyerahan telah dibuat (Satu kali sahaja dibenantar){"\n"}
                Submission already made (Only one attempt allowed)
              </Text>
            </View>
          )}
          {!!loadingState.error && (
            <View style={styles.errBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={RED} />
              <Text style={{ color: RED, fontWeight: "700" }}>{String(loadingState.error)}</Text>
            </View>
          )}

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((idx + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>

          {/* Compact Navigator Grid using FlatList for performance */}
          <View style={styles.navWrap}>
            <Text style={styles.navTitle}>Status Soalan | Question Status</Text>
            <FlatList
              data={questions}
              keyExtractor={(item) => item.id}
              numColumns={8}
              renderItem={({ item, index }) => (
                <CompactQuestionTile item={item} index={index} />
              )}
              contentContainerStyle={styles.compactGrid}
              scrollEnabled={false}
            />

            {!!unansweredCount && (
              <Text style={styles.unansweredHint}>
                Belum dijawab: {unansweredCount} soalan{"\n"}
                Unanswered: {unansweredCount} questions
              </Text>
            )}
          </View>

          {/* One-question page */}
          {current && (
            <View style={styles.card}>
              <Text style={styles.qNo}>Soalan {idx + 1} | Question {idx + 1}</Text>
              
              {/* Render bilingual question text */}
              <Text style={{ color: GOLD, fontWeight: "700", fontSize: 16, marginBottom: 16, lineHeight: 22 }}>
                {current.text}
              </Text>

              <View style={{ marginTop: 12, gap: 10 }}>
                {current.choices && current.choices.length > 0 ? (
                  current.choices.map((choice, i) => {
                    const letter = String.fromCharCode(65 + i);
                    // Add safety checks for current.raw
                    let selected = false;
                    if (current.raw && current.raw.malay && current.raw.english) {
                      // For bilingual questions, check if either language version is answered
                      const malayId = current.raw.malay.id;
                      const englishId = current.raw.english.id;
                      selected = (answers?.[malayId] === letter) || (answers?.[englishId] === letter);
                    } else if (current.id) {
                      // For regular questions
                      selected = answers?.[current.id] === letter;
                    }
                    
                    return (
                      <TouchableOpacity
                        key={i}
                        disabled={isSubmitted}
                        onPress={() => selectAnswer(current.id, letter)}
                        style={[
                          styles.choiceBtn,
                          selected && { borderColor: GOLD, backgroundColor: "rgba(233,221,196,0.08)" }
                        ]}
                        activeOpacity={0.9}
                        accessibilityLabel={`Pilih pilihan ${letter} | Select option ${letter}`}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                      >
                        <Text style={[styles.choiceLetter, selected && { color: GOLD }]}>{letter}.</Text>
                        <View style={{ flex: 1 }}>
                          {/* Render bilingual choice text */}
                          <Text style={{ color: GOLD, fontSize: 15, lineHeight: 20 }}>
                            {choice}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={{ color: GOLD, opacity: 0.7 }}>(Pilihan jawapan tiada | No choices)</Text>
                )}
              </View>

              {/* Prev / Next buttons */}
              <View style={styles.pagerRow}>
                <TouchableOpacity
                  onPress={() => setCurrentIndex(idx - 1)}
                  disabled={idx === 0}
                  style={[
                    styles.pagerBtn,
                    idx === 0 && { opacity: 0.4 }
                  ]}
                  activeOpacity={0.9}
                  accessibilityLabel="Pergi ke soalan sebelumnya | Go to previous question"
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="chevron-left" size={26} color={GOLD} />
                  <Text style={styles.pagerTxt}>Sebelumnya | Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCurrentIndex(idx + 1)}
                  disabled={idx === questions.length - 1}
                  style={[
                    styles.pagerBtn,
                    idx === questions.length - 1 && { opacity: 0.4 }
                  ]}
                  activeOpacity={0.9}
                  accessibilityLabel="Pergi ke soalan seterusnya | Go to next question"
                  accessibilityRole="button"
                >
                  <Text style={styles.pagerTxt}>Seterusnya | Next</Text>
                  <MaterialCommunityIcons name="chevron-right" size={26} color={GOLD} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </LuxuryShell>
  );
}

/* ——— styles ——— */
const TILE_SIZE_S = 26;
const TILE_GAP_S  = 6;

const styles = StyleSheet.create({
  stateBox: {
    backgroundColor: BG, borderColor: BORDER, borderWidth: 1, borderRadius: 16,
    padding: 18, gap: 10,
  },
  stateTxt: { color: GOLD, lineHeight: 20 },
  retryButton: {
    backgroundColor: GOLD,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  retryButtonText: {
    color: '#1c1710',
    fontWeight: 'bold'
  },

  topRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: 10,
    flexWrap: 'wrap'
  },
  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: BG, borderColor: BORDER, borderWidth: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12,
  },
  submitBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#2c2c34",
    borderColor: GOLD,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  backTxt: { color: GOLD, fontWeight: "800" },

  lockBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(233,221,196,0.08)", borderColor: BORDER, borderWidth: 1, borderRadius: 12, padding: 10,
  },
  errBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,107,107,0.08)", borderColor: "rgba(255,107,107,0.3)", borderWidth: 1, borderRadius: 12, padding: 10,
  },
  offlineBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,213,79,0.08)", borderColor: "rgba(255,213,79,0.3)", borderWidth: 1, borderRadius: 12, padding: 10,
  },

  progressBar: {
    height: 6,
    backgroundColor: "rgba(233,221,196,0.2)",
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 3
  },

  navWrap: {
    backgroundColor: BG, borderColor: BORDER, borderWidth: 1, borderRadius: 16,
    padding: 10, gap: 6,
  },
  navTitle: { color: GOLD, fontWeight: "900" },

  // ultra-compact indicator grid
  compactGrid: {
    gap: TILE_GAP_S,
  },
  compactTile: {
    width: TILE_SIZE_S,
    height: TILE_SIZE_S,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  compactNum: { fontSize: 10, fontWeight: "800" },

  unansweredHint: { color: GOLD, opacity: 0.95, marginTop: 2 },

  card: {
    backgroundColor: BG, borderColor: BORDER, borderWidth: 1, borderRadius: 16,
    padding: 16, gap: 12,
  },
  qNo: { color: GOLD, fontWeight: "900" },

  choiceBtn: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 10,
  },
  choiceLetter: { color: "#c9c0aa", fontWeight: "900", width: 20, textAlign: "right" },

  // BIG pager buttons
  pagerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 10,
  },
  pagerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#2c2c34",
    borderColor: GOLD,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  pagerTxt: {
    color: GOLD,
    fontWeight: "900",
    fontSize: 16,
    textAlign: "center",
  },

  countdown: {
    flexDirection: "column", 
    alignItems: "center", 
    gap: 2,
    borderWidth: 2, 
    borderRadius: 12, 
    paddingVertical: 6, 
    paddingHorizontal: 10,
    minWidth: 100,
  },
  countdownTxt: { fontWeight: "800", fontSize: 12 },
  countdownSubtext: { fontWeight: "600", fontSize: 10 },

  saveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveIndicatorText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "600",
  },
});
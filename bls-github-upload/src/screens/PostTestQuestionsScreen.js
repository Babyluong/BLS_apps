// screens/PostTestQuizScreen.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView, Modal
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

const QUIZ_KEY = "posttest";
const DURATION_MINUTES = 30; // 30 minutes for post test
const TEN_MINUTES = 10 * 60;

export default function PostTestQuizScreen({ onBack, onSignOut }) {
  // core
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [id]: "A"/"B"/"C"/"D" }
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null); // Track which set user selected
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false); // Show submit confirmation

  // timer
  const [remaining, setRemaining] = useState(null); // seconds
  const warnedRef = useRef(false);
  const timerRef = useRef(null);

  // paging (1 page = 1 question)
  const [idx, setIdx] = useState(0);
  const [visited, setVisited] = useState(new Set()); // ids that have been opened

  // ====== boot ======
  useEffect(() => {
    (async () => {
      setLoading(true); 
      setErr("");
      try {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        const me = authData?.user ?? null;
        setUser(me);

        // 1) Load raw questions from DB
        const rawQs = await loadQuestions();

        // 2) Check if user has already completed a post test
        const { data: existingSessions, error: sessionError } = await supabase
          .from("quiz_sessions")
          .select("*")
          .eq("user_id", me?.id)
          .eq("quiz_key", QUIZ_KEY)
          .in("status", ["submitted", "in_progress"]);

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (existingSessions && existingSessions.length > 0) {
          // User already has a session, check if it's submitted
          const sess = existingSessions[0];
          console.log("Found existing session:", sess);
          
          if (sess.status === "submitted") {
            // Session is already submitted, redirect to results
            console.log("Session already submitted, redirecting to results");
            Alert.alert(
              "Post Test Selesai | Post Test Completed",
              "Anda telah menyelesaikan Post Test. Sila lihat keputusan anda.\n\nYou have already completed the Post Test. Please view your results.",
              [
                { 
                  text: "Lihat Keputusan | View Results", 
                  onPress: () => {
                    // Navigate to results screen
                    if (typeof onBack === 'function') {
                      // This will go back to the previous screen, which should be the BLS Test menu
                      // From there, user can click "Quiz Results" to see their results
                      onBack();
                    }
                  }
                }
              ],
              { cancelable: false }
            );
            return;
          }
          
          // Session is in progress, restore it
          setSession(sess);
          
          // Restore the selected set from session answers._selected_set if available
          if (sess.answers && sess.answers._selected_set) {
            console.log("Setting selectedSet from session.answers._selected_set:", sess.answers._selected_set);
            setSelectedSet(sess.answers._selected_set);
          } else {
            console.log("No selectedSet found in session, will show set selection screen");
          }
          
          // Restore answers
          if (sess?.answers && typeof sess.answers === "object") {
            setAnswers(sess.answers);
          }
          
          // Filter questions to only the selected set and limit to 30
          const selectedSetValue = sess.answers && sess.answers._selected_set;
          if (selectedSetValue) {
            const filteredQuestions = rawQs
              .filter(q => q.set && q.set.toString().trim().toUpperCase() === selectedSetValue.toString().trim().toUpperCase())
            .slice(0, 30);
          
          // Deterministically randomize order per user (seeded by session id)
            const ordered = orderQuestions(filteredQuestions, sess?.id);
          setQuestions(ordered);
          } else {
            // No valid selected set, show set selection screen
            setQuestions([]); // Don't load questions until set is selected
          }
          
          // Start countdown to expires_at
          if (sess?.expires_at) {
            const expiry = new Date(sess.expires_at).getTime();
            // Clear any existing timer
            if (timerRef.current) clearInterval(timerRef.current);
            
            const tick = () => {
              const now = Date.now();
              const remain = Math.max(0, Math.floor((expiry - now) / 1000));
              setRemaining(remain);
            };
            tick();
            const int = setInterval(tick, 1000);
            timerRef.current = int;
          }
        } else {
          // No existing session, just load questions for set selection
          console.log("No existing session found, loading questions for set selection");
          setQuestions(rawQs);
        }
      } catch (e) {
        console.error("Boot error:", e);
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // mark first question visited when ready
  useEffect(() => {
    if (questions.length && selectedSet) {
      const firstId = questions[0].id;
      setVisited((s) => new Set(s).add(firstId));
    }
  }, [questions.length, selectedSet]);

  // 10-min warning + auto-submit
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
    if (remaining === 0 && session?.status === "in_progress") {
      handleSubmit(true);
    }
  }, [remaining]);

  // ===== helpers: bilingual building from DB =====
  const firstText = (row, keys) => {
    for (const k of keys) {
      const v = row?.[k];
      if (v != null && String(v).trim() !== "") return String(v);
    }
    return null;
  };

  const alreadyBilingual = (s) => {
    if (!s) return false;
    const t = String(s);
    return t.includes("\n") || t.includes("|");
  };

  const combineBi = (ms, en, fallback) => {
    // Prefer an existing bilingual string in fallback
    if (alreadyBilingual(fallback)) return String(fallback);
    // If either ms or en exist, combine
    if (ms || en) {
      const left = (ms ?? "").trim();
      const right = (en ?? "").trim();
      if (left && right) return `${left}\n${right}`;
      return left || right; // one-language fallback
    }
    // Last resort: raw single value
    return String(fallback ?? "");
  };

  function detectSetCol(row = {}) {
    // Check common column names for sets
    const possibleColumns = ["soalan_set", "set", "title", "jenis", "category", "paper", "question_set", "set_name"];
    
    for (const col of possibleColumns) {
      if (col in row) return col;
    }
    
    return "";
  }

  function isPostTestValue(v) { 
    // Look for SET_A, SET_B, SET_C values
    const val = String(v || "").toUpperCase().trim();
    return val === "SET_A" || val === "SET_B" || val === "SET_C";
  }

  async function loadQuestions() {
    try {
      console.log("Loading Post Test questions from Supabase...");
      
      // First, let's try to get all columns to see what's available
      let { data: allData, error: allError } = await supabase
        .from('questions')
        .select('*')
        .limit(1);

      if (allError) {
        console.error("Error accessing questions table:", allError);
        return [];
      }

      if (!allData || allData.length === 0) {
        console.log("No data found in questions table, trying soalan table...");
        // Try the soalan table as fallback
        const { data: soalanData, error: soalanError } = await supabase
          .from('soalan')
          .select('*')
          .limit(1);
          
        if (soalanError) {
          console.error("Error accessing soalan table:", soalanError);
          return [];
        }
        
        if (!soalanData || soalanData.length === 0) {
          console.log("No data found in soalan table either");
          return [];
        }
        
        allData = soalanData;
      }

      console.log("Available columns:", Object.keys(allData[0] || {}));
      
      // Try different possible column names for post test questions
      const possibleColumns = ['scaler_text', 'question_type', 'type', 'category', 'soalan_set', 'set', 'title', 'jenis', 'paper', 'question_set', 'set_name'];
      let filterColumn = null;
      let filterValue = null;
      
      console.log("Checking columns for Post Test detection...");
      console.log("Sample row data:", allData[0]);
      
      // First, try to find a column that contains Post_Test or similar values
      for (const col of possibleColumns) {
        if (allData[0] && allData[0][col] !== undefined && allData[0][col] !== null) {
          const value = String(allData[0][col]).toUpperCase().trim();
          console.log(`Checking column ${col}: value="${allData[0][col]}" -> normalized="${value}"`);
          if (value.includes('POST') || value.includes('POST_TEST') || value.includes('POSTTEST')) {
            filterColumn = col;
            filterValue = allData[0][col];
            console.log(`Found Post Test filter column: ${col} with value: ${allData[0][col]}`);
            break;
          }
        }
      }
      
      // If no Post_Test column found, look for SET_A, SET_B, SET_C values
      if (!filterColumn) {
        console.log("No Post Test column found, checking for SET values...");
        for (const col of possibleColumns) {
          if (allData[0] && allData[0][col] !== undefined && allData[0][col] !== null) {
            const value = String(allData[0][col]).toUpperCase().trim();
            console.log(`Checking column ${col}: value="${allData[0][col]}" -> normalized="${value}"`);
            if (value === 'SET_A' || value === 'SET_B' || value === 'SET_C') {
              filterColumn = col;
              filterValue = allData[0][col];
              console.log(`Found SET filter column: ${col} with value: ${allData[0][col]}`);
              break;
            }
          }
        }
      }
      
      // If still no filter found, check if we have soalan_set with SET values
      if (!filterColumn && allData[0].soalan_set) {
        console.log("Found soalan_set column, checking for SET_A, SET_B, SET_C values...");
        filterColumn = 'soalan_set';
        filterValue = 'SET_A'; // Look for SET values
        console.log(`Using soalan_set column to look for SET values`);
      }
      
      if (!filterColumn) {
        console.log("No suitable filter column found, fetching all questions");
        const tableName = allData[0] && allData[0].id ? 'questions' : 'soalan';
        const { data: questionData, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(90); // Limit to 90 total questions (30 per set)
          
      if (error) {
          console.error("Error fetching all questions:", error);
        return [];
      }
        
        return processQuestionsFromDatabase(questionData || []);
      }
      
      // Determine which table to use
      const tableName = allData[0] && allData[0].id ? 'questions' : 'soalan';
      console.log(`Using table: ${tableName}`);
      console.log(`Filter column: ${filterColumn}`);
      console.log(`Filter value: ${filterValue}`);
      
      // Fetch questions with the found filter column
      let questionData;
      if (filterValue && (String(filterValue).toUpperCase().includes('POST') || String(filterValue).toUpperCase().includes('POST_TEST'))) {
        // If it's a Post_Test column, filter by that value
        console.log(`Fetching Post Test questions with ${filterColumn} = ${filterValue}`);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq(filterColumn, filterValue)
          .limit(90);
          
        if (error) {
          console.error("Error fetching Post Test questions:", error);
          return [];
        }
        questionData = data;
        console.log(`Found ${questionData ? questionData.length : 0} Post Test questions`);
      } else if (filterValue === 'SET_A') {
        // Special case: fetch all SET_A, SET_B, SET_C questions
        console.log(`Fetching SET questions with ${filterColumn} IN ['SET_A', 'SET_B', 'SET_C']`);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .in(filterColumn, ['SET_A', 'SET_B', 'SET_C'])
          .limit(90);
          
        if (error) {
          console.error("Error fetching SET questions:", error);
          return [];
        }
        questionData = data;
        console.log(`Found ${questionData ? questionData.length : 0} SET questions`);
      } else {
        // If it's a SET column, fetch all SET_A, SET_B, SET_C questions
        console.log(`Fetching SET questions with ${filterColumn} IN ['SET_A', 'SET_B', 'SET_C']`);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .in(filterColumn, ['SET_A', 'SET_B', 'SET_C'])
          .limit(90);
          
        if (error) {
          console.error("Error fetching SET questions:", error);
          return [];
        }
        questionData = data;
        console.log(`Found ${questionData ? questionData.length : 0} SET questions`);
      }
      
      if (!questionData || questionData.length === 0) {
        console.log("No Post Test questions found in database");
        console.log("Available columns in first row:", allData[0] ? Object.keys(allData[0]) : "No data");
        console.log("Sample row data:", allData[0]);
        return [];
      }
      
      console.log(`Found ${questionData.length} Post Test questions`);
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
      const id = `post-test-${question.id}`;
      
      // Extract set information from the database
      const setValue = (
        question.set || 
        question.soalan_set || 
        question.paper || 
        question.question_set || 
        question.set_name ||
        question.scaler_text ||
        question.question_type ||
        question.type ||
        question.category ||
        "SET_A"  // Default fallback
      ).toString().trim().toUpperCase();
      
              // Check if this is the new schema with question_text_en and question_text
        if (question.question_text_en && question.question_text) {
          // New schema - similar to pre-test
          
          // Create bilingual question text
          const bilingualText = `${question.question_text}\n${question.question_text_en}`;
          
          // Create bilingual choices
          const bilingualChoices = [];
          const options = ['option_a', 'option_b', 'option_c', 'option_d'];
          const optionsEn = ['option_a_en', 'option_b_en', 'option_c_en', 'option_d_en'];
          
          for (let j = 0; j < 4; j++) {
            const malayOption = question[options[j]];
            const englishOption = question[optionsEn[j]];
            
            if (malayOption && englishOption) {
              bilingualChoices.push(`${malayOption}\n${englishOption}`);
            } else if (malayOption) {
              bilingualChoices.push(malayOption);
            } else if (englishOption) {
              bilingualChoices.push(englishOption);
            }
          }
          
          // Only add if we have at least 2 valid choices
          if (bilingualChoices.length >= 2) {
            processedQuestions.push({
              id,
              raw: question,
              text: bilingualText,
              choices: bilingualChoices,
              set: setValue,
              correctAnswer: question.correct_option || question.correct_option_en
            });
          }
        } else {
        // Old schema - use the existing logic
      
      // Question text sources (BM + EN or single)
        const q_ms = firstText(question, [
        "soalan_bm","soalan_ms","soalan_malay","question_ms","question_bm","bm_question","ms_question",
      ]);
        const q_en = firstText(question, [
        "soalan_en","question_en","english_question","en_question",
      ]);
        const q_single = firstText(question, [
        "soalan","question_text","text","pertanyaan","ques","question",
      ]);
      const text = combineBi(q_ms, q_en, q_single) || "(Tiada teks soalan | No question text)";

      // Choices A-D (each: prefer BM+EN columns; fallback to single; keep bilingual if already in single)
      const a = combineBi(
          firstText(question, ["pilihan_a_bm","choice_a_bm","a_bm","option_a_bm","jawapan_a_bm","answer_a_bm"]),
          firstText(question, ["pilihan_a_en","choice_a_en","a_en","option_a_en","jawapan_a_en","answer_a_en"]),
          firstText(question, ["pilihan_a","choice_a","a","option_a","jawapan_a","answer_a"])
      );
      const b = combineBi(
          firstText(question, ["pilihan_b_bm","choice_b_bm","b_bm","option_b_bm","jawapan_b_bm","answer_bbm"]),
          firstText(question, ["pilihan_b_en","choice_b_en","b_en","option_b_en","jawapan_b_en","answer_ben"]),
          firstText(question, ["pilihan_b","choice_b","b","option_b","jawapan_b","answer_b"])
      );
      const c = combineBi(
          firstText(question, ["pilihan_c_bm","choice_c_bm","c_bm","option_c_bm","jawapan_c_bm","answer_c_bm"]),
          firstText(question, ["pilihan_c_en","choice_c_en","c_en","option_c_en","jawapan_c_en","answer_c_en"]),
          firstText(question, ["pilihan_c","choice_c","c","option_c","jawapan_c","answer_c"])
      );
      const d = combineBi(
          firstText(question, ["pilihan_d_bm","choice_d_bm","d_bm","option_d_bm","jawapan_d_bm","answer_d_bm"]),
          firstText(question, ["pilihan_d_en","choice_d_en","d_en","option_d_en","jawapan_d_en","answer_d_en"]),
          firstText(question, ["pilihan_d","choice_d","d","option_d","jawapan_d","answer_d"])
      );

      const choices = [a,b,c,d].filter(v => v != null && String(v).trim() !== "");

        if (choices.length >= 2) {
          processedQuestions.push({ 
            id, 
            raw: question, 
            text, 
            choices, 
            set: setValue,
            correctAnswer: question.correct_option || question.correct_option_en
          });
        }
      }
    }
    
    return processedQuestions;
  }

  async function ensureSession(userId, selectedSet, qs) {
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

    const { data: existing, error: existingError } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("quiz_key", QUIZ_KEY)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing session:", existingError);
      throw existingError;
    }

    if (!existing) {
      const started = new Date();
      const expires = new Date(started.getTime() + DURATION_MINUTES * 60 * 1000);
      const initAnswers = {};
      for (const q of qs) initAnswers[q.id] = null;

      // Store selected set in answers object as a special key
      initAnswers._selected_set = selectedSet;

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
        .maybeSingle();

      if (insErr) {
        console.error("Error creating session:", insErr);
        throw new Error(insErr.message);
      }
      return created;
    }
    return existing;
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
    if (!sessionId) return qs; // fallback: no shuffle if session missing
    const seed = xfnv1aHash(`${sessionId}|${QUIZ_KEY}`);
    const rng = mulberry32(seed);
    const a = qs.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ===== set selection =====
  const handleSetSelection = async (setNumber) => {
    try {
      setLoading(true);
      setSelectedSet(setNumber);
      
      // Load questions from database for the selected set
      const { data: questionData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('soalan_set', setNumber)
        .limit(30);
        
      if (error) {
        console.error("Error fetching questions for set:", error);
        throw error;
      }
      
      // Process the questions
      const processedQuestions = processQuestionsFromDatabase(questionData || []);
      
      // Filter questions for the selected set (case-insensitive comparison)
      const filteredQuestions = processedQuestions
        .filter(q => q.set && q.set.toString().trim().toUpperCase() === setNumber.toString().trim().toUpperCase())
        .slice(0, 30); // Limit to 30 questions
      
      // Create or update session
      const sess = await ensureSession(user?.id, setNumber, filteredQuestions);
      setSession(sess);
      
      // Deterministically randomize order per user (seeded by session id)
      const ordered = orderQuestions(filteredQuestions, sess?.id);
      setQuestions(ordered);
      
      // Initialize answers
      const initAnswers = {};
      for (const q of ordered) initAnswers[q.id] = null;
      setAnswers(initAnswers);
      
      // Start timer
      if (sess?.expires_at) {
        const expiry = new Date(sess.expires_at).getTime();
        // Clear any existing timer
        if (timerRef.current) clearInterval(timerRef.current);
        
        const tick = () => {
          const now = Date.now();
          const remain = Math.max(0, Math.floor((expiry - now) / 1000));
          setRemaining(remain);
        };
        tick();
        const int = setInterval(tick, 1000);
        timerRef.current = int;
      }
    } catch (e) {
      console.error("Set selection error:", e);
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const isSubmitted = session?.status === "submitted";

  // autosave (debounced)
  const saveTimer = useRef(null);
  function scheduleSave(nextAnswers) {
    if (!user?.id || !session) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        // Include selected set in answers for persistence
        const answersToSave = {
          ...nextAnswers,
          _selected_set: selectedSet
        };
        
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
      } catch (e) {
        console.error("Autosave error:", e);
        setErr(`Autosave gagal: ${String(e.message || e)}`);
      }
    }, 400);
  }

  function setCurrentIndex(newIdx) {
    const bounded = Math.max(0, Math.min(newIdx, questions.length - 1));
    setIdx(bounded);
    const qid = questions[bounded]?.id;
    if (qid) setVisited((s) => new Set(s).add(qid));
  }

  function selectAnswer(qid, letter) {
    if (isSubmitted) return; // lock after submit (no changes, no marks shown)
    const next = { ...(answers || {}), [qid]: letter };
    setAnswers(next);
    scheduleSave(next);
  }

  // ===== bilingual rendering (Malay first line, English next)
  function renderBilingual(text) {
    if (text == null) return <Text style={{ color: GOLD }}>—</Text>;

    // Normalize different bilingual separators
    const normalizedText = String(text)
      .replace(/\r\n/g, "\n")
      .replace(/\|/g, "\n")
      .trim();

    const parts = normalizedText.split("\n");
    const ms = parts[0]?.trim();
    const en = parts[1]?.trim() || (parts.length > 1 ? parts.slice(1).join(" ") : null);

    return (
      <View>
        {!!ms && <Text style={{ color: GOLD, fontWeight: "700" }}>{ms}</Text>}
        {!!en && <Text style={{ color: "#c9c0aa", fontStyle: "italic" }}>{en}</Text>}
      </View>
    );
  }

  // ===== score calculation =====
  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = 0;

    questions.forEach(question => {
      totalQuestions++;
      
      // Get user's answer for this question
      const userAnswer = answers?.[question.id];
      
      // Get correct answer - try multiple possible field names
      const correctAnswer = question.raw?.correct_option || 
                           question.raw?.correct_option_en ||
                           question.raw?.correct_answer ||
                           question.correctAnswer;
      
      // Debug logging to help identify the issue
      const isCorrect = userAnswer && correctAnswer && userAnswer === correctAnswer;
      console.log(`Question ${question.id}:`, {
        userAnswer: `"${userAnswer}"`,
        correctAnswer: `"${correctAnswer}"`,
        userAnswerType: typeof userAnswer,
        correctAnswerType: typeof correctAnswer,
        isCorrect,
        questionText: question.text?.substring(0, 50) + '...',
        rawCorrectOption: question.raw?.correct_option,
        rawCorrectOptionEn: question.raw?.correct_option_en,
        rawCorrectAnswer: question.raw?.correct_answer,
        questionCorrectAnswer: question.correctAnswer
      });
      
      // Check if answer is correct
      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correctAnswers++;
      }
    });

    console.log(`Score calculation: ${correctAnswers}/${totalQuestions}`);
    
    // Log all correct answers for verification
    const correctQuestions = [];
    const incorrectQuestions = [];
    
    questions.forEach(question => {
      const userAnswer = answers?.[question.id];
      const correctAnswer = question.raw?.correct_option || 
                           question.raw?.correct_option_en ||
                           question.raw?.correct_answer ||
                           question.correctAnswer;
      
      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correctQuestions.push({
          id: question.id,
          userAnswer,
          correctAnswer,
          questionText: question.text?.substring(0, 50) + '...'
        });
      } else {
        incorrectQuestions.push({
          id: question.id,
          userAnswer,
          correctAnswer,
          questionText: question.text?.substring(0, 50) + '...'
        });
      }
    });
    
    console.log("CORRECT ANSWERS:", correctQuestions);
    console.log("INCORRECT ANSWERS:", incorrectQuestions);
    
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
      
      console.log("=== POST TEST QUIZ SUBMISSION DEBUG ===");
      console.log("Comprehensive Score:", comprehensiveScore);
      console.log("Answers:", answers);
      console.log("Session ID:", session.id);
      
      // Include selected set in answers for persistence
      const answersToSave = {
        ...answers,
        _selected_set: selectedSet
      };
      
      console.log("Updating quiz_sessions with score:", comprehensiveScore.score);
      
      const { error } = await supabase
        .from("quiz_sessions")
        .update({
          answers: answersToSave,
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
        "Tahniah! Anda telah berjaya menyelesaikan kuiz Post Test.\n\nCongratulations! You have successfully completed the Post Test quiz.",
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
    () => questions.filter(q => !answers || answers[q.id] == null).length,
    [questions, answers]
  );
  const allAnswered = unansweredCount === 0 && questions.length > 0;
  

  // Get available sets from raw questions (for set selection screen)
  const availableSets = useMemo(() => {
    if (questions.length === 0) {
      // If no questions loaded yet, return default sets
      return ['SET_A', 'SET_B', 'SET_C'];
    }
    
    const setMap = new Map(); // key: normalized set string, value: original set string
    questions.forEach(q => {
      if (q.set) {
        const normalized = q.set.toString().trim().toUpperCase();
        if (!setMap.has(normalized)) {
          setMap.set(normalized, q.set.toString());
        }
      }
    });
    return Array.from(setMap.values()).sort();
  }, [questions]);

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
      </View>
    );
  }

  // tile color logic: White (never opened), Yellow (visited but no answer), Green (answered)
  function tileColors(q) {
    const id = q.id;
    const ans = answers?.[id];
    if (ans) return { bg: GREEN, border: "rgba(0,0,0,0.45)" };
    if (visited.has(id)) return { bg: YELLOW, border: "rgba(0,0,0,0.35)" };
    return { bg: WHITE, border: "rgba(0,0,0,0.25)" };
  }

  // ===== Set Selection Screen =====
  if (!selectedSet && !isSubmitted) {
    return (
      <LuxuryShell title="Post Test — Kuiz | Quiz" onSignOut={onSignOut}>
        <View style={styles.stateBox}>
          <Text style={styles.setSelectionTitle}>
            Sila Pilih Set Soalan | Please Select Question Set
          </Text>
          <Text style={styles.setSelectionSubtitle}>
            Pilih salah satu set soalan Post Test | Choose one Post Test question set
          </Text>
          
          <View style={styles.setContainer}>
            {availableSets.map(set => (
              <TouchableOpacity
                key={set}
                style={styles.setButton}
                onPress={() => handleSetSelection(set)}
                disabled={loading}
              >
                <MaterialCommunityIcons name="file-document-outline" size={24} color={GOLD} />
                <Text style={styles.setButtonText}>Set {set.replace('SET_', '')}</Text>
                {loading && <ActivityIndicator color={GOLD} style={styles.setButtonLoader} />}
              </TouchableOpacity>
            ))}
          </View>
          
          {!!err && (
            <View style={styles.errBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={RED} />
              <Text style={{ color: RED, fontWeight: "700" }}>{err}</Text>
            </View>
          )}
        </View>
      </LuxuryShell>
    );
  }

  return (
    <LuxuryShell title="Post Test — Kuiz | Quiz" onSignOut={onSignOut}>
      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.stateTxt}>Memuat kuiz… | Loading quiz…</Text>
        </View>
      ) : !questions.length ? (
        <View style={styles.stateBox}>
          <MaterialCommunityIcons name="file-question-outline" size={22} color={GOLD} />
          <Text style={styles.stateTxt}>
            Tiada soalan "Post Test" ditemui. Pastikan import ada lajur
            <Text style={{ fontWeight: "800" }}> soalan_set / set / title / jenis</Text> bernilai "SET_A", "SET_B", atau "SET_C".{"\n"}
            No "Post Test" questions found. Ensure your import has one of the columns above with value "SET_A", "SET_B", or "SET_C".
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
          {/* Top controls */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.9}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={GOLD} />
              <Text style={styles.backTxt}>Kembali | Back</Text>
            </TouchableOpacity>

            <CountdownBadge />

            {/* Submit (disabled until all answered; still auto-submit at timeout) */}
            <TouchableOpacity
              disabled={isSubmitted || !allAnswered}
              onPress={() => {
                if (isSubmitted) return;
                if (!allAnswered) {
                  Alert.alert(
                    "Belum Lengkap | Incomplete",
                    "Sila jawab semua soalan sebelum menghantar.\nPlease answer all questions before submitting."
                  );
                  return;
                }
                setShowSubmitConfirm(true);
              }}
              style={[
                styles.submitBtn,
                (isSubmitted || !allAnswered) && { opacity: 0.45 }
              ]}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons name="send-check-outline" size={18} color={GOLD} />
              <Text style={styles.backTxt}>
                {isSubmitted ? "Sudah Dihantar | Submitted" : allAnswered ? "Hantar | Submit" : "Lengkapkan Dulu | Complete First"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lock & error banners */}
          {session?.status === "submitted" && (
            <View style={styles.lockBanner}>
              <MaterialCommunityIcons name="lock-check-outline" size={18} color={GOLD} />
              <Text style={{ color: GOLD, fontWeight: "700" }}>
                Penyerahan telah dibuat (Satu kali sahaja dibenarkan){"\n"}
                Submission already made (Only one attempt allowed)
              </Text>
            </View>
          )}
          {!!err && (
            <View style={styles.errBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={RED} />
              <Text style={{ color: RED, fontWeight: "700" }}>{err}</Text>
            </View>
          )}

          {/* Selected set indicator */}
          {selectedSet && (
            <View style={styles.setIndicator}>
              <MaterialCommunityIcons name="file-document-outline" size={16} color={GOLD} />
              <Text style={styles.setIndicatorText}>
                Set Soalan | Question Set: {selectedSet.replace('SET_', '')}
              </Text>
            </View>
          )}

          {/* Question count indicator */}
          <View style={styles.questionCount}>
            <Text style={styles.questionCountText}>
              Jumlah Soalan: {questions.length} | Total Questions: {questions.length}
            </Text>
          </View>

          {/* Compact Navigator Grid (tiny status tiles) */}
          <View style={styles.navWrap}>
            <Text style={styles.navTitle}>Status Soalan | Question Status</Text>
            <View style={styles.compactGrid}>
              {questions.map((q, i) => {
                const { bg, border } = tileColors(q);
                const isCurrent = i === idx;
                return (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => setCurrentIndex(i)}
                    activeOpacity={0.8}
                    style={[
                      styles.compactTile,
                      { backgroundColor: bg, borderColor: isCurrent ? "#000" : border },
                    ]}
                  >
                    <Text style={styles.compactNum}>{i + 1}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
              {renderBilingual(current.text)}

              <View style={{ marginTop: 12, gap: 10 }}>
                {current.choices.length ? (
                  current.choices.map((c, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const selected = (answers?.[current.id] ?? null) === letter;
                    return (
                      <TouchableOpacity
                        key={i}
                        disabled={isSubmitted} // lock after submit (no changing answers, no marks shown)
                        onPress={() => selectAnswer(current.id, letter)}
                        style={[
                          styles.choiceBtn,
                          selected && { borderColor: GOLD, backgroundColor: "rgba(233,221,196,0.08)" }
                        ]}
                        activeOpacity={0.9}
                      >
                        <Text style={[styles.choiceLetter, selected && { color: GOLD }]}>{letter}.</Text>
                        <View style={{ flex: 1 }}>{renderBilingual(c)}</View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={{ color: GOLD, opacity: 0.7 }}>(Pilihan jawapan tiada | No choices)</Text>
                )}
              </View>

              {/* Prev / Next — BIG & OBVIOUS */}
              <View style={styles.pagerRow}>
                <TouchableOpacity
                  onPress={() => setCurrentIndex(idx - 1)}
                  disabled={idx === 0}
                  style={[
                    styles.pagerBtn,
                    idx === 0 && { opacity: 0.4 }
                  ]}
                  activeOpacity={0.9}
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
                >
                  <Text style={styles.pagerTxt}>Seterusnya | Next</Text>
                  <MaterialCommunityIcons name="chevron-right" size={26} color={GOLD} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubmitConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hantar Kuiz | Submit Quiz</Text>
            <Text style={styles.modalMessage}>
              Anda pasti mahu hantar jawapan sekarang?{'\n'}
              Are you sure you want to submit now?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSubmitConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Batal | Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={() => {
                  setShowSubmitConfirm(false);
                  handleSubmit(false);
                }}
              >
                <Text style={styles.submitButtonText}>Hantar | Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LuxuryShell>
  );
}

/* ——— styles ——— */
const TILE_SIZE_S = 26; // tiny indicators
const TILE_GAP_S  = 6;

const styles = StyleSheet.create({
  stateBox: {
    backgroundColor: BG, 
    borderColor: BORDER, 
    borderWidth: 1, 
    borderRadius: 16,
    padding: 18, 
    gap: 10,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  stateTxt: { 
    color: GOLD, 
    lineHeight: 20, 
    textAlign: 'center' 
  },
  
  setSelectionTitle: {
    color: GOLD,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8
  },
  setSelectionSubtitle: {
    color: GOLD,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9
  },
  setContainer: {
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  setButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: BG,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16
  },
  setButtonText: {
    color: GOLD,
    fontWeight: "bold",
    fontSize: 16
  },
  setButtonLoader: {
    marginLeft: 10
  },
  setIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(233,221,196,0.08)",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8
  },
  setIndicatorText: {
    color: GOLD,
    fontWeight: "700"
  },
  questionCount: {
    backgroundColor: "rgba(233,221,196,0.08)",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center"
  },
  questionCountText: {
    color: GOLD,
    fontWeight: "700"
  },

  topRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8,
    backgroundColor: BG, 
    borderColor: BORDER, 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingVertical: 8, 
    paddingHorizontal: 12,
  },
  submitBtn: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8,
    backgroundColor: "#2c2c34",
    borderColor: GOLD,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  backTxt: { 
    color: GOLD, 
    fontWeight: "800" 
  },

  lockBanner: {
    flexDirection: "column", 
    alignItems: "center", 
    gap: 8,
    backgroundColor: "rgba(233,221,196,0.08)", 
    borderColor: BORDER, 
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 10,
    marginHorizontal: 16,
  },
  errBanner: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8,
    backgroundColor: "rgba(255,107,107,0.08)", 
    borderColor: "rgba(255,107,107,0.3)", 
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 10,
    marginHorizontal: 16,
  },

  navWrap: {
    backgroundColor: BG, 
    borderColor: BORDER, 
    borderWidth: 1, 
    borderRadius: 16,
    padding: 10, 
    gap: 6,
    marginHorizontal: 16,
  },
  navTitle: { 
    color: GOLD, 
    fontWeight: "900" 
  },

  // ultra-compact indicator grid
  compactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: TILE_GAP_S,
    justifyContent: 'center',
  },
  compactTile: {
    width: TILE_SIZE_S,
    height: TILE_SIZE_S,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  compactNum: { 
    fontSize: 10, 
    fontWeight: "800" 
  },

  unansweredHint: { 
    color: GOLD, 
    opacity: 0.95, 
    marginTop: 2,
    textAlign: 'center',
  },

  card: {
    backgroundColor: BG, 
    borderColor: BORDER, 
    borderWidth: 1, 
    borderRadius: 16,
    padding: 16, 
    gap: 12,
    marginHorizontal: 16,
  },
  qNo: { 
    color: GOLD, 
    fontWeight: "900" 
  },

  choiceBtn: {
    flexDirection: "row", 
    gap: 8, 
    alignItems: "flex-start",
    borderWidth: 1, 
    borderColor: BORDER, 
    borderRadius: 12, 
    padding: 10,
  },
  choiceLetter: { 
    color: "#c9c0aa", 
    fontWeight: "900", 
    width: 20, 
    textAlign: "right" 
  },

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
    flex: 1,                        // each takes half width
    backgroundColor: "#2c2c34",     // dark block so it pops
    borderColor: GOLD,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,            // taller
    paddingHorizontal: 20,
    gap: 8,
  },
  pagerTxt: {
    color: GOLD,
    fontWeight: "900",
    fontSize: 16,                   // bigger text
    textAlign: "center",
  },

  countdown: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
    borderWidth: 2, 
    borderRadius: 12, 
    paddingVertical: 6, 
    paddingHorizontal: 10,
  },
  countdownTxt: { 
    fontWeight: "800",
    fontSize: 14,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: BG,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: GOLD,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    color: GOLD,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: BORDER,
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: RED,
  },
  cancelButtonText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButtonText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
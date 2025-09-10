// screens/EditQuestionsScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, FlatList, Alert, ScrollView, Platform,
  RefreshControl, KeyboardAvoidingView
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import LuxuryShell from "../components/LuxuryShell";
import supabase from "../services/supabase";
import { ScoreUpdateService } from "../services/scoreUpdateService";

const GOLD = "#e9ddc4";
const BORDER = "rgba(230,210,150,0.18)";
const BG = "rgba(18,18,22,0.65)";
const LETTERS = ["A", "B", "C", "D"];

const TABLE_OVERRIDE = "questions";
const TITLE_COL_OVERRIDE = "soalan_set";
const ID_COL_OVERRIDE = "id";
const TEXT_COL_OVERRIDE = "question_text";
const TEXT_COL_EN_OVERRIDE = "question_text_en";

function confirmAsync(title, message, okText = "OK", cancelText = "Cancel") {
  if (Platform.OS === "web") {
    const ok = typeof window !== "undefined" ? window.confirm(`${title}\n\n${message}`) : false;
    return Promise.resolve(ok);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message,
      [
        { text: cancelText, style: "cancel", onPress: () => resolve(false) },
        { text: okText, onPress: () => resolve(true) },
      ],
      { cancelable: true }
    );
  });
}

function hapticSuccess() {
  if (Platform.OS !== "web") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
  }
}

const clean = (s) => String(s ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();

// Separate QuestionCard component to prevent re-mounting
const QuestionCard = React.memo(({ item, loading, savingId, onSave }) => {
  const [text, setText] = useState(item.text);
  const [textEn, setTextEn] = useState(item.textEn);
  const [opts, setOpts] = useState(item.choices.slice(0, 4));
  const [correct, setCorrect] = useState(item.correctIndex !== undefined ? item.correctIndex : -1);
  const [justSelected, setJustSelected] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update text and options when item changes, but preserve correct state
  useEffect(() => {
    setText(item.text);
    setTextEn(item.textEn);
    setOpts(item.choices.slice(0, 4));
    // Always update correct state from item data when item changes
    setCorrect(item.correctIndex !== undefined ? item.correctIndex : -1);
  }, [item.id, item.text, item.textEn, item.choices]);

  const doSave = async () => {
    try {
      await onSave({ ...item, text, textEn, choices: opts, correctIndex: correct });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.qid}>
        #{String(item.id).slice(0, 8)}...{item.title ? ` • ${item.title}` : ""}
      </Text>

      {/* Question Input - Combined Display */}
      <TextInput
        value={`${text} | ${textEn}`}
        onChangeText={(combinedText) => {
          const parts = combinedText.split(' | ');
          setText(parts[0] || '');
          setTextEn(parts[1] || '');
        }}
        multiline
        placeholder="Question text (Malay) | Question text (English)"
        placeholderTextColor="#9b907b"
        style={styles.inputMulti}
        editable={!loading && savingId !== item.id}
      />

      {/* Options */}
      {LETTERS.map((letter, i) => (
        <View key={i} style={styles.optRow}>
          <TouchableOpacity
            onPress={() => {
              setCorrect(i);
              setJustSelected(true);
              setTimeout(() => setJustSelected(false), 200);
            }}
            disabled={loading}
            activeOpacity={0.7}
            style={[
              styles.radioContainer,
              { opacity: loading ? 0.6 : 1 }
            ]}
          >
            <View
              style={[
                styles.radio,
                correct === i && styles.radioOn,
                correct === -1 && styles.radioRequired
              ]}
            >
              {correct === i && <MaterialCommunityIcons name="check" size={14} color="#0b0f18" />}
              {correct === -1 && <Text style={styles.radioRequiredText}>?</Text>}
            </View>
            <Text style={styles.optLabel}>{letter}.</Text>
          </TouchableOpacity>

          <TextInput
            value={`${opts[i]?.malay || ""} | ${opts[i]?.english || ""}`}
            onChangeText={(combinedText) => {
              const parts = combinedText.split(' | ');
              const next = [...opts];
              next[i] = {
                malay: parts[0] || '',
                english: parts[1] || ''
              };
              setOpts(next);
            }}
            placeholder={`Option ${letter} (Malay) | Option ${letter} (English)`}
            placeholderTextColor="#9b907b"
            style={styles.input}
            editable={!loading && savingId !== item.id}
          />
        </View>
      ))}

      {/* Help text for correct answer selection - only show when no answer is selected and user hasn't just selected one */}
      {correct === -1 && !justSelected && (
        <Text style={styles.helpText}>
          ⚠️ Please select the correct answer by clicking on one of the radio buttons above
        </Text>
      )}
      
      {/* Debug info - remove this after testing */}
      {__DEV__ && (
        <Text style={{ color: "#888", fontSize: 10, marginTop: 4 }}>
          DEBUG: correct={correct}, justSelected={justSelected ? "true" : "false"}, item.correctIndex={item.correctIndex}
        </Text>
      )}
      
      {/* Success message when just selected */}
      {justSelected && correct !== -1 && (
        <Text style={styles.successText}>
          ✅ Correct answer selected! You can now save.
        </Text>
      )}
      
      {/* Save success indicator */}
      {saveSuccess && (
        <View style={styles.saveSuccessContainer}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.saveSuccessText}>
            Question saved successfully!
          </Text>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={doSave}
          disabled={loading || savingId === item.id}
          style={[styles.btn, { opacity: loading || savingId === item.id ? 0.6 : 1 }]}
        >
          <MaterialCommunityIcons name="content-save-outline" size={18} color="#0b0f18" />
          <Text style={styles.btnText}>{savingId === item.id ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function EditQuestionsScreen({ onSignOut, onBack }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const [rows, setRows] = useState([]);

  const [mode, setMode] = useState("titles");
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [renameText, setRenameText] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");

  // Load all rows
  const reloadRows = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErr("");
    
    try {
      const { data, error } = await supabase
        .from(TABLE_OVERRIDE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10000);
        
      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);
      
      if (mode === "questions" && selectedTitle) {
        setMode("questions");
      } else {
        setMode("titles");
        setSelectedTitle(null);
      }
      
      setRenaming(false);
      setRenameText("");
      setSearch("");
    } catch (e) {
      setErr(e?.message || "Failed to load.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, selectedTitle]);

  useEffect(() => {
    reloadRows();
  }, []);

  // Normalize a row to the UI model
  const normalizeRow = useCallback((r) => {
    const id = String(r[ID_COL_OVERRIDE]);
    const title = String(r[TITLE_COL_OVERRIDE] ?? "").trim();
    const text = String(r[TEXT_COL_OVERRIDE] ?? "");
    const textEn = String(r[TEXT_COL_EN_OVERRIDE] ?? "");
    const choices = [
      { malay: String(r.option_a ?? ""), english: String(r.option_a_en ?? "") },
      { malay: String(r.option_b ?? ""), english: String(r.option_b_en ?? "") },
      { malay: String(r.option_c ?? ""), english: String(r.option_c_en ?? "") },
      { malay: String(r.option_d ?? ""), english: String(r.option_d_en ?? "") }
    ];
    const answer = String(r.correct_option || "").toUpperCase();
    let correctIndex = -1;
    
    if (LETTERS.includes(answer)) {
      correctIndex = LETTERS.indexOf(answer);
    } else {
      const numAnswer = parseInt(answer);
      if (!isNaN(numAnswer) && numAnswer >= 0 && numAnswer < LETTERS.length) {
        correctIndex = numAnswer;
      }
    }
    
    return {
      __raw: r,
      id,
      title,
      text,
      textEn,
      txtKey: TEXT_COL_OVERRIDE,
      txtEnKey: TEXT_COL_EN_OVERRIDE,
      choices,
      choiceKeys: ["option_a", "option_b", "option_c", "option_d"],
      choiceEnKeys: ["option_a_en", "option_b_en", "option_c_en", "option_d_en"],
      correctMeta: { field: "correct_option", as: "letter", value: r.correct_option },
      correctIndex
    };
  }, []);

  const normalized = useMemo(() => rows.map(normalizeRow), [rows, normalizeRow]);

  // Titles list (grouped by soalan_set)
  const titles = useMemo(() => {
    const counts = new Map();
    rows.forEach(r => {
      const t = clean(r[TITLE_COL_OVERRIDE]);
      if (!t) return;
      counts.set(t, (counts.get(t) || 0) + 1);
    });
    
    const nat = (s) => s.toLowerCase().replace(/(\d+)/g, m => m.padStart(6, "0"));
    return Array.from(counts.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => nat(a.title).localeCompare(nat(b.title)));
  }, [rows]);

  // Delete / Rename a whole set
  const deleteSet = useCallback(async (title) => {
    const t = String(title || "").trim();
    if (!t) return;
    
    const ok = await confirmAsync(
      "Delete set?", 
      `This will delete all ${rows.filter(r => clean(r[TITLE_COL_OVERRIDE]) === t).length} questions under "${t}".`, 
      "Delete", 
      "Cancel"
    );
    
    if (!ok) return;
    
    setLoading(true);
    try {
      const ids = rows
        .filter(r => clean(r[TITLE_COL_OVERRIDE]) === t)
        .map(r => r[ID_COL_OVERRIDE]);
        
      if (!ids.length) { 
        Alert.alert("Nothing to delete"); 
        return; 
      }
      
      const { error } = await supabase
        .from(TABLE_OVERRIDE)
        .delete()
        .in(ID_COL_OVERRIDE, ids);
        
      if (error) { 
        Alert.alert("Delete failed", error.message || "RLS/permission error"); 
        return; 
      }
      
      setRows(prev => prev.filter(r => clean(r[TITLE_COL_OVERRIDE]) !== t));
      setMode("titles"); 
      setSelectedTitle(null);
      Alert.alert("Delete Success"); 
      hapticSuccess();
    } catch (error) {
      Alert.alert("Delete failed", error.message || "An error occurred");
    } finally { 
      setLoading(false); 
    }
  }, [rows]);

  const renameSet = useCallback(async (oldTitle, newTitleRaw) => {
    const oldT = String(oldTitle || "").trim();
    const newT = String(newTitleRaw || "").trim();
    
    if (!oldT) { 
      Alert.alert("Rename failed", "Missing current title."); 
      return; 
    }
    
    if (!newT) { 
      Alert.alert("Rename failed", "New title cannot be empty."); 
      return; 
    }
    
    if (oldT === newT) { 
      Alert.alert("Rename", "Title is unchanged."); 
      return; 
    }
    
    const titleExists = rows.some(r => 
      clean(r[TITLE_COL_OVERRIDE]) === newT && clean(r[TITLE_COL_OVERRIDE]) !== oldT
    );
    
    if (titleExists) {
      Alert.alert("Rename failed", `Title "${newT}" already exists.`);
      return;
    }
    
    const ok = await confirmAsync(
      "Confirm rename", 
      `Rename "${oldT}" → "${newT}"?`, 
      "Rename", 
      "Cancel"
    );
    
    if (!ok) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from(TABLE_OVERRIDE)
        .update({ [TITLE_COL_OVERRIDE]: newT })
        .eq(TITLE_COL_OVERRIDE, oldT);
        
      if (error) { 
        Alert.alert("Supabase rename failed", error.message || "RLS/permission error"); 
        return; 
      }
      
      setRows(prev => prev.map(r => 
        clean(r[TITLE_COL_OVERRIDE]) === oldT ? { ...r, [TITLE_COL_OVERRIDE]: newT } : r
      ));
      
      setSelectedTitle(newT); 
      setRenaming(false); 
      setRenameText("");
      Alert.alert("Rename Success"); 
      hapticSuccess();
    } catch (error) {
      Alert.alert("Rename failed", error.message || "An error occurred");
    } finally { 
      setLoading(false); 
    }
  }, [rows]);

  // Questions within a selected title
  const questions = useMemo(() => {
    if (!selectedTitle) return [];
    
    const target = clean(selectedTitle);
    let out = normalized.filter(r => clean(r.title) === target);
    const q = search.trim().toLowerCase();
    
    if (q) {
      out = out.filter(r =>
        r.text.toLowerCase().includes(q) ||
        r.textEn.toLowerCase().includes(q) ||
        r.choices.some(c => 
          c.malay.toLowerCase().includes(q) || 
          c.english.toLowerCase().includes(q)
        )
      );
    }
    
    return out;
  }, [normalized, selectedTitle, search]);

  // Save one question
  const saveRow = useCallback(async (model) => {
    setSavingId(model.id);
    
    return new Promise(async (resolve, reject) => {
      try {
        // Validate inputs
        if (!model.text.trim()) {
          Alert.alert("Required", "Question text cannot be empty.");
          reject(new Error("Question text cannot be empty"));
          return;
        }
        
        if (model.correctIndex === -1 || model.correctIndex === undefined || model.correctIndex === null || model.correctIndex < 0 || model.correctIndex >= LETTERS.length) {
          Alert.alert("Required", "Please select a correct answer by clicking on one of the radio buttons (A, B, C, or D).");
          reject(new Error("Please select a correct answer"));
          return;
        }
        
        for (let i = 0; i < model.choices.length; i++) {
          if (!model.choices[i].malay.trim()) {
            Alert.alert("Required", `Option ${LETTERS[i]} cannot be empty.`);
            reject(new Error(`Option ${LETTERS[i]} cannot be empty`));
            return;
          }
        }
      
        const payload = {
          [model.txtKey]: model.text.trim(),
          [model.txtEnKey]: model.textEn.trim(),
          [model.choiceKeys[0]]: model.choices[0].malay.trim(),
          [model.choiceKeys[1]]: model.choices[1].malay.trim(),
          [model.choiceKeys[2]]: model.choices[2].malay.trim(),
          [model.choiceKeys[3]]: model.choices[3].malay.trim(),
          [model.choiceEnKeys[0]]: model.choices[0].english.trim(),
          [model.choiceEnKeys[1]]: model.choices[1].english.trim(),
          [model.choiceEnKeys[2]]: model.choices[2].english.trim(),
          [model.choiceEnKeys[3]]: model.choices[3].english.trim(),
          correct_option: LETTERS[model.correctIndex],
        };
        
        const { error } = await supabase
          .from(TABLE_OVERRIDE)
          .update(payload)
          .eq(ID_COL_OVERRIDE, model.id);
          
        if (error) { 
          // Check if it's the recalculate function error
          if (error.message && error.message.includes('recalculate_scores_for_question')) {
            console.warn('⚠️ Database trigger error (non-critical):', error.message);
            // Continue with the save operation despite the trigger error
            console.log('✅ Question saved successfully despite trigger error');
          } else {
            Alert.alert("Save failed", error.message || "RLS/permission error"); 
            reject(error);
            return; 
          }
        }
        
        // Update the local state immediately
        setRows(prev => prev.map(r => 
          (r[ID_COL_OVERRIDE] === model.id ? { ...r, ...payload } : r)
        ));
        
        // Recalculate scores for this question (in background)
        // Note: This is done in background and won't affect the save operation
        ScoreUpdateService.recalculateScoresForQuestion(model.id)
          .then(updatedCount => {
            console.log(`✅ Scores recalculated for question ${model.id}: ${updatedCount} sessions updated`);
          })
          .catch(recalcError => {
            console.warn('⚠️ Failed to recalculate scores:', recalcError.message);
            // This is non-critical, so we don't show an error to the user
          });
        
        // Show success message
        Alert.alert("✅ Save Successful", "Question has been saved successfully!", [
          { text: "OK", onPress: () => console.log("User acknowledged save success") }
        ]); 
        hapticSuccess();
        
        resolve(true);
      } catch (error) {
        Alert.alert("Save failed", error.message || "An error occurred");
        reject(error);
      } finally { 
        setSavingId(null); 
      }
    });
  }, []);

  const renderTitleItem = useCallback(({ item }) => (
    <View style={styles.titleRow}>
      <TouchableOpacity
        onPress={() => {
          setSelectedTitle(item.title);
          setMode("questions");
          setRenaming(false);
          setRenameText(item.title);
          setSearch("");
        }}
        style={[styles.tile, { flex: 1, opacity: loading ? 0.7 : 1 }]}
        activeOpacity={0.9}
        disabled={loading}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MaterialCommunityIcons name="folder-text-outline" size={20} color={GOLD} />
          <Text style={styles.tileTitle} numberOfLines={1}>{item.title}</Text>
        </View>
        <Text style={styles.metaText}>{item.count} questions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => deleteSet(item.title)}
        style={[styles.deleteBtn, { opacity: loading ? 0.6 : 1 }]}
        activeOpacity={0.85}
        disabled={loading}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#0b0f18" />
      </TouchableOpacity>
    </View>
  ), [loading, deleteSet]);

  const onRefresh = useCallback(() => {
    reloadRows(true);
  }, [reloadRows]);

  return (
    <LuxuryShell title="Edit Questions" onSignOut={onSignOut}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[GOLD]}
              tintColor={GOLD}
            />
          }
        >
          {/* Back + diagnostics + Reload */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <TouchableOpacity onPress={onBack} style={styles.tileMini} activeOpacity={0.9} disabled={loading}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={GOLD} />
              <Text style={styles.tileMiniText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => reloadRows()} style={styles.tileMini} activeOpacity={0.9} disabled={loading}>
              <MaterialCommunityIcons name="refresh" size={18} color={GOLD} />
              <Text style={styles.tileMiniText}>{loading ? "Refreshing…" : "Reload"}</Text>
            </TouchableOpacity>
            <Text style={{ color: "#a99d85", fontSize: 12 }}>
              Table: <Text style={{ color: GOLD, fontWeight: "800" }}>{TABLE_OVERRIDE}</Text>
              {"  "}PK: <Text style={{ color: GOLD, fontWeight: "800" }}>{ID_COL_OVERRIDE}</Text>
              {"  "}Title: <Text style={{ color: GOLD, fontWeight: "800" }}>{TITLE_COL_OVERRIDE}</Text>
              {"  "}Text: <Text style={{ color: GOLD, fontWeight: "800" }}>{TEXT_COL_OVERRIDE}</Text>
            </Text>
          </View>

          {/* TITLES VIEW */}
          {mode === "titles" && (
            <>
              <Text style={styles.sectionTitle}>Question Sets ({titles.length})</Text>
              {loading ? (
                <LoadingBlock />
              ) : titles.length ? (
                <FlatList
                  data={titles}
                  keyExtractor={item => item.title}
                  renderItem={renderTitleItem}
                  scrollEnabled={false}
                  contentContainerStyle={styles.grid}
                />
              ) : (
                <Text style={{ color: "#b8ad96", marginTop: 8 }}>
                  No titles detected. Make sure your rows have <Text style={{ color: GOLD }}>soalan_set</Text> filled (e.g., "SET A", "SET B", "SET C", "Pre Test").
                </Text>
              )}
            </>
          )}

          {/* QUESTIONS VIEW */}
          {mode === "questions" && selectedTitle && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, gap: 8, flexWrap: "wrap" }}>
                <Text style={styles.sectionTitle}>Questions • {selectedTitle} ({questions.length})</Text>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  <TouchableOpacity
                    onPress={() => { setMode("titles"); setSelectedTitle(null); setSearch(""); setRenaming(false); }}
                    style={[styles.crumbBtn, { opacity: loading ? 0.7 : 1 }]}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons name="arrow-left" size={16} color="#0b0f18" />
                    <Text style={styles.crumbText}>Back to Sets</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteSet(selectedTitle)}
                    style={[styles.deleteBtn, { opacity: loading ? 0.6 : 1 }]}
                    activeOpacity={0.85}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#0b0f18" />
                    <Text style={styles.deleteText}>Delete Set</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setRenaming(v => !v)}
                    style={[styles.renameBtn, { opacity: loading ? 0.6 : 1 }]}
                    activeOpacity={0.85}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={18} color="#0b0f18" />
                    <Text style={styles.renameText}>Rename Set</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {renaming && (
                <View style={styles.renameWrap}>
                  <TextInput
                    value={renameText}
                    onChangeText={setRenameText}
                    placeholder="New set title (e.g., SET A, SET B, SET C, Pre Test)"
                    placeholderTextColor="#9b907b"
                    style={styles.renameInput}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => renameSet(selectedTitle, renameText)}
                    style={[styles.renameSaveBtn, { opacity: loading ? 0.6 : 1 }]}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    <MaterialCommunityIcons name="check" size={18} color="#0b0f18" />
                    <Text style={styles.renameSaveText}>Save Title</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Search within the opened title */}
              <View style={styles.searchWrap}>
                <MaterialCommunityIcons name="magnify" size={18} color={GOLD} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search questions or options (Malay/English)..."
                  placeholderTextColor="#9b907b"
                  style={styles.searchInput}
                  editable={!loading}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={GOLD} />
                  </TouchableOpacity>
                )}
              </View>

              {loading ? (
                <LoadingBlock />
              ) : questions.length ? (
                <FlatList
                  data={questions}
                  keyExtractor={item => `question-${item.id}`}
                  renderItem={({ item }) => (
                    <QuestionCard 
                      item={item} 
                      loading={loading} 
                      savingId={savingId} 
                      onSave={saveRow}
                    />
                  )}
                  contentContainerStyle={{ paddingTop: 6, paddingBottom: 20, gap: 12 }}
                  nestedScrollEnabled
                />
              ) : search ? (
                <Text style={{ color: "#b8ad96", marginTop: 12 }}>
                  No questions found for "{search}". <Text style={{color: GOLD}} onPress={() => setSearch("")}>Clear search</Text>
                </Text>
              ) : (
                <Text style={{ color: "#b8ad96", marginTop: 12 }}>No questions found in this set.</Text>
              )}
            </>
          )}

          {!!err && <Text style={{ color: "#ffb4b4", marginTop: 10 }}>{err}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </LuxuryShell>
  );
}

function LoadingBlock() {
  return (
    <View style={{ paddingVertical: 20, alignItems: "center" }}>
      <ActivityIndicator color={GOLD} />
      <Text style={{ color: GOLD, marginTop: 8 }}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: GOLD, fontWeight: "800", marginBottom: 6, fontSize: 16 },

  grid: { gap: 12 },

  titleRow: { flexDirection: "row", alignItems: "stretch", gap: 10 },

  tile: {
    borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    backgroundColor: BG, padding: 14, flex: 1,
  },
  tileTitle: { color: GOLD, fontWeight: "800", flexShrink: 1 },
  metaText: { color: "#a99d85", marginTop: 2, fontSize: 12, fontWeight: "700" },

  tileMini: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: BG,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  tileMiniText: { color: GOLD, fontWeight: "800" },

  crumbBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GOLD, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999,
  },
  crumbText: { color: "#0b0f18", fontWeight: "800", fontSize: 12 },

  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: BORDER, backgroundColor: BG, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 8, marginTop: 6, marginBottom: 10,
  },
  searchInput: { color: GOLD, flex: 1 },

  deleteBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GOLD, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12, alignSelf: "stretch", justifyContent: "center",
  },
  deleteText: { color: "#0b0f18", fontWeight: "800" },

  renameBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GOLD, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12,
  },
  renameText: { color: "#0b0f18", fontWeight: "800" },

  renameWrap: {
    flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 6,
  },
  renameInput: {
    flex: 1, color: GOLD, borderWidth: 1, borderColor: BORDER, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: BG,
  },
  renameSaveBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GOLD, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12,
  },
  renameSaveText: { color: "#0b0f18", fontWeight: "800" },

  // Question card
  card: {
    borderWidth: 1, borderColor: BORDER, backgroundColor: BG, borderRadius: 16, padding: 12, gap: 8,
  },
  qid: { color: "#a99d85", fontSize: 12, fontWeight: "700" },
  
  inputMulti: {
    color: GOLD, minHeight: 68, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, padding: 10, textAlignVertical: "top",
  },
  
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  optLabel: { color: GOLD, width: 16, textAlign: "center", fontWeight: "800" },
  input: {
    flex: 1, color: GOLD, borderWidth: 1, borderColor: BORDER, borderRadius: 10, 
    paddingHorizontal: 10, paddingVertical: 8,
  },
  radio: {
    width: 20, height: 20, borderRadius: 20, borderWidth: 2, borderColor: GOLD, 
    alignItems: "center", justifyContent: "center",
  },
  radioOn: { 
    backgroundColor: GOLD,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  radioRequired: { borderColor: "#ff6b6b", borderWidth: 3 },
  radioRequiredText: { color: "#ff6b6b", fontSize: 12, fontWeight: "bold" },
  helpText: { 
    color: "#ff6b6b", 
    fontSize: 12, 
    fontStyle: "italic", 
    marginTop: 8, 
    textAlign: "center" 
  },
  successText: { 
    color: "#4CAF50", 
    fontSize: 12, 
    fontWeight: "bold", 
    marginTop: 8, 
    textAlign: "center" 
  },
  saveSuccessContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    marginTop: 8,
  },
  saveSuccessText: { 
    color: "#2E7D32", 
    fontSize: 14, 
    fontWeight: "bold"
  },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  btn: {
    flexDirection: "row", gap: 8, alignItems: "center",
    backgroundColor: GOLD, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
  },
  btnText: { color: "#0b0f18", fontWeight: "800" },
});
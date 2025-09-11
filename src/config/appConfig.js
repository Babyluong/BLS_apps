// src/config/appConfig.js
// Centralized configuration for the BLS app

export const APP_CONFIG = {
  // App Information
  APP_NAME: "BLS Training System",
  VERSION: "2.0.0",
  HOSPITAL_NAME: "Hospital Lawas",
  
  // Admin Configuration
  ADMIN: {
    name: "AMRI AMIT",
    ic: "940120126733"
  },
  
  // Database Configuration
  DATABASE: {
    TABLES: {
      PROFILES: "profiles",
      BLS_RESULTS: "bls_results",
      QUIZ_SESSIONS: "quiz_sessions",
      QUESTIONS: "questions",
      JAWATAN_CATEGORIES: "jawatan_categories",
      CHECKLIST_ITEMS: "checklist_items"
    }
  },
  
  // Scoring Configuration
  SCORING: {
    TOTAL_QUESTIONS: 30,
    CLINICAL_PASS_THRESHOLD: 25,
    NON_CLINICAL_PASS_THRESHOLD: 20,
    CLINICAL_GRADES: {
      A: 28,
      B: 26,
      C: 25
    },
    NON_CLINICAL_GRADES: {
      A: 27,
      B: 24,
      C: 21
    }
  },
  
  // Pagination Configuration
  PAGINATION: {
    DEFAULT_RESULTS_PER_PAGE: 20,
    MAX_RESULTS_PER_PAGE: 100,
    RESULTS_PER_PAGE_OPTIONS: [10, 20, 50, 100]
  },
  
  // UI Configuration
  UI: {
    DEBOUNCE_DELAY: 500,
    ANIMATION_DURATION: 300,
    MODAL_ANIMATION: "slide"
  },
  
  // Validation Configuration
  VALIDATION: {
    IC_PATTERN: /^\d{12}$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^[0-9+\-\s()]+$/
  }
};

// Job Positions Configuration - This should eventually be moved to database
export const JOB_POSITIONS = {
  CLINICAL: [
    "PEGAWAI PERUBATAN",
    "PENOLONG PEGAWAI PERUBATAN", 
    "JURURAWAT",
    "JURURAWAT MASYARAKAT",
    "PEMBANTU PERAWATAN KESIHATAN",
    "PEGAWAI PERGIGIAN",
    "JURUTERAPI PERGIGIAN"
  ],
  NON_CLINICAL: [
    "PEGAWAI FARMASI",
    "JURUTEKNOLOGI MAKMAL PERUBATAN",
    "JURUPULIH PERUBATAN CARAKERJA",
    "JURUPULIH FISIOTERAPI",
    "JURU-XRAY",
    "PENOLONG PEGAWAI TADBIR",
    "PEMBANTU KHIDMAT AM",
    "PEMBANTU TADBIR",
    "PEMBANTU PENYEDIAAN MAKANAN",
    "PENOLONG JURUTERA"
  ],
  ALL: [
    "PEGAWAI PERUBATAN",
    "PEGAWAI PERGIGIAN", 
    "PEGAWAI FARMASI",
    "PENOLONG PEGAWAI PERUBATAN",
    "JURURAWAT",
    "PENOLONG PEGAWAI FARMASI",
    "JURUTEKNOLOGI MAKMAL PERUBATAN",
    "JURUPULIH PERUBATAN CARAKERJA",
    "JURUPULIH FISIOTERAPI",
    "JURU-XRAY",
    "PENOLONG PEGAWAI TADBIR",
    "PEMBANTU KHIDMAT AM",
    "PEMBANTU TADBIR",
    "PEMBANTU PERAWATAN KESIHATAN",
    "JURURAWAT MASYARAKAT",
    "PEMBANTU PENYEDIAAN MAKANAN",
    "PENOLONG JURUTERA"
  ]
};

// Work Locations Configuration
export const WORK_LOCATIONS = [
  "Hospital Lawas",
  "KK Lawas", 
  "Hospital Limbang",
  "Klinik Pergigian Lawas"
];

// BLS Years Configuration
export const BLS_YEARS = (() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 2015 + 1 }, (_, i) => String(2015 + i));
})();

export const BLS_OPTIONS = ["Pertama Kali", ...BLS_YEARS];

// Grade Configuration
export const GRADE_CONFIG = {
  UD_GRADES: ["UD 9", "UD 10", "UD 11", "UD 12", "UD 13"],
  UG_GRADES: ["UG 9", "UG 10", "UG 11", "UG 12", "UG 13"], 
  UF_GRADES: ["UF 9", "UF 10", "UF 11", "UF 12", "UF 13"],
  G_U5_7: ["U5", "U6", "U7"],
  G_U1_4: ["U1", "U2", "U3", "U4"],
  G_H1_4: ["H1", "H2", "H3", "H4"],
  G_N1_4: ["N1", "N2", "N3", "N4"],
  G_J5_7: ["J5", "J6", "J7"],
  
  TITLES_U5_7: [
    "PENOLONG PEGAWAI PERUBATAN",
    "JURURAWAT",
    "PENOLONG PEGAWAI FARMASI",
    "JURUTEKNOLOGI MAKMAL PERUBATAN",
    "JURUPULIH PERUBATAN CARAKERJA",
    "JURUPULIH FISIOTERAPI",
    "JURU-XRAY"
  ],
  
  TITLES_H1_4_OR_N1_4: [
    "PENOLONG PEGAWAI TADBIR",
    "PEMBANTU KHIDMAT AM",
    "PEMBANTU TADBIR"
  ],
  
  TITLES_U1_4: [
    "PEMBANTU PERAWATAN KESIHATAN",
    "JURURAWAT MASYARAKAT",
    "PEMBANTU PENYEDIAAN MAKANAN"
  ],
  
  TITLES_J5_7: ["PENOLONG JURUTERA"]
};

// Error Messages Configuration
export const ERROR_MESSAGES = {
  LOGIN: {
    USER_NOT_FOUND: "User not found. Please check your name and IC number.",
    WRONG_CREDENTIALS: "Wrong login credential",
    NETWORK_ERROR: "Network error. Please try again."
  },
  VALIDATION: {
    REQUIRED_FIELD: "This field is required",
    INVALID_IC: "Invalid IC number format",
    INVALID_EMAIL: "Invalid email format",
    INVALID_PHONE: "Invalid phone number format"
  },
  DATABASE: {
    SAVE_ERROR: "Error saving data",
    LOAD_ERROR: "Error loading data",
    UPDATE_ERROR: "Error updating data",
    DELETE_ERROR: "Error deleting data"
  }
};

// Success Messages Configuration
export const SUCCESS_MESSAGES = {
  SAVE: "Data saved successfully",
  UPDATE: "Data updated successfully", 
  DELETE: "Data deleted successfully",
  LOGIN: "Login successful"
};

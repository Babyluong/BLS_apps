// debugLogin.js - Debug script for iOS login issues
import supabase from "./services/supabase";

// Test database connection and user lookup
export const debugLogin = async (name, ic) => {
  console.log("🔍 Starting login debug for:", { name, ic, platform: "iOS" });
  
  try {
    // Test 1: Database connection
    console.log("🧪 Test 1: Database connection");
    const { data: testData, error: testError } = await supabase
      .from("users")
      .select("full_name, ic")
      .limit(3);
    
    if (testError) {
      console.error("❌ Database connection failed:", testError);
      return { success: false, error: "Database connection failed" };
    }
    
    console.log("✅ Database connection successful");
    console.log("📋 Sample data:", testData);
    
    // Test 2: User lookup by IC
    console.log("🧪 Test 2: User lookup by IC");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("full_name, ic, jawatan")
      .eq("ic", ic)
      .single();
    
    console.log("👤 User query result:", { userData, userError });
    
    // Test 3: Staff lookup by IC
    console.log("🧪 Test 3: Staff lookup by IC");
    const { data: staffData, error: staffError } = await supabase
      .from("profiles")
      .select("full_name, ic, role")
      .eq("ic", ic)
      .eq("role", "staff")
      .single();
    
    console.log("👥 Staff query result:", { staffData, staffError });
    
    // Test 4: Name matching
    console.log("🧪 Test 4: Name matching");
    const normalizeString = (str = "") => {
      if (!str) return "";
      return String(str)
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[^\w\s]/g, "")
        .toUpperCase();
    };
    
    const isNameMatch = (inputName, dbName) => {
      if (!inputName || !dbName) return false;
      
      const normalizedInput = normalizeString(inputName);
      const normalizedDb = normalizeString(dbName);
      
      if (normalizedInput === normalizedDb) return true;
      
      const inputParts = normalizedInput.split(" ");
      const dbParts = normalizedDb.split(" ");
      
      for (const inputPart of inputParts) {
        for (const dbPart of dbParts) {
          if (inputPart.length > 2 && dbPart.length > 2 && 
              (inputPart.includes(dbPart) || dbPart.includes(inputPart))) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    const userExists = userData && isNameMatch(name, userData.full_name);
    const staffExists = staffData && isNameMatch(name, staffData.full_name);
    
    console.log("🔍 Name matching result:", {
      inputName: name,
      userDbName: userData?.full_name,
      staffDbName: staffData?.full_name,
      normalizedInput: normalizeString(name),
      normalizedUserDb: userData ? normalizeString(userData.full_name) : null,
      normalizedStaffDb: staffData ? normalizeString(staffData.full_name) : null,
      userExists,
      staffExists
    });
    
    // Test 5: Similar names search
    console.log("🧪 Test 5: Similar names search");
    const { data: similarUsers } = await supabase
      .from("users")
      .select("full_name, ic")
      .ilike("full_name", `%${name.split(' ')[0]}%`)
      .limit(5);
    
    const { data: similarStaff } = await supabase
      .from("profiles")
      .select("full_name, ic")
      .ilike("full_name", `%${name.split(' ')[0]}%`)
      .limit(5);
    
    console.log("🔍 Similar names found:", { similarUsers, similarStaff });
    
    return {
      success: true,
      userExists,
      staffExists,
      userData,
      staffData,
      similarUsers,
      similarStaff
    };
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
    return { success: false, error: error.message };
  }
};

// Test Supabase auth
export const debugAuth = async (email, password) => {
  console.log("🔐 Testing Supabase auth:", { email, password });
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      console.error("❌ Auth failed:", error);
      return { success: false, error: error.message };
    }
    
    console.log("✅ Auth successful:", data);
    return { success: true, data };
    
  } catch (error) {
    console.error("❌ Auth error:", error);
    return { success: false, error: error.message };
  }
};

export default { debugLogin, debugAuth };

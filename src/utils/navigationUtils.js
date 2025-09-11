// src/utils/navigationUtils.js
// Centralized navigation utilities and route management

import { APP_CONFIG } from '../config/appConfig';

// Route definitions with proper navigation hierarchy
export const ROUTES = {
  // Authentication
  LOGIN: 'login',
  
  // Home screens
  ADMIN_HOME: 'adminHome',
  STAFF_HOME: 'staffHome', 
  USER_HOME: 'userHome',
  
  // Admin menu
  ADMIN_MENU: 'adminMenu',
  
  // User management
  ADD_STAFF: 'addStaff',
  ADD_USER: 'addUser',
  LIST_STAFF: 'listStaff',
  LIST_USERS: 'listUsers',
  EDIT_PROFILES: 'editProfiles',
  DELETE_PROFILES: 'deleteProfiles',
  
  // Admin tools
  ADMIN_TOOLS: 'adminTools',
  ACTIVITY_LOGS: 'activityLogs',
  ONE_TAP_IMPORT_USERS: 'oneTapImportUsers',
  
  // Questions management
  IMPORT_QUESTIONS: 'importQuestions',
  EDIT_QUESTIONS: 'editQuestions',
  
  // BLS Test and related
  BLS_TEST: 'blsTest',
  BLS_CHECKLIST: 'blsChecklist',
  BLS_CHECKLIST_EDIT: 'blsChecklistEdit',
  BLS_RESULTS: 'blsResults',
  QUIZ_RESULTS: 'quizResults',
  
  // BLS Test components
  ONE_MAN_CPR: 'oneManCPR',
  TWO_MAN_CPR: 'twoManCPR',
  INFANT_CPR: 'infantCPR',
  ADULT_CHOKING: 'adultChoking',
  INFANT_CHOKING: 'infantChoking',
  
  // Quiz screens
  PRE_TEST_QUESTIONS: 'preTestQuestions',
  POST_TEST_QUESTIONS: 'postTestQuestions'
};

// Navigation hierarchy - defines which screens can navigate to which
export const NAVIGATION_HIERARCHY = {
  [ROUTES.ADMIN_HOME]: [ROUTES.ADMIN_MENU, ROUTES.BLS_CHECKLIST, ROUTES.BLS_RESULTS, ROUTES.BLS_TEST],
  [ROUTES.ADMIN_MENU]: [
    ROUTES.ADD_STAFF, ROUTES.ADD_USER, ROUTES.LIST_STAFF, ROUTES.LIST_USERS,
    ROUTES.EDIT_PROFILES, ROUTES.DELETE_PROFILES, ROUTES.ADMIN_TOOLS, ROUTES.ACTIVITY_LOGS,
    ROUTES.ONE_TAP_IMPORT_USERS, ROUTES.IMPORT_QUESTIONS, ROUTES.EDIT_QUESTIONS
  ],
  [ROUTES.STAFF_HOME]: [ROUTES.BLS_TEST, ROUTES.BLS_CHECKLIST, ROUTES.BLS_RESULTS, ROUTES.QUIZ_RESULTS],
  [ROUTES.USER_HOME]: [ROUTES.BLS_TEST, ROUTES.QUIZ_RESULTS, ROUTES.PRE_TEST_QUESTIONS, ROUTES.POST_TEST_QUESTIONS],
  [ROUTES.BLS_TEST]: [
    ROUTES.PRE_TEST_QUESTIONS, ROUTES.POST_TEST_QUESTIONS, ROUTES.ONE_MAN_CPR, ROUTES.TWO_MAN_CPR,
    ROUTES.INFANT_CPR, ROUTES.ADULT_CHOKING, ROUTES.INFANT_CHOKING, ROUTES.BLS_CHECKLIST
  ]
};

// Role-based access control
export const ROLE_PERMISSIONS = {
  admin: [
    ROUTES.ADMIN_HOME, ROUTES.ADMIN_MENU,
    ROUTES.ADD_STAFF, ROUTES.ADD_USER, ROUTES.LIST_STAFF, ROUTES.LIST_USERS,
    ROUTES.EDIT_PROFILES, ROUTES.DELETE_PROFILES, ROUTES.ADMIN_TOOLS, ROUTES.ACTIVITY_LOGS,
    ROUTES.ONE_TAP_IMPORT_USERS, ROUTES.IMPORT_QUESTIONS, ROUTES.EDIT_QUESTIONS,
    ROUTES.BLS_TEST, ROUTES.BLS_CHECKLIST, ROUTES.BLS_CHECKLIST_EDIT, ROUTES.BLS_RESULTS,
    ROUTES.QUIZ_RESULTS, ROUTES.ONE_MAN_CPR, ROUTES.TWO_MAN_CPR, ROUTES.INFANT_CPR,
    ROUTES.ADULT_CHOKING, ROUTES.INFANT_CHOKING, ROUTES.PRE_TEST_QUESTIONS, ROUTES.POST_TEST_QUESTIONS
  ],
  staff: [
    ROUTES.STAFF_HOME, ROUTES.BLS_TEST, ROUTES.BLS_CHECKLIST, ROUTES.BLS_RESULTS,
    ROUTES.QUIZ_RESULTS, ROUTES.ONE_MAN_CPR, ROUTES.TWO_MAN_CPR, ROUTES.INFANT_CPR,
    ROUTES.ADULT_CHOKING, ROUTES.INFANT_CHOKING, ROUTES.PRE_TEST_QUESTIONS, ROUTES.POST_TEST_QUESTIONS
  ],
  user: [
    ROUTES.USER_HOME, ROUTES.BLS_TEST, ROUTES.QUIZ_RESULTS, ROUTES.PRE_TEST_QUESTIONS, ROUTES.POST_TEST_QUESTIONS
  ]
};

// Screen titles
export const SCREEN_TITLES = {
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.ADMIN_HOME]: 'BLS Administrator',
  [ROUTES.STAFF_HOME]: 'BLS Staff',
  [ROUTES.USER_HOME]: 'BLS User',
  [ROUTES.ADMIN_MENU]: 'Admin Menu',
  [ROUTES.ADD_STAFF]: 'Add Staff',
  [ROUTES.ADD_USER]: 'Add User',
  [ROUTES.LIST_STAFF]: 'List Staff',
  [ROUTES.LIST_USERS]: 'List Users',
  [ROUTES.EDIT_PROFILES]: 'Edit Profiles',
  [ROUTES.DELETE_PROFILES]: 'Delete Profiles',
  [ROUTES.ADMIN_TOOLS]: 'Admin Tools',
  [ROUTES.ACTIVITY_LOGS]: 'Activity Logs',
  [ROUTES.ONE_TAP_IMPORT_USERS]: 'Import Users',
  [ROUTES.IMPORT_QUESTIONS]: 'Import Questions',
  [ROUTES.EDIT_QUESTIONS]: 'Edit Questions',
  [ROUTES.BLS_TEST]: 'BLS Test',
  [ROUTES.BLS_CHECKLIST]: 'BLS Checklist',
  [ROUTES.BLS_CHECKLIST_EDIT]: 'Edit BLS Checklist',
  [ROUTES.BLS_RESULTS]: 'BLS Results',
  [ROUTES.QUIZ_RESULTS]: 'Quiz Results',
  [ROUTES.ONE_MAN_CPR]: 'One Man CPR',
  [ROUTES.TWO_MAN_CPR]: 'Two Man CPR',
  [ROUTES.INFANT_CPR]: 'Infant CPR',
  [ROUTES.ADULT_CHOKING]: 'Adult Choking',
  [ROUTES.INFANT_CHOKING]: 'Infant Choking',
  [ROUTES.PRE_TEST_QUESTIONS]: 'Pre-Test Questions',
  [ROUTES.POST_TEST_QUESTIONS]: 'Post-Test Questions'
};

/**
 * Get the home screen for a given role
 * @param {string} role - User role (admin, staff, user)
 * @returns {string} - Home screen route
 */
export function getHomeScreen(role) {
  switch (role) {
    case 'admin': return ROUTES.ADMIN_HOME;
    case 'staff': return ROUTES.STAFF_HOME;
    case 'user': return ROUTES.USER_HOME;
    default: return ROUTES.USER_HOME;
  }
}

/**
 * Check if a user has permission to access a route
 * @param {string} role - User role
 * @param {string} route - Route to check
 * @returns {boolean} - Whether user has permission
 */
export function hasPermission(role, route) {
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;
  return permissions.includes(route);
}

/**
 * Get the back route for a given screen
 * @param {string} currentRoute - Current screen route
 * @param {string} role - User role
 * @returns {string|null} - Back route or null if no back route
 */
export function getBackRoute(currentRoute, role) {
  // Special cases for direct navigation
  if (currentRoute === ROUTES.ADMIN_MENU) {
    return ROUTES.ADMIN_HOME;
  }
  
  // For admin sub-screens, go back to admin menu
  const adminSubScreens = [
    ROUTES.ADD_STAFF, ROUTES.ADD_USER, ROUTES.LIST_STAFF, ROUTES.LIST_USERS,
    ROUTES.EDIT_PROFILES, ROUTES.DELETE_PROFILES, ROUTES.ADMIN_TOOLS, ROUTES.ACTIVITY_LOGS,
    ROUTES.ONE_TAP_IMPORT_USERS, ROUTES.IMPORT_QUESTIONS, ROUTES.EDIT_QUESTIONS
  ];
  
  if (adminSubScreens.includes(currentRoute)) {
    return ROUTES.ADMIN_MENU;
  }
  
  // For BLS test components, go back to BLS test
  const blsTestComponents = [
    ROUTES.ONE_MAN_CPR, ROUTES.TWO_MAN_CPR, ROUTES.INFANT_CPR,
    ROUTES.ADULT_CHOKING, ROUTES.INFANT_CHOKING, ROUTES.PRE_TEST_QUESTIONS, ROUTES.POST_TEST_QUESTIONS
  ];
  
  if (blsTestComponents.includes(currentRoute)) {
    return ROUTES.BLS_TEST;
  }
  
  // For BLS results, go back to admin menu (for admin) or home (for staff)
  if (currentRoute === ROUTES.BLS_RESULTS) {
    return role === 'admin' ? ROUTES.ADMIN_MENU : getHomeScreen(role);
  }
  
  // For BLS checklist, go back to home
  if (currentRoute === ROUTES.BLS_CHECKLIST) {
    return getHomeScreen(role);
  }
  
  // Default: go to home
  return getHomeScreen(role);
}

/**
 * Get screen title
 * @param {string} route - Route name
 * @returns {string} - Screen title
 */
export function getScreenTitle(route) {
  return SCREEN_TITLES[route] || 'Unknown Screen';
}

/**
 * Validate navigation
 * @param {string} fromRoute - Current route
 * @param {string} toRoute - Target route
 * @param {string} role - User role
 * @returns {Object} - Validation result
 */
export function validateNavigation(fromRoute, toRoute, role) {
  // Check if user has permission to access target route
  if (!hasPermission(role, toRoute)) {
    return {
      valid: false,
      error: 'You do not have permission to access this page.'
    };
  }
  
  // Check if navigation is allowed in hierarchy
  const allowedRoutes = NAVIGATION_HIERARCHY[fromRoute] || [];
  if (allowedRoutes.length > 0 && !allowedRoutes.includes(toRoute)) {
    return {
      valid: false,
      error: 'Navigation to this page is not allowed from the current page.'
    };
  }
  
  return { valid: true };
}

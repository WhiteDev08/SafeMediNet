// firebase.ts - Database & Backend Integration Only
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  addDoc
} from 'firebase/firestore';

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

// Security configuration
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';
const ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'SafeMediNetEncryptionSalt2025';
const PASSWORD_SALT_ROUNDS = 100000; // For PBKDF2
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

function validateEncryptionKey() {
  if (!ENCRYPTION_KEY) {
    throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY environment variable is required');
  }
  if (ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }
}

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);

// ============================================================================
// ENCRYPTION & HASHING UTILITIES (Browser-Compatible)
// ============================================================================

/**
 * Converts string to Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Converts Uint8Array to hex string
 */
function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) throw new Error('Invalid hex string');
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

/**
 * Derives encryption key using PBKDF2 (Web Crypto API)
 */
async function deriveEncryptionKey(): Promise<CryptoKey> {
  validateEncryptionKey();
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToUint8Array(ENCRYPTION_KEY),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: stringToUint8Array(ENCRYPTION_SALT),
      iterations: PASSWORD_SALT_ROUNDS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM (Web Crypto API)
 */
export async function encryptData(data: object | string): Promise<string> {
  try {
    validateEncryptionKey();
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key
    const key = await deriveEncryptionKey();
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      stringToUint8Array(text)
    );
    
    // Return IV:ciphertext in hex format
    const encryptedArray = new Uint8Array(encrypted);
    return `${uint8ArrayToHex(iv)}:${uint8ArrayToHex(encryptedArray)}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data using AES-GCM (Web Crypto API)
 */
export async function decryptData(cipherText: string): Promise<any> {
  try {
    validateEncryptionKey();
    const [ivHex, encryptedHex] = cipherText.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid cipher text format');
    }
    
    const iv = hexToUint8Array(ivHex);
    const encrypted = hexToUint8Array(encryptedHex);
    
    // Derive key
    const key = await deriveEncryptionKey();
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decryptedText = new TextDecoder().decode(decrypted);
    
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hashes password using PBKDF2 (Web Crypto API)
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  validateEncryptionKey();
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToUint8Array(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: stringToUint8Array(salt),
      iterations: PASSWORD_SALT_ROUNDS,
      hash: 'SHA-512'
    },
    keyMaterial,
    512 // 64 bytes * 8 bits
  );

  return uint8ArrayToHex(new Uint8Array(derivedBits));
}

/**
 * Generates random salt
 */
export function generateSalt(): string {
  const saltArray = crypto.getRandomValues(new Uint8Array(16));
  return uint8ArrayToHex(saltArray);
}

/**
 * Verifies password against stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const hash = await hashPassword(password, storedSalt);
  return hash === storedHash;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ThreatLevel = "low" | "medium" | "high";
export type UserRole = "doctor" | "nurse" | "patient";

export interface VitalsData {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  bloodGlucose: number;
  weight: number;
  height: number;
}

// ============================================================================
// 1. LOGIN FUNCTION - CALLS /update_login API WITH GLOBAL STATE
// ============================================================================

/**
 * Handles user login with backend integration
 * Verifies password and calls FastAPI /update_login endpoint with global state
 * 
 * @param userId - User ID (e.g., "DOC001", "NURSE001", "PAT001")
 * @param password - Plain text password
 * @param role - User role ("doctor" | "nurse" | "patient")
 * @returns Object with success status and user data if successful
 */
export async function handleLogin(
  userId: string,
  password: string,
  role: UserRole
): Promise<{ success: boolean; userData?: any; error?: string }> {
  try {
    // 1. Get user from Firestore
    const collectionName = role === 'doctor' ? 'doctors' : role === 'nurse' ? 'nurses' : 'patients';
    const userRef = doc(db, collectionName, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();

    // 2. Verify password (now async)
    const passwordCorrect = await verifyPassword(password, userData.hashedPassword, userData.passwordSalt);

    // 3. Call FastAPI /update_login endpoint with global state parameters
    try {
      const response = await fetch(`${BACKEND_URL}/update_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          password_correct: passwordCorrect,
          login_time: new Date().toISOString(),
          role: role,
          // Global state parameters
          global_state :{
          suspicious_password: 0,
          suspicious_time: 0,
          login_suspicion: "low",
          login_message: "No suspicious Activities Found.",
          patient_id: null,
          previous_parameters: {},
          changed_parameters: {},
          total_change: 0,
          change_count: 0,
          timestamp: null
          }
       
        })
      });

      if (!response.ok) {
        console.warn('Backend /update_login failed:', await response.text());
      }
    } catch (backendError) {
      console.warn('Backend /update_login unavailable:', backendError);
      // Continue with login even if backend is down
    }

    // 4. If password correct, update lastLogin
    if (passwordCorrect) {
      await updateDoc(userRef, {
        lastLogin: Timestamp.now()
      });

      return {
        success: true,
        userData: {
          id: userId,
          name: userData.name,
          email: userData.email,
          role: role
        }
      };
    }

    return { success: false, error: 'Invalid password' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// ============================================================================
// 2. NURSE VITALS UPDATE - CALLS /update_vitals API
// ============================================================================

/**
 * Nurse updates patient vitals and triggers backend agent
 * 
 * Flow:
 * 1. Fetch current vitals from database (becomes previousParameters)
 * 2. Encrypt and store new vitals in database
 * 3. Call FastAPI /update_vitals with both previous and new parameters
 * 
 * @param patientId - Patient ID (e.g., "P-12345")
 * @param nurseId - Nurse ID who is updating (e.g., "NURSE001")
 * @param newVitals - New vital signs to store
 */
export async function nurseUpdateVitals(
  patientId: string,
  nurseId: string,
  newVitals: VitalsData
): Promise<{ success: boolean; error?: string }> {
  try {
    // STEP 1: Fetch current vitals from database (will become previousParameters)
    const patientRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientRef);

    if (!patientDoc.exists()) {
      return { success: false, error: 'Patient not found' };
    }

    const patientData = patientDoc.data();
    
    // Get current vitals (decrypt if exists)
    let previousParameters: VitalsData | null = null;
    if (patientData.vitalsEncrypted) {
      previousParameters = await decryptData(patientData.vitalsEncrypted) as VitalsData;
    } else {
      // If no previous vitals, use default values
      previousParameters = {
        heartRate: 0,
        systolicBP: 0,
        diastolicBP: 0,
        temperature: 0,
        oxygenSaturation: 0,
        respiratoryRate: 0,
        bloodGlucose: 0,
        weight: 0,
        height: 0
      };
    }

    // STEP 2: Encrypt new vitals and update database
    const previousEncrypted = await encryptData(previousParameters);
    const parametersEncrypted = await encryptData(newVitals);

    // Update patient document
    await updateDoc(patientRef, {
      previousVitalsEncrypted: previousEncrypted,
      vitalsEncrypted: parametersEncrypted,
      lastUpdated: Timestamp.now()
    });

    // Store in iomt_data collection for history
    await addDoc(collection(db, 'iomt_data'), {
      patientId: patientId,
      nurseId: nurseId,
      deviceType: 'Manual Update',
      previousParametersEncrypted: previousEncrypted,
      parametersEncrypted: parametersEncrypted,
      timestamp: Timestamp.now()
    });

    // STEP 3: Call FastAPI /update_vitals endpoint with decrypted data
    const payload = {
      patientId: patientId,
      timestamp: new Date().toISOString(),
      previousParameters: previousParameters,
      parameters: newVitals
    };

    try {
      const response = await fetch(`${BACKEND_URL}/update_vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Backend /update_vitals failed:', await response.text());
        return { success: false, error: 'Backend agent trigger failed' };
      }

      console.log('✅ Vitals updated and agent triggered successfully');
      return { success: true };
    } catch (backendError) {
      console.error('Backend /update_vitals error:', backendError);
      return { success: false, error: 'Backend unavailable' };
    }

  } catch (error) {
    console.error('Vitals update error:', error);
    return { success: false, error: 'Failed to update vitals' };
  }
}


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets decrypted vitals for a patient
 */
export async function getPatientVitals(patientId: string): Promise<VitalsData | null> {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientRef);

    if (!patientDoc.exists()) {
      return null;
    }

    const patientData = patientDoc.data();
    
    if (!patientData.vitalsEncrypted) {
      return null;
    }

    return await decryptData(patientData.vitalsEncrypted) as VitalsData;
  } catch (error) {
    console.error('Error getting patient vitals:', error);
    return null;
  }
}

/**
 * Gets patient data by ID
 */
export async function getPatientData(patientId: string): Promise<any | null> {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientRef);

    if (!patientDoc.exists()) {
      return null;
    }

    return { id: patientDoc.id, ...patientDoc.data() };
  } catch (error) {
    console.error('Error getting patient data:', error);
    return null;
  }
}

/**
 * Gets all patients assigned to a nurse
 */
export async function getNursePatients(nurseId: string): Promise<any[]> {
  try {
    const q = query(
      collection(db, 'patients'),
      where('assignedNurse', '==', nurseId)
    );
    
    const querySnapshot = await getDocs(q);
    const patients: any[] = [];

    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });

    return patients;
  } catch (error) {
    console.error('Error getting nurse patients:', error);
    return [];
  }
}

/**
 * Creates new user (doctor/nurse/patient)
 */
export async function createUser(userData: any, role: UserRole): Promise<void> {
  try {
    const collectionName = role === 'doctor' ? 'doctors' : role === 'nurse' ? 'nurses' : 'patients';
    
    // Check if user already exists
    const userRef = doc(db, collectionName, userData.id);
    const existingUser = await getDoc(userRef);
    
    if (existingUser.exists()) {
      throw new Error(`User ID ${userData.id} already exists`);
    }
    
    const salt = generateSalt();
    const hashedPassword = await hashPassword(userData.password, salt);
    
    const userDoc = {
      ...userData,
      hashedPassword,
      passwordSalt: salt,
      role,
      loginAttempts: 0,
      wrongTimeAttempts: 0,
      threatLevel: "low" as ThreatLevel,
      lastLogin: Timestamp.now()
    };
    
    delete userDoc.password;
    delete userDoc.confirmPassword;
    
    await setDoc(doc(db, collectionName, userData.id), userDoc);
    console.log(`${role} created successfully:`, userData.id);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Creates a new doctor
 */
export async function createDoctor(doctorData: any): Promise<void> {
  const userData = {
    id: doctorData.id,
    name: doctorData.name,
    email: doctorData.email,
    department: doctorData.department,
    phone: doctorData.phone,
    password: doctorData.password,
    publicKey: '',
    privateKeyEncrypted: '',
    patients: []
  };
  await createUser(userData, 'doctor');
}

/**
 * Creates a new nurse
 */
export async function createNurse(nurseData: any): Promise<void> {
  const userData = {
    id: nurseData.id,
    name: nurseData.name,
    email: nurseData.email,
    phone: nurseData.phone,
    department: nurseData.department,
    licenseNumber: nurseData.licenseNumber,
    password: nurseData.password,
    assignedPatients: []
  };
  await createUser(userData, 'nurse');
}

/**
 * Creates a new patient
 */
export async function createPatient(patientData: any): Promise<void> {
  const salt = generateSalt();
  const hashedPassword = await hashPassword(patientData.password, salt);
  
  const patientDoc = {
    id: patientData.id,
    name: patientData.name,
    email: patientData.email,
    hashedPassword,
    passwordSalt: salt,
    phone: patientData.phone,
    dob: patientData.dob,
    bloodType: patientData.bloodType,
    assignedDoctor: patientData.assignedDoctor || '',
    assignedNurse: patientData.assignedNurse || '',
    vitalsEncrypted: '',
    previousVitalsEncrypted: '',
    lastUpdated: Timestamp.now()
  };
  
  // Check if patient already exists
  const patientRef = doc(db, 'patients', patientData.id);
  const existingPatient = await getDoc(patientRef);
  
  if (existingPatient.exists()) {
    throw new Error(`Patient ID ${patientData.id} already exists`);
  }
  
  await setDoc(patientRef, patientDoc);
  console.log('Patient created successfully:', patientData.id);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Authentication & Login
  handleLogin,
  
  // Nurse Portal - Vitals Update
  nurseUpdateVitals,
  
  // Data Retrieval
  getPatientVitals,
  getPatientData,
  getNursePatients,
  
  // User Management
  createUser,
  createDoctor,
  createNurse,
  createPatient,
  
  // Encryption Utilities
  encryptData,
  decryptData,
  hashPassword,
  generateSalt,
  verifyPassword
};
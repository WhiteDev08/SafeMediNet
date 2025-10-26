// firebase.ts - Database & Backend Integration
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

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';
const ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'SafeMediNetEncryptionSalt2025';
const PASSWORD_SALT_ROUNDS = 100000;
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

export interface SessionState {
  suspicious_password: number;
  suspicious_time: number;
  login_suspicion: string;
  login_message: string;
  patient_id: string | null;
  previous_parameters: Record<string, any>;
  changed_parameters: Record<string, any>;
  total_change: number;
  change_count: number;
  timestamp: string | null;
}

// ============================================================================
// ENCRYPTION & HASHING UTILITIES
// ============================================================================

function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) throw new Error('Invalid hex string');
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

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

export async function encryptData(data: object | string): Promise<string> {
  try {
    validateEncryptionKey();
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveEncryptionKey();
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      stringToUint8Array(text)
    );
    
    const encryptedArray = new Uint8Array(encrypted);
    return `${uint8ArrayToHex(iv)}:${uint8ArrayToHex(encryptedArray)}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export async function decryptData(cipherText: string): Promise<any> {
  try {
    validateEncryptionKey();
    const [ivHex, encryptedHex] = cipherText.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid cipher text format');
    }
    
    const iv = hexToUint8Array(ivHex);
    const encrypted = hexToUint8Array(encryptedHex);
    const key = await deriveEncryptionKey();
    
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
    512
  );

  return uint8ArrayToHex(new Uint8Array(derivedBits));
}

export function generateSalt(): string {
  const saltArray = crypto.getRandomValues(new Uint8Array(16));
  return uint8ArrayToHex(saltArray);
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  try {
    const hash = await hashPassword(password, storedSalt);
    return hash === storedHash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// ============================================================================
// HELPER: CREATE DEFAULT SESSION STATE
// ============================================================================

function createDefaultSessionState(): SessionState {
  return {
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
  };
}

// ============================================================================
// LOGIN FUNCTION
// ============================================================================

export async function handleLogin(
  userId: string,
  password: string,
  role: UserRole
): Promise<{ success: boolean; userData?: any; error?: string }> {
  try {
    const collectionName = role === 'doctor' ? 'doctors' : role === 'nurse' ? 'nurses' : 'patients';
    const userRef = doc(db, collectionName, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();

    // Verify password with proper error handling
    if (!userData.hashedPassword || !userData.passwordSalt) {
      console.error('Missing password data for user:', userId);
      return { success: false, error: 'User authentication data corrupted' };
    }

    const passwordCorrect = await verifyPassword(password, userData.hashedPassword, userData.passwordSalt);

    const sessionState = userData.session_state || {};

    // Call backend API
    try {
      const response = await fetch(`${BACKEND_URL}/update_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          password_correct: passwordCorrect,
          login_time: new Date().toISOString(),
          role: role,
          global_state:sessionState
        })
      });

      if (!response.ok) {
        console.warn('Backend /update_login failed:', await response.text());
      }
    } catch (backendError) {
      console.warn('Backend /update_login unavailable:', backendError);
    }

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
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// ============================================================================
// NURSE VITALS UPDATE
// ============================================================================

export async function nurseUpdateVitals(
  patientId: string,
  nurseId: string,
  newVitals: VitalsData
): Promise<{ success: boolean; error?: string }> {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientRef);

    if (!patientDoc.exists()) {
      return { success: false, error: 'Patient not found' };
    }

    const patientData = patientDoc.data();
    
    let previousParameters: VitalsData;
    if (patientData.vitalsEncrypted) {
      previousParameters = await decryptData(patientData.vitalsEncrypted) as VitalsData;
    } else {
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

    const previousEncrypted = await encryptData(previousParameters);
    const parametersEncrypted = await encryptData(newVitals);

    await updateDoc(patientRef, {
      previousVitalsEncrypted: previousEncrypted,
      vitalsEncrypted: parametersEncrypted,
      lastUpdated: Timestamp.now()
    });

    await addDoc(collection(db, 'iomt_data'), {
      patientId: patientId,
      nurseId: nurseId,
      deviceType: 'Manual Update',
      previousParametersEncrypted: previousEncrypted,
      parametersEncrypted: parametersEncrypted,
      timestamp: Timestamp.now()
    });

    const payload = {
      patientId: patientId,
      nurseId: nurseId,
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

export async function getPatientVitals(patientId: string): Promise<VitalsData | null> {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientRef);

    if (!patientDoc.exists() || !patientDoc.data().vitalsEncrypted) {
      return null;
    }

    return await decryptData(patientDoc.data().vitalsEncrypted) as VitalsData;
  } catch (error) {
    console.error('Error getting patient vitals:', error);
    return null;
  }
}

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

// ============================================================================
// USER CREATION FUNCTIONS
// ============================================================================

export async function createUser(userData: any, role: UserRole): Promise<void> {
  try {
    const collectionName = role === 'doctor' ? 'doctors' : role === 'nurse' ? 'nurses' : 'patients';
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
      lastLogin: Timestamp.now(),
      session_state: createDefaultSessionState()
    };
    
    delete userDoc.password;
    delete userDoc.confirmPassword;
    
    await setDoc(userRef, userDoc);
    console.log(`${role} created successfully:`, userData.id);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

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

export async function createPatient(patientData: any): Promise<void> {
  try {
    const patientRef = doc(db, 'patients', patientData.id);
    const existingPatient = await getDoc(patientRef);
    
    if (existingPatient.exists()) {
      throw new Error(`Patient ID ${patientData.id} already exists`);
    }
    
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
      lastUpdated: Timestamp.now(),
      session_state: createDefaultSessionState()
    };
    
    await setDoc(patientRef, patientDoc);
    console.log('Patient created successfully:', patientData.id);
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  handleLogin,
  nurseUpdateVitals,
  getPatientVitals,
  getPatientData,
  getNursePatients,
  createUser,
  createDoctor,
  createNurse,
  createPatient,
  encryptData,
  decryptData,
  hashPassword,
  generateSalt,
  verifyPassword
};
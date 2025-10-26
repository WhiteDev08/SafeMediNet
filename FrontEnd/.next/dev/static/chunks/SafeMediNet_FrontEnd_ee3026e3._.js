(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/SafeMediNet/FrontEnd/firebase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// firebase.ts - Database & Backend Integration
__turbopack_context__.s([
    "createDoctor",
    ()=>createDoctor,
    "createNurse",
    ()=>createNurse,
    "createPatient",
    ()=>createPatient,
    "createUser",
    ()=>createUser,
    "db",
    ()=>db,
    "decryptData",
    ()=>decryptData,
    "default",
    ()=>__TURBOPACK__default__export__,
    "encryptData",
    ()=>encryptData,
    "generateSalt",
    ()=>generateSalt,
    "getNursePatients",
    ()=>getNursePatients,
    "getPatientData",
    ()=>getPatientData,
    "getPatientVitals",
    ()=>getPatientVitals,
    "handleLogin",
    ()=>handleLogin,
    "hashPassword",
    ()=>hashPassword,
    "nurseUpdateVitals",
    ()=>nurseUpdateVitals,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/@firebase/app/dist/esm/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
;
;
// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyDu73QqUHWkqAREsQBS-DcBlLMCcHnIXaY"),
    authDomain: ("TURBOPACK compile-time value", "diagnowise-ehr-encryption.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "diagnowise-ehr-encryption"),
    storageBucket: ("TURBOPACK compile-time value", "diagnowise-ehr-encryption.firebasestorage.app"),
    messagingSenderId: ("TURBOPACK compile-time value", "271363443305"),
    appId: ("TURBOPACK compile-time value", "1:271363443305:web:9c60fdeeb1bbebdf3f70f8")
};
const ENCRYPTION_KEY = ("TURBOPACK compile-time value", "SafeMediNet-Ultra-Secure-Key-2025-Must-Be-32-Chars-Long!") || '';
const ENCRYPTION_SALT = ("TURBOPACK compile-time value", "SafeMediNetEncryptionSalt2025") || 'SafeMediNetEncryptionSalt2025';
const PASSWORD_SALT_ROUNDS = 100000;
const BACKEND_URL = ("TURBOPACK compile-time value", "http://127.0.0.1:8000") || 'http://127.0.0.1:8000';
function validateEncryptionKey() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (ENCRYPTION_KEY.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters');
    }
}
// Initialize Firebase
let app;
if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApps"])().length) {
    app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig);
} else {
    app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApps"])()[0];
}
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirestore"])(app);
// ============================================================================
// ENCRYPTION & HASHING UTILITIES
// ============================================================================
function stringToUint8Array(str) {
    return new TextEncoder().encode(str);
}
function uint8ArrayToHex(arr) {
    return Array.from(arr).map((b)=>b.toString(16).padStart(2, '0')).join('');
}
function hexToUint8Array(hex) {
    const matches = hex.match(/.{1,2}/g);
    if (!matches) throw new Error('Invalid hex string');
    return new Uint8Array(matches.map((byte)=>parseInt(byte, 16)));
}
async function deriveEncryptionKey() {
    validateEncryptionKey();
    const keyMaterial = await crypto.subtle.importKey('raw', stringToUint8Array(ENCRYPTION_KEY), 'PBKDF2', false, [
        'deriveBits',
        'deriveKey'
    ]);
    return crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt: stringToUint8Array(ENCRYPTION_SALT),
        iterations: PASSWORD_SALT_ROUNDS,
        hash: 'SHA-256'
    }, keyMaterial, {
        name: 'AES-GCM',
        length: 256
    }, false, [
        'encrypt',
        'decrypt'
    ]);
}
async function encryptData(data) {
    try {
        validateEncryptionKey();
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveEncryptionKey();
        const encrypted = await crypto.subtle.encrypt({
            name: 'AES-GCM',
            iv
        }, key, stringToUint8Array(text));
        const encryptedArray = new Uint8Array(encrypted);
        return `${uint8ArrayToHex(iv)}:${uint8ArrayToHex(encryptedArray)}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}
async function decryptData(cipherText) {
    try {
        validateEncryptionKey();
        const [ivHex, encryptedHex] = cipherText.split(':');
        if (!ivHex || !encryptedHex) {
            throw new Error('Invalid cipher text format');
        }
        const iv = hexToUint8Array(ivHex);
        const encrypted = hexToUint8Array(encryptedHex);
        const key = await deriveEncryptionKey();
        const decrypted = await crypto.subtle.decrypt({
            name: 'AES-GCM',
            iv
        }, key, encrypted);
        const decryptedText = new TextDecoder().decode(decrypted);
        try {
            return JSON.parse(decryptedText);
        } catch  {
            return decryptedText;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}
async function hashPassword(password, salt) {
    validateEncryptionKey();
    const keyMaterial = await crypto.subtle.importKey('raw', stringToUint8Array(password), 'PBKDF2', false, [
        'deriveBits'
    ]);
    const derivedBits = await crypto.subtle.deriveBits({
        name: 'PBKDF2',
        salt: stringToUint8Array(salt),
        iterations: PASSWORD_SALT_ROUNDS,
        hash: 'SHA-512'
    }, keyMaterial, 512);
    return uint8ArrayToHex(new Uint8Array(derivedBits));
}
function generateSalt() {
    const saltArray = crypto.getRandomValues(new Uint8Array(16));
    return uint8ArrayToHex(saltArray);
}
async function verifyPassword(password, storedHash, storedSalt) {
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
function createDefaultSessionState() {
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
async function handleLogin(userId, password, role) {
    try {
        const collectionName = role === 'doctor' ? 'doctors' : role === 'nurse' ? 'nurses' : 'patients';
        const userRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(db, collectionName, userId);
        const userDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(userRef);
        if (!userDoc.exists()) {
            return {
                success: false,
                error: 'User not found'
            };
        }
        const userData = userDoc.data();
        // Verify password with proper error handling
        if (!userData.hashedPassword || !userData.passwordSalt) {
            console.error('Missing password data for user:', userId);
            return {
                success: false,
                error: 'User authentication data corrupted'
            };
        }
        const passwordCorrect = await verifyPassword(password, userData.hashedPassword, userData.passwordSalt);
        const sessionState = userData.session_state || {};
        // Call backend API
        try {
            const response = await fetch(`${BACKEND_URL}/update_login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    password_correct: passwordCorrect,
                    login_time: new Date().toISOString(),
                    role: role,
                    global_state: sessionState
                })
            });
            if (!response.ok) {
                console.warn('Backend /update_login failed:', await response.text());
            }
        } catch (backendError) {
            console.warn('Backend /update_login unavailable:', backendError);
        }
        if (passwordCorrect) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(userRef, {
                lastLogin: __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
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
        return {
            success: false,
            error: 'Invalid password'
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Login failed. Please try again.'
        };
    }
}
async function nurseUpdateVitals(patientId, nurseId, newVitals) {
    try {
        const patientRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(db, 'patients', patientId);
        const patientDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(patientRef);
        if (!patientDoc.exists()) {
            return {
                success: false,
                error: 'Patient not found'
            };
        }
        const patientData = patientDoc.data();
        let previousParameters;
        if (patientData.vitalsEncrypted) {
            previousParameters = await decryptData(patientData.vitalsEncrypted);
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
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(patientRef, {
            previousVitalsEncrypted: previousEncrypted,
            vitalsEncrypted: parametersEncrypted,
            lastUpdated: __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(db, 'iomt_data'), {
            patientId: patientId,
            nurseId: nurseId,
            deviceType: 'Manual Update',
            previousParametersEncrypted: previousEncrypted,
            parametersEncrypted: parametersEncrypted,
            timestamp: __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                console.error('Backend /update_vitals failed:', await response.text());
                return {
                    success: false,
                    error: 'Backend agent trigger failed'
                };
            }
            console.log('✅ Vitals updated and agent triggered successfully');
            return {
                success: true
            };
        } catch (backendError) {
            console.error('Backend /update_vitals error:', backendError);
            return {
                success: false,
                error: 'Backend unavailable'
            };
        }
    } catch (error) {
        console.error('Vitals update error:', error);
        return {
            success: false,
            error: 'Failed to update vitals'
        };
    }
}
async function getPatientVitals(patientId) {
    try {
        const patientRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(db, 'patients', patientId);
        const patientDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(patientRef);
        if (!patientDoc.exists() || !patientDoc.data().vitalsEncrypted) {
            return null;
        }
        return await decryptData(patientDoc.data().vitalsEncrypted);
    } catch (error) {
        console.error('Error getting patient vitals:', error);
        return null;
    }
}
async function getPatientData(patientId) {
    try {
        const patientRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(db, 'patients', patientId);
        const patientDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(patientRef);
        if (!patientDoc.exists()) {
            return null;
        }
        return {
            id: patientDoc.id,
            ...patientDoc.data()
        };
    } catch (error) {
        console.error('Error getting patient data:', error);
        return null;
    }
}
async function getNursePatients(nurseId) {
    try {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(db, 'patients'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('assignedNurse', '==', nurseId));
        const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        const patients = [];
        querySnapshot.forEach((doc)=>{
            patients.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return patients;
    } catch (error) {
        console.error('Error getting nurse patients:', error);
        return [];
    }
}
async function createUser(userData, role) {
    try {
        const collectionName = role === 'doctor' ? 'doctors' : role === 'nurse' ? 'nurses' : 'patients';
        const userRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(db, collectionName, userData.id);
        const existingUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(userRef);
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
            threatLevel: "low",
            lastLogin: __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now(),
            session_state: createDefaultSessionState()
        };
        delete userDoc.password;
        delete userDoc.confirmPassword;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(userRef, userDoc);
        console.log(`${role} created successfully:`, userData.id);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}
async function createDoctor(doctorData) {
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
async function createNurse(nurseData) {
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
async function createPatient(patientData) {
    try {
        const patientRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(db, 'patients', patientData.id);
        const existingPatient = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(patientRef);
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
            lastUpdated: __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now(),
            session_state: createDefaultSessionState()
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(patientRef, patientDoc);
        console.log('Patient created successfully:', patientData.id);
    } catch (error) {
        console.error('Error creating patient:', error);
        throw error;
    }
}
const __TURBOPACK__default__export__ = {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/SafeMediNet/FrontEnd/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/auth.ts - Firebase-connected Authentication
__turbopack_context__.s([
    "ROLE_ROUTES",
    ()=>ROLE_ROUTES,
    "clearStoredUser",
    ()=>clearStoredUser,
    "getStoredUser",
    ()=>getStoredUser,
    "setStoredUser",
    ()=>setStoredUser,
    "validateCredentials",
    ()=>validateCredentials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/firebase.ts [app-client] (ecmascript)");
;
async function validateCredentials(userId, password, role) {
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["handleLogin"])(userId, password, role);
        if (result.success && result.userData) {
            return result.userData;
        }
        return null;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}
function getStoredUser() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const userJson = localStorage.getItem("safemedi_user");
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch  {
            return null;
        }
    }
    return null;
}
function setStoredUser(user) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem("safemedi_user", JSON.stringify(user));
}
function clearStoredUser() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem("safemedi_user");
}
const ROLE_ROUTES = {
    doctor: "/doctor/dashboard",
    patient: "/patient/dashboard",
    nurse: "/nurse/dashboard"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/SafeMediNet/FrontEnd/hooks/use-auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// hooks/use-auth.ts - Firebase-connected Auth Hook
__turbopack_context__.s([
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/lib/auth.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function useAuth() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAuth.useEffect": ()=>{
            // Check for stored user on mount
            const storedUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStoredUser"])();
            setUser(storedUser);
            setIsLoading(false);
        }
    }["useAuth.useEffect"], []);
    /**
   * Login with Firebase authentication
   * @param userId - User ID (e.g., "DOC001", "NURSE001", "PAT001")
   * @param password - Plain text password
   * @param role - User role
   */ const login = async (userId, password, role)=>{
        try {
            setIsLoading(true);
            // Validate against Firebase (also calls backend /update_login)
            const authenticatedUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateCredentials"])(userId, password, role);
            if (authenticatedUser) {
                // Store user and redirect to portal
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setStoredUser"])(authenticatedUser);
                setUser(authenticatedUser);
                router.push(__TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_ROUTES"][role]);
                setIsLoading(false);
                return true;
            }
            setIsLoading(false);
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
            return false;
        }
    };
    /**
   * Signup new user
   * @param userData - User signup data
   * @param role - User role
   */ const signup = async (userData, role)=>{
        try {
            setIsLoading(true);
            // Import createUser from firebase
            const { createUser, createDoctor, createNurse, createPatient } = await __turbopack_context__.A("[project]/SafeMediNet/FrontEnd/firebase.ts [app-client] (ecmascript, async loader)");
            // Create user based on role
            if (role === 'doctor') {
                await createDoctor(userData);
            } else if (role === 'nurse') {
                await createNurse(userData);
            } else if (role === 'patient') {
                await createPatient(userData);
            }
            setIsLoading(false);
            return {
                success: true
            };
        } catch (error) {
            console.error('Signup failed:', error);
            setIsLoading(false);
            return {
                success: false,
                error: error.message || 'Failed to create account. User ID may already exist.'
            };
        }
    };
    /**
   * Logout and clear session
   */ const logout = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearStoredUser"])();
        setUser(null);
        router.push("/");
    };
    /**
   * Check if user has required role
   */ const hasRole = (requiredRole)=>{
        if (!user) return false;
        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(user.role);
        }
        return user.role === requiredRole;
    };
    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        hasRole
    };
}
_s(useAuth, "tZTulkvxNCIy72YUhaDqXHUCOtk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/SafeMediNet/FrontEnd/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/node_modules/lucide-react/dist/esm/icons/user-plus.js [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/SafeMediNet/FrontEnd/hooks/use-auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function LoginPage() {
    _s();
    const { login, signup, isLoading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("login");
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("doctor");
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Login form state
    const [loginUserId, setLoginUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loginPassword, setLoginPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Signup form state
    const [signupData, setSignupData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        id: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        department: "",
        licenseNumber: "",
        dob: "",
        bloodType: "",
        assignedDoctor: "",
        assignedNurse: "" // for patients
    });
    const handleLogin = async (e)=>{
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);
        try {
            const success = await login(loginUserId, loginPassword, role);
            if (!success) {
                setError("Invalid credentials. Please check your User ID and password.");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Login failed. Please try again.");
            setIsLoading(false);
        }
    };
    const handleSignup = async (e)=>{
        e.preventDefault();
        setError("");
        setSuccess("");
        // Validate passwords match
        if (signupData.password !== signupData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        // Validate password strength
        if (signupData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setIsLoading(true);
        try {
            const result = await signup(signupData, role);
            if (result.success) {
                setSuccess(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully! Redirecting...`);
                // Clear form
                setSignupData({
                    id: "",
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phone: "",
                    department: "",
                    licenseNumber: "",
                    dob: "",
                    bloodType: "",
                    assignedDoctor: "",
                    assignedNurse: ""
                });
                // Switch to login after 2 seconds
                setTimeout(()=>{
                    setMode("login");
                    setSuccess("");
                }, 2000);
            } else {
                setError(result.error || "Signup failed. Please try again.");
            }
            setIsLoading(false);
        } catch (err) {
            setError("Signup failed. Please try again.");
            setIsLoading(false);
        }
    };
    const placeholders = {
        doctor: "e.g., DOC001",
        patient: "e.g., PAT001",
        nurse: "e.g., NURSE001"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-screen items-center justify-center bg-background px-4 py-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-8 flex flex-col items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 flex items-center justify-center rounded-full bg-gradient-primary p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                        className: "h-6 w-6 text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                        lineNumber: 114,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                        className: "h-6 w-6 text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                lineNumber: 113,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold text-gradient-primary",
                            children: "SafeMediNet"
                        }, void 0, false, {
                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-center text-sm text-secondary",
                            children: "Privacy-Preserving EHR Network"
                        }, void 0, false, {
                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "card p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-6 flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setMode("login");
                                        setError("");
                                        setSuccess("");
                                    },
                                    disabled: isLoading || authLoading,
                                    className: `flex-1 rounded-lg py-2 font-semibold transition-all duration-300 ${mode === "login" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"}`,
                                    children: "Login"
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setMode("signup");
                                        setError("");
                                        setSuccess("");
                                    },
                                    disabled: isLoading || authLoading,
                                    className: `flex-1 rounded-lg py-2 font-semibold transition-all duration-300 ${mode === "signup" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"}`,
                                    children: "Sign Up"
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 139,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-6 flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setRole("doctor"),
                                    disabled: isLoading || authLoading,
                                    className: `flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${role === "doctor" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"}`,
                                    children: "Doctor"
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 156,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setRole("patient"),
                                    disabled: isLoading || authLoading,
                                    className: `flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${role === "patient" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"}`,
                                    children: "Patient"
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 165,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setRole("nurse"),
                                    disabled: isLoading || authLoading,
                                    className: `flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-300 ${role === "nurse" ? "bg-gradient-primary text-white" : "bg-surface-alt text-foreground hover:bg-border"}`,
                                    children: "Nurse"
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 174,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                            lineNumber: 155,
                            columnNumber: 11
                        }, this),
                        mode === "login" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleLogin,
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "User ID"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 189,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: loginUserId,
                                            onChange: (e)=>setLoginUserId(e.target.value),
                                            placeholder: placeholders[role],
                                            className: "input-field",
                                            disabled: isLoading || authLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 190,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "Password"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 202,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "password",
                                            value: loginPassword,
                                            onChange: (e)=>setLoginPassword(e.target.value),
                                            placeholder: "Enter password",
                                            className: "input-field",
                                            disabled: isLoading || authLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 203,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 201,
                                    columnNumber: 15
                                }, this),
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg bg-error/10 p-3 text-sm text-error",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 214,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "btn-primary w-full",
                                    disabled: isLoading || authLoading,
                                    children: isLoading || authLoading ? "Signing in..." : "Sign In"
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 216,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                            lineNumber: 187,
                            columnNumber: 13
                        }, this),
                        mode === "signup" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSignup,
                            className: "space-y-4 max-h-[500px] overflow-y-auto pr-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "User ID *"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 230,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: signupData.id,
                                            onChange: (e)=>setSignupData({
                                                    ...signupData,
                                                    id: e.target.value
                                                }),
                                            placeholder: placeholders[role],
                                            className: "input-field",
                                            disabled: isLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 231,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 229,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "Full Name *"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 243,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: signupData.name,
                                            onChange: (e)=>setSignupData({
                                                    ...signupData,
                                                    name: e.target.value
                                                }),
                                            placeholder: "Enter full name",
                                            className: "input-field",
                                            disabled: isLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 244,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 242,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "Email *"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 256,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "email",
                                            value: signupData.email,
                                            onChange: (e)=>setSignupData({
                                                    ...signupData,
                                                    email: e.target.value
                                                }),
                                            placeholder: "email@example.com",
                                            className: "input-field",
                                            disabled: isLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 257,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 255,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "Phone *"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 269,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "tel",
                                            value: signupData.phone,
                                            onChange: (e)=>setSignupData({
                                                    ...signupData,
                                                    phone: e.target.value
                                                }),
                                            placeholder: "+1234567890",
                                            className: "input-field",
                                            disabled: isLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 270,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 268,
                                    columnNumber: 15
                                }, this),
                                (role === "doctor" || role === "nurse") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "Department *"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 284,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: signupData.department,
                                            onChange: (e)=>setSignupData({
                                                    ...signupData,
                                                    department: e.target.value
                                                }),
                                            placeholder: "e.g., Cardiology, ICU",
                                            className: "input-field",
                                            disabled: isLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 285,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 283,
                                    columnNumber: 17
                                }, this),
                                role === "nurse" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "License Number *"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 300,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: signupData.licenseNumber,
                                            onChange: (e)=>setSignupData({
                                                    ...signupData,
                                                    licenseNumber: e.target.value
                                                }),
                                            placeholder: "e.g., RN123456",
                                            className: "input-field",
                                            disabled: isLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 301,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 299,
                                    columnNumber: 17
                                }, this),
                                role === "patient" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-2 block text-sm font-semibold text-foreground",
                                                    children: "Date of Birth *"
                                                }, void 0, false, {
                                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                    lineNumber: 317,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "date",
                                                    value: signupData.dob,
                                                    onChange: (e)=>setSignupData({
                                                            ...signupData,
                                                            dob: e.target.value
                                                        }),
                                                    className: "input-field",
                                                    disabled: isLoading,
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                    lineNumber: 318,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 316,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-2 block text-sm font-semibold text-foreground",
                                                    children: "Blood Type *"
                                                }, void 0, false, {
                                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: signupData.bloodType,
                                                    onChange: (e)=>setSignupData({
                                                            ...signupData,
                                                            bloodType: e.target.value
                                                        }),
                                                    className: "input-field",
                                                    disabled: isLoading,
                                                    required: true,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Select blood type"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 337,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "A+",
                                                            children: "A+"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 338,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "A-",
                                                            children: "A-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 339,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "B+",
                                                            children: "B+"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 340,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "B-",
                                                            children: "B-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 341,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "AB+",
                                                            children: "AB+"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 342,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "AB-",
                                                            children: "AB-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 343,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "O+",
                                                            children: "O+"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 344,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "O-",
                                                            children: "O-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                            lineNumber: 345,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 328,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-2 block text-sm font-semibold text-foreground",
                                                    children: "Assigned Doctor ID"
                                                }, void 0, false, {
                                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                    lineNumber: 350,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: signupData.assignedDoctor,
                                                    onChange: (e)=>setSignupData({
                                                            ...signupData,
                                                            assignedDoctor: e.target.value
                                                        }),
                                                    placeholder: "e.g., DOC001 (optional)",
                                                    className: "input-field",
                                                    disabled: isLoading
                                                }, void 0, false, {
                                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                    lineNumber: 351,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 349,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "mb-2 block text-sm font-semibold text-foreground",
                                                    children: "Assigned Nurse ID"
                                                }, void 0, false, {
                                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                    lineNumber: 362,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: signupData.assignedNurse,
                                                    onChange: (e)=>setSignupData({
                                                            ...signupData,
                                                            assignedNurse: e.target.value
                                                        }),
                                                    placeholder: "e.g., NURSE001 (optional)",
                                                    className: "input-field",
                                                    disabled: isLoading
                                                }, void 0, false, {
                                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                                    lineNumber: 363,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 361,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "Password *"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 376,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "password",
                                            value: signupData.password,
                                            onChange: (e)=>setSignupData({
                                                    ...signupData,
                                                    password: e.target.value
                                                }),
                                            placeholder: "Min 6 characters",
                                            className: "input-field",
                                            disabled: isLoading,
                                            required: true,
                                            minLength: 6
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 377,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 375,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block text-sm font-semibold text-foreground",
                                            children: "Confirm Password *"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 390,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "password",
                                            value: signupData.confirmPassword,
                                            onChange: (e)=>setSignupData({
                                                    ...signupData,
                                                    confirmPassword: e.target.value
                                                }),
                                            placeholder: "Re-enter password",
                                            className: "input-field",
                                            disabled: isLoading,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 391,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 389,
                                    columnNumber: 15
                                }, this),
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg bg-error/10 p-3 text-sm text-error",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 402,
                                    columnNumber: 25
                                }, this),
                                success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg bg-green-500/10 p-3 text-sm text-green-600",
                                    children: success
                                }, void 0, false, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 403,
                                    columnNumber: 27
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "btn-primary w-full flex items-center justify-center gap-2",
                                    disabled: isLoading,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                            lineNumber: 410,
                                            columnNumber: 17
                                        }, this),
                                        isLoading ? "Creating Account..." : "Create Account"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                                    lineNumber: 405,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                            lineNumber: 228,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                    lineNumber: 123,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-8 text-center text-xs text-secondary",
                    children: "© SafeMediNet 2025 – Privacy Preserving EHR Platform"
                }, void 0, false, {
                    fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
                    lineNumber: 418,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
            lineNumber: 109,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/SafeMediNet/FrontEnd/app/page.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s(LoginPage, "HxkioC33lBzbnFXuWKx4VauWEfk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$SafeMediNet$2f$FrontEnd$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=SafeMediNet_FrontEnd_ee3026e3._.js.map
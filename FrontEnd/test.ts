// Create in a temporary file: scripts/createTestUsers.ts
import { createUser } from './firebase';

async function createTestUsers() {
  // Create Doctor
  await createUser({
    id: 'DOC001',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@safemedi.net',
    department: 'Cardiology',
    phone: '+1234567890',
    password: '1234',
    publicKey: '',
    privateKeyEncrypted: '',
    patients: []
  }, 'doctor');

  // Create Nurse
  await createUser({
    id: 'NURSE001',
    name: 'Jane Smith',
    email: 'nurse@safemedi.net',
    phone: '+1234567890',
    department: 'ICU',
    licenseNumber: 'RN123456',
    password: '1234',
    assignedPatients: []
  }, 'nurse');

  // Create Patient
  await createUser({
    id: 'PAT001',
    name: 'John Doe',
    email: 'patient@safemedi.net',
    phone: '+1234567890',
    dob: '1990-01-15',
    bloodType: 'O+',
    assignedDoctor: 'DOC001',
    assignedNurse: 'NURSE001',
    password: '1234'
  }, 'patient');
}

createTestUsers();
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};




const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


import { getStorage } from "firebase/storage";
export const storage = getStorage(app);



export interface UserProfileData {
  jobType: string;
  uid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  experienceYears?: string;
  companies?: string[];
  location?: string;
  goalDate?: string;
  learningHours?: number;
  onboardingComplete?: boolean;
}


export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const fullName = `${firstName} ${lastName}`;

  await updateProfile(userCredential.user, { displayName: fullName });

  await setDoc(doc(db, "users", userCredential.user.uid), {
    uid: userCredential.user.uid,
    firstName,
    lastName,
    email,
    role: "",
    companies: [],
    location: "",
    goalDate: "",
    learningHours: 0,
    onboardingComplete: false,
  });

  await sendEmailVerification(userCredential.user); 
  return userCredential.user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    firstName: user.displayName?.split(" ")[0] || "Google",
    lastName: user.displayName?.split(" ")[1] || "User",
    email: user.email,
    role: "",
    companies: [],
    location: "",
    goalDate: "",
    learningHours: 0,
    onboardingComplete: false,
  }, { merge: true });

  return user;
};

export const logout = async () => {
  await signOut(auth);
};

export const requestPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
  return "Password reset email sent!";
};

export const updateUserPassword = async (user: User, newPassword: string) => {
  await updatePassword(user, newPassword);
};

export const sendUserEmailVerification = async (user: User) => {
  await sendEmailVerification(user);
};

export const saveUserProfile = async (uid: string, profileData: any) => {
  await setDoc(doc(db, "users", uid), profileData, { merge: true });
};

export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() as UserProfileData : null;
};

export const uploadDSAQuestions = async (questions: any[]) => {
  const dsaCollection = collection(db, "dsa_questions");
  for (const q of questions) {
    await addDoc(dsaCollection, q);
  }
};


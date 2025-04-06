import { initializeApp } from "firebase/app";
import { collection, addDoc } from "firebase/firestore";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "firebase/auth";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";

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


export const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fullName = `${firstName} ${lastName}`;
        await updateProfile(userCredential.user, { displayName: fullName });

        await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: "", 
            companies: [], 
            location: "",
            goalDate: "",
            learningHours: 0,
        });

        console.log("User signed up and profile created:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    }
};

export const loginWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};


export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            firstName: user.displayName?.split(" ")[0] || "Google User",
            lastName: user.displayName?.split(" ")[1] || "",
            email: user.email,
            role: "",
            companies: [],
            location: "",
            goalDate: "",
            learningHours: 0,
        }, { merge: true });

        console.log("User logged in with Google:", user);
        return user;
    } catch (error) {
        console.error("Google login error:", error);
        throw error;
    }
};


export const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
    } catch (error) {
        console.error("Logout error:", error);
    }
};


export const saveUserProfile = async (uid: string, profileData: any) => {
    try {
        await setDoc(doc(db, "users", uid), profileData, { merge: true });
        console.log("User profile updated successfully!");
    } catch (error) {
        console.error("Error saving user profile:", error);
        throw error;
    }
};


export const getUserProfile = async (uid: string) => {
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists()) {
            console.log("User profile retrieved:", docSnap.data());
            return docSnap.data();
        } else {
            console.log("No user profile found!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};


export const uploadDSAQuestions = async (questions: any[]) => {
    const dsaCollection = collection(db, "dsa_questions");

    try {
        for (const q of questions) {
            await addDoc(dsaCollection, q);
        }
        console.log("All questions uploaded to Firestore!");
    } catch (error) {
        console.error("Error uploading questions:", error);
        throw error;
    }
};

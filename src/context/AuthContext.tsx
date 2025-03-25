import { createContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextType {
    user: User | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

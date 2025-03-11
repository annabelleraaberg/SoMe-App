// AuthContext and useSession based on code from expo authentication: https://docs.expo.dev/router/reference/authentication/
// Mixed with lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/providers/authctx.tsx

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import * as authApi from "@/api/authApi";
import {  storeData } from "@/utils/local_storage";

const AuthContext = createContext<{
  signIn: (username: string, password: string) => void;
  signInAsGuest: () => void;
  signOut: VoidFunction;
  userNameSession?: string | null;
  isLoading: boolean;
  user: User | null;
  isGuest: boolean;
}>({
  signIn: (s: string, p: string) => null,
  signInAsGuest: () => null,
  signOut: () => null,
  userNameSession: null,
  isLoading: false,
  user: null,
  isGuest: false,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider");
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState<string | null>(null);
  const [userAuthSession, setUserAuthSession] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const router = useRouter();
  console.log("userNameSession in context: ", userSession);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); 
        const displayName = user.displayName || "Anonymous";

        // Only updates if the session value is outdated.
        // Added to avoid setUserSession from being overwritten.
        if (userSession !== displayName) {
          setUserSession(displayName);
          await storeData("userNameSession", displayName);
        }
        setUserAuthSession(user);
        setIsGuest(false);
        router.replace("/");
      } else if (isGuest) {
        setUserSession(null);
        setUserAuthSession(null);
      } else {
        setUserSession(null);
        setUserAuthSession(null);
        router.replace("/");
      }
      setIsLoading(false);
      
    });
    return () => unsubscribe();
  }, [userSession, isGuest]); 

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email: string, password: string) => {
          try {
            const userCredential = await authApi.signIn(email, password);
            const user = auth.currentUser;

            if (user) {
              // Forces reload to ensure displayName is available
              await user.reload();
              const displayName = user.displayName || "Anonymous";
              setUserSession(displayName);
              await storeData("userNameSession", displayName);
              setIsGuest(false);

              console.log("User signed in: ", displayName);
            }
          } catch (error) {
            console.log("authctx: Error during sign-in", error);
          }
        },
        signInAsGuest: () => {
          console.log("Starting guest sign-in...");
          setIsGuest(true);
          console.log("Guest session activated");
        },
        signOut: async () => {
          await authApi.signOut();
          setIsGuest(false);
          router.replace("/authentication");
        },
        userNameSession: userSession,
        user: userAuthSession,
        isLoading: isLoading,
        isGuest: isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

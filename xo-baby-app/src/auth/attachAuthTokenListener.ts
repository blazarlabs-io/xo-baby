import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useUserStore } from "../store/userStore";

export function attachAuthTokenListener() {
  return onIdTokenChanged(auth, async (fbUser) => {
    if (!fbUser) {
      console.log("🔍 AuthTokenListener - No Firebase user, clearing store");
      useUserStore.getState().clearUser?.();
      return;
    }
    
    const token = await fbUser.getIdToken(); // non-forced; background refresh
    const current = useUserStore.getState().user;
    
    console.log("🔍 AuthTokenListener - Current user in store:", current);
    console.log("🔍 AuthTokenListener - Firebase user:", { uid: fbUser.uid, email: fbUser.email });
    
    // If we already have a user with the same UID, just update the token
    if (current && current.uid === fbUser.uid) {
      console.log("🔍 AuthTokenListener - Same user, just updating token, preserving role:", current.role);
      useUserStore.getState().updateToken(token);
      return;
    }
    
    // New user or different user - set with default role
    const finalRole = current?.role ?? "parent";
    console.log("🔍 AuthTokenListener - New/different user, using role:", finalRole);
    
    useUserStore.getState().setUser({
      uid: fbUser.uid,
      email: fbUser.email ?? current?.email ?? "",
      token,
      role: finalRole,
    });
  });
}

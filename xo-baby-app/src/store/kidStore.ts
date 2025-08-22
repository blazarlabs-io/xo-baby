import { create } from "zustand";
import { createKid, getDecryptedKidData, getKidDetails } from "../api/kidApi";

export interface Kid {
  id: string;
  childId?: string; // Blockchain child ID from Midnight contract
  parentId: string; // Who added the kid (parent/custodian)
  adminId?: string; // Admin who approved/registered the kid
  doctorId?: string; // Doctor assigned to the kid
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  ethnicity: string;
  location: string;
  congenitalAnomalies: { name: string; description: string }[];
  avatarUrl?: string;
  createdAt: string;
  ipfsHash?: string; // IPFS hash for encrypted data
  encryptedData?: string; // AES key for decryption

  vitals: {
    heartRate: number;
    oximetry: number;
    breathingRate?: number;
    temperature?: number;
    movement?: number;
    weight?: number;
    height?: number;
    headCircumference?: number;
    feedingSchedule?: string;
  };

  weightHistory?: { value: number; date: string }[];
  heightHistory?: { value: number; date: string }[];
  headCircumferenceHistory?: { value: number; date: string }[];

  // Additional fields for role-based access control
  userRole?: "parent" | "admin" | "doctor" | "viewer";
  // canEdit?: boolean;
  // canDelete?: boolean;
  // canViewVitals?: boolean;
}

// Since role fields are now included in Kid interface, we can use Kid directly
interface KidStore {
  kids: Kid[];
  isLoading: boolean;
  error: string | null;
  addKid: (kid: Kid) => void;
  addKids: (newKids: Kid[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearKids: () => void;
  createKid: (kidData: Partial<Kid>) => Promise<Kid>;
  getDecryptedKidData: (kidId: string, aesKey: string) => Promise<any>;
  getKidDetails: (kidId: string) => Promise<any>;
}

export const useKidStore = create<KidStore>((set, get) => ({
  kids: [],
  isLoading: false,
  error: null,
  addKid: (kid) =>
    set((state) => {
      const alreadyExists = state.kids.some((k) => k.id === kid.id);
      if (alreadyExists) return state;
      return { kids: [...state.kids, kid] };
    }),
  addKids: (newKids) =>
    set((state) => {
      const currentIds = new Set(state.kids.map((k) => k.id));
      const filtered = newKids.filter((k) => !currentIds.has(k.id));
      return {
        kids: [...state.kids, ...filtered],
        isLoading: false,
        error: null,
      };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearKids: () => set({ kids: [], isLoading: false, error: null }),
  createKid: async (kidData: Partial<Kid>) => {
    try {
      // Get the current user's token from userStore or AuthService
      const token = ""; // TODO: Get from user store or auth service

      const newKid = await createKid({
        ...kidData,
        parentId: kidData.parentId || "", // Ensure parentId is set
      } as any);

      set((state) => ({ kids: [...state.kids, newKid] }));
      return newKid;
    } catch (error) {
      console.error("Error creating kid:", error);
      throw error;
    }
  },
  getDecryptedKidData: async (kidId: string, aesKey: string) => {
    try {
      const token = ""; // TODO: Get from user store or auth service
      return await getDecryptedKidData(kidId, aesKey, token);
    } catch (error) {
      console.error("Error getting decrypted kid data:", error);
      throw error;
    }
  },
  getKidDetails: async (kidId: string) => {
    try {
      const token = ""; // TODO: Get from user store or auth service
      return await getKidDetails(kidId, token);
    } catch (error) {
      console.error("Error getting kid details:", error);
      throw error;
    }
  },
}));

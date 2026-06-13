import { create } from "zustand";

export interface EcoLocation {
  id: number | string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  city: string;
  address?: string;
  notes?: string;
  badge?: "search_result" | "pending_review";
  approved?: boolean;
}

interface GreenMapState {
  /* ── City ── */
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  /* ── Place type filter ── */
  selectedType: string;
  setSelectedType: (type: string) => void;

  /* ── Search result (Feature 2) ── */
  searchResult: EcoLocation | null;
  setSearchResult: (loc: EcoLocation | null) => void;
  clearSearchResult: () => void;

  /* ── User-submitted locations (Feature 4) ── */
  submittedLocations: EcoLocation[];
  addSubmittedLocation: (loc: EcoLocation) => void;

  /* ── Submit drawer ── */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  /* ── Toast ── */
  toastMessage: string;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

// Load submitted locations from localStorage
function loadSubmitted(): EcoLocation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("greenmap_submitted");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSubmitted(locs: EcoLocation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("greenmap_submitted", JSON.stringify(locs));
  } catch {
    // Quota exceeded — ignore
  }
}

export const useGreenMapStore = create<GreenMapState>((set) => ({
  selectedCity: "Delhi",
  setSelectedCity: (city) => set({ selectedCity: city }),

  selectedType: "All",
  setSelectedType: (type) => set({ selectedType: type }),

  searchResult: null,
  setSearchResult: (loc) => set({ searchResult: loc }),
  clearSearchResult: () => set({ searchResult: null }),

  submittedLocations: loadSubmitted(),
  addSubmittedLocation: (loc) =>
    set((state) => {
      const updated = [loc, ...state.submittedLocations];
      saveSubmitted(updated);
      return { submittedLocations: updated };
    }),

  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  toastMessage: "",
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: "" }), 3500);
  },
  clearToast: () => set({ toastMessage: "" }),
}));

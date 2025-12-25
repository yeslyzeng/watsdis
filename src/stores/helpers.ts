import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "./useAppStore";

// Generic helper to wrap a selector with Zustand's shallow comparator for AppStore
export function useAppStoreShallow<T>(
  selector: (state: ReturnType<typeof useAppStore.getState>) => T
): T {
  return useAppStore(useShallow(selector));
}

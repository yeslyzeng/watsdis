import { useAppStore } from "@/stores/useAppStore";
import { AppId } from "@/config/appRegistry";

// Export the interface
export interface LaunchAppOptions {
  initialPath?: string;
  initialData?: unknown; // Add initialData field
  multiWindow?: boolean; // Add multiWindow flag
}

export const useLaunchApp = () => {
  // Get the launch method and instances from the store
  const launchAppInstance = useAppStore((state) => state.launchApp);
  const instances = useAppStore((state) => state.instances);
  const bringInstanceToForeground = useAppStore(
    (state) => state.bringInstanceToForeground
  );
  const restoreInstance = useAppStore((state) => state.restoreInstance);

  const launchApp = (appId: AppId, options?: LaunchAppOptions) => {
    console.log(`[useLaunchApp] Launch event received for ${appId}`, options);

    // Convert initialPath to proper initialData for Finder
    let initialData = options?.initialData;
    if (appId === "finder" && options?.initialPath && !initialData) {
      initialData = { path: options.initialPath };
    }

    // Check if all instances of this app are minimized
    // If so, restore them instead of creating a new instance
    const appInstances = Object.values(instances).filter(
      (inst) => inst.appId === appId && inst.isOpen
    );
    
    if (appInstances.length > 0) {
      // Check if all instances are minimized
      const allMinimized = appInstances.every((inst) => inst.isMinimized);
      
      if (allMinimized) {
        // Restore all minimized instances
        let lastRestoredId: string | null = null;
        appInstances.forEach((inst) => {
          if (inst.isMinimized) {
            restoreInstance(inst.instanceId);
            lastRestoredId = inst.instanceId;
          }
        });
        
        // Bring the most recently restored instance to foreground
        if (lastRestoredId) {
          console.log(
            `[useLaunchApp] All instances of ${appId} were minimized, restored and bringing ${lastRestoredId} to foreground`
          );
          bringInstanceToForeground(lastRestoredId);
          return lastRestoredId;
        }
      }
    }

    // Always use multi-window for apps that support it
    const multiWindow =
      options?.multiWindow ||
      appId === "finder" ||
      appId === "textedit";

    // Use the new instance-based launch system
    const instanceId = launchAppInstance(
      appId,
      initialData,
      undefined,
      multiWindow
    );
    console.log(
      `[useLaunchApp] Created instance ${instanceId} for app ${appId} with multiWindow: ${multiWindow}`
    );

    return instanceId;
  };

  return launchApp;
};

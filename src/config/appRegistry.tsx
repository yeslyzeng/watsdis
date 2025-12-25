import { lazy, Suspense, ComponentType, useEffect } from "react";
import { appIds } from "./appIds";
import type {
  AppProps,
  BaseApp,
  ControlPanelsInitialData,
  PaintInitialData,
} from "@/apps/base/types";
import { useAppStore } from "@/stores/useAppStore";

export type AppId = (typeof appIds)[number];

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowConstraints {
  minSize?: WindowSize;
  maxSize?: WindowSize;
  defaultSize: WindowSize;
  mobileDefaultSize?: WindowSize;
}

// Default window constraints for any app not specified
const defaultWindowConstraints: WindowConstraints = {
  defaultSize: { width: 730, height: 475 },
  minSize: { width: 300, height: 200 },
};

// ============================================================================
// LAZY LOADING WRAPPER
// ============================================================================

// Signal component to notify store when lazy component is loaded
const LoadSignal = ({ instanceId }: { instanceId?: string }) => {
  const markInstanceAsLoaded = useAppStore((state) => state.markInstanceAsLoaded);
  useEffect(() => {
    if (instanceId) {
      // Use requestIdleCallback for non-urgent loading signal, falling back to setTimeout
      // This ensures we don't block the main thread during heavy app initialization
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const handle = window.requestIdleCallback(
          () => {
            markInstanceAsLoaded(instanceId);
          },
          { timeout: 1000 }
        );
        return () => window.cancelIdleCallback(handle);
      } else {
        const timer = setTimeout(() => {
          markInstanceAsLoaded(instanceId);
        }, 50); 
        return () => clearTimeout(timer);
      }
    }
  }, [instanceId, markInstanceAsLoaded]);
  return null;
};

// Cache for lazy components to maintain stable references across HMR
const lazyComponentCache = new Map<string, ComponentType<AppProps<unknown>>>();

// Helper to create a lazy-loaded component with Suspense
// Uses a cache to maintain stable component references across HMR
function createLazyComponent<T = unknown>(
  importFn: () => Promise<{ default: ComponentType<AppProps<T>> }>,
  cacheKey: string
): ComponentType<AppProps<T>> {
  // Return cached component if it exists (prevents HMR issues)
  const cached = lazyComponentCache.get(cacheKey);
  if (cached) {
    return cached as ComponentType<AppProps<T>>;
  }

  const LazyComponent = lazy(importFn);
  
  // Wrap with Suspense to handle loading state
  const WrappedComponent = (props: AppProps<T>) => (
    <Suspense fallback={null}>
      <LazyComponent {...props} />
      <LoadSignal instanceId={props.instanceId} />
    </Suspense>
  );
  
  // Cache the component
  lazyComponentCache.set(cacheKey, WrappedComponent as ComponentType<AppProps<unknown>>);
  
  return WrappedComponent;
}

// ============================================================================
// LAZY-LOADED APP COMPONENTS
// ============================================================================

// Critical apps (load immediately for perceived performance)
// Finder is critical - users see it on desktop
import { FinderAppComponent } from "@/apps/finder/components/FinderAppComponent";

// Lazy-loaded apps (loaded on-demand when opened)
const LazyTextEditApp = createLazyComponent<unknown>(
  () => import("@/apps/textedit/components/TextEditAppComponent").then(m => ({ default: m.TextEditAppComponent })),
  "textedit"
);

const LazyControlPanelsApp = createLazyComponent<ControlPanelsInitialData>(
  () => import("@/apps/control-panels/components/ControlPanelsAppComponent").then(m => ({ default: m.ControlPanelsAppComponent })),
  "control-panels"
);

const LazyPaintApp = createLazyComponent<PaintInitialData>(
  () => import("@/apps/paint/components/PaintAppComponent").then(m => ({ default: m.PaintAppComponent })),
  "paint"
);

// ============================================================================
// APP METADATA (loaded eagerly - small)
// ============================================================================

import { appMetadata as finderMetadata, helpItems as finderHelpItems } from "@/apps/finder";
import { appMetadata as texteditMetadata, helpItems as texteditHelpItems } from "@/apps/textedit";
import { appMetadata as paintMetadata, helpItems as paintHelpItems } from "@/apps/paint";
import { appMetadata as controlPanelsMetadata, helpItems as controlPanelsHelpItems } from "@/apps/control-panels";

// ============================================================================
// APP REGISTRY
// ============================================================================

// Registry of all available apps with their window configurations
export const appRegistry = {
  ["finder"]: {
    id: "finder",
    name: "Finder",
    icon: { type: "image", src: "/icons/mac.png" },
    description: "Browse and manage files",
    component: FinderAppComponent, // Critical - loaded eagerly
    helpItems: finderHelpItems,
    metadata: finderMetadata,
    windowConfig: {
      defaultSize: { width: 400, height: 300 },
      minSize: { width: 300, height: 200 },
    } as WindowConstraints,
  },
  ["textedit"]: {
    id: "textedit",
    name: "TextEdit",
    icon: { type: "image", src: texteditMetadata.icon },
    description: "A simple rich text editor",
    component: LazyTextEditApp,
    helpItems: texteditHelpItems,
    metadata: texteditMetadata,
    windowConfig: {
      defaultSize: { width: 430, height: 475 },
      minSize: { width: 430, height: 200 },
    } as WindowConstraints,
  },
  ["paint"]: {
    id: "paint",
    name: "Paint",
    icon: { type: "image", src: paintMetadata.icon },
    description: "Draw and edit images",
    component: LazyPaintApp,
    helpItems: paintHelpItems,
    metadata: paintMetadata,
    windowConfig: {
      defaultSize: { width: 713, height: 480 },
      minSize: { width: 400, height: 400 },
      maxSize: { width: 713, height: 535 },
    } as WindowConstraints,
  } as BaseApp<PaintInitialData> & { windowConfig: WindowConstraints },
  ["control-panels"]: {
    id: "control-panels",
    name: "Control Panels",
    icon: { type: "image", src: controlPanelsMetadata.icon },
    description: "System settings",
    component: LazyControlPanelsApp,
    helpItems: controlPanelsHelpItems,
    metadata: controlPanelsMetadata,
    windowConfig: {
      defaultSize: { width: 365, height: 415 },
      minSize: { width: 320, height: 415 },
      maxSize: { width: 365, height: 600 },
    } as WindowConstraints,
  } as BaseApp<ControlPanelsInitialData> & { windowConfig: WindowConstraints },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to get app icon path
export const getAppIconPath = (appId: AppId): string => {
  const app = appRegistry[appId];
  if (typeof app.icon === "string") {
    return app.icon;
  }
  return app.icon.src;
};

// Helper function to get all apps except Finder
export const getNonFinderApps = (isAdmin: boolean = false): Array<{
  name: string;
  icon: string;
  id: AppId;
}> => {
  return Object.entries(appRegistry)
    .filter(([id, app]) => {
      if (id === "finder") return false;
      // Filter out admin-only apps for non-admin users
      if ((app as { adminOnly?: boolean }).adminOnly && !isAdmin) return false;
      return true;
    })
    .map(([id, app]) => ({
      name: app.name,
      icon: typeof app.icon === "string" ? app.icon : app.icon.src,
      id: id as AppId,
    }));
};

// Helper function to get window constraints for an app
export const getWindowConstraints = (appId: AppId): WindowConstraints => {
  const app = appRegistry[appId];
  return app?.windowConfig || defaultWindowConstraints;
};

// Alias for backward compatibility
export const getWindowConfig = getWindowConstraints;

// Helper function to get app by id
export const getAppById = (appId: AppId) => {
  return appRegistry[appId];
};

// Helper function to get app component by id
export const getAppComponent = (appId: AppId) => {
  const app = appRegistry[appId];
  return app?.component;
};

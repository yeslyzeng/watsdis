import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AppId } from "@/utils/i18n";

/**
 * Hook to get translated help items for an app
 * Merges translated text with original icons
 */
export function useTranslatedHelpItems(
  appId: AppId,
  originalHelpItems: Array<{ icon: string; title: string; description: string }>
) {
  const { t } = useTranslation();

  const helpKeys: Record<AppId, string[]> = {
    finder: ["browseNavigate", "fileManagement", "viewSort", "quickAccess", "storageInfo", "trash"],
    textedit: ["richEditing", "formatting", "listsTasks", "fileManagement", "voiceDictation", "slashCommands"],
    paint: ["drawingTools", "colors", "undo", "saving", "patterns", "filters"],
    "control-panels": ["appearance", "sounds", "aiModel", "shaderEffects", "backupRestore", "system"],
  };

  return useMemo(() => {
    const keys = helpKeys[appId] || [];
    return originalHelpItems.map((item, index) => {
      const key = keys[index];
      if (!key) return item; // Fallback to original if no key

      const titleKey = `apps.${appId}.help.${key}.title`;
      const descKey = `apps.${appId}.help.${key}.description`;

      return {
        icon: item.icon, // Keep original icon
        title: t(titleKey, { defaultValue: item.title }),
        description: t(descKey, { defaultValue: item.description }),
      };
    });
  }, [appId, originalHelpItems, t]);
}

export const appIds = [
  "finder",
  "textedit",
  "paint",
  "control-panels",
] as const;

export type AppId = (typeof appIds)[number];

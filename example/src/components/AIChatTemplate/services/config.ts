declare const __PANELUI_AI_API_URL__: string;
const configuredUrl =
  typeof __PANELUI_AI_API_URL__ === "string" ? __PANELUI_AI_API_URL__ : "";
/** Public demo endpoint only. Provider credentials never enter the mini program. */
export const AI_API_URL = configuredUrl.replace(/\/$/u, "");
export const AI_CONFIGURED = /^https?:\/\//u.test(AI_API_URL);

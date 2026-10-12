export type ThemeKey = "white" | "sepia" | "oled";
export type FontKey = "serif" | "sans" | "mono";

export interface ReaderSettings { theme: ThemeKey; fontSize: number; font: FontKey }
export interface ReadingProgress { chapter: number; scroll: number; updatedAt: number }

export const SETTINGS_KEY = "opennovel:reader:v1";
export const progressKey = (slug: string) => `opennovel:progress:${slug}`;
export const DEFAULT_SETTINGS: ReaderSettings = { theme: "white", fontSize: 18, font: "serif" };

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or disabled: reading still works */
  }
}

export function readSettings(): ReaderSettings {
  const s = read<Partial<ReaderSettings>>(SETTINGS_KEY) ?? {};
  return {
    theme: s.theme === "white" || s.theme === "sepia" || s.theme === "oled" ? s.theme : DEFAULT_SETTINGS.theme,
    font: s.font === "serif" || s.font === "sans" || s.font === "mono" ? s.font : DEFAULT_SETTINGS.font,
    fontSize: typeof s.fontSize === "number" ? Math.min(24, Math.max(14, Math.round(s.fontSize))) : DEFAULT_SETTINGS.fontSize,
  };
}
export const writeSettings = (s: ReaderSettings) => write(SETTINGS_KEY, s);

export function readProgress(slug: string): ReadingProgress | null {
  const p = read<ReadingProgress>(progressKey(slug));
  return p && Number.isInteger(p.chapter) && typeof p.scroll === "number" ? p : null;
}
export const writeProgress = (slug: string, p: ReadingProgress) => write(progressKey(slug), p);

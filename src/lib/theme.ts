export type Theme = "light" | "dark" | "system";
export const themeKey = "espoir-theme";
export const themeEvent = "espoir-theme-change";
let memoryTheme: Theme = "system";
// Runs while the head is parsed, before the body paints. Only html data-theme differs from SSR.
export const themeScript = `(()=>{let t;try{t=localStorage.getItem('${themeKey}')}catch{}document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')})()`;
export function readTheme(): Theme {
  try {
    const value = localStorage.getItem(themeKey);
    if (value === "light" || value === "dark") return value;
  } catch {
    return memoryTheme;
  }
  return "system";
}
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme =
    theme === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
}
export function setTheme(theme: Theme) {
  memoryTheme = theme;
  try {
    localStorage.setItem(themeKey, theme);
  } catch {
    /* Keep the current tab usable. */
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(themeEvent));
}

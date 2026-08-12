/**
 * Light/dark switching, shared by both apps.
 *
 * Three states, not two. A person who has never touched the switch should get
 * whatever their phone or laptop is already set to — a student opening the app
 * at night on a device in dark mode wants a dark app, and asking them to set it
 * again is asking them to repeat a preference they have already expressed. Once
 * they *do* touch the switch, that choice wins and keeps winning, including
 * against a later change of the OS setting.
 *
 *   "system"  no stored choice: follow prefers-color-scheme, live
 *   "light"   explicit
 *   "dark"    explicit
 *
 * The resolved value is written to `data-theme` on <html>, which is the only
 * thing the CSS reads. That is deliberate: with the attribute always present and
 * always resolved, the stylesheets need one `:root` block and one
 * `:root[data-theme="dark"]` block, instead of a media query *and* an attribute
 * override — which is the arrangement where a token gets fixed in one place and
 * forgotten in the other.
 */

export type Theme = "light" | "dark";
export type Preference = Theme | "system";

export const STORAGE_KEY = "unitrack-theme";

/** Fired on this tab when the preference changes, since `storage` does not self-notify. */
const CHANGE_EVENT = "unitrack-theme-change";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function readPreference(): Preference {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Private browsing and blocked storage both throw on access, not on write.
    // A theme is not worth failing a render over.
    return "system";
  }
}

export function resolve(preference: Preference): Theme {
  return preference === "system" ? systemTheme() : preference;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  // Tells the browser to paint its own furniture — form controls, scrollbars,
  // the overscroll gutter — to match. Without it a dark page keeps a white
  // scrollbar and light-styled inputs.
  document.documentElement.style.colorScheme = theme;
}

export function setPreference(preference: Preference): void {
  try {
    if (preference === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Unstorable is survivable: the switch still works for this page view.
  }
  applyTheme(resolve(preference));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Watch every way the effective theme can change. Returns an unsubscribe.
 *
 * All three sources matter:
 * - `CHANGE_EVENT` — the switch in this tab.
 * - `storage` — the switch in another tab. Without it two open tabs disagree
 *   until reload, which on a phone means the app looks different depending on
 *   which tab you come back to.
 * - `matchMedia` — the OS flipping while the preference is still "system",
 *   which on both iOS and Android happens on a schedule at dusk.
 */
export function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  const systemChanged = () => {
    if (readPreference() === "system") applyTheme(systemTheme());
    onChange();
  };
  const crossTab = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    applyTheme(resolve(readPreference()));
    onChange();
  };

  media.addEventListener("change", systemChanged);
  window.addEventListener("storage", crossTab);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener("change", systemChanged);
    window.removeEventListener("storage", crossTab);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * The blocking script that resolves the theme before the first paint.
 *
 * It has to be inline and synchronous in `<head>`. Any later — a `useEffect`, a
 * deferred bundle — and the page paints light first and then snaps to dark: the
 * white flash that makes a dark app feel broken every time it is opened.
 *
 * Kept as a string next to the functions it mirrors so the storage key cannot
 * drift between the two. Wrapped in try/catch because a storage exception here
 * would abort the script and leave the document with no `data-theme` at all.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k=${JSON.stringify(STORAGE_KEY)},s=localStorage.getItem(k),
t=(s==="light"||s==="dark")?s:(matchMedia(${JSON.stringify(DARK_QUERY)}).matches?"dark":"light"),
e=document.documentElement;
e.dataset.theme=t;e.style.colorScheme=t;
}catch(_){document.documentElement.dataset.theme="light"}})();`;

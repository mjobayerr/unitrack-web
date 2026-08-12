"use client";

import { useCallback, useEffect, useState } from "react";

import { type Preference, type Theme, readPreference, resolve, setPreference, subscribe } from "./theme";

interface ThemeState {
  /** What is actually on screen right now. */
  theme: Theme;
  /** What the person chose. "system" until they touch the switch. */
  preference: Preference;
  /** Flip to the opposite of what is on screen, as an explicit choice. */
  toggle: () => void;
  /**
   * False until the client has read storage.
   *
   * The server cannot know the theme — it is in localStorage and in an OS
   * setting, neither of which is in the request. So the first render must not
   * claim one, or React reports a hydration mismatch on every page load. The
   * switch renders in a neutral state for that one frame and the caller can
   * hide its label until this is true.
   */
  ready: boolean;
}

export function useTheme(): ThemeState {
  const [preference, setPreferenceState] = useState<Preference>("system");
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const next = readPreference();
      setPreferenceState(next);
      setTheme(resolve(next));
      setReady(true);
    };
    sync();
    return subscribe(sync);
  }, []);

  const toggle = useCallback(() => {
    // Explicitly the opposite of what is *displayed*, not of the stored
    // preference. From "system" resolved to dark, one tap has to give light —
    // toggling the preference itself would store "dark" and change nothing
    // visible, which reads as a broken switch.
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, preference, toggle, ready };
}

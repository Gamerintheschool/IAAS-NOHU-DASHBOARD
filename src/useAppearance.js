import { useEffect, useState } from "react";

function useStoredPreference(key, fallback, isValid) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return isValid(saved) ? saved : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    // Preferences remain usable for this session when storage is unavailable.
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private browsing or a storage policy may block persistence.
    }
  }, [key, value]);

  return [value, setValue];
}

export default function useAppearance() {
  const [theme, setTheme] = useStoredPreference(
    "iaas-theme",
    "light",
    (value) => value === "light" || value === "dark",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useStoredPreference(
    "iaas-sidebar-collapsed",
    false,
    (value) => typeof value === "boolean",
  );
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#282b2e" : "#ffffff");
  }, [theme]);

  return { theme, setTheme, sidebarCollapsed, setSidebarCollapsed, isMobile };
}

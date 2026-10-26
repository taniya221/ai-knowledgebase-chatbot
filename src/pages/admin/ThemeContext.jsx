import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {

  // =====================================
  // THEME
  // =====================================

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "Light";
  });


  // =====================================
  // PRIMARY COLOR
  // =====================================

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem("app_color") || "#4f46e5";
  });


  // =====================================
  // SYSTEM DARK MODE
  // =====================================

  const [systemDark, setSystemDark] = useState(() => {

    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  });


  // =====================================
  // APPLY THEME
  // =====================================

  useEffect(() => {

    localStorage.setItem(
      "app_theme",
      theme
    );

    let isDark = false;

    if (theme === "Dark") {
      isDark = true;
    }

    if (theme === "Light") {
      isDark = false;
    }

    if (theme === "System") {
      isDark = systemDark;
    }


    // =====================================
    // DARK MODE CLASS
    // =====================================

    if (isDark) {

      document.body.classList.add(
        "dark-mode"
      );

    } else {

      document.body.classList.remove(
        "dark-mode"
      );

    }


    // =====================================
    // LIGHT MODE VARIABLES
    // =====================================

    if (!isDark) {

      document.documentElement.style.setProperty(
        "--bg-color",
        "#f8fafc"
      );

      document.documentElement.style.setProperty(
        "--card-bg",
        "#ffffff"
      );

      document.documentElement.style.setProperty(
        "--text-color",
        "#111827"
      );

      document.documentElement.style.setProperty(
        "--secondary-text",
        "#6b7280"
      );

      document.documentElement.style.setProperty(
        "--border-color",
        "#e5e7eb"
      );

      document.documentElement.style.setProperty(
        "--input-bg",
        "#ffffff"
      );

      document.documentElement.style.setProperty(
        "--hover-bg",
        "#f1f5f9"
      );

      document.documentElement.style.setProperty(
        "--shadow-color",
        "rgba(0, 0, 0, 0.08)"
      );

    }


    // =====================================
    // DARK MODE VARIABLES
    // =====================================

    if (isDark) {

      document.documentElement.style.setProperty(
        "--bg-color",
        "#111827"
      );

      document.documentElement.style.setProperty(
        "--card-bg",
        "#1f2937"
      );

      document.documentElement.style.setProperty(
        "--text-color",
        "#f9fafb"
      );

      document.documentElement.style.setProperty(
        "--secondary-text",
        "#9ca3af"
      );

      document.documentElement.style.setProperty(
        "--border-color",
        "#374151"
      );

      document.documentElement.style.setProperty(
        "--input-bg",
        "#111827"
      );

      document.documentElement.style.setProperty(
        "--hover-bg",
        "#374151"
      );

      document.documentElement.style.setProperty(
        "--shadow-color",
        "rgba(0, 0, 0, 0.30)"
      );

    }

  }, [theme, systemDark]);


  // =====================================
  // APPLY PRIMARY COLOR
  // =====================================

  useEffect(() => {

    localStorage.setItem(
      "app_color",
      primaryColor
    );

    document.documentElement.style.setProperty(
      "--primary-color",
      primaryColor
    );

  }, [primaryColor]);


  // =====================================
  // SYSTEM THEME DETECTION
  // =====================================

  useEffect(() => {

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );


    const handleChange = (event) => {

      setSystemDark(
        event.matches
      );

    };


    mediaQuery.addEventListener(
      "change",
      handleChange
    );


    return () => {

      mediaQuery.removeEventListener(
        "change",
        handleChange
      );

    };

  }, []);


  // =====================================
  // CONTEXT
  // =====================================

  return (

    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        primaryColor,
        setPrimaryColor,
        systemDark
      }}
    >

      {children}

    </ThemeContext.Provider>

  );

}


// =====================================
// CUSTOM HOOK
// =====================================

export function useTheme() {

  return useContext(
    ThemeContext
  );

}
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type SettingsContextType = {
  theme: string;
  accentColor: string;
  fontFamily: string;
  backgroundImage: string;
  profilePicture: string | null;
  updateLocalSettings: (updates: Partial<SettingsContextType>) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({
  children,
  initialSettings,
  initialProfilePicture,
}: {
  children: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSettings: any;
  initialProfilePicture: string | null;
}) {
  const [settings, setSettings] = useState({
    theme: initialSettings?.theme || "system",
    accentColor: initialSettings?.accentColor || "#f59e0b", // default amber
    fontFamily: initialSettings?.fontFamily || "sans",
    backgroundImage: initialSettings?.backgroundImage || "",
    profilePicture: initialProfilePicture,
  });

  const updateLocalSettings = (updates: Partial<SettingsContextType>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove("light", "dark", "sepia");
    
    let activeTheme = settings.theme;
    if (activeTheme === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    if (activeTheme === "dark") root.classList.add("dark");
    if (activeTheme === "sepia") {
      root.classList.add("sepia");
      root.setAttribute("data-theme", "sepia");
    } else {
      root.removeAttribute("data-theme");
    }

    root.style.setProperty("--accent-color", settings.accentColor);
    
    body.classList.remove("font-sans", "font-serif", "font-mono");
    if (settings.fontFamily) {
      body.classList.add(`font-${settings.fontFamily}`);
    } else {
      body.classList.add("font-sans");
    }
    
    if (settings.backgroundImage) {
      body.style.backgroundImage = `url(${settings.backgroundImage})`;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
      body.style.backgroundAttachment = "fixed";
    } else {
      body.style.backgroundImage = "none";
    }

  }, [settings.theme, settings.accentColor, settings.fontFamily, settings.backgroundImage]);

  return (
    <SettingsContext.Provider value={{ ...settings, updateLocalSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

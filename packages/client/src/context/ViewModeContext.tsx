import { createContext, useContext, useEffect, useState } from "react";

type ViewMode = "full" | "compact";

interface ViewModeCtx {
  compact: boolean;
  toggle: () => void;
}

const ViewModeContext = createContext<ViewModeCtx>({
  compact: false,
  toggle: () => {},
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const isSmallScreen = () => window.innerWidth < 768;

  const [sysCompact, setSysCompact] = useState(isSmallScreen);
  const [override, setOverride] = useState<ViewMode | null>(() => {
    const stored = localStorage.getItem("viewMode");
    return stored === "full" || stored === "compact" ? stored : null;
  });

  useEffect(() => {
    const handler = () => setSysCompact(isSmallScreen());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // compact = user override if set, otherwise follow screen size
  const compact = override !== null ? override === "compact" : sysCompact;

  function toggle() {
    const next: ViewMode = compact ? "full" : "compact";
    setOverride(next);
    localStorage.setItem("viewMode", next);
  }

  return (
    <ViewModeContext.Provider value={{ compact, toggle }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}

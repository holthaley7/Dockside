import WhatsBiting from "../components/WhatsBiting";
import { useViewMode } from "../context/ViewModeContext";

export default function Dashboard() {
  const { compact } = useViewMode();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`${compact ? "max-w-xl" : "max-w-5xl"} mx-auto px-4 py-8 transition-all`}>
      <p className="text-[11px] font-mono text-gray-600 uppercase tracking-widest mb-6">
        San Diego &middot; {today}
      </p>
      <WhatsBiting />
    </div>
  );
}

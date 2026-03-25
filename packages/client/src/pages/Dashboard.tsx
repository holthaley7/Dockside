import { Link } from "react-router-dom";
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
    <div className={`${compact ? "max-w-xl" : "max-w-5xl"} mx-auto px-4 transition-all`}>

      {/* Hero */}
      <div className="py-16 text-center">
        <p className="text-xs font-mono text-sand/60 uppercase tracking-widest mb-4">
          San Diego Sport Fishing
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-gray-100 mb-4 leading-tight">
          Know Before You Go
        </h1>
        <p className="text-gray-400 text-base font-mono max-w-xl mx-auto mb-8 leading-relaxed">
          Live conditions, species guides, regulations, and local catch reports —
          everything you need before you hit the water.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="#whats-biting"
            className="px-6 py-3 rounded-lg bg-sand text-navy-900 font-semibold text-sm hover:bg-sand/90 transition-colors"
          >
            What's Biting Today
          </a>
          <Link
            to="/species"
            className="px-6 py-3 rounded-lg border border-navy-600 text-gray-300 font-semibold text-sm hover:border-sand/50 hover:text-sand transition-colors"
          >
            Browse Species
          </Link>
        </div>
      </div>

      {/* Date line */}
      <p className="text-[11px] font-mono text-gray-600 uppercase tracking-widest mb-6">
        San Diego &middot; {today}
      </p>

      <div id="whats-biting">
        <WhatsBiting />
      </div>
    </div>
  );
}

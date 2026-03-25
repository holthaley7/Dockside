import { useEffect, useState } from "react";
import { fetchGeneralInfo, type GeneralInfo } from "../lib/api";

// ── Section SVG icons ────────────────────────────────────────────────────────

function ScaleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"/>
      <path d="M3 9h18"/>
      <path d="M6 9l-3 6a3 3 0 0 0 6 0l-3-6"/>
      <path d="M18 9l-3 6a3 3 0 0 0 6 0l-3-6"/>
      <path d="M9 21h6"/>
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/>
      <line x1="7.5" y1="10.5" x2="9.5" y2="12.5"/>
      <line x1="11"  y1="7"    x2="13" y2="9"/>
      <line x1="14.5" y1="3.5" x2="16.5" y2="5.5"/>
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}

function ChainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

// ── Quick-reference card icons ───────────────────────────────────────────────

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function WavesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    </svg>
  );
}

function LandingNetIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l5 5"/>
      <path d="M9 9a6 6 0 1 0 8.49 8.49"/>
      <circle cx="16" cy="16" r="4"/>
      <line x1="19.5" y1="12.5" x2="21" y2="11"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

const gold = "#C8A55A";

const quickRefs = [
  {
    icon: <ShieldIcon />,
    title: "License Required",
    detail: "Age 16+ must carry a valid CA sport fishing license",
    accent: gold,
  },
  {
    icon: <WavesIcon />,
    title: "Public Pier Exception",
    detail: "No license needed when fishing from a public pier",
    accent: gold,
  },
  {
    icon: <LandingNetIcon />,
    title: "Landing Net Required",
    detail: "Must be aboard any vessel while fishing",
    accent: gold,
  },
  {
    icon: <ClockIcon />,
    title: "Report within 24hrs",
    detail: "Required for certain game fish catches",
    accent: gold,
  },
];

const categoryMeta = {
  legal: {
    title: "General Legal & Gear Requirements",
    icon: <ScaleIcon />,
    description: "California sport fishing regulations that apply to all species",
    accent: gold,
  },
  vocab: {
    title: "Measurement Vocabulary",
    icon: <RulerIcon />,
    description: "Legal definitions for fish measurement methods",
    accent: gold,
  },
  tools: {
    title: "Mandatory Tools & Preparation",
    icon: <WrenchIcon />,
    description: "Required equipment for legal fishing in California waters",
    accent: gold,
  },
  links: {
    title: "Essential Links",
    icon: <ChainIcon />,
    description: "Official resources and regulatory documents",
    accent: gold,
  },
};

const categoryOrder = ["legal", "tools", "vocab", "links"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Rules() {
  const [info, setInfo] = useState<GeneralInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeneralInfo()
      .then(setInfo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-sand/30 border-t-sand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Page header ── */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Rules &amp; Regulations</h2>
        <p className="text-gray-400 text-sm">
          California sport fishing regulations for San Diego waters
        </p>
      </div>

      {/* ── Quick Reference Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {quickRefs.map((ref) => (
          <div
            key={ref.title}
            className="bg-navy-800/60 border border-navy-700/40 rounded-xl p-4 flex flex-col gap-3"
            style={{ borderTop: `2px solid ${ref.accent}` }}
          >
            <span style={{ color: ref.accent }}>{ref.icon}</span>
            <p className="text-sm font-bold leading-snug"
               style={{ color: ref.accent }}>
              {ref.title}
            </p>
            <p className="text-xs text-gray-400 leading-snug">{ref.detail}</p>
          </div>
        ))}
      </div>

      {/* ── Sections ── */}
      <div className="space-y-10">
        {categoryOrder.map((cat) => {
          const items = info[cat];
          if (!items) return null;
          const meta = categoryMeta[cat as keyof typeof categoryMeta];

          return (
            <section key={cat}>

              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                {/* Icon badge */}
                <div
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border"
                  style={{
                    backgroundColor: `${meta.accent}18`,
                    borderColor: `${meta.accent}45`,
                    color: meta.accent,
                  }}
                >
                  {meta.icon}
                </div>

                {/* Title + rule line */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-gray-100 flex-shrink-0">
                      {meta.title}
                    </h3>
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: `linear-gradient(to right, ${meta.accent}55, transparent)`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {meta.description}
                  </p>
                </div>
              </div>

              {/* Regulation cards */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="bg-navy-800/55 border border-navy-700/40 rounded-lg px-5 py-4"
                    style={{ borderLeft: `3px solid ${meta.accent}` }}
                  >
                    <h4
                      className="text-sm font-semibold mb-2"
                      style={{ color: meta.accent }}
                    >
                      {item.key}
                    </h4>
                    {cat === "links" ? (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-sea-400 hover:text-sea-500 transition-colors font-mono break-all"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-300 leading-relaxed">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>

            </section>
          );
        })}
      </div>
    </div>
  );
}

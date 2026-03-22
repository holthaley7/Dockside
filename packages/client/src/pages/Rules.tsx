import { useEffect, useState } from "react";
import { fetchGeneralInfo, type GeneralInfo } from "../lib/api";

const categoryMeta: Record<
  string,
  { title: string; icon: string; description: string }
> = {
  legal: {
    title: "General Legal & Gear Requirements",
    icon: "⚖️",
    description: "California sport fishing regulations that apply to all species",
  },
  vocab: {
    title: "Measurement Vocabulary",
    icon: "📏",
    description: "Legal definitions for fish measurement methods",
  },
  tools: {
    title: "Mandatory Tools & Preparation",
    icon: "🧰",
    description: "Required equipment for legal fishing in California waters",
  },
  links: {
    title: "Essential Links",
    icon: "🔗",
    description: "Official resources and regulatory documents",
  },
};

const categoryOrder = ["legal", "vocab", "tools", "links"];

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
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">
          Rules & Regulations
        </h2>
        <p className="text-gray-400 font-mono text-sm">
          California sport fishing regulations for San Diego waters
        </p>
      </div>

      <div className="space-y-10">
        {categoryOrder.map((cat) => {
          const items = info[cat];
          if (!items) return null;
          const meta = categoryMeta[cat];

          return (
            <section key={cat}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">{meta.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    {meta.title}
                  </h3>
                  <p className="text-xs font-mono text-gray-500">
                    {meta.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="bg-navy-800/40 border border-navy-700/40 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-mono text-sand mb-1">
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
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {item.value}
                      </p>
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

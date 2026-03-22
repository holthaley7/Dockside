import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Species" },
    { to: "/rules", label: "Rules & Regs" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-navy-700/50 bg-navy-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-2xl">⚓</span>
            <div>
              <h1 className="text-xl font-bold text-sand tracking-wide font-serif">
                Dockside
              </h1>
              <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">
                San Diego Sport Fishing Intelligence
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-mono tracking-wide transition-colors ${
                  location.pathname === link.to
                    ? "text-sand"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-navy-700/30 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs font-mono text-gray-600">
            Dockside &middot; San Diego Sport Fishing Intelligence &middot;{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useViewMode } from "../context/ViewModeContext";
import DocksideLogo from "./DocksideLogo";

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Layout() {
  const location = useLocation();
  const { compact, toggle } = useViewMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Biting Now" },
    { to: "/species", label: "Species" },
    { to: "/rules", label: "Rules & Regs" },
  ];

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  }

  // Close mobile menu on navigation
  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <>
      {/* Logo — scrolls with page, not sticky */}
      <div className="bg-navy-900 border-b border-navy-700/20 flex justify-center py-5">
        <Link to="/" onClick={handleNavClick}>
          <DocksideLogo size={160} />
        </Link>
      </div>

      {/* Sticky nav — plain block element, no flex parent, sticks to viewport */}
      <header className="border-b border-navy-700/50 bg-navy-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 relative flex items-center justify-center">
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-mono tracking-wide px-3 py-1.5 rounded-md transition-colors ${
                  isActive(link.to)
                    ? "text-sand bg-sand/10"
                    : "text-gray-500 hover:text-gray-300 hover:bg-navy-800/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="absolute right-2 flex items-center gap-2">
            <button
              onClick={toggle}
              title={compact ? "Switch to desktop view" : "Switch to mobile view"}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-md border border-navy-600 text-gray-400 hover:text-sand hover:border-sand/40 transition-colors"
            >
              {compact ? <MonitorIcon /> : <PhoneIcon />}
              <span className="hidden sm:inline">
                {compact ? "Desktop" : "Mobile"}
              </span>
            </button>

            <button
              className="sm:hidden p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-navy-700/50 bg-navy-900/95 px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={handleNavClick}
                className={`text-sm font-mono px-3 py-2.5 rounded-md transition-colors ${
                  isActive(link.to)
                    ? "text-sand bg-sand/10"
                    : "text-gray-400 hover:text-gray-200 hover:bg-navy-800/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="min-h-screen">
        <Outlet />
      </main>

      <footer className="border-t border-navy-700/20 py-5 mt-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[10px] font-mono text-gray-700">
            Dockside &middot; San Diego Sport Fishing Intelligence &middot;{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}

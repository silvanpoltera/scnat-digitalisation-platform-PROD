import { Link, useLocation } from "react-router-dom";
import ScnatLogo from "./ScnatLogo";
import SearchModal from "./SearchModal";
import { Menu, X, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const navItems = [
  { label: "Übersicht", path: "/" },
  { label: "Strategie", path: "/strategie" },
  { label: "Handlungsfelder", path: "/handlungsfelder" },
  { label: "Software & Co", path: "/systemlandschaft" },
  { label: "KI", path: "/ki-hub" },
  { label: "Prozesse", path: "/prozesse" },
  { label: "Team", path: "/team" },
  { label: "FAQs", path: "/faqs" },
  { label: "Glossar", path: "/glossar" },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-scnat-anthrazit-dark/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="shrink-0">
              <ScnatLogo />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={openSearch}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-white/50 border border-white/10 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs">Suchen</span>
                <kbd className="ml-1 hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono border border-white/10 rounded bg-white/5">
                  {isMac ? "⌘" : "Ctrl"}K
                </kbd>
              </button>
              <button
                className="sm:hidden p-2 text-white/60 hover:text-white"
                onClick={openSearch}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="lg:hidden p-2 text-white/60 hover:text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-scnat-anthrazit-dark">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={closeSearch} />
    </>
  );
}

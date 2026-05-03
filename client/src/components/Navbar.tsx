import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type NavbarMode = "landing" | "preview";
type LandingScrollState = {
  scrollTarget?: string;
};

type NavbarProps = {
  mode?: NavbarMode;
};

export function Navbar({ mode = "landing" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = useMemo(
    () =>
      mode === "preview"
        ? [
            { name: "Home", href: "/" },
            { name: "About", href: "/#about" },
            { name: "Features", href: "/#features" },
            { name: "Courses", href: "/#courses" },
            { name: "Events", href: "/#events" },
            { name: "Blog", href: "/#blog" },
            { name: "FAQ", href: "/#faq" },
          ]
        : [
            { name: "Home", href: "#" },
            { name: "About", href: "#about" },
            { name: "Features", href: "#features" },
            { name: "Courses", href: "#courses" },
            { name: "Events", href: "#events" },
            { name: "Blog", href: "#blog" },
            { name: "FAQ", href: "#faq" },
          ],
    [mode]
  );

  useEffect(() => {
    if (mode === "preview") {
      const handlePreviewScroll = () => {
        setScrolled(window.scrollY > 20);
        setIsAtBottom(false);
        if (location.pathname.startsWith("/blog")) {
          setActiveSection("Blog");
          return;
        }

        if (location.pathname.startsWith("/events")) {
          setActiveSection("Events");
          return;
        }

        setActiveSection("Courses");
      };

      window.addEventListener("scroll", handlePreviewScroll);
      handlePreviewScroll();
      return () => window.removeEventListener("scroll", handlePreviewScroll);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setIsAtBottom(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100);

      let currentActive = "Home";
      for (const link of navLinks) {
        if (link.href === "#" || link.href.startsWith("/")) continue;
        const element = document.querySelector(link.href);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            currentActive = link.name;
          }
        }
      }
      
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10) {
        currentActive = navLinks[navLinks.length - 1].name;
      }

      setActiveSection(currentActive);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, mode, navLinks]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);



  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    if (href.startsWith("/")) {
      const [pathname, hash = ""] = href.split("#");
      if (location.pathname !== pathname) {
        navigate(pathname, {
          state: hash ? ({ scrollTarget: hash } satisfies LandingScrollState) : undefined,
        });
      } else if (!hash) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.querySelector(`#${hash}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }

      setIsOpen(false);
      return;
    }

    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }

    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{
        y: isAtBottom ? -96 : 0,
        opacity: isAtBottom ? 0 : 1,
        paddingTop: scrolled || isOpen ? 16 : 24,
      }}
      transition={{
        y: { type: "spring", stiffness: 180, damping: 24, mass: 0.9 },
        opacity: { duration: 0.28, ease: "easeOut" },
        paddingTop: { type: "spring", stiffness: 220, damping: 26 },
      }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center ${isAtBottom ? "pointer-events-none" : "pointer-events-auto"}`}
    >
      <motion.div
        animate={{
          backgroundColor: scrolled || isOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0)",
          borderColor: scrolled || isOpen ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0)",
          borderRadius: scrolled || isOpen ? 999 : 24,
          paddingLeft: scrolled || isOpen ? 24 : 0,
          paddingRight: scrolled || isOpen ? 24 : 0,
          paddingTop: scrolled || isOpen ? 8 : 0,
          paddingBottom: scrolled || isOpen ? 8 : 0,
          boxShadow: scrolled || isOpen
            ? "0 20px 45px rgba(15, 23, 42, 0.08)"
            : "0 0 0 rgba(15, 23, 42, 0)",
        }}
        transition={{
          type: "spring",
          stiffness: 170,
          damping: 22,
          mass: 0.95,
        }}
        className="z-[60] mx-4 flex w-full max-w-7xl items-center justify-between border backdrop-blur-xl saturate-[1.8] ring-1 ring-white/20 sm:mx-6 lg:mx-8"
      >
        {/* Logo Section */}
        <div className="flex-1 flex items-center justify-start gap-3 py-2">
          <button
            type="button"
            onClick={handleLogoClick}
            className="font-display font-black text-2xl tracking-tighter text-foreground"
            aria-label="Go to home"
          >
            FortyFour
          </button>
        </div>

        {/* Desktop Navigation Pill */}
        <motion.nav
          animate={{
            backgroundColor: scrolled ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.10)",
            borderColor: scrolled ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.20)",
            paddingLeft: scrolled ? 0 : 6,
            paddingRight: scrolled ? 0 : 6,
            paddingTop: scrolled ? 0 : 6,
            paddingBottom: scrolled ? 0 : 6,
            boxShadow: scrolled
              ? "0 0 0 rgba(15, 23, 42, 0)"
              : "0 18px 40px rgba(15, 23, 42, 0.06)",
          }}
          transition={{
            type: "spring",
            stiffness: 190,
            damping: 24,
            mass: 0.9,
          }}
          className="hidden shrink-0 items-center gap-1 rounded-full border backdrop-blur-xl saturate-[1.8] ring-1 ring-white/20 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className={`px-5 py-2 rounded-full text-sm transition-all font-medium ${activeSection === link.name
                ? "bg-slate-100 text-blue-600 shadow-sm ring-1 ring-slate-200/50 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                }`}
            >
              {link.name}
            </a>
          ))}
        </motion.nav>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex flex-1 items-center justify-end gap-3 py-1 sm:gap-4 lg:gap-6">
          <button
            onClick={() => navigate("/login")}
            className="hidden text-sm font-bold text-slate-500 transition-colors hover:text-foreground sm:block"
          >
            {mode === "preview" ? "Sign In" : "Sign In"}
          </button>
          <Button
            onClick={() => navigate("/register")}
            className="hidden h-10 rounded-full border-none bg-blue-600 px-6 text-sm font-bold leading-none text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 sm:inline-flex lg:px-8"
          >
            {mode === "preview" ? "Sign Up" : "Sign Up"}
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 text-slate-600 transition-colors hover:text-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center overflow-y-auto bg-white/80 px-5 pb-10 pt-28 backdrop-blur-2xl lg:hidden sm:px-6 sm:pt-32"
          >
            <nav className="flex w-full max-w-sm flex-col items-center gap-5">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={(e) => {
                    handleScrollTo(e, link.href);
                    setIsOpen(false);
                  }}
                  className={`w-full rounded-2xl px-6 py-3 text-center text-xl font-bold transition-colors sm:text-2xl ${activeSection === link.name
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-800 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-6 flex w-full flex-col gap-4"
              >
                <button
                  onClick={() => { setIsOpen(false); navigate("/login"); }}
                  className="min-h-11 w-full rounded-2xl border border-slate-200 py-3.5 text-base font-bold text-slate-600 sm:text-lg"
                >
                  {mode === "preview" ? "Sign In" : "Sign In"}
                </button>
                <Button
                  onClick={() => { setIsOpen(false); navigate("/register"); }}
                  className="min-h-11 w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 sm:text-lg"
                >
                  {mode === "preview" ? "Sign Up" : "Sign Up"}
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

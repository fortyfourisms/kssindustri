import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#about" },
    { name: "Features", href: "#features" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${scrolled || isOpen ? "pt-4" : "pt-6"
        }`}
    >
      <div
        className={`w-full max-w-7xl mx-4 sm:mx-6 lg:mx-8 transition-all duration-500 flex items-center justify-between z-[60] ${scrolled || isOpen
          ? "bg-white/10 backdrop-blur-xl saturate-[1.8] border border-white/20 rounded-full px-6 sm:px-8 py-2 shadow-2xl shadow-black/5 ring-1 ring-white/20"
          : "px-0"
          }`}
      >
        {/* Logo Section */}
        <div className="flex-1 flex items-center justify-start gap-3 py-2">
          <span className="font-display font-black text-2xl tracking-tighter text-foreground">
            FortyFour
          </span>
        </div>

        {/* Desktop Navigation Pill */}
        <nav
          className={`hidden md:flex items-center transition-all duration-500 shrink-0 ${scrolled
            ? "bg-transparent border-none shadow-none ring-0 px-0 py-0"
            : "bg-white/10 backdrop-blur-xl saturate-[1.8] border border-white/20 rounded-full px-1.5 py-1.5 shadow-2xl shadow-black/5 ring-1 ring-white/20"
            }`}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`px-6 py-2 rounded-full text-sm transition-all font-medium ${link.name === "Home"
                ? "font-bold text-foreground"
                : "text-slate-500 hover:text-slate-900"
                }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6 py-1">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-bold text-slate-500 hover:text-foreground transition-colors hidden sm:block"
          >
            Sign In
          </button>
          <Button
            onClick={() => navigate("/register")}
            className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-10 text-sm font-bold shadow-lg shadow-blue-500/20 border-none transition-all hover:scale-105 active:scale-95 leading-none"
          >
            Sign Up
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 md:hidden bg-white/80 backdrop-blur-2xl px-6 pt-32 flex flex-col items-center"
          >
            <nav className="flex flex-col items-center gap-6 w-full max-w-sm">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-bold text-slate-800 hover:text-blue-600 transition-colors py-2"
                >
                  {link.name}
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col w-full gap-4 mt-8"
              >
                <button
                  onClick={() => { setIsOpen(false); navigate("/login"); }}
                  className="w-full py-4 rounded-2xl text-lg font-bold text-slate-600 border border-slate-200"
                >
                  Sign In
                </button>
                <Button
                  onClick={() => { setIsOpen(false); navigate("/register"); }}
                  className="w-full py-7 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                >
                  Sign Up
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

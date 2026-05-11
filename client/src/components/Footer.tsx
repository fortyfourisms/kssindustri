import React from "react";
import { Mail, Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";

type LandingScrollState = {
  scrollTarget?: string;
};

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

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
      return;
    }

    if (location.pathname !== "/") {
      navigate("/", {
        state:
          href === "#" || href === "#home"
            ? undefined
            : ({ scrollTarget: href.slice(1) } satisfies LandingScrollState),
      });
      return;
    }

    if (href === "#" || href === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("/");
  };

  return (
    <section className="relative w-full overflow-hidden bg-transparent py-12 sm:py-16 lg:py-20">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <footer className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[2.5rem] lg:rounded-[3rem]">
          <div className="p-6 sm:p-8 md:p-12 lg:p-16">
            {/* Top Navigation */}
            <nav className="mb-8 flex flex-wrap justify-center gap-x-4 gap-y-3 sm:gap-x-5 md:mb-10 md:gap-8 lg:gap-12">
              {[
                { label: "Home", href: "#home" },
                { label: "About", href: "#about" },
                { label: "Features", href: "#features" },
                { label: "Courses", href: "#courses" },
                { label: "Events", href: "#events" },
                { label: "Blog", href: "#blog" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleScrollTo(e, item.href)}
                  className="text-sm font-bold text-slate-900 transition-colors duration-300 hover:text-blue-600 sm:text-base"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <hr className="border-slate-500 mb-8 md:mb-12" />

            {/* Bottom Content */}
            <div className="grid grid-cols-1 items-center gap-10 text-center md:grid-cols-3 md:gap-12 md:text-left">
              {/* Logo Section */}
              <div className="relative flex h-24 items-center justify-center md:justify-start">
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none text-white font-bold italic leading-none opacity-10 md:left-0 md:translate-x-0" style={{ fontSize: 'clamp(4.5rem, 22vw, 10rem)', letterSpacing: '-0.05em' }}>
                  44
                </span>
                <button
                  type="button"
                  onClick={handleLogoClick}
                  className="relative z-10 text-[clamp(2.25rem,8vw,3.5rem)] font-black tracking-tighter text-slate-900"
                  aria-label="Go to home"
                >
                  FortyFour
                </button>
              </div>

              {/* Description */}
              <div className="flex justify-center">
                <p className="max-w-prose text-sm font-medium leading-relaxed text-slate-600 md:text-base">
                  Platform resmi Direktorat Keamanan Siber dan Sandi Industri, mendukung transformasi digital yang aman dan terpercaya.
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex items-center justify-center gap-3 md:justify-end">
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600">
                  <FaWhatsapp className="h-5 w-5" />
                </a>
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}

// Removing XIcon as we use lucide icons

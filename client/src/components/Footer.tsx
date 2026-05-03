import React from "react";
import { Twitter, Mail, Instagram } from "lucide-react";
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
    <section className="relative w-full overflow-hidden bg-transparent px-4 py-10 sm:py-14 md:px-8 md:py-20 lg:px-10">
      <div className="max-w-7xl mx-auto relative z-10">
        <footer className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[2.5rem] lg:rounded-[3rem]">
          <div className="p-6 sm:p-8 md:p-12 lg:p-16">
            {/* Top Navigation */}
            <nav className="mb-8 flex flex-wrap justify-center gap-x-5 gap-y-3 md:mb-10 md:gap-12">
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
                  className="text-base font-bold text-slate-900 transition-colors hover:text-blue-600 sm:text-lg"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <hr className="border-slate-500 mb-8 md:mb-12" />

            {/* Bottom Content */}
            <div className="grid grid-cols-1 items-center gap-10 text-center md:grid-cols-3 md:gap-12 md:text-left">
              {/* Logo Section */}
              <div className="relative flex justify-center md:justify-start items-center h-24">
                <span className="absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 text-white font-bold opacity-10 leading-none select-none pointer-events-none italic" style={{ fontSize: 'clamp(5rem, 25vw, 10rem)', letterSpacing: '-0.05em' }}>
                  44
                </span>
                <button
                  type="button"
                  onClick={handleLogoClick}
                  className="relative z-10 text-[clamp(2.5rem,7vw,3.5rem)] font-black tracking-tighter text-slate-900"
                  aria-label="Go to home"
                >
                  FortyFour
                </button>
              </div>

              {/* Description */}
              <div className="flex justify-center">
                <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-sm font-medium">
                  Platform resmi Direktorat Keamanan Siber dan Sandi Industri, mendukung transformasi digital yang aman dan terpercaya.
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex justify-center md:justify-end items-center gap-6">
                <a href="#" className="p-2 transition-transform hover:scale-110">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="p-2 transition-transform hover:scale-110">
                  <Mail className="w-6 h-6" />
                </a>
                <a href="#" className="p-2 transition-transform hover:scale-110">
                  <Instagram className="w-6 h-6" />
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

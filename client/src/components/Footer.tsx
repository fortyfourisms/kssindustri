import { Twitter, Mail, Instagram } from "lucide-react";

export function Footer() {
  return (
    <section className="relative w-full py-10 md:py-20 px-4 md:px-10 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto relative z-10">
        <footer className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-6 md:p-12 lg:p-16">
            {/* Top Navigation */}
            <nav className="flex flex-wrap justify-center gap-4 md:gap-12 mb-8 md:mb-10">
              {["Home", "About", "Features", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-900 font-bold text-lg hover:text-blue-600 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            <hr className="border-slate-500 mb-8 md:mb-12" />

            {/* Bottom Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-12 text-center md:text-left">
              {/* Logo Section */}
              <div className="relative flex justify-center md:justify-start items-center h-24">
                <span className="absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 text-white font-bold opacity-10 leading-none select-none pointer-events-none italic" style={{ fontSize: 'clamp(5rem, 25vw, 10rem)', letterSpacing: '-0.05em' }}>
                  44
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 relative z-10 tracking-tighter">
                  FortyFour
                </h2>
              </div>

              {/* Description */}
              <div className="flex justify-center">
                <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-sm font-medium">
                  Platform resmi Direktorat Keamanan Siber dan Kriptografi Industri, mendukung transformasi digital yang aman dan terpercaya.
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

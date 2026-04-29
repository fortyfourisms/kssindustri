import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Features } from "@/components/Features";
import { UsageFlow } from "@/components/UsageFlow";
import { Security } from "@/components/Security";
import { CourseShowcase } from "@/components/CourseShowcase";
import { EventSection } from "@/components/EventSection";
import { BlogSection } from "@/components/BlogSection";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { CyberBackground } from "@/components/CyberBackground";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";

type LandingScrollState = {
  scrollTarget?: string;
};

export default function Home() {
  const hasSeenLandingLoading = useAppStore((state) => state.hasSeenLandingLoading);
  const setHasSeenLandingLoading = useAppStore((state) => state.setHasSeenLandingLoading);
  const [isLoading, setIsLoading] = useState(() => !hasSeenLandingLoading);
  const location = useLocation();
  const scrollTarget = (location.state as LandingScrollState | null)?.scrollTarget;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const selector = scrollTarget ? `#${scrollTarget}` : location.hash;

    if (!selector) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const element = document.querySelector(selector);
    if (element) {
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [isLoading, location.hash, scrollTarget]);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen
            key="loading"
            onLoadingComplete={() => {
              setHasSeenLandingLoading(true);
              setIsLoading(false);
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <CyberBackground />
        <Navbar />
        <main className="relative z-10">
          <Hero />
          <About />
          <Features />
          <UsageFlow />
          <Security />
          <CourseShowcase />
          <EventSection />
          <BlogSection />
          <div className="relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: `
                  radial-gradient(80% 60% at 15% 90%, #595cff 0%, transparent 60%),
                  radial-gradient(70% 60% at 50% 100%, #0061ff 0%, transparent 60%),
                  radial-gradient(80% 70% at 95% 90%, #60efff 0%, transparent 60%),
                  linear-gradient(to top, #f2f4f8 0%, #ffffff 60%)
                `,
                filter: "blur(80px) saturate(140%)",
              }}
            />
            <div className="relative z-10">
              <FAQ />
              <CTA />
              <Footer />
            </div>
          </div>
        </main>
      </motion.div>
    </div>
  );
}

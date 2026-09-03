import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/landing/Navbar.jsx";
import { HeroSection } from "../components/landing/HeroSection.jsx";
import { OrbitShowcase } from "../components/landing/OrbitShowcase.jsx";
import { ProductShowcase } from "../components/landing/ProductShowcase.jsx";
import { PatientJourneyShowcase } from "../components/landing/PatientJourneyShowcase.jsx";
import { WorkflowTimeline } from "../components/landing/WorkflowTimeline.jsx";
import { ImpactMetricsSection } from "../components/landing/ImpactMetricsSection.jsx";
import { BookDemoBanner } from "../components/landing/BookDemoBanner.jsx";
import { FooterSection } from "../components/landing/FooterSection.jsx";

export function LandingPage() {
  const navigate = useNavigate();
  const [scrollRotation, setScrollRotation] = useState(0);
  const [showcaseProgress, setShowcaseProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("triage");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const rotation = window.scrollY * 0.12;
      setScrollRotation(rotation);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = rect.height;
      const offsetTop = -rect.top;
      const windowHeight = window.innerHeight;
      const totalScrollable = containerHeight - windowHeight;

      if (totalScrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, offsetTop / totalScrollable));
      setShowcaseProgress(progress);

      if (progress < 0.33) {
        setActiveTab("triage");
      } else if (progress < 0.66) {
        setActiveTab("record");
      } else {
        setActiveTab("track");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabClick = (tabId) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const containerTop = rect.top + scrollTop;
    const totalScrollable = rect.height - window.innerHeight;

    let targetScroll = containerTop;
    if (tabId === "record") {
      targetScroll = containerTop + totalScrollable * 0.5;
    } else if (tabId === "track") {
      targetScroll = containerTop + totalScrollable;
    }

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const handleNavigate = (path) => {
    if (path.startsWith("/#")) {
      const id = path.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-sans select-none overflow-x-clip text-slate-800 antialiased">
      <Navbar onNavigate={handleNavigate} />
      <HeroSection onNavigate={handleNavigate} />
      <OrbitShowcase scrollRotation={scrollRotation} onNavigate={handleNavigate} />
      <ProductShowcase
        containerRef={containerRef}
        activeTab={activeTab}
        showcaseProgress={showcaseProgress}
        handleTabClick={handleTabClick}
        onNavigate={handleNavigate}
      />
      <PatientJourneyShowcase />
      <WorkflowTimeline />
      <ImpactMetricsSection />
      <BookDemoBanner onNavigate={handleNavigate} />
      <FooterSection onNavigate={handleNavigate} />
    </div>
  );
}

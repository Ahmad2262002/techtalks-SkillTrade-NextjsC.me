"use client";

import { useRef, useState } from "react";
import styles from "../../app/(public)/Landing.module.css";
import { Search, Zap, Award, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Features() {
  const container = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);


  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Discover Expertise",
      desc: "Browse a curated collection of elite skills. From quantum physics to deep philosophy, find the master you seek.",
      color: "from-white/5 to-transparent",
      iconColor: "text-primary/60",
      stat: "2.4k+ Elite"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Connect & Propose",
      desc: "Initiate a strategic synergy request. Explain your unique value and align your intellectual goals.",
      color: "from-white/10 to-transparent",
      iconColor: "text-primary/80",
      stat: "Vetted Only"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "The Exchange",
      desc: "Engage in deliberate, one-on-one sanctuary sessions. Coordinate through our proprietary sync protocol.",
      color: "from-primary/5 to-transparent",
      iconColor: "text-primary",
      stat: "0.8s Sync"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Build Legacy",
      desc: "Earn permanent endorsements. Cultivate a verified portfolio of mastery and ascend the collective hierarchy.",
      color: "from-primary/10 to-transparent",
      iconColor: "text-primary",
      stat: "Elite Status"
    },
  ];

  useGSAP(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return; // Skip on mobile
    const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

    // Title reveal (Smoother)
    gsap.fromTo([`.${styles.sectionTitle}`, `.${styles.sectionDescription}`],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          toggleActions: "play none none none",
        },
      }
    );

    // Enhanced wave reveal with 3D rotation
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        {
          y: 100,
          rotateX: 15,
          rotateY: -10,
          opacity: 0,
          scale: 0.85
        },
        {
          y: 0,
          rotateX: 0,
          rotateY: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
            toggleActions: "play none none none",
          }
        }
      );
    });
  }, { scope: container });

  // 3D tilt effect on hover
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      duration: 1.2,
      ease: "power3.out"
    });
  };

  return (
    <section id="features" ref={container} className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>
            Platform Capabilities
          </span>
          <h2 className={cn(styles.sectionTitle, "font-playfair italic font-medium")}>
            The SkillTrade <span className="text-primary">Ecosystem</span>
          </h2>
          <p className={cn(styles.sectionDescription, "font-medium opacity-60 tracking-wide")}>
            A sanctified environment for intellectual convergence. Where knowledge is the only standard of value.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {steps.map((step, i) => (
            <div
              key={i}
              className={cn(styles.featureCard, "group feature-card")}
              style={{
                willChange: "transform, opacity",
                transformStyle: "preserve-3d"
              }}
              onMouseMove={(e) => handleCardMouseMove(e, i)}
              onMouseLeave={handleCardMouseLeave}
              onMouseEnter={() => setHoveredCard(i)}
            >
              <div className={styles.viscousGlow} />

              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${step.color.split(' ')[0].replace('from-', '')}, ${step.color.split(' ')[1].replace('to-', '')})`,
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              <div className={cn(
                styles.featureIcon,
                "bg-gradient-to-br transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                step.color,
                step.iconColor
              )}>
                <div className="transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                  {step.icon}
                </div>
              </div>

              <h3 className={cn(styles.featureTitle, "text-2xl font-playfair font-medium mb-4 transition-all duration-700 group-hover:text-primary")}>
                {step.title}
              </h3>

              <p className={cn(
                styles.featureDescription,
                "font-medium opacity-70 transition-all duration-300 group-hover:opacity-100"
              )}>
                {step.desc}
              </p>

              {/* Stat badge that appears on hover */}
              <div className={cn(
                "mt-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-wider border border-primary/20",
                "transform transition-all duration-500",
                hoveredCard === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {step.stat}
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
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

  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Discover Expertise",
      desc: "Browse a curated collection of skills. From quantum physics to sourdough baking, find exactly what you want to master.",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-cyan-500"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Connect & Propose",
      desc: "Found a match? Send a personalized swap request. Explain what you can offer and start the conversation.",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "The Exchange",
      desc: "Schedule your one-on-one sessions. Use our built-in chat to coordinate and start your knowledge exchange journey.",
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Build Reputation",
      desc: "Complete your swap and get endorsed. Build a portfolio of verified skills and become a top-rated mentor.",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-500"
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

    // Physical wave reveal (Elegantly slow)
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        {
          y: 80, // Less aggressive jump
          rotateZ: 4,
          opacity: 0,
          scale: 0.9
        },
        {
          y: 0,
          rotateZ: 0,
          opacity: 1,
          scale: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            toggleActions: "play none none none",
          }
        }
      );
    });
  }, { scope: container });

  return (
    <section id="features" ref={container} className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>
            Platform Capabilities
          </span>
          <h2 className={styles.sectionTitle}>
            The SkillTrade <span className="text-primary">Ecosystem</span>
          </h2>
          <p className={styles.sectionDescription}>
            Unlocking human potential through collaborative knowledge exchange. No money, just mastery.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {steps.map((step, i) => (
            <div
              key={i}
              className={cn(styles.featureCard, "group feature-card")}
              style={{ willChange: "transform, opacity" }}
            >
              <div className={styles.viscousGlow} />
              <div className={cn(
                styles.featureIcon,
                "bg-gradient-to-br transition-all duration-500 group-hover:scale-110",
                step.color,
                step.iconColor
              )}>
                {step.icon}
              </div>
              <h3 className={cn(styles.featureTitle, "text-2xl font-black mb-4")}>{step.title}</h3>
              <p className={cn(styles.featureDescription, "font-medium opacity-70")}>{step.desc}</p>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

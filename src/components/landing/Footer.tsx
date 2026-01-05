"use client";

import React, { useRef } from 'react';
import styles from "@/app/(public)/Landing.module.css";
import Link from 'next/link';
import Image from 'next/image';

import { Zap, Github, Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".footer-col", {
      scrollTrigger: {
        trigger: container.current,
        start: "top 90%",
      },
      y: 50,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: "expo.out"
    });
  }, { scope: container });

  return (
    <footer ref={container} className={styles.footer}>
      <div className={styles.container}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-8 footer-col">
            <Link href="/" className={cn(styles.logo, "hover:scale-105 transition-all duration-500 mb-2 flex items-center group")}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-4 shadow-xl shadow-primary/10 overflow-hidden border border-primary/20 transition-all group-hover:rotate-12">
                <Image
                  src="/favicon.ico"
                  alt="SkillSync Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">Skill<span className="text-primary not-italic">Sync</span></span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs">
              The world's first decentralized talent exchange. Join thousands of experts trading knowledge across 50+ countries. <span className="text-primary font-bold">Your skill is your wealth.</span>
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:scale-110 hover:-translate-y-1 transition-all shadow-xl shadow-black/5">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary mb-8 ml-1">Platform</h4>
            <ul className="space-y-5">
              {['Explore Swaps', 'Top Mentors', 'Community', 'Safety Center'].map(item => (
                <li key={item}><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all font-bold hover:translate-x-1 inline-block">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary mb-8 ml-1">Ecosystem</h4>
            <ul className="space-y-5">
              {['About Us', 'Success Stories', 'Partner Program', 'Careers'].map(item => (
                <li key={item}><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all font-bold hover:translate-x-1 inline-block">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary mb-8 ml-1">Intelligence Feed</h4>
            <p className="text-xs text-muted-foreground mb-6 font-bold leading-relaxed">Get the latest swap opportunities and protocol updates weekly.</p>
            <div className="relative group">
              <input
                type="email"
                placeholder="agent@skillsync.io"
                className="w-full bg-background/50 border-2 border-border/50 rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 footer-col">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
            © {new Date().getFullYear()} SkillSync Premium Registry. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

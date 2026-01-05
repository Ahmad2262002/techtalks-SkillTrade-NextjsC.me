"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import styles from "@/app/(public)/Landing.module.css";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ScrollSmoother } from 'gsap/dist/ScrollSmoother';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

interface NavbarProps {
  userId: string | null;
}

const Navbar = ({ userId }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();

    // 1. If we are NOT on the homepage, redirect to home first
    if (pathname !== "/") {
      router.push(`/${target}`);
      return;
    }

    // 2. If we ARE on home, use ScrollSmoother
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(target, true, "top top");
    } else {
      const element = document.querySelector(target);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(".nav-logo",
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.8, ease: "expo.out" }
    )
      .fromTo(".nav-item",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2, duration: 1.5, ease: "expo.out" },
        "-=1.4"
      )
      .fromTo(".nav-action",
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.5, ease: "expo.out" },
        "-=1.4"
      );

    // Scroll-based "Walking" effect
    gsap.to(container.current, {
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      },
      y: 10,
      ease: "none"
    });
  }, { scope: container });

  return (
    <header
      ref={container}
      className={cn(
        styles.navbar,
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 py-6",
        scrolled ? "py-4" : "py-8"
      )}
    >
      <div className={cn(
        "max-w-7xl mx-auto flex items-center justify-between px-10 h-22 rounded-[3rem] transition-all duration-700 relative overflow-hidden",
        scrolled
          ? "bg-background/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-[0.96] border border-white/10"
          : "bg-transparent border border-transparent"
      )}>
        {/* Scrolled Background Glow */}
        {scrolled && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        )}

        <Link href="/" className="nav-logo flex items-center gap-4 z-[60] hover:scale-110 transition-all opacity-0 group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center backdrop-blur-3xl border border-primary/20 shadow-2xl shadow-primary/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
            <Image
              src="/favicon.ico"
              alt="SkillSync Logo"
              width={34}
              height={34}
              className="object-contain transition-transform duration-500 group-hover:scale-125 relative z-10"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Skill<span className="text-primary not-italic">Sync</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-12">
          {['Home', 'Features', 'Browse'].map((item) => (
            <Link
              key={item}
              href={item === 'Home' ? '/' : item === 'Browse' ? '/dashboard' : '#features'}
              onClick={item === 'Features' ? (e) => handleSmoothScroll(e as any, "#features") : undefined}
              className="nav-item text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-primary transition-all hover:scale-110 opacity-0 relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center nav-action opacity-0">
            <ThemeCustomizer />
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-border/50 to-transparent mx-8" />
            {userId ? (
              <div className="flex items-center gap-5">
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 px-8 hover:bg-primary/5 hover:text-primary transition-all">Dashboard</Button>
                </Link>
                <form action={signOut}>
                  <Button type="submit" className="font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 px-8 bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">Logout</Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link href="/login">
                  <Button className="font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 px-10 bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all group overflow-hidden relative border-none">
                    <span className="relative z-10 flex items-center">
                      <Globe className="mr-3 w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-1000" />
                      Authorize Access
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button
            className="lg:hidden z-[60] w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-50 bg-background/98 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
        mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex flex-col items-center justify-center h-full gap-12 p-20">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-black uppercase tracking-tighter hover:text-primary transition-all hover:scale-110">Home</Link>
          <a
            href="#features"
            onClick={(e) => handleSmoothScroll(e, "#features")}
            className="text-5xl font-black uppercase tracking-tighter hover:text-primary transition-all hover:scale-110"
          >
            Features
          </a>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-5xl font-black uppercase tracking-tighter hover:text-primary transition-all hover:scale-110">Browse</Link>
          <div className="w-20 h-2 bg-primary rounded-full" />
          <div className="flex flex-col w-full max-w-sm gap-4">
            {userId ? (
              <Button onClick={() => setMobileMenuOpen(false)} className="h-16 rounded-[2rem] text-xl font-black bg-foreground text-background">Dashboard</Button>
            ) : (
              <Button onClick={() => setMobileMenuOpen(false)} className="h-16 rounded-[2rem] text-xl font-black bg-primary">Join Pulse</Button>
            )}
          </div>
          <ThemeCustomizer />
        </div>
      </div>
    </header>
  );
};

export default Navbar;

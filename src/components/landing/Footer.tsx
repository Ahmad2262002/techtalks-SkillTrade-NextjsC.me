"use client";

import React, { useRef, useState } from 'react';
import styles from "../../app/(public)/Landing.module.css";
import Link from 'next/link';
import Image from 'next/image';

import { Zap, Github, Twitter, Linkedin, Mail, MessageSquare, ArrowRight, CheckCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { submitContactForm } from '@/actions/contact-action';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const container = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Consolidated Contact + Footer Logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const result = await submitContactForm(data);
      if (result.success) {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useGSAP(() => {
    // Fail-safe: Disable animations on mobile to ensure visibility
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    gsap.from(".footer-anim", {
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom", // Trigger as soon as top hits bottom of viewport
        toggleActions: "play none none none"
      },
      y: 40,
      opacity: 0,
      duration: 1.4,
      stagger: 0.1,
      ease: "expo.out",
      clearProps: "all"
    });
  }, { scope: container });

  return (
    <footer ref={container} className={cn(styles.footer, "relative overflow-hidden pt-32 pb-12")}>

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className={cn(styles.container, "relative z-10")}>

        {/* --- Unified Contact Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32 footer-anim">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
              Need Help? <br />
              <span className="text-primary">Let's Connect.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium mb-10 max-w-md leading-relaxed">
              Our support team is active 24/7. Whether it's a dispute resolution or a feature request, we're here.
            </p>

            <div className="space-y-6">
              <a href="mailto:ahmadalkadri2002@gmail.com" className="flex items-center gap-4 group p-4 rounded-2xl bg-foreground/[0.05] border border-border/80 hover:border-primary/40 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-0.5">Direct Support</h4>
                  <span className="text-base font-bold group-hover:text-primary transition-colors">We are here to listen and help</span>
                </div>
              </a>

              <div className="flex items-center gap-4 group p-4 rounded-2xl bg-foreground/[0.05] border border-border/80 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-0.5">Community</h4>
                  <span className="text-base font-bold">10k+ Active Peers</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-2">Message Sent</h3>
                <p className="text-muted-foreground">We'll respond shortly.</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Name</label>
                    <Input name="name" required placeholder="Name" className="h-12 rounded-xl bg-foreground/[0.03] border-none focus-visible:ring-1 focus-visible:ring-primary font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                    <Input name="email" required type="email" placeholder="Email" className="h-12 rounded-xl bg-foreground/[0.03] border-none focus-visible:ring-1 focus-visible:ring-primary font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                  <Textarea name="message" required placeholder="How can we help?" className="min-h-[100px] rounded-xl bg-foreground/[0.03] border-none focus-visible:ring-1 focus-visible:ring-primary font-medium resize-none" />
                </div>
                <Button disabled={isSubmitting} className="w-full h-14 rounded-2xl text-sm font-black bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2 haptic-touch">
                  {isSubmitting ? "Sending..." : "Send Message"} <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>


        {/* --- Footer Links --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 border-t border-border/50 pt-16 footer-anim">
          <div className="flex flex-col gap-6">
            <Link href="/" className={cn(styles.logo, "hover:scale-105 transition-all duration-500 mb-2 flex items-center group")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-3 shadow-xl shadow-primary/10 overflow-hidden border border-primary/20 transition-all group-hover:rotate-12">
                <Image
                  src="/favicon.ico"
                  alt="SkillTrade Logo"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">Skill<span className="text-primary not-italic">Trade</span></span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs">
              The decentralized talent exchange. <br /><span className="text-primary font-bold">Your skill is your wealth.</span>
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-foreground/[0.03] border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all haptic-touch active:scale-95">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary mb-6 ml-1">Platform</h4>
            <ul className="space-y-4">
              {[
                { label: 'Explore Swaps', href: '/dashboard?tab=browse' },
                { label: 'Top Mentors', href: '/dashboard?tab=leaderboard' },
                { label: 'Community', href: 'https://discord.gg/skilltrade' },
                { label: 'Safety Center', href: '#' }
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-all font-bold hover:translate-x-1 inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary mb-6 ml-1">Ecosystem</h4>
            <ul className="space-y-4">
              {[
                { label: 'About Us', href: '#hero' },
                { label: 'Success Stories', href: '#reviews' }, // Assuming Reviews section needs an ID
                { label: 'Partner Program', href: '#' },
                { label: 'Careers', href: '#' }
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-all font-bold hover:translate-x-1 inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-primary mb-6 ml-1">Intelligence</h4>
            <p className="text-xs text-muted-foreground mb-4 font-bold leading-relaxed">Weekly protocol updates.</p>
            <div className="relative group">
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full bg-foreground/[0.03] border border-border/50 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-primary/50 transition-all"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-white px-4 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all haptic-touch">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-4 footer-anim">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
            © {new Date().getFullYear()} SkillTrade Premium Registry.
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

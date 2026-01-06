"use client";

import { cn } from "@/lib/utils";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Zap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function LoginPage() {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".auth-card", {
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out"
    });
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      router.refresh();
      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message ?? "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main ref={container} className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Decorative background orbs with more depth */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-start w-full mb-8 relative z-50">
          <Link href="/" className="back-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-background/60 hover:bg-background/80 border border-white/10 backdrop-blur-xl transition-all group shadow-xl hover:shadow-2xl active:scale-95">
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Back to Orbit</span>
          </Link>
        </div>

        <Card className="auth-card border-none bg-card/30 backdrop-blur-3xl shadow-[0_50px_120px_-30px_rgba(0,0,0,0.7)] rounded-[3.5rem] overflow-hidden border border-white/10 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-indigo-500 to-primary animate-gradient-x" />

          <CardHeader className="pt-14 px-12 pb-8">
            <div className="flex justify-between items-start mb-10">
              <div className="w-18 h-18 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-2xl shadow-primary/20 border border-primary/20 overflow-hidden group">
                <Image
                  src="/favicon.ico"
                  alt="SkillSync Logo"
                  width={40}
                  height={40}
                  className="object-contain transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12"
                />
              </div>
              <div className="flex bg-muted/30 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                <button
                  onClick={() => setMode("signin")}
                  className={cn(
                    "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    mode === "signin" ? "bg-background text-primary shadow-[0_10px_20px_rgba(0,0,0,0.2)]" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Login
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={cn(
                    "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    mode === "signup" ? "bg-background text-primary shadow-[0_10px_20px_rgba(0,0,0,0.2)]" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Join
                </button>
              </div>
            </div>

            <CardTitle className="text-6xl font-black tracking-tight uppercase italic leading-[0.9] mb-4">
              {mode === "signin" ? (
                <>Welcome <span className="text-primary not-italic">Back.</span></>
              ) : (
                <>Join the <span className="text-primary not-italic">Pulse.</span></>
              )}
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
              {mode === "signin" ? "IDENTIFICATION REQUIRED // SECTOR 7" : "IDENTITY INITIALIZATION // GLOBAL GRID"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="relative z-10">
            <CardContent className="space-y-10 px-12 pt-6">
              <div className="space-y-4 group">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 group-focus-within:text-primary transition-colors ml-1">
                  Node Identifier
                </Label>
                <div className="relative overflow-hidden rounded-2xl">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@skillsync.io"
                    className="h-18 rounded-2xl bg-background/20 border-2 border-white/5 focus:border-primary/40 focus:bg-background/40 transition-all px-8 font-bold text-lg placeholder:text-muted-foreground/20"
                  />
                  <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
                </div>
              </div>

              <div className="space-y-4 group">
                <div className="flex justify-between items-end px-1">
                  <Label htmlFor="password" dir="ltr" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 group-focus-within:text-primary transition-colors">
                    Access Crypt
                  </Label>
                  {mode === "signin" && (
                    <button type="button" className="text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                      Lost Key?
                    </button>
                  )}
                </div>
                <div className="relative overflow-hidden rounded-2xl">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-18 rounded-2xl bg-background/20 border-2 border-white/5 focus:border-primary/40 focus:bg-background/40 transition-all pl-8 pr-16 font-bold text-lg placeholder:text-muted-foreground/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors z-20"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
                </div>
              </div>

              {error && (
                <div className="p-6 rounded-3xl bg-destructive/5 border border-destructive/20 text-[10px] font-black uppercase tracking-[0.2em] text-destructive animate-in fade-in slide-in-from-top-4 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-ping" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-10 p-12 mt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-20 rounded-[2rem] bg-primary text-white shadow-[0_25px_60px_-15px_rgba(var(--primary),0.5)] hover:shadow-[0_30px_70px_-10px_rgba(var(--primary),0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-[0.4em] relative overflow-hidden group border-none"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" ? "Initialize Sync" : "Create Master Node"}
                      <Zap className="w-4 h-4 fill-white animate-pulse" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>

              <div className="flex items-center justify-center gap-6 opacity-30">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-foreground" />
                <span className="text-[9px] font-black uppercase tracking-[0.6em] italic whitespace-nowrap">Secure Uplink Established</span>
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-foreground" />
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}

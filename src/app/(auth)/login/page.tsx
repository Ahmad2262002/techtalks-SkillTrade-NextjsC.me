"use client";

import { cn } from "@/lib/utils";
import { authSchema } from "@/lib/validations/auth";

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
import { useToast } from "@/components/ui/use-toast";


export default function LoginPage() {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();


  useGSAP(() => {
    const tl = gsap.timeline();

    // Initial Entrance
    tl.fromTo(".auth-card",
      { y: 60, opacity: 0, scale: 0.95, filter: "blur(20px)" },
      { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out", clearProps: "all" }
    )
      .from(".auth-header-item", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out"
      }, "-=1.0")
      .from(".auth-input-group", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "expo.out",
        clearProps: "all"
      }, "-=0.8")
      .from(".auth-footer-item", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        clearProps: "all"
      }, "-=1.0");

  }, { scope: container });

  // Mode Switch Animation
  useGSAP(() => {
    gsap.fromTo(".auth-form-content",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" }
    );
  }, { scope: container, dependencies: [mode] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Zod Validation
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const firstError = (result.error as any).errors?.[0]?.message || "Invalid input parameters";
      setError(firstError);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    try {
      const { id: toastId, update } = toast({
        title: "Syncing Master Node",
        description: "Establishing secure uplink to the global grid...",
        variant: "loading",
        duration: 8000,
      });

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        update({
          id: toastId,
          title: "Access Granted",
          description: "Welcome back to the Orbit, Agent.",
          variant: "success",
          duration: 3000,
        });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          update({
            id: toastId,
            title: "Check Your Email",
            description: "We've sent a magic link to your inbox. Verify to access the grid.",
            variant: "default",
            duration: 10000,
          });
          setLoading(false);
          return; // Stop here, user needs to verify email
        }

        update({
          id: toastId,
          title: "Node Created",
          description: "Your master identity has been synchronized. Entering orbit...",
          variant: "success",
          duration: 3000,
        });
      }

      // Fast transition - speed up the process
      setTimeout(() => {
        router.refresh();
        router.push("/dashboard");
      }, 100);

    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMessage = err.message ?? "Authentication failed. Please check your credentials.";

      if (errorMessage.toLowerCase().includes("email not confirmed") || errorMessage.toLowerCase().includes("email not verified")) {
        errorMessage = "Identity not verified. Check your inbox for the activation link.";
      } else if (errorMessage.toLowerCase().includes("invalid login credentials")) {
        errorMessage = "Verification failed. Check your access crypt (password).";
      }

      setError(errorMessage);
      toast({
        title: "Link Terminated",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main ref={container} className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-y-auto py-20 sm:py-6">
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

        <Card className="auth-card border-none bg-card/30 backdrop-blur-3xl shadow-[0_50px_120px_-30px_rgba(0,0,0,0.5)] rounded-[3.5rem] border border-white/10 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-indigo-500 to-primary animate-gradient-x" />

          <CardHeader className="pt-14 px-12 pb-8">
            <div className="flex justify-between items-start mb-10">
              <div className="auth-header-item w-20 h-20 rounded-[2.5rem] bg-primary/20 dark:bg-primary/20 flex items-center justify-center shadow-xl shadow-primary/20 dark:shadow-2xl border border-primary/30 dark:border-primary/10 overflow-hidden group">
                <Image
                  src="/favicon.ico"
                  alt="SkillTrade Logo"
                  width={44}
                  height={44}
                  className="object-contain transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 icon-premium"
                />
              </div>
              <div className="auth-header-item flex bg-muted/30 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={cn(
                    "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    mode === "signin" ? "bg-background text-primary shadow-[0_10px_20px_rgba(0,0,0,0.2)]" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Login
                </button>
                <button
                  type="button"
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

            <CardTitle className="auth-header-item text-6xl font-black tracking-tight uppercase italic leading-[0.9] mb-4">
              {mode === "signin" ? (
                <>Welcome <span className="text-primary not-italic">Back.</span></>
              ) : (
                <>Join the <span className="text-primary not-italic">Pulse.</span></>
              )}
            </CardTitle>
            <CardDescription className="auth-header-item text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
              {mode === "signin" ? "IDENTIFICATION REQUIRED // SECTOR 7" : "IDENTITY INITIALIZATION // GLOBAL GRID"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="relative z-10">
            <CardContent className="auth-form-content space-y-10 px-12 pt-6">
              <div className="auth-input-group space-y-4 group">
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
                    placeholder="agent@skilltrade.solutions"
                    className="h-18 rounded-2xl bg-background/20 border-2 border-white/5 focus:border-primary/40 focus:bg-background/40 transition-all px-8 font-bold text-lg placeholder:text-muted-foreground/20"
                  />
                  <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
                </div>
              </div>

              <div className="auth-input-group space-y-4 group">
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
                className="auth-footer-item w-full h-20 rounded-[2rem] bg-primary text-white hover:scale-110 active:scale-95 transition-all font-black text-xs uppercase tracking-[0.4em] relative overflow-hidden group border-none shadow-premium-vibrant haptic-touch"
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

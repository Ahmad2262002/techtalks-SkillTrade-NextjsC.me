"use client";

import React, { useState } from 'react';
import { Mail, MessageSquare, Globe, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { submitContactForm } from '@/actions/contact-action';

export default function Contact() {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            message: formData.get('message') as string,
        };

        const result = await submitContactForm(data);

        setLoading(false);

        if (result.success) {
            setSent(true);
            setTimeout(() => setSent(false), 5000);
        } else {
            setError(result.error || 'Failed to send message');
        }
    };

    return (
        <section id="contact" className="py-32 px-6 bg-background relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">
                            Need Help <br />
                            <span className="text-primary">Getting Started?</span>
                        </h2>
                        <p className="text-xl text-muted-foreground font-medium mb-12 max-w-md leading-relaxed">
                            Our support team is here to help you navigate the swap ecosystem. Ask us anything about guidelines, security, or platform features.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-xs mb-1">Direct Support</h4>
                                    <a href="mailto:ahmadalkadri2002@gmail.com" className="text-lg font-bold hover:text-primary transition-colors">ahmadalkadri2002@gmail.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-111 transition-transform duration-300">
                                    <MessageSquare className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-xs mb-1">Community Discord</h4>
                                    <p className="text-lg font-bold">Join 10k+ Members</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-1 pr-1 pb-1 rounded-[3.5rem] bg-gradient-to-br from-primary/20 via-border to-purple-500/20 shadow-2xl">
                        <div className="bg-card rounded-[3.2rem] p-10 md:p-14">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Message Sent!</h3>
                                    <p className="text-muted-foreground font-medium">We'll get back to you at ahmadalkadri2002@gmail.com shortly.</p>
                                </div>
                            ) : (
                                <form className="space-y-8" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                            <Input name="name" required placeholder="John Doe" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary font-bold px-6" disabled={loading} />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                            <Input name="email" required type="email" placeholder="john@example.com" className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary font-bold px-6" disabled={loading} />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Message</label>
                                        <Textarea name="message" required placeholder="How can we help you?" className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary font-medium p-6" disabled={loading} />
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                                            <p className="text-sm font-bold text-destructive">{error}</p>
                                        </div>
                                    )}

                                    <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl text-lg font-black bg-primary shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3 group disabled:opacity-50 disabled:cursor-not-allowed haptic-touch">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 pt-4 opacity-50">
                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Average Response: 12 Hours</span>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

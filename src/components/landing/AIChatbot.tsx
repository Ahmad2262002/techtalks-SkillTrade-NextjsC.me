"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Send as SendIcon, Zap } from 'lucide-react';
import { detectPerformanceTier } from '@/lib/performance';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLowPerf, setIsLowPerf] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'System Online. I am the SkillTrade Strategic Sync Orchestrator. How may I facilitate your professional expertise exchange today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const perf = detectPerformanceTier();
        setIsLowPerf(perf.tier === 'low');

        // Auto-open after delay on high-perf devices
        if (perf.tier !== 'low') {
            const timer = setTimeout(() => handleOpen(true), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleOpen = (open: boolean) => {
        if (open) {
            setIsOpen(true);
            // Wait for DOM update
            setTimeout(() => {
                if (containerRef.current) {
                    gsap.fromTo(containerRef.current,
                        { y: 100, opacity: 0, scale: 0.9, transformOrigin: 'bottom right' },
                        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }
                    );
                }
            }, 0);
        } else {
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    y: 50, opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.in',
                    onComplete: () => setIsOpen(false)
                });
            } else {
                setIsOpen(false);
            }
        }
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I apologize, but I am unable to process your request at this moment. Please check your connection."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLowPerf && !isOpen) {
        return (
            <button
                onClick={() => handleOpen(true)}
                className="fixed bottom-6 right-6 z-[60] p-4 rounded-full bg-primary text-white shadow-2xl hover:scale-110 transition-all"
            >
                <Bot size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            {!isOpen && (
                <button
                    ref={buttonRef}
                    onClick={() => handleOpen(true)}
                    onMouseEnter={() => gsap.to(buttonRef.current, { scale: 1.1, duration: 0.3 })}
                    onMouseLeave={() => gsap.to(buttonRef.current, { scale: 1, duration: 0.3 })}
                    className="group relative p-5 rounded-full bg-background/20 backdrop-blur-xl border border-primary/20 shadow-[0_0_50px_rgba(var(--primary),0.3)] transition-all"
                >
                    {!isLowPerf && <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />}
                    <Bot className="relative z-10 text-primary w-7 h-7" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                </button>
            )}

            {isOpen && (
                <div
                    ref={containerRef}
                    className="w-[380px] h-[550px] rounded-[2.5rem] overflow-hidden bg-background/80 backdrop-blur-2xl border border-primary/20 shadow-[0_20px_80px_rgba(0,0,0,0.5)] flex flex-col relative"
                >
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-primary/20 to-indigo-500/20 border-b border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-primary/20">
                                <Sparkles className="text-primary w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Sync Orchestrator</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Strategic Intelligence Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleOpen(false)}
                            aria-label="Close Intelligence Assistant"
                            className="p-2 hover:bg-error/20 rounded-xl transition-colors group"
                        >
                            <X className="w-4 h-4 text-muted-foreground group-hover:text-error" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex flex-col gap-2 max-w-[85%]",
                                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div className={cn(
                                    "p-4 rounded-[1.5rem]",
                                    msg.role === 'user'
                                        ? "bg-primary text-white rounded-tr-none shadow-lg"
                                        : "bg-muted/50 backdrop-blur-md border border-white/5 rounded-tl-none"
                                )}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-black uppercase opacity-40">
                                    {msg.role === 'user' ? 'Sync User' : 'ST Intelligence'}
                                </span>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex flex-col gap-2 max-w-[85%] mr-auto items-start">
                                <div className="p-4 rounded-[1.5rem] bg-muted/50 backdrop-blur-md border border-white/5 rounded-tl-none flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                                </div>
                                <span className="text-[10px] text-muted-foreground font-black uppercase opacity-40">
                                    Analyzing
                                </span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-white/5 bg-background/40">
                        <div className="relative">
                            <input
                                type="text"
                                aria-label="Query Strategic Intelligence"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Consult intelligence orchestrator..."
                                className="w-full bg-muted/30 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-all placeholder:text-muted-foreground/30"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-2 p-2.5 rounded-xl bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                <SendIcon size={16} />
                            </button>
                        </div>
                        <p className="text-center mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 flex items-center justify-center gap-2">
                            <Zap size={10} className="text-primary" /> Master your expertise via AI
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

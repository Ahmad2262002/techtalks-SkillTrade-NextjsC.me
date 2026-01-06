"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import styles from "../../app/(public)/Landing.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

import { Review } from "@/types/dashboard";

interface RecentReviewsProps {
    reviews: Review[];
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top 75%",
                end: "bottom 25%",
                toggleActions: "play none none reverse"
            }
        });

        tl.from(`.${styles.sectionTitle}, .${styles.eyebrow}, .${styles.sectionDescription}`, {
            y: 50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "expo.out",
            clearProps: "all"
        })
            .from(".review-card", {
                y: 60,
                opacity: 0,
                duration: 1.4,
                stagger: 0.1,
                ease: "expo.out",
                clearProps: "all"
            }, "-=1.0");

    }, { scope: container });

    if (!reviews || reviews.length === 0) return null;

    return (
        <section ref={container} className={styles.section}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={styles.eyebrow}>
                        Verified Endorsements
                    </span>
                    <h2 className={styles.sectionTitle}>
                        Success <span className="text-primary">Stories</span>
                    </h2>
                    <p className={styles.sectionDescription}>
                        Authentic feedback from our growing decentralized network of learners.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <div
                            key={review.id}
                            className={cn(styles.glassCard, "group relative review-card")}
                        >
                            <div className={styles.viscousGlow} />
                            <div className="absolute top-8 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                                <Quote className="w-16 h-16 fill-current" />
                            </div>

                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, star) => (
                                    <Star
                                        key={star}
                                        className={cn(
                                            "w-4 h-4",
                                            star < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
                                        )}
                                    />
                                ))}
                            </div>

                            <p className="text-xl font-bold tracking-tight text-foreground/90 italic mb-8 leading-relaxed">
                                &quot;{review.comment || "An incredible skill exchange session. Highly recommended!"}&quot;
                            </p>

                            <div className="flex items-center gap-4 border-t border-border/50 pt-8 mt-auto">
                                <Avatar className="h-12 w-12 border-2 border-primary/20">
                                    <AvatarImage src={review.author?.avatarUrl ?? undefined} />
                                    <AvatarFallback className="font-black">{review.author?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-foreground">{review.author?.name}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verified Learner</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

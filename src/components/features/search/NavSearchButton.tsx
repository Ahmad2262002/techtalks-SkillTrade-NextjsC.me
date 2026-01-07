// components/NavSearchButton.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search as SearchIcon, X as XIcon } from "lucide-react";
import SearchSection from "../../../components/features/search/SearchSection";

export default function NavSearchButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // prevent body scroll while modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const modalContent = open ? (
    <div
      className="fixed inset-0 z-[10000] flex flex-col isolate"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop - Solid background to fully hide sidebar */}
      <div
        className="fixed inset-0 bg-background/100 backdrop-blur-3xl transition-all duration-500 animate-in fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative z-10 flex flex-col items-center justify-end sm:justify-center w-full h-full p-0 sm:p-4 lg:p-8 pointer-events-none">
        <div
          ref={panelRef}
          className="pointer-events-auto w-full h-full sm:h-[90vh] sm:max-w-6xl bg-background sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500 ring-1 ring-border/50 border border-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/10 bg-muted/30 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                <SearchIcon className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-black tracking-tight text-foreground leading-none">Global Search</h3>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1.5">Exploring Skills & Opportunities</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-3 hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border/50 group"
                aria-label="Close search"
              >
                <XIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* content */}
          <div className="flex-1 overflow-auto bg-background/50 relative">
            <SearchSection />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-primary/40 bg-primary px-3 sm:px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/40 transition-all hover:scale-[1.05] hover:shadow-primary/60 cursor-pointer active:scale-95"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <SearchIcon className="h-5 w-5 sm:mr-2 transition-transform group-hover:rotate-12" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {mounted && typeof document !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
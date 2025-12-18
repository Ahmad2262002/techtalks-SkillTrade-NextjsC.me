<<<<<<< HEAD:src/components/landing/Navbar.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

// Define the props interface
interface NavbarProps {
  userId: string | null;
}

// Use the props in the component signature
const Navbar = ({ userId }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between px-8 py-6 absolute top-0 w-full z-50 text-white">
      <Link href="/" className="text-2xl font-bold tracking-wider">
        Skill<span className="text-purple-400">Swap</span>
      </Link>
      
      <ul className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
        <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
        <li><Link href="/#features" className="hover:text-white transition-colors">How It Works</Link></li>
        <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
      </ul>

      <div className="flex items-center gap-4">
        {userId ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Dashboard
              </Button>
            </Link>
            <form action={signOut}>
              <Button type="submit" className="rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700">
                Logout
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Log In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 border-0">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

=======
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import styles from '@/app/(public)/Landing.module.css';

interface NavbarProps {
  userId: string | null;
}

const Navbar = ({ userId }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className={`${styles.container} ${styles.navContent}`}>
        <Link href="/" className={styles.logo}>
          Skill<span>Swap</span>
        </Link>
        
        <nav className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/#features">How It Works</Link>
          <Link href="/browse">Browse</Link>
        </nav>

        <div className={styles.navActions}>
          <ThemeToggleButton />
          {userId ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <form action={signOut}>
                <Button type="submit">Logout</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/login">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

>>>>>>> 51fea53e9c3c640ee6fd7ebf5d71800b1e27a859:skill-sync/src/components/landing/Navbar.tsx
export default Navbar;
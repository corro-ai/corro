"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Code2 as Github, ExternalLink } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-zinc-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
          🔬 <span>Corro</span>
        </Link>

        {/* Right: Links */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/corro-ai/corro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            <Github size={18} />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <Link
            href="/projects"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
          >
            Try Corro Free →
          </Link>
        </div>
      </div>
    </nav>
  );
}
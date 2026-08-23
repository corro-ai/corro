import Link from "next/link";
import { Code2 as Github, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-full px-4 py-1.5 mb-8 text-sm">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-zinc-400">Open Source · Built in Public</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
          <span className="text-white">Turn customer calls into</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            evidence-cited specs.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop writing PRDs from memory. Corro traces every requirement to a real
          customer quote and backs every priority with hard data. Built for PMs
          who feed specs to AI coding agents.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/projects"
            className="group bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center gap-2"
          >
            Try Corro Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="https://github.com/corro-ai/corro"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all flex items-center gap-2"
          >
            <Github size={18} />
            Star on GitHub
          </a>
        </div>

        {/* Product preview */}
        <div className="mt-16 relative">
          {/* Glow behind the preview */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent rounded-2xl blur-2xl" />

          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl shadow-indigo-500/10">
            <div className="bg-zinc-900 rounded-xl p-6 min-h-[300px] flex items-center justify-center">
              <div className="text-left max-w-lg w-full space-y-4">
                {/* Fake report preview */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-zinc-600 text-xs ml-2 font-mono">corro — insight report</span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white font-bold text-sm">🔥 Theme: Pricing Page Confusion</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Users repeatedly struggle with the pricing tiers.
                    <span className="inline-flex items-center bg-indigo-500/15 text-indigo-400 text-xs px-1.5 py-0.5 rounded ml-1 font-mono cursor-pointer hover:bg-indigo-500/25 transition-colors">[1]</span>
                  </p>
                  <blockquote className="border-l-2 border-indigo-500 pl-3 text-zinc-500 text-sm italic">
                    "I stared at the pricing page for 10 minutes and still couldn't figure out which plan I needed."
                  </blockquote>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">pain</span>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">severity: 5/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
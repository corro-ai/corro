import { Link2, Quote, Database, FileCode2 } from "lucide-react";

export default function EvidenceChain() {
  return (
    <section className="py-32 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          The Unbroken Chain of Evidence
        </h2>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Corro's entire architecture is designed around one strict rule: 
          no insight, theme, or spec can exist without tracing back to a verbatim quote.
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative">
        {/* The glowing vertical line */}
        <div className="absolute top-10 bottom-10 left-[27px] sm:left-1/2 sm:-translate-x-1/2 w-[2px] bg-gradient-to-b from-indigo-500/0 via-indigo-500 to-indigo-500/0" />

        <div className="space-y-12">
          
          {/* Step 1 */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
            <div className="hidden sm:block flex-1 text-right text-zinc-500 text-sm font-medium uppercase tracking-widest">
              Raw Source
            </div>
            <div className="relative z-10 w-14 h-14 rounded-full bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Quote className="text-indigo-400" size={24} />
            </div>
            <div className="flex-1 bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative">
              <p className="text-zinc-300 italic">"I stared at the pricing page for 10 minutes and still couldn't figure out which plan I needed."</p>
              <p className="text-xs text-zinc-500 mt-2 font-mono">04:12 - Vikram (Onboarding Call)</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
            <div className="hidden sm:block flex-1 text-right text-zinc-500 text-sm font-medium uppercase tracking-widest">
              Database
            </div>
            <div className="relative z-10 w-14 h-14 rounded-full bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center flex-shrink-0">
              <Database className="text-indigo-400" size={24} />
            </div>
            <div className="flex-1 bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/20">pain_point</span>
                <span className="text-zinc-400 text-xs font-mono">Severity: 5</span>
              </div>
              <p className="text-white font-medium">Pricing tier confusion</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
            <div className="hidden sm:block flex-1 text-right text-zinc-500 text-sm font-medium uppercase tracking-widest">
              Live Contract
            </div>
            <div className="relative z-10 w-14 h-14 rounded-full bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <FileCode2 className="text-indigo-400" size={24} />
            </div>
            <div className="flex-1 bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative">
              <p className="text-zinc-400 text-sm mb-2 font-mono">Feature Brief Generated</p>
              <h3 className="text-white font-bold text-lg mb-2">Redesign Pricing Table</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Add a toggle for monthly/annual billing and clearly distinguish enterprise features.
                <span className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-400 text-xs px-1.5 py-0.5 rounded ml-2 font-mono"><Link2 size={10} /> Cited</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
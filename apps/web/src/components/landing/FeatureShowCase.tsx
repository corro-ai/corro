import { Search, LineChart, FileText } from "lucide-react";

export default function FeatureShowcase() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto space-y-32">
        
        {/* Feature 1: Reports */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <FileText size={14} /> Phase 1
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Evidence-Cited Reports</h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Never wonder where a requirement came from. Every claim in a Corro report is 
              backed by a citation pill. Click it to see the exact transcript quote, 
              speaker, and timestamp.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl relative group">
              <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl" />
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 relative">
                <div className="h-40 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 font-mono text-sm">
                  [Report UI Mockup]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Evidence Chat (Reversed) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6 md:pl-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Search size={14} /> Phase 2
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">RAG Evidence Chat</h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Ask your corpus questions like <em>"What did users say about the mobile app?"</em> 
              Corro uses pgvector to find the semantic matches and generates an answer 
              with confidence scores and source links.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl relative group">
              <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl" />
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 relative">
                 <div className="h-40 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 font-mono text-sm">
                  [Chat UI Mockup]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Opportunity Engine */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <LineChart size={14} /> Phase 3
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Qual × Quant Engine</h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Upload your PostHog or Amplitude metrics CSV. Corro cross-references 
              your funnel drop-offs with your interview transcripts to automatically 
              rank product opportunities using RICE scoring.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl relative group">
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl" />
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 relative">
                 <div className="h-40 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 font-mono text-sm">
                  [Opportunity UI Mockup]
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
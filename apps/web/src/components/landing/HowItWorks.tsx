import { UploadCloud, Cpu, FileSignature, ArrowRight } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: UploadCloud,
    title: "Upload Transcripts",
    desc: "Drop in .vtt, .srt, .txt, or audio files from your customer calls. Corro parses the speakers and timestamps.",
  },
  {
    num: "02",
    icon: Cpu,
    title: "AI Extracts Evidence",
    desc: "Our engine chunks the dialogue, extracts pain points, and clusters them into themes using Llama 3.3 and semantic search.",
  },
  {
    num: "03",
    icon: FileSignature,
    title: "Cited Specs Generated",
    desc: "Get an OpenSpec-compatible markdown brief where every claim links back to a verbatim customer quote.",
    highlight: true,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-zinc-950/50 border-y border-zinc-900">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-zinc-500 text-sm font-medium uppercase tracking-widest mb-4">
          The Pipeline
        </p>
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-white mb-16">
          How Corro Works
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connector lines (hidden on mobile) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-zinc-800 via-indigo-500/30 to-zinc-800" />

          {steps.map((step, idx) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center text-center">
              {/* Icon circle */}
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 border-black ${
                  step.highlight 
                    ? "bg-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.4)]" 
                    : "bg-zinc-900"
                }`}
              >
                <step.icon size={36} className={step.highlight ? "text-white" : "text-zinc-400"} />
              </div>

              {/* Step number badge */}
              <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono px-2 py-0.5 rounded mb-3">
                STEP {step.num}
              </div>

              {/* Text content */}
              <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              
              {/* Mobile arrow (hidden on desktop) */}
              {idx < steps.length - 1 && (
                <ArrowRight className="md:hidden text-zinc-700 mt-6" size={24} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
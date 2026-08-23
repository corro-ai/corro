import Link from "next/link";
import { Code2 as Github, ArrowRight, LockOpen } from "lucide-react";

export default function OpenSourceCTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-900/10" />
      
      <div className="max-w-3xl mx-auto text-center relative z-10 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 backdrop-blur-sm">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <LockOpen size={32} className="text-white" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          100% Open Source. Always.
        </h2>
        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
          Corro is built in public. You can self-host the entire pipeline, inspect every prompt, 
          and verify the evidence chain yourself. 
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/projects"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all flex items-center gap-2"
          >
            Try Corro Free
            <ArrowRight size={18} />
          </Link>

          <a
            href="https://github.com/corro-ai/corro"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all flex items-center gap-2"
          >
            <Github size={18} />
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
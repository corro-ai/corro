"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BrainCircuit } from "lucide-react";

export default function ReportPollingState() {
  const router = useRouter();

  useEffect(() => {
    // Poll the server component every 5 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
      <div className="relative w-24 h-24 flex items-center justify-center mb-8">
        <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
        <BrainCircuit size={32} className="text-indigo-400 animate-pulse" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">Pipeline Running</h2>
      <p className="text-zinc-400 max-w-md mx-auto text-lg leading-relaxed">
        Corro is currently parsing your transcript, extracting pain points, and generating evidence-cited specs using Llama 3.3.
      </p>
      
      <div className="mt-8 flex items-center gap-2 text-sm text-zinc-500 font-mono bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800">
        <Loader2 size={14} className="animate-spin text-indigo-400" />
        <span>Polling database for completed report...</span>
      </div>
    </div>
  );
}

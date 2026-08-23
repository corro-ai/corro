"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Quote, BarChart2, AlertCircle } from "lucide-react";

export default function FeatureBriefViewer({ params }: { params: { opportunityId: string } }) {
  const [brief, setBrief] = useState<any>(null);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchData();
  }, [params.opportunityId]);

  async function fetchData() {
    // 1. Fetch Opportunity
    const { data: oppData } = await supabase
      .from("opportunities")
      .select("*")
      .eq("id", params.opportunityId)
      .single();
    if (oppData) setOpportunity(oppData);

    // 2. Fetch the Generated Brief
    const { data: briefData } = await supabase
      .from("feature_briefs")
      .select("*")
      .eq("opportunity_id", params.opportunityId)
      .single();
    if (briefData) setBrief(briefData);

    // 3. Fetch the Evidence Glue
    const { data: evidence } = await supabase
      .from("opportunity_evidence")
      .select("*")
      .eq("opportunity_id", params.opportunityId);

    if (evidence && evidence.length > 0) {
      const metricIds = evidence.filter(e => e.type === "metric").map(e => e.metric_id);
      const insightIds = evidence.filter(e => e.type === "insight").map(e => e.insight_id);

      // 4. Fetch actual Evidence Data
      if (metricIds.length > 0) {
        const { data: mData } = await supabase.from("metrics").select("*").in("id", metricIds);
        if (mData) setMetrics(mData);
      }
      
      if (insightIds.length > 0) {
        const { data: iData } = await supabase.from("insights").select("*").in("id", insightIds);
        if (iData) setInsights(iData);
      }
    }
    
    setLoading(false);
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Spec...</div>;
  }

  if (!brief) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold">Brief Not Found</h2>
        <p className="text-zinc-400">Click "Generate Brief" on the dashboard first.</p>
        <Link href={`/opportunities/${opportunity?.project_id}`} className="mt-6 text-indigo-400 hover:underline">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link href={`/opportunities/${opportunity?.project_id}`} className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">Feature Spec</h1>
            <p className="text-xs text-zinc-500">{opportunity?.title}</p>
          </div>
        </div>
        <div className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full font-medium border border-indigo-500/20">
          Live Contract
        </div>
      </header>

      {/* Dual Pane Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANE: The Spec (Markdown) */}
        <main className="flex-1 overflow-y-auto p-8 border-r border-zinc-800 bg-zinc-950/30">
          <div className="max-w-3xl mx-auto prose prose-invert prose-headings:text-white prose-a:text-indigo-400">
            <ReactMarkdown>{brief.content_md}</ReactMarkdown>
          </div>
        </main>

        {/* RIGHT PANE: The Evidence */}
        <aside className="w-[400px] bg-zinc-950 overflow-y-auto flex-shrink-0 flex flex-col">
          <div className="p-6 border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              The Evidence
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Why are we building this?</p>
          </div>

          <div className="p-6 flex flex-col gap-8">
            
            {/* Quantitative Data */}
            <section>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart2 size={14} /> Hard Data
              </h3>
              <div className="flex flex-col gap-3">
                {metrics.map(m => (
                  <div key={m.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">{m.value}</div>
                    <div className="text-sm font-medium text-zinc-300">{m.name}</div>
                    <div className="text-xs text-zinc-500 mt-2 flex justify-between">
                      <span>{m.dimension || 'Global'}</span>
                      <span className="uppercase text-indigo-400/70">{m.source}</span>
                    </div>
                  </div>
                ))}
                {metrics.length === 0 && <p className="text-sm text-zinc-600">No quantitative metrics linked.</p>}
              </div>
            </section>

            {/* Qualitative Data */}
            <section>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Quote size={14} /> Customer Quotes
              </h3>
              <div className="flex flex-col gap-3">
                {insights.map(i => (
                  <div key={i.id} className="bg-zinc-900/50 border border-zinc-800 border-l-2 border-l-indigo-500 p-4 rounded-lg">
                    <Quote size={16} className="text-indigo-500/50 mb-2" />
                    <p className="text-sm text-zinc-300 italic mb-3 leading-relaxed">
                      "{i.quote}"
                    </p>
                    <div className="text-xs text-zinc-500 bg-black/50 p-2 rounded">
                      <span className="block font-medium text-zinc-400 mb-1">Extracted insight:</span>
                      {i.statement}
                    </div>
                  </div>
                ))}
                {insights.length === 0 && <p className="text-sm text-zinc-600">No customer quotes linked.</p>}
              </div>
            </section>

          </div>
        </aside>
      </div>
    </div>
  );
}
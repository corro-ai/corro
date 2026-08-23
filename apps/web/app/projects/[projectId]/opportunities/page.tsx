 "use client";
import { use, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, TrendingUp, AlertCircle } from "lucide-react";

export default function OpportunitiesDashboard({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchOpportunities();
  }, [projectId]);

  async function fetchOpportunities() {
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .eq("project_id", projectId)
      .order("score", { ascending: false });
    
    if (data) setOpportunities(data);
    setLoading(false);
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const text = await file.text();
    
    // Parse the CSV
    const rows = text.split("\n").map(row => row.split(","));
    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    // Format for Supabase
    const metricsToInsert = rows.slice(1).filter(row => row.length === headers.length).map(row => ({
      project_id: projectId,
      name: row[headers.indexOf("name")]?.trim(),
      value: row[headers.indexOf("value")]?.trim(),
      dimension: row[headers.indexOf("dimension")]?.trim() || null,
      period: row[headers.indexOf("period")]?.trim() || null,
      source: "csv_upload",
    }));

    if (metricsToInsert.length > 0) {
      setGenerating(true);
      
      const res = await fetch("/api/project/trigger-opportunities", {
        method: "POST",
        body: JSON.stringify({ projectId, metrics: metricsToInsert }),
      });
      
      if (!res.ok) {
        alert("Failed to trigger opportunity generation");
        setGenerating(false);
        setUploading(false);
        return;
      }
      
      const pollInterval = setInterval(async () => {
        const { count } = await supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("project_id", projectId);

        if (count && count > 0) {
          clearInterval(pollInterval);
          window.location.reload();
        }
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans p-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12">
        <div>
          <Link href={`/projects/${projectId}/report`} className="text-zinc-500 hover:text-zinc-300 flex items-center gap-2 mb-4 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Project
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="text-indigo-500" />
            Opportunity Engine
          </h1>
          <p className="text-zinc-400 mt-2">Ranked features based on qualitative and quantitative evidence.</p>
        </div>
        
        {/* Upload CSV Button */}
        <label className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium cursor-pointer">
          <Upload size={16} />
          {uploading || generating ? "AI Generating..." : "Upload Metrics CSV"}
          <input type="file" accept=".csv" onChange={handleCSVUpload} onClick={(e) => { e.currentTarget.value = "" }} className="hidden" />
        </label>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center text-zinc-500 py-20">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="text-center border border-dashed border-zinc-800 rounded-2xl py-20 bg-zinc-950/50">
            <AlertCircle size={48} className="mx-auto text-zinc-700 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Upload a Metrics CSV to cross-reference with your interview transcripts and generate your first opportunities.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {opportunities.map((opp, index) => (
              <div key={opp.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-colors">
                
                {/* Left Side: Rank & Details */}
                <div className="flex items-start gap-6">
                  <div className="bg-indigo-500/10 text-indigo-400 font-mono text-xl font-bold w-12 h-12 flex items-center justify-center rounded-lg border border-indigo-500/20">
                    #{index + 1}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{opp.title}</h2>
                    <p className="text-zinc-400 text-sm max-w-2xl">{opp.description}</p>
                    <div className="flex gap-4 mt-4 text-xs font-medium text-zinc-500">
                      <span className="flex items-center gap-1"><TrendingUp size={14} /> Score: {opp.score}</span>
                      <span className="text-indigo-400/70 bg-indigo-500/10 px-2 py-0.5 rounded">Status: {opp.status}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Button */}
                <Link 
                  href={`/projects/${projectId}/briefs/${opp.id}`} 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  <FileText size={16} />
                  View Spec
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return;

    setLoading(true);

    try {
      // 1. Create Supabase Client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 2. Insert into the `projects` table (via API to bypass RLS)
      const res = await fetch("/api/project/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const { projectId } = await res.json();

      // 3. Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${projectId}/transcript.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("transcript")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 4. Trigger Inngest Pipeline
      await fetch("/api/project/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, filePath }),
      });

      // 5. Redirect to the beautiful new Project Report page
      router.push(`/projects/${projectId}/report`);

    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto pt-12">
        <Link 
          href="/projects" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <h1 className="text-3xl font-bold mb-2">Create a new Project</h1>
        <p className="text-zinc-400 mb-8">Set up a workspace and upload your first customer call.</p>

        <form onSubmit={handleUpload} className="space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Project Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pricing Page Redesign"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are we researching?"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Upload Transcript (.vtt, .srt, .txt)</label>
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:bg-zinc-800/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <UploadCloud size={32} className="mx-auto text-zinc-500 mb-3" />
              <p className="text-sm text-zinc-400">
                {file ? <span className="text-indigo-400 font-semibold">{file.name}</span> : "Drag and drop or click to browse"}
              </p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !file || !name}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Create Project & Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
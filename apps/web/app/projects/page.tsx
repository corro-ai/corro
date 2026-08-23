import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Folder, Plus, ArrowRight, Clock } from "lucide-react";
import Navbar from "@/src/components/landing/Navbar";

export default async function ProjectsHub() {
  // Initialize Supabase (Server Side)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all projects from the new database table we created!
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-zinc-400">Manage your workspaces and analysis reports.</p>
          </div>
          <Link
            href="/projects/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center gap-2"
          >
            <Plus size={18} />
            New Project
          </Link>
        </div>

        {/* Project Grid */}
        {!projects || projects.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
            <Folder size={48} className="text-zinc-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-zinc-400 mb-6 max-w-sm">
              Create your first project to upload transcripts and generate evidence-cited specs.
            </p>
            <Link
              href="/projects/new"
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/report`}
                className="group bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Folder className="text-indigo-400" size={20} />
                  </div>
                  <ArrowRight className="text-zinc-600 group-hover:text-indigo-400 transition-colors" size={20} />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 truncate">
                  {project.name}
                </h3>
                
                <p className="text-zinc-400 text-sm line-clamp-2 mb-6 flex-1">
                  {project.description || "No description provided."}
                </p>

                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50">
                  <Clock size={14} />
                  {new Date(project.created_at).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
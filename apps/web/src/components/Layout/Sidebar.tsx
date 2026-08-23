"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  MessageSquare, 
  Target, 
  Upload, 
  ArrowLeft 
} from "lucide-react";

export default function Sidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  const links = [
    { name: "Report", href: `/projects/${projectId}/report`, icon: FileText },
    { name: "Evidence Chat", href: `/projects/${projectId}/chat`, icon: MessageSquare },
    { name: "Opportunities", href: `/projects/${projectId}/opportunities`, icon: Target },
  ];

  return (
    <aside className="w-[240px] bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800 flex flex-col h-screen sticky top-0 left-0">
      
      {/* Top: Logo & Project Info */}
      <div className="p-6 border-b border-zinc-900">
        <Link href="/projects" className="flex items-center gap-2 text-white font-bold text-lg mb-6 hover:opacity-80 transition-opacity">
          🔬 <span>Corro</span>
        </Link>
        
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">
          Workspace
        </p>
        <p className="text-sm text-zinc-300 font-mono truncate bg-black/50 px-2 py-1 rounded border border-zinc-800">
          {projectId.split("-")[0]} {/* Shows just the first part of the UUID */}
        </p>
      </div>

      {/* Middle: Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-500/10 text-white border-l-2 border-l-indigo-500 shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900 border-l-2 border-transparent"
              }`}
            >
              <link.icon size={18} className={isActive ? "text-indigo-400" : "text-zinc-500"} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Actions */}
      <div className="p-4 border-t border-zinc-900 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-left">
          <Upload size={18} className="text-zinc-500" />
          Upload Metrics
        </button>
        
        <Link 
          href="/projects"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-all"
        >
          <ArrowLeft size={18} />
          All Projects
        </Link>
      </div>
      
    </aside>
  );
}
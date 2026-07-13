import { ArrowRight, Database, FileCode2, Sparkles, Terminal } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-50 selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Corro
          </div>
          <a href="#waitlist" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Building in public
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">evidence layer</span> for spec-driven development.
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
            Coding agents are only as good as the specs you feed them. Corro turns customer calls and usage data into evidence-cited feature briefs—so your agents build exactly what users actually want.
          </p>

          {/* Waitlist Form */}
          <div id="waitlist" className="bg-white/5 border border-white/10 rounded-2xl p-2 max-w-md flex items-center backdrop-blur-sm">
            <input 
              type="email" 
              placeholder="name@startup.com" 
              className="bg-transparent border-none outline-none px-4 py-2 w-full text-white placeholder:text-slate-500"
            />
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap">
              Get Early Access <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors">
            <Database className="w-10 h-10 text-blue-400 mb-6" />
            <h3 className="text-xl font-semibold mb-3">Upload Anything</h3>
            <p className="text-slate-400 leading-relaxed">
              Drag and drop Zoom calls, Notion notes, and Slack exports. Corro extracts the exact pain points and links them to the timestamp.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors">
            <FileCode2 className="w-10 h-10 text-cyan-400 mb-6" />
            <h3 className="text-xl font-semibold mb-3">Evidence-Cited Specs</h3>
            <p className="text-slate-400 leading-relaxed">
              Generate OpenSpec-compatible markdown briefs where every feature requirement is cited back to a direct customer quote.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-colors">
            <Terminal className="w-10 h-10 text-indigo-400 mb-6" />
            <h3 className="text-xl font-semibold mb-3">MCP Live Contract</h3>
            <p className="text-slate-400 leading-relaxed">
              When Cursor or Claude builds your feature, they can query the Corro MCP server to ask &quot;Why does this requirement exist?&quot;
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
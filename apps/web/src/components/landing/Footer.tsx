import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
            🔬 Corro
          </Link>
          <p className="text-zinc-500 max-w-sm">
            The open-source evidence layer for spec-driven development.
            Turn customer calls into specs for AI coding agents.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-3">
            <li><Link href="/projects" className="text-zinc-500 hover:text-white transition-colors">Try Free</Link></li>
            <li><a href="https://github.com/corro-ai/corro" className="text-zinc-500 hover:text-white transition-colors">GitHub Repository</a></li>
            <li><a href="https://github.com/corro-ai/corro/issues" className="text-zinc-500 hover:text-white transition-colors">Issues & Roadmap</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <ul className="space-y-3">
            <li><a href="https://x.com/pushkarpandey" className="text-zinc-500 hover:text-white transition-colors">X (Twitter)</a></li>
            <li><a href="#" className="text-zinc-500 hover:text-white transition-colors">Discord (Coming Soon)</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-zinc-600 text-sm">
          © {new Date().getFullYear()} Corro. Open Source under Apache-2.0.
        </p>
        <p className="text-zinc-600 text-sm flex items-center gap-1">
          Built with <span className="text-red-500">❤️</span> in India
        </p>
      </div>
    </footer>
  );
}
import { Brain, Unlink, BarChart3 } from "lucide-react";

const problems = [
  {
    icon: Brain,
    title: "Specs from memory",
    description: "PMs write requirements from 3-week-old memories of calls they half-remember. Critical details get lost.",
    color: "text-red-400",
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
  },
  {
    icon: Unlink,
    title: "No evidence linking",
    description: "When an engineer asks 'Why are we building this?', there's no trail back to what the customer actually said.",
    color: "text-orange-400",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    icon: BarChart3,
    title: "Zero data backing",
    description: "Qualitative feedback and quantitative metrics live in different tools. No one cross-references them.",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <p className="text-center text-zinc-500 text-sm font-medium uppercase tracking-widest mb-4">
          The problem
        </p>
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-white mb-4">
          Specs are the weakest link in AI coding.
        </h2>
        <p className="text-center text-zinc-400 max-w-2xl mx-auto mb-16 text-lg">
          Coding agents are incredible, but they're only as good as the specs you feed them. 
          Most specs are written from vibes, not evidence.
        </p>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className={`${problem.bgColor} border ${problem.borderColor} rounded-xl p-6 transition-all hover:scale-[1.02]`}
            >
              <problem.icon size={28} className={`${problem.color} mb-4`} />
              <h3 className="text-white font-semibold text-lg mb-2">{problem.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>

        {/* Transition text */}
        <p className="text-center text-zinc-500 mt-16 text-lg">
          ↓ What if every requirement had <span className="text-indigo-400 font-semibold">undeniable proof</span>?
        </p>
      </div>
    </section>
  );
}
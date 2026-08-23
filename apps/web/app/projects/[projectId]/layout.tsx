import Sidebar from "@/src/components/layout/Sidebar";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* The persistent Sidebar on the left */}
      <Sidebar projectId={projectId} />

      {/* The specific page content (Report, Chat, etc.) on the right */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
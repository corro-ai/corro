import { ChatContainer } from "@/src/components/chat/ChatContainer";

export default async function ChatPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#000000',
      color: '#e4e4e7',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <ChatContainer projectId={projectId} />
    </div>
  );
}

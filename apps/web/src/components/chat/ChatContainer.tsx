"use client";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { CitationPanel } from "./CitationPanel";
import { EmptyState } from "./EmptyState";
import { TypingIndicator } from "./TypingIndicator";
import { useChat } from "@/src/hooks/useChat";

interface ChatContainerProps {
  projectId: string;
}

export function ChatContainer({ projectId }: ChatContainerProps) {
  const { 
    messages, 
    isLoading, 
    activeCitation, 
    setActiveCitation, 
    sendMessage 
  } = useChat(projectId);

  const handleCitationClick = (index: number) => {
    const lastAiMsg = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAiMsg && lastAiMsg.citations) {
      const citation = lastAiMsg.citations.find(c => c.index === index);
      if (citation) setActiveCitation(citation);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Main Chat Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
        height: '100%',
      }}>
        <ChatHeader projectId={projectId} />
        
        {/* Message Thread */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          paddingBottom: '140px',
        }}>
          {messages.length === 0 ? (
            <EmptyState onSuggestedClick={sendMessage} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  onCitationClick={handleCitationClick} 
                />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Input Area with gradient fade */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 32px',
          background: 'linear-gradient(to top, #000000 60%, transparent)',
        }}>
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </main>

      {/* Citation Side Panel */}
      {activeCitation && (
        <CitationPanel 
          citation={activeCitation} 
          onClose={() => setActiveCitation(null)} 
        />
      )}
    </div>
  );
}
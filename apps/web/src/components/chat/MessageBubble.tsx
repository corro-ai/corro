import { ChatMessage } from "@/src/types/chat";
import { CitationPill } from "./CitationPill";
import { ConfidenceBadge } from "./ConfidenceBadge";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: ChatMessage;
  onCitationClick: (citation: number) => void;
}

// Pre-process content to convert plain [1] into markdown links [[1]](#cite-1)
// so ReactMarkdown renders them as <a> tags we can intercept
function preprocessCitations(content: string): string {
  return content.replace(/\[(\d+)\]/g, '[$1](#cite-$1)');
}

export function MessageBubble({ message, onCitationClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-4 items-start ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 600,
          flexShrink: 0,
          background: '#0a0a0a',
          border: '1px solid #27272a',
          color: '#6366f1',
        }}>AI</div>
      )}
      
      <div style={{
        maxWidth: '80%',
        padding: '16px 20px',
        borderRadius: '16px',
        lineHeight: 1.6,
        ...(isUser ? {
          background: '#0a0a0a',
          border: '1px solid #27272a',
          color: '#e4e4e7',
          borderBottomRightRadius: '4px',
        } : {
          background: 'transparent',
          color: '#e4e4e7',
        }),
      }}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <>
            <div>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ marginBottom: '12px' }}>{children}</p>,
                  a: ({ href, children }) => {
                    // Check if this is a citation link we created
                    const hrefStr = href || '';
                    const citeMatch = hrefStr.match(/^#cite-(\d+)$/);
                    if (citeMatch) {
                      const index = parseInt(citeMatch[1], 10);
                      return <CitationPill index={index} onClick={onCitationClick} />;
                    }
                    return <a href={href} style={{ color: '#818cf8', textDecoration: 'underline' }}>{children}</a>;
                  }
                }}
              >
                {preprocessCitations(message.content)}
              </ReactMarkdown>
            </div>
            
            {message.confidence && message.sourceCount !== undefined && message.sourceCount > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #27272a' }}>
                <ConfidenceBadge 
                  level={message.confidence} 
                  sourceCount={message.sourceCount} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {isUser && (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 600,
          flexShrink: 0,
          background: '#6366f1',
          color: '#ffffff',
        }}>You</div>
      )}
    </div>
  );
}

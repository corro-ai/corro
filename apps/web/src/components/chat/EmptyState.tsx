import { MessageSquare } from "lucide-react";

interface EmptyStateProps {
  onSuggestedClick: (question: string) => void;
}

export function EmptyState({ onSuggestedClick }: EmptyStateProps) {
  const suggestions = [
    "What are customers complaining about most?",
    "Are there any feature requests for the dashboard?",
    "How do users feel about the current pricing?",
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center',
      color: '#a1a1aa',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'rgba(99, 102, 241, 0.1)',
        color: '#6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <MessageSquare size={32} />
      </div>
      <h2 style={{ color: '#e4e4e7', fontSize: '24px', marginBottom: '12px', fontWeight: 600 }}>
        Chat with your evidence
      </h2>
      <p style={{ marginBottom: '32px', maxWidth: '400px', lineHeight: 1.6 }}>
        Ask questions about your uploaded transcripts. Every answer is backed by exact quotes.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
        {suggestions.map((q, i) => (
          <button 
            key={i} 
            onClick={() => onSuggestedClick(q)}
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(63, 63, 70, 0.5)',
              color: '#e4e4e7',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'left',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(63, 63, 70, 0.5)';
              e.currentTarget.style.background = '#0a0a0a';
            }}
          >
            &ldquo;{q}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}
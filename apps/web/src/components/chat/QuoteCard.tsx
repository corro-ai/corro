import { Quote } from "lucide-react";

interface QuoteCardProps {
  text: string;
  speaker: string | null;
  source: string;
}

export function QuoteCard({ text, speaker, source }: QuoteCardProps) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid #27272a',
      borderLeft: '3px solid #6366f1',
      borderRadius: '8px',
      padding: '20px',
    }}>
      <Quote size={20} style={{ color: '#6366f1', marginBottom: '12px', opacity: 0.7 }} />
      <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#e4e4e7', marginBottom: '16px' }}>
        &ldquo;{text}&rdquo;
      </p>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#71717a',
        borderTop: '1px solid #27272a',
        paddingTop: '12px',
      }}>
        <span style={{ fontWeight: 600, color: '#ffffff' }}>{speaker || "Unknown Speaker"}</span>
        <span>{source}</span>
      </div>
    </div>
  );
}
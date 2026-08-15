"use client";
import { Citation } from "@/src/types/chat";
import { X } from "lucide-react";
import { QuoteCard } from "./QuoteCard";

interface CitationPanelProps {
  citation: Citation | null;
  onClose: () => void;
}

export function CitationPanel({ citation, onClose }: CitationPanelProps) {
  if (!citation) return null;

  return (
    <aside style={{
      width: '400px',
      background: '#09090b',
      borderLeft: '1px solid #27272a',
      display: 'flex',
      flexDirection: 'column',
      animation: 'panelSlideIn 0.3s ease-out',
      flexShrink: 0,
    }}>
      <style>{`
        @keyframes panelSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa' }}>Source {citation.index}</h3>
        <button 
          onClick={onClose} 
          aria-label="Close panel"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#71717a',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            transition: 'all 0.2s',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <QuoteCard 
          text={citation.chunk.text}
          speaker={citation.chunk.speaker}
          source={citation.chunk.source_filename}
        />

        {/* Metadata */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: '#000000',
          borderRadius: '8px',
          fontSize: '13px',
        }}>
          <span style={{ color: '#71717a' }}>Relevance Score</span>
          <span style={{ fontWeight: 600, color: '#e4e4e7' }}>{Math.round(citation.chunk.score * 100)}%</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px',
          background: '#000000',
          borderRadius: '8px',
          fontSize: '13px',
        }}>
          <span style={{ color: '#71717a' }}>Found via</span>
          <span style={{ fontWeight: 600, color: '#e4e4e7', textTransform: 'capitalize' }}>{citation.chunk.method} search</span>
        </div>
      </div>
    </aside>
  );
}
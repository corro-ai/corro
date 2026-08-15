interface CitationPillProps {
  index: number;
  onClick: (index: number) => void;
}

export function CitationPill({ index, onClick }: CitationPillProps) {
  return (
    <button
      onClick={() => onClick(index)}
      aria-label={`View source ${index}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#3b82f6',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '0 8px',
        fontSize: '12px',
        fontWeight: 600,
        height: '22px',
        margin: '0 4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        verticalAlign: 'middle',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {index}
    </button>
  );
}
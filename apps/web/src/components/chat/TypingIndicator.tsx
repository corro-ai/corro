export function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      padding: '16px 20px',
      background: '#0a0a0a',
      border: '1px solid #27272a',
      borderRadius: '16px',
      borderBottomLeftRadius: '4px',
      width: 'fit-content',
      alignItems: 'center',
    }}>
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div style={{ width: 6, height: 6, background: '#71717a', borderRadius: '50%', animation: 'dotBounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></div>
      <div style={{ width: 6, height: 6, background: '#71717a', borderRadius: '50%', animation: 'dotBounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></div>
      <div style={{ width: 6, height: 6, background: '#71717a', borderRadius: '50%', animation: 'dotBounce 1.4s infinite ease-in-out both' }}></div>
    </div>
  );
}
"use client";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(24, 24, 27, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(63, 63, 70, 0.5)',
        borderRadius: '9999px',
        padding: '8px 12px 8px 24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      <input
        type="text"
        placeholder="Ask about product feedback, user research..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: '#e4e4e7',
          fontSize: '15px',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      <button 
        type="submit" 
        disabled={!input.trim() || disabled}
        aria-label="Send message"
        style={{
          background: !input.trim() || disabled ? '#3f3f46' : '#6366f1',
          color: !input.trim() || disabled ? '#71717a' : '#ffffff',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: !input.trim() || disabled ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}
      >
        <Send size={18} />
      </button>
    </form>
  );
}
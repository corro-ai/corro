import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ChatHeaderProps {
  projectId: string;
}

export function ChatHeader({ projectId }: ChatHeaderProps) {
  return (
    <header style={{
      padding: '20px 24px',
      borderBottom: '1px solid #27272a',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    }}>
      <Link 
        href={`/report/${projectId}`} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#71717a',
          textDecoration: 'none',
          fontSize: '14px',
          transition: 'color 0.2s',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Report</span>
      </Link>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '2px', color: '#fafafa' }}>
          Project Q&A
        </h3>
        <span style={{ fontSize: '12px', color: '#71717a' }}>
          {projectId.split('-')[0]}
        </span>
      </div>
    </header>
  );
}

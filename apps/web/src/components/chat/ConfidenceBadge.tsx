import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface ConfidenceBadgeProps {
  level: "high" | "medium" | "low";
  sourceCount: number;
}

export function ConfidenceBadge({ level, sourceCount }: ConfidenceBadgeProps) {
  const configs = {
    high: { 
      icon: CheckCircle2, 
      text: "High Confidence", 
      bg: 'rgba(34, 197, 94, 0.1)',
      color: '#22c55e',
    },
    medium: { 
      icon: AlertCircle, 
      text: "Medium Confidence", 
      bg: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b',
    },
    low: { 
      icon: HelpCircle, 
      text: "Low Confidence", 
      bg: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
    },
  };

  const config = configs[level];
  const Icon = config.icon;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
      background: config.bg,
      color: config.color,
    }}>
      <Icon size={14} />
      <span>{config.text} ({sourceCount} source{sourceCount !== 1 ? 's' : ''})</span>
    </div>
  );
}
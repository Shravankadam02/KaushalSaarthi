const STYLES = {
  High: { bg: '#FEF2F2', text: '#B91C1C', dot: '#DC2626' },
  Medium: { bg: '#FFFBEB', text: '#92400E', dot: '#D97706' },
  Low: { bg: '#F0FDF4', text: '#166534', dot: '#059669' },
};

export default function RiskBadge({ level }) {
  const s = STYLES[level] || STYLES.Low;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {level}
    </span>
  );
}
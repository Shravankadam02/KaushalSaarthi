export default function ProgressRing({ value, label, color = '#6366F1' }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50" y="50" textAnchor="middle" dominantBaseline="middle"
          fontSize="20" fontWeight="600" fill="#0F172A"
          transform="rotate(90 50 50)"
        >
          {Math.round(clamped)}%
        </text>
      </svg>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
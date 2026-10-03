export default function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-5 sm:p-6 flex items-center justify-center gap-4 sm:gap-6">
      {Icon && (
        <div style={{ color: accent || '#2563EB' }} className="shrink-0">
          <Icon size={42} />
        </div>
      )}
      <div className="flex flex-col items-center text-center">
        <p className="text-3xl sm:text-4xl font-bold" style={{ color: accent || '#2563EB' }}>
          {value}
        </p>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
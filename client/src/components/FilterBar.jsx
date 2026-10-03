import { FiSearch } from 'react-icons/fi';

export default function FilterBar({
  search, onSearchChange,
  riskFilter, onRiskFilterChange,
  departmentFilter, onDepartmentFilterChange,
  departments = [],
  classFilter, onClassFilterChange,
  classes = [],
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      <div className="relative flex-1 min-w-0">
        <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', 'High', 'Medium', 'Low'].map((level) => (
          <button
            key={level}
            onClick={() => onRiskFilterChange(level)}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition whitespace-nowrap ${
              riskFilter === level
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {level}
          </button>
        ))}

        {departments.length > 0 && (
          <select
            value={departmentFilter}
            onChange={(e) => onDepartmentFilterChange(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        {classes.length > 0 && (
          <select
            value={classFilter}
            onChange={(e) => onClassFilterChange(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
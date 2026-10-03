import { useNavigate } from 'react-router-dom';
import RiskBadge from './RiskBadge';

export default function StudentTable({ students }) {
  const navigate = useNavigate();

  if (students.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">No students match this filter.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-slate-200">
          <th className="py-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Student</th>
          <th className="py-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Class</th>
          <th className="py-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Risk Score</th>
          <th className="py-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr
            key={s.studentId}
            onClick={() => navigate(`/student/${s.studentId}`)}
            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <td className="py-3.5 pr-4">
              <div className="font-medium text-slate-800">{s.firstName} {s.lastName}</div>
              <div className="text-xs text-slate-400">{s.studentId}</div>
            </td>
            <td className="py-3.5 pr-4 text-slate-500">{s.class}</td>
            <td className="py-3.5 pr-4">
              <span className="font-mono text-slate-700">{(s.riskScore * 100).toFixed(0)}%</span>
            </td>
            <td className="py-3.5 pr-4"><RiskBadge level={s.riskLevel} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
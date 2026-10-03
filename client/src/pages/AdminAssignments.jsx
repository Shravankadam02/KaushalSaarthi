import { useEffect, useState } from 'react';
import { FiUserCheck, FiUserX, FiDownload, FiSearch } from 'react-icons/fi';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { useToast } from '../context/ToastContext';

export default function AdminAssignments() {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState('');
  const [assignFilter, setAssignFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const { showToast } = useToast();

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];

  const filtered = students.filter((s) => {
    const matchesSearch =
      search === '' ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesAssign = assignFilter === 'All' || (assignFilter === 'Unassigned' && !s.mentorId);
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    return matchesSearch && matchesAssign && matchesDept;
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/students'), api.get('/mentors')])
      .then(([studentsRes, mentorsRes]) => {
        setStudents(studentsRes.data.students);
        setMentors(mentorsRes.data.mentors);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleAssign = async (studentId, mentorCode) => {
    setSavingId(studentId);
    try {
      await api.patch(`/students/${studentId}/mentor`, { mentorCode: mentorCode || null });
      setStudents((prev) =>
        prev.map((s) => (s.studentId === studentId ? { ...s, mentorId: mentorCode || null } : s))
      );
      showToast('Mentor assignment updated', 'success');
    } catch {
      showToast('Failed to update mentor assignment', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const unassignedCount = students.filter((s) => !s.mentorId).length;

  const handleExport = async () => {
    try {
      const res = await api.get('/students/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Export downloaded', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  return (
    <DashboardLayout 
      title="Mentor Assignments" 
      subtitle="Assign or reassign students to mentors"
      headerIcon={FiUserCheck}
    >
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs font-medium text-slate-500 mb-1.5">Total Students</p>
          <p className="text-2xl font-semibold text-slate-900">{students.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs font-medium text-slate-500 mb-1.5">Unassigned</p>
          <p className="text-2xl font-semibold text-amber-600">{unassignedCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative max-w-xs flex-1">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {departments.length > 0 && (
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-2">
          {['All', 'Unassigned'].map((f) => (
            <button
              key={f}
              onClick={() => setAssignFilter(f)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition ${
                assignFilter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-lg hover:border-slate-300 transition"
        >
          <FiDownload size={13} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 px-6">
        {loading && <p className="text-sm text-slate-500 py-16 text-center">Loading...</p>}
        {error && <p className="text-sm text-red-600 py-16 text-center">{error}</p>}

        {!loading && !error && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200">
                <th className="py-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Student</th>
                <th className="py-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Class</th>
                <th className="py-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Current Mentor</th>
                <th className="py-3 pr-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Assign</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.studentId} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-slate-800">{s.firstName} {s.lastName}</div>
                    <div className="text-xs text-slate-400">{s.studentId}</div>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{s.class}</td>
                  <td className="py-3 pr-4">
                    {s.mentorId ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                        <FiUserCheck size={13} /> {s.mentorId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-600">
                        <FiUserX size={13} /> Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={s.mentorId || ''}
                      onChange={(e) => handleAssign(s.studentId, e.target.value)}
                      disabled={savingId === s.studentId}
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <option value="">— Unassigned —</option>
                      {mentors.map((m) => (
                        <option key={m.mentorCode} value={m.mentorCode}>
                          {m.mentorCode} · {m.username}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
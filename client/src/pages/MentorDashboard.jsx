import { useEffect, useState } from 'react';
import { FiRefreshCw, FiUpload, FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiUsers } from 'react-icons/fi';
import { LuGauge } from 'react-icons/lu';
import api from '../api/axios';
import StudentTable from '../components/StudentTable';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import FilterBar from '../components/FilterBar';

export default function MentorDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];
  const classes = [...new Set(students.map((s) => s.class).filter(Boolean))];

  const filtered = students.filter((s) => {
    const matchesSearch =
      search === '' ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'All' || s.riskLevel === riskFilter;
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    const matchesClass = classFilter === 'All' || s.class === classFilter;
    return matchesSearch && matchesRisk && matchesDept && matchesClass;
  });

  useEffect(() => {
    api.get('/students')
      .then((res) => setStudents(res.data.students))
      .catch(() => setError('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const counts = students.reduce(
    (acc, s) => ({ ...acc, [s.riskLevel]: (acc[s.riskLevel] || 0) + 1 }),
    {}
  );

  return (
    <DashboardLayout 
      title="Mentor Dashboard" 
      subtitle="Monitor student risk levels and manage interventions"
      headerIcon={LuGauge}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard label="High Risk" value={counts.High || 0} accent="#DC2626" icon={FiAlertTriangle} />
        <StatCard label="Medium Risk" value={counts.Medium || 0} accent="#D97706" icon={FiAlertCircle} />
        <StatCard label="Low Risk" value={counts.Low || 0} accent="#059669" icon={FiCheckCircle} />
        <StatCard label="Total Students" value={students.length} accent="#2563EB" icon={FiUsers} />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        riskFilter={riskFilter}
        onRiskFilterChange={setRiskFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        departments={departments}
        classFilter={classFilter}
        onClassFilterChange={setClassFilter}
        classes={classes}
      />

      <div className="bg-white rounded-xl border border-slate-200 px-4 sm:px-6 overflow-x-auto">
        {loading && <p className="text-sm text-slate-500 py-16 text-center">Loading students...</p>}
        {error && <p className="text-sm text-red-600 py-16 text-center">{error}</p>}
        {!loading && !error && <StudentTable students={filtered} />}
      </div>
    </DashboardLayout>
  );
}
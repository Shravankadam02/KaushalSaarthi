import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Doughnut, Bar, Scatter } from 'react-chartjs-2';
import { FiAlertTriangle, FiRefreshCw, FiAlertCircle, FiUsers, FiBarChart2, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { LuGauge } from 'react-icons/lu';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement);

export default function MentorAnalytics() {
  const location = useLocation();
  const [summary, setSummary] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([api.get('/summary'), api.get('/escalations')])
      .then(([summaryRes, escalationsRes]) => {
        setSummary(summaryRes.data);
        setEscalations(escalationsRes.data.escalations);
      })
      .catch(() => setError('Failed to load summary'))
      .finally(() => setLoading(false));
  };

  const handlePredictRefresh = () => {
    setLoading(true);
    api.post('/students/predict-all')
      .then(() => {
        fetchDashboardData();
      })
      .catch((err) => {
        console.error('Prediction failed:', err);
        setError('Failed to run batch predictions');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [location.key]);

  if (loading) {
    return <DashboardLayout title="Overview"><p className="text-sm text-slate-500">Loading...</p></DashboardLayout>;
  }
  if (error || !summary) {
    return <DashboardLayout title="Overview"><p className="text-sm text-red-600">{error}</p></DashboardLayout>;
  }

  const { totalStudents, riskDistribution, byDepartment, openInterventions, attendanceDistribution, testTrends, highRiskStudents } = summary;

  const doughnutData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [riskDistribution.High, riskDistribution.Medium, riskDistribution.Low],
      backgroundColor: ['#DC2626', '#D97706', '#059669'],
      borderWidth: 0,
    }],
  };

  const deptLabels = Object.keys(byDepartment);
  const barData = {
    labels: deptLabels,
    datasets: [
      { label: 'High', data: deptLabels.map((d) => byDepartment[d].High), backgroundColor: '#DC2626' },
      { label: 'Medium', data: deptLabels.map((d) => byDepartment[d].Medium), backgroundColor: '#D97706' },
      { label: 'Low', data: deptLabels.map((d) => byDepartment[d].Low), backgroundColor: '#059669' },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, grid: { color: '#F1F5F9' }, ticks: { precision: 0 } },
    },
  };

  const attLabels = ['0-50%', '51-65%', '66-75%', '76-85%', '86-100%'];
  const attColors = ['#EF4444', '#F59E0B', '#EAB308', '#22C55E', '#10B981'];
  const attendanceData = {
    labels: attLabels,
    datasets: [{
      label: 'Students',
      data: attLabels.map(l => attendanceDistribution[l] || 0),
      backgroundColor: attColors,
      borderRadius: 4,
    }],
  };
  const attendanceOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { 
      x: { title: { display: true, text: 'Attendance Range', font: { size: 10 } }, grid: { display: false } },
      y: { title: { display: true, text: 'Number of Students', font: { size: 10 } }, grid: { color: '#F1F5F9' }, ticks: { stepSize: 1 } }
    }
  };

  const getRiskColor = (risk) => risk === 'High' ? '#EF4444' : risk === 'Medium' ? '#F59E0B' : '#10B981';
  
  const scatterData = {
    datasets: [{
      label: 'Students',
      data: testTrends.map(t => ({ x: t.x, y: t.y })),
      backgroundColor: testTrends.map(t => getRiskColor(t.risk)),
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };
  
  const scatterOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Previous Test Average', font: { size: 10 } }, min: 0, max: 100, grid: { color: '#F1F5F9' } },
      y: { title: { display: true, text: 'Current Test Average', font: { size: 10 } }, min: 0, max: 100, grid: { color: '#F1F5F9' } }
    }
  };

  const highRiskPercent = totalStudents > 0 ? ((riskDistribution.High / totalStudents) * 100).toFixed(1) : 0;
  const isHealthy = highRiskPercent < 15;

  const headerActions = (
    <button
      type="button"
      onClick={handlePredictRefresh}
      className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium text-sm"
    >
      <FiRefreshCw size={16} />
      Refresh
    </button>
  );

  return (
    <DashboardLayout 
      title="Mentor Analytics" 
      subtitle="Overview of your assigned students"
      headerIcon={LuGauge}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <StatCard label="My Students" value={totalStudents} accent="#4F46E5" icon={FiUsers} />
        <StatCard label="High Risk" value={riskDistribution.High} accent="#DC2626" icon={FiAlertTriangle} />
        <StatCard label="Open Interventions" value={openInterventions.total} accent="#059669" icon={FiAlertCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <p className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2"><FiBarChart2 className="text-slate-500" /> Attendance Distribution</p>
          <Bar data={attendanceData} options={attendanceOptions} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <p className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2"><FiActivity className="text-slate-500" /> Test Performance Trends</p>
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <p className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2"><FiAlertTriangle className="text-slate-500" /> High Risk Students</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-indigo-100 bg-indigo-50/60 text-xs text-indigo-700 font-semibold tracking-wide">
                  <th className="py-3 px-4 rounded-tl-lg">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 rounded-tr-lg">Primary Issue</th>
                </tr>
              </thead>
              <tbody>
                {highRiskStudents.map((s) => (
                  <tr key={s.studentId} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-medium text-slate-800">{s.name}</td>
                    <td className="py-3 px-4 text-slate-500">{s.class}</td>
                    <td className="py-3 px-4 text-red-600 font-semibold">{s.riskScore}%</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{s.primaryIssue}</td>
                  </tr>
                ))}
                {highRiskStudents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-500">No high risk students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <p className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2"><FiCheckCircle className="text-slate-500" /> Key Insights</p>
          <div className="mt-2">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${isHealthy ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                <FiCheckCircle size={20} />
              </div>
              <p className={`font-semibold text-base ${isHealthy ? 'text-emerald-800' : 'text-red-800'}`}>
                {isHealthy ? 'Good Overall Health' : 'Action Required'}
              </p>
            </div>
            <p className="text-sm text-slate-600 pl-11">
              Only {highRiskPercent}% of your students are at high risk. {isHealthy ? 'This is within acceptable thresholds.' : 'Please review high-risk cases immediately.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-slate-500">Counselling Cases</p>
          <Link to="/mentor/escalations" className="text-xs font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xl font-semibold text-red-600">
              {escalations.filter((e) => e.status === 'open').length}
            </p>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-amber-600">
              {escalations.filter((e) => e.status === 'in_progress').length}
            </p>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-emerald-600">
              {escalations.filter((e) => e.status === 'resolved').length}
            </p>
            <p className="text-xs text-slate-500">Resolved</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <p className="text-xs font-medium text-slate-500 mb-4">Risk Distribution</p>
          <div className="max-w-[220px] mx-auto">
            <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <p className="text-xs font-medium text-slate-500 mb-4">Risk by Department</p>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {openInterventions.staleOver30Days > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <p className="text-xs font-medium text-slate-500 mb-4 flex items-center gap-1.5">
            <FiAlertTriangle size={14} className="text-amber-600" />
            Interventions Open 30+ Days ({openInterventions.staleOver30Days})
          </p>
          <div className="space-y-2">
            {openInterventions.details
              .filter((n) => n.stale)
              .map((n) => (
                <div key={n.noteId} className="flex justify-between items-center text-sm border-b border-slate-100 py-2 last:border-0">
                  <span className="font-medium text-slate-700">{n.studentId}</span>
                  <span className="text-slate-500">{n.ageDays} days open</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

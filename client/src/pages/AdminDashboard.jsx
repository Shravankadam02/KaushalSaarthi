import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  HeartHandshake,
  MapPin,
  MessageCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
);

const colors = [
  "#d97706",
  "#0f766e",
  "#be123c",
  "#334155",
  "#64748b",
  "#a16207",
];
const labels = {
  income: "Income",
  job_security: "Job security",
  social_status: "Social status",
  safety: "Safety",
  training_quality: "Training quality",
  distance_cost: "Distance and cost",
  further_education: "Further education",
  other: "Other",
};

function Metric({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}
      >
        <Icon size={21} />
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 font-bold text-slate-700">{label}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (district = selectedDistrict) => {
    setLoading(true);
    setError("");
    try {
      const params = district ? { district } : {};
      const [overviewResponse, districtResponse] = await Promise.all([
        api.get("/insights/overview", { params }),
        api.get("/insights/by-district", { params }),
      ]);
      setOverview(overviewResponse.data);
      setDistricts(districtResponse.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load resistance insights.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = async () => {
    const response = await api.get("/insights/export.csv", {
      params: selectedDistrict ? { district: selectedDistrict } : {},
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kaushalsaarthi-insights.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const objectionData = {
    labels:
      overview?.objectionMix?.map(
        (item) => labels[item.category] || item.category,
      ) || [],
    datasets: [
      {
        data: overview?.objectionMix?.map((item) => item.count) || [],
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };
  const districtData = {
    labels: districts.map((item) => item.district),
    datasets: [
      {
        label: "Resistance index",
        data: districts.map((item) => item.resistanceIndex),
        backgroundColor: "#d97706",
        borderRadius: 8,
        barThickness: 18,
      },
    ],
  };
  const districtOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, max: 100, grid: { color: "#e2e8f0" } },
      y: { grid: { display: false } },
    },
  };

  return (
    <DashboardLayout
      title="Resistance dashboard"
      subtitle="See where family concerns are concentrated and whether conversations are helping."
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">
              Scheme administrator
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Family sentiment at a glance
            </h2>
            <span className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
              Synthetic demo engagement data
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDistrict}
              onChange={(event) => {
                setSelectedDistrict(event.target.value);
                load(event.target.value);
              }}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700"
            >
              <option value="">All districts</option>
              {[
                "Nashik",
                "Pune",
                "Nagpur",
                "Chhatrapati Sambhajinagar",
                "Kolhapur",
                "Jalgaon",
              ].map((district) => (
                <option key={district}>{district}</option>
              ))}
            </select>
            <button
              onClick={() => load()}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:border-slate-500"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={exportCsv}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700"
            >
              <ArrowDownToLine size={16} /> Export CSV
            </button>
          </div>
        </div>
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">
            {error}
          </div>
        )}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-slate-500">
            Loading insights...
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Metric
                icon={Users}
                label="Families"
                value={overview?.totalFamilies || 0}
                detail="Profiles created"
                tone="bg-amber-100 text-amber-800"
              />
              <Metric
                icon={MessageCircle}
                label="Sessions"
                value={overview?.chatSessions || 0}
                detail="Family conversations"
                tone="bg-teal-100 text-teal-800"
              />
              <Metric
                icon={AlertTriangle}
                label="Open escalations"
                value={overview?.openEscalations || 0}
                detail="Need human follow-up"
                tone="bg-rose-100 text-rose-800"
              />
              <Metric
                icon={HeartHandshake}
                label="Hopeful endings"
                value={`${overview?.hopefulRatePct || 0}%`}
                detail="Sessions ending hopeful"
                tone="bg-emerald-100 text-emerald-800"
              />
              <Metric
                icon={ArrowUpRight}
                label="Sentiment shift"
                value={overview?.averageSentimentShift || 0}
                detail="Average change per session"
                tone="bg-slate-100 text-slate-800"
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-800">
                    <MapPin size={19} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">
                      District resistance
                    </h3>
                    <p className="text-sm text-slate-500">
                      Index combines negative starts and worried endings.
                    </p>
                  </div>
                </div>
                <div className="h-[310px]">
                  {districts.length ? (
                    <Bar data={districtData} options={districtOptions} />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                      No district session data yet.
                    </div>
                  )}
                </div>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-rose-100 p-2 text-rose-800">
                    <Activity size={19} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">
                      Why families hesitate
                    </h3>
                    <p className="text-sm text-slate-500">
                      Logged objection categories.
                    </p>
                  </div>
                </div>
                <div className="h-[310px]">
                  {overview?.objectionMix?.length ? (
                    <Doughnut
                      data={objectionData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { boxWidth: 12, padding: 14 },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                      No objections logged yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-800">
                  <MapPin size={19} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">District detail</h3>
                  <p className="text-sm text-slate-500">
                    Use this view to prioritize counsellor coverage.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="py-3">District</th>
                      <th className="py-3">Sessions</th>
                      <th className="py-3">Resistance</th>
                      <th className="py-3">Sentiment shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districts.map((district) => (
                      <tr
                        key={district.district}
                        className="border-b border-slate-100"
                      >
                        <td className="py-4 font-bold text-slate-800">
                          {district.district}
                        </td>
                        <td className="py-4 text-slate-600">
                          {district.sessions}
                        </td>
                        <td className="py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${district.resistanceIndex >= 60 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                          >
                            {district.resistanceIndex}/100
                          </span>
                        </td>
                        <td className="py-4 font-semibold text-slate-600">
                          {district.averageSentimentShift > 0 ? "+" : ""}
                          {district.averageSentimentShift}
                        </td>
                      </tr>
                    ))}
                    {!districts.length && (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-12 text-center text-slate-500"
                        >
                          District insights will appear after family sessions
                          are recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

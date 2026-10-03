import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const ladder = [
  "Course",
  "First skilled role",
  "Higher skill level",
  "Supervisor or specialist",
  "Diploma or own business",
];

export default function TradeDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/trades/${id}`, { params: district ? { district } : {} })
      .then((response) => setData(response.data))
      .catch(() => setError("This trade could not be loaded right now."))
      .finally(() => setLoading(false));
  }, [id, district]);

  if (loading)
    return (
      <main className="min-h-screen bg-[#f6f1e8] p-8 text-center text-slate-500">
        Loading trade details...
      </main>
    );
  if (error || !data)
    return (
      <main className="min-h-screen bg-[#f6f1e8] p-8 text-center text-rose-700">
        {error || "Trade not found."}
      </main>
    );

  const { trade, aggregate, providers = [] } = data;
  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/explore-careers"
          className="mb-8 inline-flex items-center gap-2 font-bold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={18} /> Back to trades
        </Link>
        <section className="rounded-4xl bg-slate-900 p-7 text-white shadow-xl shadow-slate-900/10 sm:p-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-amber-300">
                {trade.sector || "Vocational pathway"}
              </p>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
                {typeof trade.name === "string" ? trade.name : trade.name?.en}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                {trade.description ||
                  "Practical training that builds a pathway into skilled work and further education."}
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
              Skill level {trade.nsqfLevel || "—"}
            </span>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              <Clock3 size={16} />{" "}
              {trade.duration || `${trade.durationMonths || "—"} months`}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              <GraduationCap size={16} />{" "}
              {trade.eligibility || trade.minEligibility || "Check eligibility"}
            </span>
          </div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-amber-700">
                  Outcome snapshot
                </p>
                <h2 className="mt-2 text-2xl font-black">What the data says</h2>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={17} className="text-slate-400" />
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold"
                >
                  <option value="">All available areas</option>
                  <option>Nashik</option>
                  <option>Pune</option>
                  <option>Nagpur</option>
                  <option>Kolhapur</option>
                  <option>Jalgaon</option>
                </select>
              </div>
            </div>
            {aggregate ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-emerald-50 p-5">
                  <p className="text-sm font-bold text-emerald-800">
                    Placement
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-950">
                    {Math.round(aggregate.placementRatePct || 0)}%
                  </p>
                  <p className="mt-1 text-xs text-emerald-800">
                    {aggregate.scope} data · {aggregate.year}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-sm font-bold text-amber-800">
                    Starting average
                  </p>
                  <p className="mt-2 text-3xl font-black text-amber-950">
                    ₹
                    {Math.round(
                      aggregate.avgStartingSalaryMonthly || 0,
                    ).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-amber-800">per month</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-5">
                  <p className="text-sm font-bold text-slate-700">
                    After 3 years
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    ₹
                    {Math.round(
                      aggregate.avgSalaryAfter3YrsMonthly || 0,
                    ).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    average monthly figure
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                There is no outcome data for this trade yet. A counsellor can
                help you understand what to ask next.
              </div>
            )}
            <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CheckCircle2 size={15} className="text-emerald-600" /> Sample
              data label: replace with verified MSDE data before production.
            </p>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-800">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-amber-700">
                  Career ladder
                </p>
                <h2 className="mt-1 text-2xl font-black">Where it can lead</h2>
              </div>
            </div>
            <div className="mt-7 space-y-3">
              {ladder.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 rounded-xl bg-slate-50 px-4 py-3 font-bold text-slate-700">
                    {step}
                  </div>
                  {index < ladder.length - 1 && (
                    <ArrowRight
                      size={16}
                      className="hidden text-slate-300 sm:block"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">
                Study nearby
              </p>
              <h2 className="mt-1 text-2xl font-black">Training providers</h2>
            </div>
          </div>
          {providers.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {providers.map((provider) => (
                <div
                  key={provider.providerId}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black">{provider.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {provider.address || provider.district}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {provider.type}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    Course fee:{" "}
                    {provider.fees
                      ? `₹${provider.fees.toLocaleString()}`
                      : "Ask the provider"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-slate-500">
              Choose a district or ask a counsellor for nearby providers.
            </p>
          )}
        </section>
        <Link
          to="/chat"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
        >
          Ask the counsellor about this trade <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}

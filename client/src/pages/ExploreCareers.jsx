import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Map,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ExploreCareers() {
  const [trades, setTrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/trades")
      .then(({ data }) => setTrades(data))
      .catch(() => setError("Trades are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, []);

  const filteredTrades = trades.filter((trade) => {
    const name =
      typeof trade.name === "string" ? trade.name : trade.name?.en || "";
    return `${name} ${trade.sector || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900/10 pb-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
              <Sparkles size={21} />
            </span>
            <span className="text-xl font-black tracking-tight">
              KaushalSaarthi
            </span>
          </Link>
          <Link
            to="/family"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Family space
          </Link>
        </header>
        <section className="py-12">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-800">
            Vocational pathways
          </p>
          <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                Find a path that fits.
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
                Explore practical careers, understand the next skill level, and
                compare sample outcome data with your family.
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search trades or sectors"
                className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>
        </section>
        {loading && (
          <div className="rounded-3xl bg-white p-12 text-center text-slate-500">
            Loading pathways...
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">
            {error}
          </div>
        )}
        {!loading && !error && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrades.map((trade) => {
              const name =
                typeof trade.name === "string"
                  ? trade.name
                  : trade.name?.en || "Trade";
              return (
                <article
                  key={trade._id}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                          {trade.sector || "Skill career"}
                        </p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight">
                          {name}
                        </h2>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        Level {trade.nsqfLevel || "—"}
                      </span>
                    </div>
                    <p className="mt-4 line-clamp-3 leading-6 text-slate-500">
                      {trade.description ||
                        "Practical training for a skilled career."}
                    </p>
                    <div className="mt-6 space-y-3 text-sm font-semibold text-slate-600">
                      <p className="flex items-center gap-3">
                        <Clock3 size={17} className="text-amber-700" />
                        {trade.duration ||
                          `${trade.durationMonths || "—"} months`}
                      </p>
                      <p className="flex items-center gap-3">
                        <BookOpen size={17} className="text-amber-700" />
                        {trade.eligibility ||
                          trade.minEligibility ||
                          "Check eligibility"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                      <CheckCircle2 size={15} /> Sample data
                    </span>
                    <Link
                      to={`/trades/${trade.tradeId || trade._id}`}
                      className="flex items-center gap-1 text-sm font-black text-slate-900 hover:text-amber-700"
                    >
                      View path{" "}
                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
        {!loading && !error && !filteredTrades.length && (
          <div className="rounded-3xl bg-white p-12 text-center text-slate-500">
            No matching trades found.
          </div>
        )}
        <Link
          to="/pathway"
          className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 font-black text-slate-700 hover:border-amber-400"
        >
          <Map size={18} className="text-amber-700" /> Understand skill levels
          first <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}

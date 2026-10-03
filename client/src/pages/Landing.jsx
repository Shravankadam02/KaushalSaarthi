import {
  ArrowRight,
  BarChart3,
  HeartHandshake,
  Map,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: BarChart3,
    title: "Outcome data",
    text: "Compare placement and earning information for skill careers.",
  },
  {
    icon: HeartHandshake,
    title: "Family decisions",
    text: "Give parents and learners one respectful place to ask questions.",
  },
  {
    icon: ShieldCheck,
    title: "Human support",
    text: "Move from AI guidance to a counsellor whenever the family needs one.",
  },
];

export default function Landing() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f1e8] text-slate-900">
      <nav className="border-b border-slate-900/10 bg-[#f6f1e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
              <HeartHandshake size={22} />
            </span>
            <span className="text-xl font-black tracking-tight">
              KaushalSaarthi
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white"
                >
                  Open dashboard
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                >
                  Join a family
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-24">
        <div>
          <p className="mb-5 text-sm font-black uppercase tracking-[0.18em] text-amber-800">
            MSDE · Problem statement 26241
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-7xl">
            Choose a skill.{" "}
            <span className="text-amber-700">Decide together.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            KaushalSaarthi helps learners and parents understand vocational
            careers through simple explanations, local outcome data, and human
            counselling.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
            >
              Start family counselling <ArrowRight size={18} />
            </Link>
            <Link
              to="/explore-careers"
              className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 font-black text-slate-700 hover:border-slate-500"
            >
              Explore careers <Map size={18} />
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-4xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-amber-400/70" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm font-bold text-amber-300">
                  A shared conversation
                </p>
                <p className="mt-1 text-2xl font-black">
                  Ask without hesitation.
                </p>
              </div>
              <MessageCircle className="text-amber-300" size={28} />
            </div>
            <div className="mt-6 space-y-4">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 p-4 text-sm leading-6 text-slate-200">
                Is there a future after a skill course?
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-amber-500 p-4 text-sm font-semibold leading-6 text-slate-950">
                Explore verified outcomes, career steps, and nearby providers
                together.
              </div>
              <div className="flex items-center gap-2 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <ShieldCheck size={15} className="text-emerald-300" /> Grounded
                guidance for families
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-slate-900/10 bg-white/50">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:px-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-3xl border border-slate-200 bg-white p-6"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <Icon size={21} />
              </div>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-2 leading-6 text-slate-500">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

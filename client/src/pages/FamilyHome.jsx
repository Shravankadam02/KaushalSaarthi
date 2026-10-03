import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  LogOut,
  Map,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const actions = [
  {
    label: "Start counselling",
    description: "Ask a question together",
    icon: MessageCircle,
    href: "/chat",
    tone: "bg-amber-500",
  },
  {
    label: "Explore trades",
    description: "See skill careers near you",
    icon: Map,
    href: "/pathway",
    tone: "bg-emerald-600",
  },
  {
    label: "How skill levels work",
    description: "Understand the career path",
    icon: BookOpen,
    href: "/explore-careers",
    tone: "bg-slate-900",
  },
  {
    label: "Talk to a counsellor",
    description: "Request a human call",
    icon: HeartHandshake,
    href: "/counsellors",
    tone: "bg-rose-600",
  },
];

export default function FamilyHome() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-slate-900/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500 p-3">
              <HeartHandshake />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-amber-800">
                KaushalSaarthi
              </p>
              <h1 className="text-2xl font-black">Your family career space</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/family/profile"
              title="Open family profile"
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold hover:bg-amber-50 sm:flex"
            >
              <UserRound size={17} /> {user?.username}
            </Link>
            <Link
              to="/family/profile"
              title="Open family profile"
              className="rounded-xl p-3 text-slate-500 hover:bg-white hover:text-amber-700 sm:hidden"
            >
              <UserRound size={18} />
            </Link>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="rounded-xl p-3 text-slate-500 hover:bg-white hover:text-rose-700"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <section className="py-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-amber-800">
            Welcome
          </p>
          <h2 className="max-w-2xl text-4xl font-black tracking-tight sm:text-6xl">
            Make the next career decision together.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Ask questions, compare practical careers, and bring a counsellor
            into the conversation whenever your family needs one.
          </p>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map(({ label, description, icon: Icon, href, tone }) => (
            <Link
              key={label}
              to={href}
              className="group flex min-h-52 flex-col justify-between rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${tone}`}
              >
                <Icon />
              </div>
              <div>
                <h3 className="text-xl font-black">{label}</h3>
                <p className="mt-1 text-slate-500">{description}</p>
                <span className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-700">
                  Open{" "}
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </section>
        <section className="mt-10 rounded-3xl bg-slate-900 p-7 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">
            Common questions
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/chat"
              className="rounded-full border border-white/20 px-5 py-3 font-semibold hover:bg-white/10"
            >
              Will the learner earn enough?
            </Link>
            <Link
              to="/chat"
              className="rounded-full border border-white/20 px-5 py-3 font-semibold hover:bg-white/10"
            >
              Can they study further?
            </Link>
            <Link
              to="/chat"
              className="rounded-full border border-white/20 px-5 py-3 font-semibold hover:bg-white/10"
            >
              Is the work safe?
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

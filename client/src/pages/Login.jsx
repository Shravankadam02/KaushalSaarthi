import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  { label: "Family · Marathi", username: "fam-001@demo.local", role: "family" },
  { label: "Family · English", username: "fam-002@demo.local", role: "family" },
  {
    label: "Counsellor",
    username: "counsellor1@msde.demo",
    role: "counsellor",
  },
  { label: "Administrator", username: "admin@msde.demo", role: "admin" },
];

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectDemo = (account) =>
    setForm({ username: account.username, password: "demo1234" });
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
              <HeartHandshake size={22} />
            </span>
            <span className="text-xl font-black tracking-tight">
              KaushalSaarthi
            </span>
          </Link>
          <Link
            to="/register"
            className="text-sm font-bold text-slate-600 hover:text-slate-950"
          >
            Create a family account{" "}
            <ArrowRight className="ml-1 inline" size={15} />
          </Link>
        </header>
        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden lg:block">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-800">
              Welcome back
            </p>
            <h1 className="mt-4 max-w-lg text-6xl font-black leading-[1.02] tracking-tight">
              Continue the conversation about what comes next.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">
              Use a demo account to explore the family, counsellor, or
              administrator experience.
            </p>
          </section>
          <section className="mx-auto w-full max-w-md rounded-4xl border border-white bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-9">
            <Link
              to="/"
              className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} /> Back home
            </Link>
            <h2 className="text-3xl font-black tracking-tight">Sign in</h2>
            <p className="mt-2 text-slate-500">
              Choose a demo profile or enter your own account.
            </p>
            <div className="mt-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Demo access
              </p>
              <div className="grid gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => selectDemo(account)}
                    className={`flex min-h-12 items-center justify-between rounded-xl border px-4 text-left text-sm font-bold transition ${form.username === account.username ? "border-amber-500 bg-amber-50 text-amber-950" : "border-slate-200 bg-white text-slate-700 hover:border-amber-300"}`}
                  >
                    <span>{account.label}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      {account.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Username or phone
                <div className="relative">
                  <UserRound
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    required
                    value={form.username}
                    onChange={(event) =>
                      setForm({ ...form, username: event.target.value })
                    }
                    className="min-h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="you@example.com"
                  />
                </div>
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Password
                <div className="relative">
                  <LockKeyhole
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    className="min-h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="Your password"
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 font-black text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Continue"}
                <ArrowRight size={18} />
              </button>
            </form>
            <p className="mt-5 text-center text-xs text-slate-400">
              Demo password:{" "}
              <span className="font-bold text-slate-600">demo1234</span>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

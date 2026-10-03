import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Headphones,
  Languages,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const starterQuestions = {
  en: [
    "Will the learner earn enough?",
    "Is this work safe?",
    "Can they study further?",
  ],
  mr: [
    "यातून पुरेसे उत्पन्न मिळेल का?",
    "हे काम सुरक्षित आहे का?",
    "पुढे शिक्षण घेता येईल का?",
  ],
  hi: [
    "क्या इससे अच्छी कमाई होगी?",
    "क्या यह काम सुरक्षित है?",
    "क्या आगे पढ़ाई कर सकते हैं?",
  ],
};

const labels = {
  en: {
    parent: "Parent",
    learner: "Learner",
    placeholder: "Ask your question in simple words...",
    title: "Family counselling",
    subtitle: "A shared conversation about the next step",
    intro: "What would you like to understand together?",
    send: "Send",
    listen: "Listen",
    human: "Talk to a counsellor",
    source: "Sample outcome data",
    noData: "No verified outcome card was returned for this question.",
  },
  mr: {
    parent: "पालक",
    learner: "विद्यार्थी",
    placeholder: "तुमचा प्रश्न सोप्या शब्दांत विचारा...",
    title: "कुटुंबाचे मार्गदर्शन",
    subtitle: "पुढच्या पायरीबद्दल एकत्र चर्चा",
    intro: "तुम्हाला एकत्र काय समजून घ्यायचे आहे?",
    send: "पाठवा",
    listen: "ऐका",
    human: "समुपदेशकाशी बोला",
    source: "नमुना निकाल माहिती",
    noData: "या प्रश्नासाठी पडताळलेली माहिती मिळाली नाही.",
  },
  hi: {
    parent: "माता-पिता",
    learner: "शिक्षार्थी",
    placeholder: "अपना सवाल आसान शब्दों में पूछें...",
    title: "परिवार मार्गदर्शन",
    subtitle: "अगले कदम पर साथ मिलकर बातचीत",
    intro: "आप साथ मिलकर क्या समझना चाहते हैं?",
    send: "भेजें",
    listen: "सुनें",
    human: "काउंसलर से बात करें",
    source: "नमूना परिणाम डेटा",
    noData: "इस सवाल के लिए सत्यापित परिणाम कार्ड नहीं मिला।",
  },
};

function speak(text, language) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
  window.speechSynthesis.speak(utterance);
}

export default function FamilyChat() {
  const [language, setLanguage] = useState("en");
  const [speaker, setSpeaker] = useState("parent");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const text = labels[language];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (value = input) => {
    const message = value.trim();
    if (!message || sending) return;
    setMessages((current) => [
      ...current,
      { role: "user", speaker, content: message },
    ]);
    setInput("");
    setSending(true);
    setError("");
    try {
      const response = await api.post("/chat", {
        message,
        chatSessionId: sessionId,
        language,
        speaker,
      });
      setSessionId(response.data.chatSessionId || sessionId);
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          content: response.data.reply,
          evidence: response.data.evidence,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "The counselling service is unavailable right now.",
      );
    } finally {
      setSending(false);
    }
  };

  const startListening = () => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang =
      language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.start();
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-3 py-4 text-slate-900 sm:px-6">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-6xl flex-col overflow-hidden rounded-4xl border border-white bg-white shadow-2xl shadow-slate-900/10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/family"
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-800">
              <Sparkles size={21} />
            </div>
            <div>
              <h1 className="font-black tracking-tight">{text.title}</h1>
              <p className="text-sm text-slate-500">{text.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-slate-400" />
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none"
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <aside className="border-b border-slate-200 bg-[#fbfaf7] p-5 lg:w-72 lg:border-b-0 lg:border-r lg:p-7">
            <div className="flex items-center gap-2 text-sm font-black text-slate-700">
              <UserRound size={17} className="text-amber-700" /> Speaking now
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => setSpeaker("parent")}
                className={`rounded-xl px-4 py-3 text-left text-sm font-bold ${speaker === "parent" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
              >
                {text.parent}
              </button>
              <button
                type="button"
                onClick={() => setSpeaker("learner")}
                className={`rounded-xl px-4 py-3 text-left text-sm font-bold ${speaker === "learner" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
              >
                {text.learner}
              </button>
            </div>
            <div className="mt-7 hidden rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 lg:block">
              <ShieldCheck size={19} className="mb-3 text-emerald-700" />
              <p className="font-bold">Grounded guidance</p>
              <p className="mt-1 leading-5 text-emerald-800/80">
                Numbers are shown only when outcome data is available.
              </p>
            </div>
          </aside>
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
              {messages.length === 0 && (
                <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <Headphones />
                  </div>
                  <h2 className="max-w-xl text-3xl font-black tracking-tight sm:text-4xl">
                    {text.intro}
                  </h2>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {starterQuestions[language].map((question) => (
                      <button
                        key={question}
                        onClick={() => send(question)}
                        className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`mb-5 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-3xl px-5 py-4 sm:max-w-[75%] ${message.role === "user" ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm"}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-6 text-xs font-bold uppercase tracking-wider opacity-60">
                      <span>
                        {message.role === "user"
                          ? message.speaker === "parent"
                            ? text.parent
                            : text.learner
                          : "KaushalSaarthi"}
                      </span>
                      {message.role === "ai" && (
                        <button
                          type="button"
                          title={text.listen}
                          onClick={() => speak(message.content, language)}
                          className="rounded-lg p-1 hover:bg-slate-100"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap leading-7">
                      {message.content}
                    </p>
                    {message.evidence?.length > 0 && (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-emerald-700">
                          {text.source}
                        </p>
                        {message.evidence.slice(0, 2).map((card, cardIndex) => (
                          <div
                            key={cardIndex}
                            className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-950"
                          >
                            <p className="font-bold">{card.topic}</p>
                            <p className="mt-1 leading-5">{card.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="text-sm font-semibold text-slate-400">
                  Thinking...
                </div>
              )}
              {error && (
                <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div className="border-t border-slate-200 bg-white p-4 sm:p-6">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  send();
                }}
                className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-100"
              >
                <button
                  type="button"
                  title="Voice input"
                  onClick={startListening}
                  className="rounded-xl p-3 text-slate-500 hover:bg-white hover:text-amber-700"
                >
                  <Mic size={20} />
                </button>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={text.placeholder}
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none"
                />
                <button
                  type="submit"
                  title={text.send}
                  disabled={sending || !input.trim()}
                  className="rounded-xl bg-slate-900 p-3 text-white transition hover:bg-slate-700 disabled:opacity-40"
                >
                  <Send size={20} />
                </button>
              </form>
              <div className="mx-auto mt-3 flex max-w-3xl justify-center">
                <button
                  type="button"
                  onClick={async (event) => {
                    if (!sessionId) return;
                    const originalText = event.currentTarget.innerText;
                    event.currentTarget.innerText = "Requesting...";
                    event.currentTarget.disabled = true;
                    try {
                      await api.post("/chat/escalate", { chatSessionId: sessionId });
                      setMessages(current => [
                        ...current,
                        { role: "ai", content: "I've let a human counsellor know. They will reach out to you shortly." }
                      ]);
                      event.currentTarget.innerText = "Request Sent ✓";
                    } catch (err) {
                      event.currentTarget.innerText = originalText;
                      event.currentTarget.disabled = false;
                      setError("Failed to request human support. Please try again.");
                    }
                  }}
                  disabled={!sessionId}
                  className="text-sm font-bold text-rose-700 disabled:text-slate-400"
                >
                  {text.human}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle, MessageCircle, Globe, Database, HelpCircle, Briefcase, TrendingUp, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';

const CONCERNS = [
  { id: 'income', icon: <Briefcase className="w-8 h-8 text-indigo-500" />, label: 'Income & Salary', labelMr: 'उत्पन्न (Income)' },
  { id: 'job_security', icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />, label: 'Job Security', labelMr: 'नोकरीची सुरक्षितता (Job Security)' },
  { id: 'career_growth', icon: <TrendingUp className="w-8 h-8 text-blue-500" />, label: 'Career Growth', labelMr: 'करिअरची प्रगती (Career Growth)' },
  { id: 'education', icon: <GraduationCap className="w-8 h-8 text-purple-500" />, label: 'Further Education', labelMr: 'पुढील शिक्षण (Further Education)' },
];

export default function StudentHome() {
  const { user } = useAuth();
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text, hidden = false) => {
    if (!text.trim()) return;
    
    if (!hidden) {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setInput('');
    }
    
    setLoading(true);
    try {
      const res = await api.post('/chat', {
        message: text,
        chatSessionId,
        language
      });
      
      if (res.data.chatSessionId) setChatSessionId(res.data.chatSessionId);
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: res.data.reply, 
        evidence: res.data.evidence 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'error', content: 'Failed to connect to the counselling service.' }]);
    }
    setLoading(false);
  };

  const handleConcernSelect = (concern) => {
    const msg = language === 'English' 
      ? `I am considering a vocational course but I am concerned about ${concern.label}. Can you guide me?`
      : `मी व्यावसायिक अभ्यासक्रमाचा विचार करत आहे पण मला ${concern.labelMr} बद्दल काळजी वाटते. तुम्ही मार्गदर्शन करू शकता का?`;
    handleSend(msg);
  };

  return (
    <DashboardLayout title="Family Career Counselling">
      <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-5 flex justify-between items-center shrink-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
              <MessageCircle size={20} className="text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">SkillSaathi AI Counsellor</h2>
              <p className="text-xs text-indigo-200 opacity-80">Evidence-based family support</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLanguage(l => l === 'English' ? 'Marathi' : 'English')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold transition backdrop-blur-md"
            >
              <Globe size={16} /> {language === 'English' ? 'मराठी' : 'English'}
            </button>
            <button className="bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-rose-500/20">
              <AlertCircle size={16} />
              <span className="hidden sm:inline">{language === 'English' ? 'Talk to Human' : 'समुपदेशकाशी बोला'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        {/* Concern Selection (Initial Screen) */}
        {messages.length === 0 && (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center relative z-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-2xl"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6 border-8 border-white shadow-xl shadow-indigo-100">
                <HelpCircle className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                {language === 'English' ? 'What is your main concern?' : 'तुमची मुख्य काळजी काय आहे?'}
              </h3>
              <p className="text-lg text-slate-500 mb-12">
                {language === 'English' 
                  ? 'Select a topic to start discussing vocational careers and view verified outcome data.' 
                  : 'व्यावसायिक करिअरचे पर्याय आणि त्यांच्या निकालांबद्दल चर्चा सुरू करण्यासाठी एक विषय निवडा.'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CONCERNS.map((c, i) => (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={c.id}
                    onClick={() => handleConcernSelect(c)}
                    className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all text-left flex items-center gap-5"
                  >
                    <div className="bg-slate-50 p-4 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      {c.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {language === 'English' ? c.label : c.labelMr}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-indigo-600 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Discuss this <ArrowRight size={14} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Chat Interface */}
        {messages.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 z-0">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-5 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-600/20' 
                        : msg.role === 'error'
                          ? 'bg-rose-50 border border-rose-200 text-rose-700'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-base">{msg.content}</p>
                      
                      {/* Evidence Cards */}
                      {msg.evidence && msg.evidence.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 bg-emerald-50 inline-flex px-3 py-1.5 rounded-full">
                            <Database size={14} /> 
                            {language === 'English' ? 'Verified Evidence Retrieved' : 'पडताळलेले पुरावे'}
                          </div>
                          {msg.evidence.map((ev, eIdx) => (
                            <div key={eIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm hover:border-indigo-200 transition-colors">
                              <span className="font-bold text-slate-900 block mb-2 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">{ev.type}</span>
                                {ev.topic}
                              </span>
                              <span className="text-slate-600 block leading-relaxed">{ev.text}</span>
                              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium">
                                <span>Source: {ev.source || 'Govt Dataset'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-3xl rounded-bl-sm px-6 py-5 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="p-5 bg-white border-t border-slate-200 shrink-0 z-10">
              <form 
                onSubmit={e => { e.preventDefault(); handleSend(input); }}
                className="flex gap-3 max-w-4xl mx-auto relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={language === 'English' ? "Type your question here (e.g. What is the salary of an electrician?)" : "तुमचा प्रश्न येथे टाइप करा..."}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 py-4 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-slate-800 text-lg shadow-inner"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-indigo-600/30 shrink-0"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
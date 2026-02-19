
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, X, Send, Bot, User, Minimize2, Maximize2, Terminal } from 'lucide-react';
import { UserRole } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  userRole: UserRole;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hello! I'm your Charronix AI Assistant. How can I help you today as a ${userRole.toLowerCase()}?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messages.concat({ role: 'user', text: userMessage }).map(m => ({
          parts: [{ text: m.text }],
          role: m.role
        })),
        config: {
          systemInstruction: `You are the Charronix AI Assistant. 
          The user's role is: ${userRole}.
          
          APP CAPABILITIES:
          - Dashboard: Overview of school stats (Students, Attendance %, etc).
          - Attendance: Teachers mark attendance (Present/Absent/Late).
          - Student List: Manage student data, add/edit/view students.
          - Notices: View and send announcements.
          
          YOUR TASKS:
          1. Academic Doubts: Provide clear, expert explanations for students and teachers.
          2. App Operations: Help users navigate the Charronix app. If they ask how to mark attendance, tell them to go to the "Attendance" section in the sidebar, select their class, and use the check/cross buttons.
          
          GUIDELINES:
          - Be professional yet friendly.
          - Keep answers concise but thorough.
          - Use Markdown for formatting (bold, lists, etc).`,
          temperature: 0.7,
        },
      });

      const text = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
      >
        <Sparkles className="group-hover:rotate-12 transition-transform" size={28} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-[100] transition-all overflow-hidden ${isMinimized ? 'h-16' : 'h-[600px] max-h-[85vh]'}`}>
      {/* Header */}
      <div className="bg-slate-900 dark:bg-black text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="font-black text-base tracking-tight">Charronix AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">AI Assistant</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/30 custom-scroll">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : 'bg-slate-800 dark:bg-black text-white border-slate-700 dark:border-slate-800 shadow-sm'}`}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="How can I assist you?" 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 px-1">
              <Terminal size={14} className="text-slate-400" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Charronix Core AI Engine</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;


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
      const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });

      // ── Rich System Snapshot ──────────────────────────────────
      const systemSnapshot = {
        schoolName: 'Charronix International School',
        academicYear: '2025-2026',
        totalStudents: 452,
        totalTeachers: 28,
        totalClasses: 12,
        totalSections: 36,

        todayAttendance: {
          present: 418,
          absent: 34,
          late: 12,
          percentage: '92.5%',
          date: new Date().toLocaleDateString('en-IN'),
        },

        weeklyAttendance: [
          { day: 'Monday', present: 410, absent: 42 },
          { day: 'Tuesday', present: 425, absent: 27 },
          { day: 'Wednesday', present: 395, absent: 57 },
          { day: 'Thursday', present: 418, absent: 34 },
          { day: 'Friday', present: 420, absent: 32 },
        ],

        classSummary: [
          { class: '6', sections: ['A', 'B', 'C'], students: 120 },
          { class: '7', sections: ['A', 'B', 'C'], students: 115 },
          { class: '8', sections: ['A', 'B', 'C'], students: 110 },
          { class: '9', sections: ['A', 'B', 'C'], students: 107 },
          { class: '10', sections: ['A', 'B'], students: 55 },
          { class: '11', sections: ['Sci', 'Com'], students: 25 },
          { class: '12', sections: ['Sci', 'Com'], students: 20 },
        ],

        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography', 'Computer Science', 'Physical Education', 'Art', 'Music'],

        topStudents: [
          { name: 'Aarav Sharma', class: '10-A', attendance: '94%', grade: 'A' },
          { name: 'Ishani Verma', class: '10-A', attendance: '98%', grade: 'A+' },
          { name: 'Vihaan Gupta', class: '10-A', attendance: '88%', grade: 'B+' },
          { name: 'Ananya Singh', class: '10-A', attendance: '91%', grade: 'A' },
          { name: 'Arjun Patel', class: '10-A', attendance: '95%', grade: 'A' },
        ],

        teachers: [
          { name: 'Meera Iyer', id: 'TCH001', subjects: ['Mathematics', 'Physics'], classes: ['10-A', '10-B'] },
          { name: 'Rahul Kapoor', id: 'TCH002', subjects: ['English', 'History'], classes: ['9-A', '9-C'] },
        ],

        recentActivity: [
          { title: 'New Admission', desc: 'Rahul Kumar added to Class 9-A', time: '2 hours ago' },
          { title: 'Fee Payment', desc: 'Verified payment for ADM2023001', time: '4 hours ago' },
          { title: 'Staff Meeting', desc: 'Monthly review scheduled for Friday', time: 'Yesterday' },
        ],

        notices: [
          { title: 'Republic Day Celebration', date: '2026-01-24', target: 'All' },
          { title: 'Parent-Teacher Meeting', date: '2026-01-20', target: 'Class 10' },
        ],

        examSchedule: {
          upcoming: 'Unit Test 3 – March 2026',
          lastResult: 'Mid-Term Exam – December 2025',
        },

        feeStatus: {
          totalCollected: '₹45,20,000',
          pending: '₹8,30,000',
          defaulters: 18,
        },
      };

      // ── Role-Specific Capabilities ────────────────────────────
      const roleCapabilities: Record<string, string> = {
        STUDENT: `
AS A STUDENT, the user can:
- View their personal Dashboard with academic progress, GPA, and subject-wise performance
- Check daily Attendance records and monthly attendance percentage
- Access their personalized Timetable with class timings, rooms, and teachers
- View Exam Reports and download PDF report cards  
- Read school Notifications and announcements
STUDENT-SPECIFIC GUIDANCE:
- Help them with homework, academic doubts (math, science, history, etc.)
- Explain concepts clearly like a tutor
- Guide them to the correct app section when they ask about features
- Motivate and encourage academic effort`,

        TEACHER: `
AS A TEACHER, the user can:
- View their Dashboard with class-wise analytics and student performance
- Take Attendance: Mark students Present/Absent/Late for their assigned classes
- Upload Marks: Enter subject-wise grades and exam scores
- View My Students: See the complete roster of their assigned classes
TEACHER-SPECIFIC GUIDANCE:
- Help with pedagogy questions, lesson planning ideas
- Provide data-driven insights about student performance trends
- Assist with attendance operations ("go to Take Attendance > select your class > mark each student")
- Answer questions about educational methodologies`,

        PARENT: `
AS A PARENT, the user can:
- View Overview dashboard of their child's academic status
- Check Reports: Detailed grade reports and performance trends
- File Complaints: Report issues to administration
- Monitor Attendance: Track child's daily presence/absence
PARENT-SPECIFIC GUIDANCE:
- Help them understand their child's performance
- Explain grading systems and academic standards
- Guide them to file complaints or view reports
- Provide tips for supporting their child's education at home`,

        ADMIN: `
AS AN ADMIN, the user can:
- View full Dashboard with school-wide analytics (attendance, enrollment, finances)
- Manage Attendance records across all classes
- Manage Students: Add, edit, view all student records and profiles
- Manage Teachers: Add, edit staff records, assign subjects and classes
- AI Timetable: Generate and manage class schedules using AI
- View Analytics: Detailed reports and data visualization
ADMIN-SPECIFIC GUIDANCE:
- Provide statistical analysis and data-driven recommendations
- Help with operational decisions (staffing, scheduling, resource allocation)
- Generate summaries and reports from available data
- Assist with admission processes and fee management`,

        PRINCIPAL: `
AS A PRINCIPAL, the user can:
- Full Dashboard with complete school overview and KPIs
- All Admin capabilities plus strategic oversight
- Staff performance monitoring
- School-wide analytics and trend analysis
PRINCIPAL-SPECIFIC GUIDANCE:
- Provide executive-level summaries and strategic insights
- Compare performance metrics across classes and departments
- Suggest data-driven improvements for school operations
- Help draft communications and policy recommendations`,
      };

      const roleBlock = roleCapabilities[userRole] || roleCapabilities['ADMIN'];

      // ── System Instruction ────────────────────────────────────
      const systemInstruction = `
You are the **Charronix AI Assistant** — an intelligent, friendly, and knowledgeable AI built into the Charronix School Management System.

═══ IDENTITY ═══
- Name: Charronix AI
- School: ${systemSnapshot.schoolName}
- Academic Year: ${systemSnapshot.academicYear}
- Current Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

═══ CURRENT USER ═══
- Role: ${userRole}
${roleBlock}

═══ SCHOOL DATA (Live Snapshot) ═══
${JSON.stringify(systemSnapshot, null, 2)}

═══ CORE BEHAVIOR RULES ═══

1. **GENERAL QUESTIONS**: When the user asks general knowledge, math, science, coding, history, or any academic question — answer it DIRECTLY like a knowledgeable tutor. Do NOT mention school data or system stats. Examples:
   - "What is photosynthesis?" → Explain photosynthesis clearly
   - "2+5" → Answer "7" without adding school stats
   - "Explain Newton's laws" → Give a clear physics explanation

2. **SCHOOL QUESTIONS**: When the user asks about school operations, attendance, students, teachers, or navigation — use the provided data snapshot and guide them appropriately. Examples:
   - "How many students are absent today?" → Use the attendance data
   - "How do I mark attendance?" → Give step-by-step app navigation help

3. **FORMATTING**: Use Markdown formatting for readability:
   - Use **bold** for emphasis
   - Use bullet points and numbered lists
   - Use headers (###) for structured responses
   - Keep responses concise but thorough

4. **TONE**: Be warm, professional, and helpful. Adapt your tone based on the user's role:
   - Students: Friendly, encouraging, tutorial-like
   - Teachers: Professional, collegial, supportive
   - Parents: Empathetic, clear, reassuring
   - Admin/Principal: Data-driven, analytical, executive

5. **NEVER** append system statistics to unrelated responses.
6. **NEVER** say "I don't have access to individual records" — instead, guide the user to the correct app module.
7. When unsure, provide the best possible answer and suggest where to find more details.
`;

      const response = await (ai as any).models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messages.concat({ role: 'user', text: userMessage }).map(m => ({
          parts: [{ text: m.text }],
          role: m.role
        })),
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.4,
        },
      });

      const text = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again." }]);
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

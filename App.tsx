
import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceMarker from './components/AttendanceMarker';
import StudentList from './components/StudentList';
import StudentPortal from './components/StudentPortal';
import ParentPortal from './components/ParentPortal';

import TeacherPortal from '@/components/TeacherPortal';
import TimetableGenerator from '@/components/TimetableGenerator';
import TeacherManagement from '@/components/TeacherManagement';
import LandingPage from '@/components/LandingPage';
import { authAPI } from './services/api';
import PrincipalNotificationsPage from './components/PrincipalNotificationsPage';
import TransportManagement from './components/TransportManagement';


import {
  LogIn,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Users,
  ShieldCheck,
  Smartphone,
  Lock,
  ChevronRight,
  ShieldAlert,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

type AuthState = 'landing' | 'portal' | 'login' | 'reset-password';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState<AuthState>('landing');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [activeView, setActiveView] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Credentials
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Auto-login removed to prevent bypassing verification

  useEffect(() => {
    if (isAuthenticated) {
      const fetchProfile = async () => {
        try {
          const res = await authAPI.getMe();
          if (res.success) {
            setUserProfile(res.data);
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
        }
      };
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [isAuthenticated]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Login ID format rules per role:
  // Student:   2 digits + 3 letters + 4 digits  (e.g. 24BIT0543)
  // Teacher:   exactly 6 digits                  (e.g. 100234)
  // Principal: exactly 6 digits                  (e.g. 900001)
  // Parent:    student first name + DOB (DDMMYYYY) (e.g. Aarav15032010)
  const ID_PATTERNS: Record<string, { regex: RegExp; hint: string; placeholder: string }> = {
    Student: { regex: /^\d{2}[A-Za-z]{3}\d{4}$/, hint: 'Must be 2 digits + 3 letters + 4 digits (e.g. 24BIT0543)', placeholder: 'e.g. 24BIT0543' },
    Teacher: { regex: /^\d{6}$/, hint: 'Must be exactly 6 digits (e.g. 100234)', placeholder: 'e.g. 100234' },
    Principal: { regex: /^\d{6}$/, hint: 'Must be exactly 6 digits (e.g. 900001)', placeholder: 'e.g. 900001' },
    Parent: { regex: /^([A-Za-z]+(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])\d{4}|\d{6})$/, hint: 'Student name + DOB or 6-digit ID (e.g. 800001)', placeholder: 'e.g. 800001 or Aarav15032010' },
  };

  const roles = [
    { id: 'Student', label: 'Student', icon: GraduationCap, color: 'text-indigo-600', darkColor: 'dark:text-indigo-400', bg: 'bg-indigo-50', darkBg: 'dark:bg-indigo-900/20', btn: 'bg-indigo-600', role: UserRole.STUDENT, idLabel: 'Registration Number (e.g. 24BIT0543)' },
    { id: 'Teacher', label: 'Teacher', icon: Briefcase, color: 'text-blue-600', darkColor: 'dark:text-blue-400', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20', btn: 'bg-blue-600', role: UserRole.TEACHER, idLabel: 'Faculty ID' },
    { id: 'Parent', label: 'Parent', icon: Users, color: 'text-emerald-500', darkColor: 'dark:text-emerald-400', bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/20', btn: 'bg-emerald-600', role: UserRole.PARENT, idLabel: 'Parent Login ID (6-digit ID or Name+DOB)' },
    { id: 'Principal', label: 'Principal', icon: ShieldCheck, color: 'text-amber-600', darkColor: 'dark:text-amber-400', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20', btn: 'bg-amber-600', role: UserRole.PRINCIPAL, idLabel: 'UID' },
  ];

  const handlePortalClick = (role: typeof roles[0]) => {
    setSelectedRole(role.id);
    setUserRole(role.role);
    setIdentifier('');
    setPassword('');
    setLoginError('');
    setAppState('login');
  };

  // Removed ROLE_PASSWORDS fallback to ensure manual verification

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Validate ID format based on role
    const pattern = ID_PATTERNS[selectedRole];
    if (pattern && !pattern.regex.test(identifier.trim())) {
      setLoginError('Invalid ID format. ' + pattern.hint);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password: password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Store token
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken || '');
        localStorage.setItem('userRole', selectedRole);
        if (data.data.user) {
          setUserProfile(data.data.user);
        }
      }

      setIsAuthenticated(true);
      setIsLoading(false);
      setActiveView('dashboard');
    } catch {
      setLoginError('Cannot connect to server. Please ensure the backend is running.');
      setIsLoading(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isResetting) {
      setIsResetting(true);
    } else {
      setAppState('login');
      setIsResetting(false);
    }
  };

  const renderView = () => {
    // Role-specific rendering
    if (userRole === UserRole.STUDENT) {
      return <StudentPortal isDarkMode={isDarkMode} activeView={activeView} setActiveView={setActiveView} />;
    }
    if (userRole === UserRole.PARENT) {
      return <ParentPortal isDarkMode={isDarkMode} activeView={activeView} setActiveView={setActiveView} />;
    }
    if (userRole === UserRole.TEACHER) {
      return <TeacherPortal isDarkMode={isDarkMode} activeView={activeView} setActiveView={setActiveView} />;
    }

    // Admin/Principal generic views
    switch (activeView) {
      case 'dashboard': return <Dashboard isDarkMode={isDarkMode} />;
      case 'attendance': return <AttendanceMarker />;
      case 'students': return <StudentList />;
      case 'teachers': return <TeacherManagement isDarkMode={isDarkMode} />;
      case 'timetable': return <TimetableGenerator isDarkMode={isDarkMode} />;
      case 'notifications': return <PrincipalNotificationsPage isDarkMode={isDarkMode} />;
      case 'transport': return <TransportManagement isDarkMode={isDarkMode} />;
      default: return <Dashboard isDarkMode={isDarkMode} />;
    }
  };

  if (isAuthenticated) {
    return (
      <Layout
        activeView={activeView}
        setActiveView={setActiveView}
        userRole={userRole}
        // Fixed: onLogout correctly expects a function () => void
        onLogout={() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
          setAppState('portal');
        }}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        userData={userProfile}
      >
        {renderView()}
      </Layout>
    );
  }


  if (appState === 'landing') {
    return <LandingPage onStart={() => setAppState('portal')} />;
  }

  // PORTAL SELECTION PAGE
  if (appState === 'portal') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <header className="bg-indigo-700 dark:bg-indigo-900 w-full h-16 flex items-center px-6 shadow-md text-white justify-between">
          <div className="flex items-center gap-2">
            <Zap className="fill-white" size={24} />
            <span className="font-bold text-xl tracking-tight">Charronix</span>
          </div>
          <button onClick={toggleTheme} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 flex flex-col justify-center">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Smart Gateway to Excellence</h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Select your portal to access personalized academic tracking, administration, and communication tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 card-3d cursor-pointer group h-80 flex flex-col items-center justify-between"
                onClick={() => handlePortalClick(role)}
              >
                <div className={`${role.bg} ${role.darkBg} w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <role.icon size={48} className={`${role.color} ${role.darkColor}`} />
                </div>
                <div className="text-center w-full card-3d-content">
                  <h3 className={`text-2xl font-black ${role.color} ${role.darkColor} mb-6`}>{role.label}</h3>
                  <button className={`${role.btn} text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-95`}>
                    <LogIn size={20} /> Login
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center text-slate-400 dark:text-slate-600 text-sm font-medium">
            © 2026 Charronix School Management System • v4.2.0
          </div>
        </main>
      </div>
    );
  }

  // LOGIN PAGE
  const roleInfo = roles.find(r => r.id === selectedRole) || roles[0];

  if (appState === 'reset-password') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 overflow-hidden p-8 space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setAppState('login')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Reset Password</h2>
          </div>

          <form onSubmit={handleResetSubmit} className="space-y-6">
            {!isResetting ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 ml-1">Phone Number</label>
                <div className="relative">
                  <Smartphone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Enter phone number..."
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all font-bold"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400 ml-1">Enter 6-Digit OTP</label>
                <div className="relative text-center">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl py-4 text-center text-2xl tracking-[1rem] outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all font-black"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">
              {isResetting ? 'Verify & Reset' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 overflow-hidden">
        <div className={`${roleInfo.btn} p-10 text-white relative`}>
          <button onClick={() => setAppState('portal')} className="absolute left-6 top-10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center mt-4">
            <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
              <roleInfo.icon size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black">{roleInfo.label} Portal</h2>
            <p className="text-white/80 font-medium mt-2">Charronix School Management</p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 ml-1">{roleInfo.idLabel}</label>
            <div className="relative">
              {roleInfo.id === 'Parent' ? <Users size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /> : <ShieldAlert size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />}
              <input
                id="identifier"
                name="username"
                autoComplete="username"
                type="text"
                placeholder={ID_PATTERNS[selectedRole]?.placeholder || `Enter ${roleInfo.idLabel}...`}
                className={`w-full border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all font-bold ${loginError
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-500 animate-shake'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                value={identifier}
                onChange={e => { setIdentifier(e.target.value); setLoginError(''); }}
                required
              />
            </div>

            {/* Error message */}
            {loginError && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 mt-1 animate-fadeIn">
                <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold text-red-600 dark:text-red-400">{loginError}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Password</label>
              <button
                type="button"
                onClick={() => setAppState('reset-password')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                name="password"
                autoComplete="current-password"
                type="password"
                placeholder="••••••••"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all font-bold"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${roleInfo.btn} text-white py-5 rounded-2xl font-black shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg`}
          >
            {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default App;

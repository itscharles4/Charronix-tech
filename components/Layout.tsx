
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  ClipboardCheck,
  Bell,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Zap,
  Moon,
  Sun,
  BookOpen,
  Award,
  Calendar,
  AlertCircle,
  FileText,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import { UserRole } from '../types';
import AIAssistant from './AIAssistant';
import NotificationPanel from './NotificationPanel';
import { notificationAPI } from '../services/api';
import { MOCK_STUDENTS, MOCK_TEACHERS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  userRole: UserRole;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  userData: any;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  setActiveView,
  userRole,
  onLogout,
  isDarkMode,
  toggleTheme,
  userData
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and poll every 30 s
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await notificationAPI.getUnreadCount();
        if (result?.success) setUnreadCount(result.data.count);
      } catch { }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Strictly filter navigation items per role
  const getNavItems = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        return [
          { id: 'dashboard', label: 'My Progress', icon: LayoutDashboard },
          { id: 'reports', label: 'Exam Reports', icon: FileText },
          { id: 'attendance', label: 'My Attendance', icon: ClipboardCheck },
          { id: 'timetable', label: 'My Timetable', icon: Calendar },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];
      case UserRole.PARENT:
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'messages', label: 'Complaints', icon: AlertCircle },
          { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
        ];
      case UserRole.TEACHER:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'Take Attendance', icon: CheckSquare },
          { id: 'marks', label: 'Upload Marks', icon: BookOpen },
          { id: 'students', label: 'My Students', icon: Users },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];
      case UserRole.ADMIN:
      case UserRole.PRINCIPAL:
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'teachers', label: 'Teachers', icon: UserSquare2 },
          { id: 'timetable', label: 'AI Timetable', icon: Calendar },
          { id: 'reports', label: 'Analytics', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];
    }
  };

  const navItems = getNavItems();

  // Calculate identity display
  const profile = userData?.student || userData?.teacher || userData?.profile;
  const identity = {
    name: profile?.firstName ? `${profile.firstName} ${profile.lastName}` : userData?.email || 'Guest',
    initials: (profile?.firstName?.[0] || userData?.email?.[0] || 'G') + (profile?.lastName?.[0] || ''),
    role: userData?.role || userRole || 'GUEST'
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 dark:bg-slate-900 text-white shadow-2xl border-r border-slate-800">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Zap className="fill-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">Charronix</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Management v4.2</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                // Student/Teacher 'notifications' opens the slide-over panel
                // Principal/Admin 'notifications' navigates to the full page
                if (item.id === 'notifications' && (userRole === UserRole.STUDENT || userRole === UserRole.TEACHER)) {
                  setNotifPanelOpen(true);
                } else {
                  setActiveView(item.id);
                }
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeView === item.id
                ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-900/50 translate-x-1'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <item.icon size={22} className={activeView === item.id ? 'text-white' : 'text-slate-500'} />
              <span className="text-sm font-bold">{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {item.id !== 'notifications' && activeView === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-2xl mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-black">
              {identity.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{identity.name}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{identity.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-2 font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between px-6 z-50 border-b dark:border-slate-800 transition-colors">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="text-indigo-600 fill-indigo-600" size={20} />
          <span className="font-black text-slate-800 dark:text-slate-100 tracking-tighter">CHARRONIX</span>
        </div>
        <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <header className="hidden md:flex h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 items-center justify-between px-10 transition-colors">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 capitalize tracking-tight">{activeView.replace('-', ' ')}</h2>
          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-100 dark:border-slate-700">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Bell with unread badge */}
            <button
              onClick={() => setNotifPanelOpen(true)}
              className="relative p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-100 dark:border-slate-700"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">{identity.name}</p>
                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{identity.role}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black shadow-sm">
                {identity.initials}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scroll bg-slate-50/50 dark:bg-slate-950/50">
          {children}
        </div>
      </main>

      <AIAssistant userRole={userRole} />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notifPanelOpen}
        onClose={() => setNotifPanelOpen(false)}
        userRole={userRole}
        isDarkMode={isDarkMode}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
};

export default Layout;

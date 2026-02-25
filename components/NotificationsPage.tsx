import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertCircle,
  BookOpen,
  Trophy,
  Calendar,
  Users,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { studentAPI } from '../services/api';

interface NotificationsPageProps {
  isDarkMode: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'academic' | 'event' | 'alert' | 'system' | 'info' | 'warning' | 'success' | 'error';
  icon: string;
  timestamp: string;
  isRead: boolean;
  sender?: string;
  actionLink?: string;
  actionLabel?: string;
}

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ isDarkMode }) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'academic' | 'event' | 'alert' | 'info' | 'warning' | 'success' | 'error'>('all');
  const [groupedNotifications, setGroupedNotifications] = useState<GroupedNotifications>({
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  });

  const card = 'bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch notifications from API
        const response = await studentAPI.getNotifications(50);
        console.log('Notifications API Response:', response); // Debug log

        if (response?.data && Array.isArray(response.data)) {
          // Map API responses to match our Notification interface
          const mappedNotifications: Notification[] = response.data.map((notif: any) => ({
            id: notif.id || '',
            title: notif.title || 'No Title',
            message: notif.message || 'No Message',
            type: nTypeMapping(notif.type),
            icon: getIconForType(notif.type || 'INFO'),
            timestamp: notif.createdAt || new Date().toISOString(),
            isRead: notif.isRead || false,
            sender: 'Admin',
          }));
          console.log('Mapped Notifications:', mappedNotifications); // Debug log
          setNotifications(mappedNotifications);
          groupNotificationsByDate(mappedNotifications);
        } else {
          console.warn('Invalid response format:', response);
          setError('No notifications found');
        }
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        setError(err.message || 'Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nTypeMapping = (type: string): any => {
    switch ((type || 'INFO').toUpperCase()) {
      case 'WARNING': return 'warning';
      case 'ERROR': return 'alert';
      case 'SUCCESS': return 'success';
      case 'INFO': return 'info';
      default: return 'system';
    }
  };

  const getIconForType = (type: string): string => {
    switch ((type || 'INFO').toUpperCase()) {
      case 'WARNING': return '⚠️';
      case 'SUCCESS': return '✅';
      case 'ERROR': return '❌';
      case 'INFO':
      default: return 'ℹ️';
    }
  };

  const groupNotificationsByDate = (notifs: Notification[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const grouped: GroupedNotifications = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    notifs.forEach((notif) => {
      const notifDate = new Date(notif.timestamp);
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      if (notifDay.getTime() === today.getTime()) {
        grouped.today.push(notif);
      } else if (notifDay.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(notif);
      } else if (notifDay.getTime() > weekAgo.getTime()) {
        grouped.thisWeek.push(notif);
      } else {
        grouped.older.push(notif);
      }
    });

    setGroupedNotifications(grouped);
  };

  const getFilteredNotifications = () => {
    const allNotifs = { ...groupedNotifications };

    if (selectedFilter === 'unread') {
      return Object.keys(allNotifs).reduce((acc, key) => ({
        ...acc,
        [key]: allNotifs[key as keyof GroupedNotifications].filter(n => !n.isRead),
      }), allNotifs as GroupedNotifications);
    }

    if (selectedFilter !== 'all') {
      return Object.keys(allNotifs).reduce((acc, key) => ({
        ...acc,
        [key]: allNotifs[key as keyof GroupedNotifications].filter(n => n.type === selectedFilter),
      }), allNotifs as GroupedNotifications);
    }

    return allNotifs;
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'event': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'alert':
      case 'error': return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'success': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filtered = getFilteredNotifications();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
        <p className="font-bold text-lg">Loading Notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 p-8 text-center">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-xl font-black mb-2">Error Loading Notifications</h3>
        <p className="font-bold text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Controls */}
      <div className={`${card} p-6 flex items-center justify-between flex-wrap gap-4`}>
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Notifications</h1>
          <p className="text-sm text-slate-400 font-bold mt-1">
            {unreadCount} unread • {notifications.length} total
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread', badge: unreadCount },
          { id: 'academic', label: 'Academic' },
          { id: 'event', label: 'Events' },
          { id: 'alert', label: 'Alerts' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id as any)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all relative ${selectedFilter === filter.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : `${card} text-slate-600 dark:text-slate-400 hover:shadow-md`
              }`}
          >
            {filter.label}
            {filter.badge && (
              <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-black">
                {filter.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div className="space-y-8">
        {/* Today */}
        {filtered.today.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">TODAY</h2>
            <div className="space-y-3">
              {filtered.today.map((notif) => (
                <div
                  key={notif.id}
                  className={`${card} p-5 flex gap-4 ${!notif.isRead ? 'border-l-4 border-l-indigo-600' : ''}`}
                >
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-2" />
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${getTypeColor(notif.type)}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{notif.title}</h3>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{notif.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        {notif.timestamp && (
                          <>
                            <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                            {notif.sender && (
                              <>
                                <span>•</span>
                                <span className="text-indigo-600 dark:text-indigo-400">{notif.sender}</span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                      {notif.actionLabel && (
                        <button className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline">
                          {notif.actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex-shrink-0"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yesterday */}
        {filtered.yesterday.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">YESTERDAY</h2>
            <div className="space-y-3">
              {filtered.yesterday.map((notif) => (
                <div key={notif.id} className={`${card} p-5 flex gap-4`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${getTypeColor(notif.type)}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{notif.title}</h3>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{notif.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        {notif.sender && <span>{notif.sender}</span>}
                      </div>
                      {notif.actionLabel && (
                        <button className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline">
                          {notif.actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* This Week */}
        {filtered.thisWeek.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">THIS WEEK</h2>
            <div className="space-y-3">
              {filtered.thisWeek.map((notif) => (
                <div key={notif.id} className={`${card} p-5 flex gap-4`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${getTypeColor(notif.type)}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{notif.title}</h3>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{notif.message}</p>
                    <div className="text-xs font-bold text-slate-400">
                      {new Date(notif.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Older */}
        {filtered.older.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">OLDER</h2>
            <div className="space-y-3">
              {filtered.older.slice(0, 5).map((notif) => (
                <div key={notif.id} className={`${card} p-4 flex gap-4`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${getTypeColor(notif.type)}`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{notif.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(notif.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filtered.today.length === 0 &&
          filtered.yesterday.length === 0 &&
          filtered.thisWeek.length === 0 &&
          filtered.older.length === 0 && (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-black text-slate-600 dark:text-slate-400 mb-2">No Notifications</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500">You're all caught up!</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default NotificationsPage;

import React from 'react';
import { BookOpen, Users, Briefcase, MessageSquare, User, ShieldAlert, LogOut, Globe, Wifi, WifiOff } from 'lucide-react';
import { User as UserType } from '../types.ts';

interface HeaderProps {
  user: UserType | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  isOffline: boolean;
}

export default function Header({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  language,
  setLanguage,
  isOffline,
}: HeaderProps) {
  let desktopTabs = [];
  if (user?.role === 'admin') {
    desktopTabs = [
      { id: 'admin', label: language === 'en' ? 'Admin Panel' : 'Panel Admin', icon: ShieldAlert },
      { id: 'forum', label: 'Forum', icon: MessageSquare },
      { id: 'profile', label: language === 'en' ? 'Profile' : 'Profil', icon: User },
    ];
  } else if (user?.role === 'mentor') {
    desktopTabs = [
      { id: 'mentorship', label: language === 'en' ? 'Mentor Sessions' : 'Sessions Mentor', icon: Users },
      { id: 'forum', label: 'Forum', icon: MessageSquare },
      { id: 'profile', label: language === 'en' ? 'Profile' : 'Profil', icon: User },
    ];
  } else {
    desktopTabs = [
      { id: 'courses', label: language === 'en' ? 'Courses' : 'Cours', icon: BookOpen },
      { id: 'mentorship', label: language === 'en' ? 'Mentorship' : 'Mentorat', icon: Users },
      { id: 'opportunities', label: language === 'en' ? 'Opportunities' : 'Opportunités', icon: Briefcase },
      { id: 'forum', label: 'Forum', icon: MessageSquare },
      { id: 'profile', label: language === 'en' ? 'Profile' : 'Profil', icon: User },
    ];
  }

  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 h-20 flex items-center shadow-xs" id="main-app-header">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Brand logo & title */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer" 
          onClick={() => setActiveTab('courses')}
          id="header-brand-logo"
        >
          <div className="bg-teal-950 text-teal-400 font-black px-3 py-1.5 rounded-xl text-lg tracking-tight font-display flex items-center justify-center">
            HR
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 font-display hidden sm:inline">HerRise</span>
        </div>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-1.5" id="desktop-navigation-links">
            {desktopTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 border-l-4 md:border-l-0 md:border-b-2 border-teal-500'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  style={{ minHeight: '40px' }}
                  id={`desktop-nav-${tab.id}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer"
            style={{ minHeight: '40px' }}
            title="Switch Language / Changer de langue"
            id="language-switcher-btn"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Connection Status Indicator */}
          <div className="flex items-center" id="connection-status-dot">
            {isOffline ? (
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" title="Offline" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" title="Online Ready" />
            )}
          </div>

          {/* User Signout */}
          {user && (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-slate-600 hidden lg:inline max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                style={{ minHeight: '40px', minWidth: '40px' }}
                title={language === 'en' ? 'Sign Out' : 'Se Déconnecter'}
                id="header-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

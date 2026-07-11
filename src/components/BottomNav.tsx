import React from 'react';
import { BookOpen, Users, Briefcase, MessageSquare, User, ShieldAlert } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role?: string;
  language: 'en' | 'fr';
}

export default function BottomNav({ activeTab, setActiveTab, role, language }: BottomNavProps) {
  let tabs = [];
  if (role === 'admin') {
    tabs = [
      { id: 'admin', label: language === 'en' ? 'Admin' : 'Admin', icon: ShieldAlert },
      { id: 'forum', label: 'Forum', icon: MessageSquare },
      { id: 'profile', label: language === 'en' ? 'Profile' : 'Profil', icon: User },
    ];
  } else if (role === 'mentor') {
    tabs = [
      { id: 'mentorship', label: language === 'en' ? 'Sessions' : 'Sessions', icon: Users },
      { id: 'forum', label: 'Forum', icon: MessageSquare },
      { id: 'profile', label: language === 'en' ? 'Profile' : 'Profil', icon: User },
    ];
  } else {
    tabs = [
      { id: 'courses', label: language === 'en' ? 'Courses' : 'Cours', icon: BookOpen },
      { id: 'mentorship', label: language === 'en' ? 'Mentors' : 'Mentorat', icon: Users },
      { id: 'opportunities', label: language === 'en' ? 'Opps' : 'Opps', icon: Briefcase },
      { id: 'forum', label: 'Forum', icon: MessageSquare },
      { id: 'profile', label: language === 'en' ? 'Profile' : 'Profil', icon: User },
    ];
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 block md:hidden"
      aria-label="Mobile Navigation"
      id="bottom-navigation-bar"
    >
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 w-full h-[56px] transition-colors cursor-pointer ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
              id={`nav-btn-${tab.id}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

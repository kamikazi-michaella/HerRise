import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import BottomNav from './components/BottomNav.tsx';
import OfflineIndicator from './components/OfflineIndicator.tsx';
import RegisterLogin from './components/RegisterLogin.tsx';
import CourseLibrary from './components/CourseLibrary.tsx';
import MentorshipTab from './components/MentorshipTab.tsx';
import OpportunitiesTab from './components/OpportunitiesTab.tsx';
import ForumTab from './components/ForumTab.tsx';
import ProfileTab from './components/ProfileTab.tsx';
import AdminTab from './components/AdminTab.tsx';

import { User } from './types.ts';
import { CreditCard, Wallet, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, MessageSquare, Award, Users, Info } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('herrise_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('courses');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  // Network Simulation state
  const [isOffline, setIsOffline] = useState<boolean>(localStorage.getItem('herrise_offline') === 'true');
  const [isDataSaver, setIsDataSaver] = useState<boolean>(localStorage.getItem('herrise_datasaver') === 'true');

  // Paid Premium / Payment Simulation sheets
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('2500'); // RWF
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'ussd_sent' | 'success'>('idle');

  // Load language settings & initial user profiles
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      if (isOffline) {
        // Build simulated mock profile from stored state or a default user
        const stored = localStorage.getItem('herrise_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          setLanguage(parsed.language || 'en');
        } else {
          const mockUser: User = {
            id: 'user_offline_001',
            name: 'Aisha Umutesi',
            email: 'aisha.umutesi@gmail.com',
            role: 'learner',
            country: 'Rwanda',
            language: 'en',
            skills: ['Tailoring', 'Basic English'],
            bio: 'Aspiring digital merchant in Kigali, Rwanda.',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
            isVerified: true,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(mockUser);
          localStorage.setItem('herrise_user', JSON.stringify(mockUser));
        }
        return;
      }

      // Online fetching
      const response = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setLanguage(data.user.language || 'en');
        localStorage.setItem('herrise_user', JSON.stringify(data.user));
      } else {
        // Invalid or expired token
        handleLogout();
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleLoginSuccess = (newToken: string, user: User) => {
    setToken(newToken);
    setCurrentUser(user);
    setLanguage(user.language || 'en');
    localStorage.setItem('herrise_token', newToken);
    localStorage.setItem('herrise_user', JSON.stringify(user));
    
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else if (user.role === 'mentor') {
      setActiveTab('mentorship');
    } else {
      setActiveTab('courses');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('herrise_token');
    localStorage.removeItem('herrise_user');
    setActiveTab('courses');
  };

  const toggleOfflineMode = () => {
    const nextVal = !isOffline;
    setIsOffline(nextVal);
    localStorage.setItem('herrise_offline', String(nextVal));
  };

  const toggleDataSaverMode = () => {
    const nextVal = !isDataSaver;
    setIsDataSaver(nextVal);
    localStorage.setItem('herrise_datasaver', String(nextVal));
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setLanguage(updatedUser.language);
    localStorage.setItem('herrise_user', JSON.stringify(updatedUser));
  };

  // Push notification payment simulator
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentStatus('ussd_sent');

    // Simulate USSD Push prompt delay
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentStatus('success');

      // Sync state to current logged-in profile after mock purchase
      if (currentUser) {
        const updated = {
          ...currentUser,
          isPremium: true,
          skills: [...currentUser.skills, 'Premium Member'],
        };
        handleUpdateProfile(updated);
      }
    }, 3000);
  };

  const t = {
    en: {
      tagline: 'Supporting women in software engineering, digital trade, and leadership across East Africa.',
      momoTitle: 'Support HerRise Sisters - Upgrade to Premium',
      momoDesc: 'Unlock advanced Web Coding tracks and secure direct 1-on-1 mentorship matches. Payments are securely simulated over MTN Mobile Money and Airtel Money networks.',
      providerLabel: 'Choose Mobile Network Operator',
      phoneLabel: 'Mobile Money Number (+250 / +254)',
      phonePlaceholder: 'e.g. 0788123456',
      amountLabel: 'Amount (RWF)',
      submitPay: 'Initiate USSD Push Request',
      payLoading: 'Pushing USSD payment prompt to handset...',
      paySuccess: 'Payment Completed Successfully!',
      paySuccessSub: 'Thank you for your support! Your HerRise pilot account has been upgraded to Premium instantly.',
      closeBtn: 'Close Sandbox',
      homeTab: 'Welcome Home',
      ctaPremium: 'Upgrade Account via Mobile Money',
      quickNav: 'Quick Nav',
    },
    fr: {
      tagline: 'Soutenir les femmes dans le codage web, le commerce et le leadership en Afrique.',
      momoTitle: 'Soutenir HerRise - Devenir Premium',
      momoDesc: 'Débloquez les parcours avancés de programmation. Les paiements sont simulés via MTN Mobile Money et Airtel Money.',
      providerLabel: 'Choisissez l\'opérateur',
      phoneLabel: 'Numéro Mobile Money (+250 / +254)',
      phonePlaceholder: 'ex. 0788123456',
      amountLabel: 'Montant (RWF)',
      submitPay: 'Lancer la requête USSD',
      payLoading: 'Envoi de l\'invitation de paiement USSD...',
      paySuccess: 'Paiement effectué avec succès !',
      paySuccessSub: 'Merci pour votre soutien ! Votre profil a été mis à niveau en Premium.',
      closeBtn: 'Fermer',
      homeTab: 'Bienvenue',
      ctaPremium: 'Passer Premium avec Mobile Money',
      quickNav: 'Navigation rapide',
    }
  }[language];

  // Routing View selector
  const renderTabContent = () => {
    if (!token) {
      return <RegisterLogin onLoginSuccess={handleLoginSuccess} language={language} />;
    }

    switch (activeTab) {
      case 'courses':
        return (
          <CourseLibrary
            token={token}
            isOffline={isOffline}
            isDataSaver={isDataSaver}
            language={language}
            onShowCertificates={() => setActiveTab('profile')}
          />
        );
      case 'mentorship':
        return (
          <MentorshipTab
            token={token}
            currentUser={currentUser}
            isOffline={isOffline}
            language={language}
          />
        );
      case 'opportunities':
        return (
          <OpportunitiesTab
            token={token}
            isOffline={isOffline}
            language={language}
          />
        );
      case 'forum':
        return (
          <ForumTab
            token={token}
            isOffline={isOffline}
            language={language}
          />
        );
      case 'profile':
        return (
          <ProfileTab
            token={token}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            isOffline={isOffline}
            language={language}
          />
        );
      case 'admin':
        if (currentUser?.role === 'admin') {
          return (
            <AdminTab
              token={token}
              isOffline={isOffline}
              language={language}
            />
          );
        }
        return <div className="p-8 text-center text-slate-500">Access Denied.</div>;
      default:
        return (
          <CourseLibrary
            token={token}
            isOffline={isOffline}
            isDataSaver={isDataSaver}
            language={language}
            onShowCertificates={() => setActiveTab('profile')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0 font-sans" id="herrise-pwa-app-root">
      
      {/* 1. Mobile Money Checkout Simulator overlay */}
      {showPaymentSheet && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" id="momo-payment-sheet">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border-t-8 border-teal-950 animate-fade-in">
            
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-display">
              <Wallet className="w-5 h-5 text-teal-600" />
              <span>{t.momoTitle}</span>
            </h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-normal">{t.momoDesc}</p>

            {paymentStatus === 'success' ? (
              <div className="text-center py-6 space-y-4 animate-fade-in" id="payment-success-box">
                <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto border border-teal-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{t.paySuccess}</h4>
                  <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
                    {t.paySuccessSub}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentSheet(false);
                    setPaymentStatus('idle');
                    setPaymentPhone('');
                  }}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  {t.closeBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleInitiatePayment} className="space-y-4 mt-5 text-left">
                {/* Operator Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">{t.providerLabel}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('mtn')}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 transition-all ${
                        paymentProvider === 'mtn' 
                          ? 'border-amber-400 bg-amber-50 text-amber-950' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      {/* Simple yellow/yellow representation for MTN */}
                      <span className="w-3 h-3 rounded-full bg-amber-400 block"></span>
                      <span>MTN MoMo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('airtel')}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 transition-all ${
                        paymentProvider === 'airtel' 
                          ? 'border-rose-500 bg-rose-50 text-rose-950' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
                      <span>Airtel Money</span>
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t.phoneLabel}</label>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    required
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-teal-500"
                    style={{ minHeight: '40px' }}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t.amountLabel}</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:bg-slate-50 font-bold text-slate-800"
                    style={{ minHeight: '40px' }}
                    readOnly
                  />
                </div>

                {/* Status indicator loader inside form */}
                {paymentStatus === 'ussd_sent' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl font-medium flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                    <span>{t.payLoading}</span>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentSheet(false);
                      setPaymentStatus('idle');
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading || !paymentPhone}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                    style={{ minHeight: '40px' }}
                  >
                    {t.submitPay}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Top Header Navigation (Desktop/Brand Toolbar) */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
        isOffline={isOffline}
      />

      {/* 3. Offline & Data-Saver Simulation status bars */}
      <OfflineIndicator
        isOffline={isOffline}
        onToggleOffline={toggleOfflineMode}
        isDataSaver={isDataSaver}
        onToggleDataSaver={toggleDataSaverMode}
        language={language}
      />

      {/* 4. Quick MoMo Promotion banner for learners */}
      {currentUser && !currentUser.isPremium && (
        <div className="bg-amber-50 border-b border-amber-100 py-2.5 px-4 print:hidden" id="premium-upgrade-promotional-bar">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <span className="text-amber-900 font-semibold flex items-center gap-1.5 leading-tight">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-200 shrink-0" />
              <span>{language === 'en' ? 'Unlock full programming syllabus + verifiable blockchain stamps.' : 'Débloquez l\'accès premium et obtenez des certificats certifiés.'}</span>
            </span>
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setShowPaymentSheet(true);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-3.5 rounded-lg shrink-0 text-[10px] cursor-pointer"
              style={{ minHeight: '32px' }}
              id="initiate-promotional-upgrade-btn"
            >
              {t.ctaPremium}
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Screen / Tab Switcher Viewport */}
      <main className="flex-grow pb-12" id="main-content-viewport">
        {renderTabContent()}
      </main>

      {/* 6. Bottom Navigation (Mobile Bottom Bar) */}
      {token && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={currentUser?.role}
          language={language}
        />
      )}

    </div>
  );
}

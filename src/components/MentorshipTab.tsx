import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, Video, Star, CheckCircle, XCircle, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { User, MentorshipSession } from '../types.ts';

interface MentorshipTabProps {
  token: string | null;
  currentUser: User | null;
  isOffline: boolean;
  language: 'en' | 'fr';
}

export default function MentorshipTab({
  token,
  currentUser,
  isOffline,
  language,
}: MentorshipTabProps) {
  const [mentors, setMentors] = useState<User[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Booking session modal
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookGoal, setBookGoal] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Rating session modal
  const [sessionToRate, setSessionToRate] = useState<MentorshipSession | null>(null);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const t = {
    en: {
      searchPlaceholder: 'Search mentors by name or bio...',
      allSkills: 'All Specialties',
      specialty: 'Specialties',
      sessionsHeader: 'Your Mentorship Schedule',
      noSessions: 'No mentorship sessions scheduled yet.',
      noMentors: 'No mentors found matching your query.',
      bookBtn: 'Schedule Session',
      bookModalTitle: 'Book Mentorship with',
      dateLabel: 'Select Date',
      timeLabel: 'Select Time',
      goalLabel: 'What is your primary goal for this session?',
      submitBook: 'Request Session',
      close: 'Cancel',
      successMsg: 'Session request submitted successfully! Your mentor will review the request.',
      statusPending: 'Pending Accept',
      statusAccepted: 'Accepted & Ready',
      statusDeclined: 'Declined',
      statusCompleted: 'Completed',
      joinCall: 'Join Video Session',
      rateSessionBtn: 'Rate Session',
      reviewSubmitted: 'Review submitted. Thank you!',
      skillsLabel: 'Mentor Skills:',
      roleMentor: 'Mentor Profile',
      sessionRequests: 'Incoming Student Requests',
      acceptBtn: 'Accept Request',
      declineBtn: 'Decline',
      markComplete: 'Mark Completed',
      ratingTitle: 'Rate your session with',
      reviewLabel: 'Feedback / Notes',
      submitRate: 'Submit Rating',
    },
    fr: {
      searchPlaceholder: 'Rechercher un mentor...',
      allSkills: 'Toutes les spécialités',
      specialty: 'Spécialités',
      sessionsHeader: 'Votre Calendrier de Mentorat',
      noSessions: 'Aucun rendez-vous planifié.',
      noMentors: 'Aucun mentor trouvé.',
      bookBtn: 'Planifier une session',
      bookModalTitle: 'Réserver un rendez-vous avec',
      dateLabel: 'Sélectionner la date',
      timeLabel: 'Sélectionner l\'heure',
      goalLabel: 'Quel est votre objectif principal pour cette session ?',
      submitBook: 'Demander le rendez-vous',
      close: 'Annuler',
      successMsg: 'Demande soumise ! Le mentor va l\'examiner.',
      statusPending: 'En attente',
      statusAccepted: 'Accepté',
      statusDeclined: 'Décliné',
      statusCompleted: 'Terminé',
      joinCall: 'Rejoindre l\'appel vidéo',
      rateSessionBtn: 'Évaluer la session',
      reviewSubmitted: 'Évaluation envoyée. Merci !',
      skillsLabel: 'Compétences :',
      roleMentor: 'Profil du Mentor',
      sessionRequests: 'Demandes d\'apprenantes',
      acceptBtn: 'Accepter',
      declineBtn: 'Refuser',
      markComplete: 'Marquer comme terminé',
      ratingTitle: 'Évaluer la session avec',
      reviewLabel: 'Commentaires / Remarques',
      submitRate: 'Soumettre l\'évaluation',
    }
  }[language];

  // Unique list of skills for filter
  const allAvailableSkills = [
    'Leadership', 'React', 'Node.js', 'PostgreSQL', 'JavaScript', 
    'Business Strategy', 'Financial Planning', 'Micro-loans', 
    'Confidence Coaching', 'HR Management', 'Communication'
  ];

  useEffect(() => {
    fetchMentors();
    if (token) {
      fetchSessions();
    }
  }, [search, selectedSkill, token, isOffline]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      if (isOffline) {
        // Mock filter
        const stored = localStorage.getItem('herrise_mentors_cache');
        if (stored) {
          let cached = JSON.parse(stored) as User[];
          if (selectedSkill !== 'all') cached = cached.filter(m => m.skills.includes(selectedSkill));
          if (search) cached = cached.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || (m.bio && m.bio.toLowerCase().includes(search.toLowerCase())));
          setMentors(cached);
        }
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (selectedSkill !== 'all') params.append('skills', selectedSkill);
      if (search) params.append('search', search);

      const res = await fetch(`/api/mentors?${params.toString()}`);
      const data = await res.json();
      setMentors(data);
      localStorage.setItem('herrise_mentors_cache', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      if (isOffline) {
        const stored = localStorage.getItem('herrise_sessions_cache');
        if (stored) setSessions(JSON.parse(stored));
        return;
      }

      const res = await fetch('/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSessions(data);
      localStorage.setItem('herrise_sessions_cache', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !token) return;

    try {
      if (isOffline) {
        const newSession: MentorshipSession = {
          id: 'sess_offline_' + Date.now(),
          learnerId: currentUser?.id || 'offline_learner',
          learnerName: currentUser?.name || 'Aisha Umutesi',
          mentorId: selectedMentor.id,
          mentorName: selectedMentor.name,
          date: bookDate,
          time: bookTime,
          goal: bookGoal,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const updated = [...sessions, newSession];
        setSessions(updated);
        localStorage.setItem('herrise_sessions_cache', JSON.stringify(updated));

        setBookingSuccess(t.successMsg);
        setTimeout(() => {
          setSelectedMentor(null);
          setBookDate('');
          setBookTime('');
          setBookGoal('');
          setBookingSuccess('');
        }, 2000);
        return;
      }

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          date: bookDate,
          time: bookTime,
          goal: bookGoal,
        })
      });

      const data = await res.json();
      const updated = [...sessions, data];
      setSessions(updated);
      localStorage.setItem('herrise_sessions_cache', JSON.stringify(updated));

      setBookingSuccess(t.successMsg);
      setTimeout(() => {
        setSelectedMentor(null);
        setBookDate('');
        setBookTime('');
        setBookGoal('');
        setBookingSuccess('');
      }, 2500);

    } catch (err) {
      console.error(err);
    }
  };

  const handleSessionAction = async (sessionId: string, action: 'accept' | 'decline' | 'complete') => {
    try {
      if (isOffline) {
        const updated = sessions.map(s => {
          if (s.id === sessionId) {
            s.status = action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'completed';
            if (action === 'accept') s.videoRoomUrl = `https://whereby.com/offline-herrise-${s.id}`;
          }
          return s;
        });
        setSessions(updated);
        localStorage.setItem('herrise_sessions_cache', JSON.stringify(updated));
        return;
      }

      const res = await fetch(`/api/sessions/${sessionId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();

      const updated = sessions.map(s => s.id === sessionId ? data : s);
      setSessions(updated);
      localStorage.setItem('herrise_sessions_cache', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToRate || !token) return;

    try {
      if (isOffline) {
        const updated = sessions.map(s => {
          if (s.id === sessionToRate.id) {
            s.status = 'completed';
            s.rating = stars;
            s.review = reviewText;
          }
          return s;
        });
        setSessions(updated);
        localStorage.setItem('herrise_sessions_cache', JSON.stringify(updated));
        setSessionToRate(null);
        setStars(5);
        setReviewText('');
        return;
      }

      const res = await fetch(`/api/sessions/${sessionToRate.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: stars,
          review: reviewText,
        })
      });
      const data = await res.json();

      const updated = sessions.map(s => s.id === sessionToRate.id ? data : s);
      setSessions(updated);
      localStorage.setItem('herrise_sessions_cache', JSON.stringify(updated));

      setSessionToRate(null);
      setStars(5);
      setReviewText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="mentorship-system-panel">
      
      {/* Schedule Modal Booking */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" id="book-session-modal">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border-t-8 border-teal-950 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-display">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>{t.bookModalTitle} {selectedMentor.name}</span>
            </h3>

            {bookingSuccess ? (
              <div className="my-6 p-4 bg-teal-50 border border-teal-100 text-teal-900 text-xs rounded-xl font-medium animate-fade-in">
                {bookingSuccess}
              </div>
            ) : (
              <form onSubmit={handleBookSession} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.dateLabel}</label>
                    <input
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                      style={{ minHeight: '40px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.timeLabel}</label>
                    <input
                      type="time"
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                      style={{ minHeight: '40px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.goalLabel}</label>
                  <textarea
                    rows={3}
                    value={bookGoal}
                    onChange={(e) => setBookGoal(e.target.value)}
                    placeholder="e.g. I need guidance on applying for the Agri-Business expansion grant."
                    required
                    className="w-full p-3 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer shadow-sm"
                    style={{ minHeight: '40px' }}
                  >
                    {t.submitBook}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Rating / Review Modal */}
      {sessionToRate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" id="rate-session-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
              {t.ratingTitle} {sessionToRate.mentorName}
            </h3>

            <form onSubmit={handleRateSession} className="space-y-4">
              {/* Star selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Stars</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setStars(val)}
                      className="p-1 cursor-pointer transition-transform hover:scale-120"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          val <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.reviewLabel}</label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="e.g. Divine provided amazing advice on structuring my database indexes!"
                  className="w-full p-3 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSessionToRate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer shadow-sm"
                  style={{ minHeight: '40px' }}
                >
                  {t.submitRate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Mentor List Finder (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-teal-950 text-white p-8 rounded-3xl border border-teal-850 shadow-sm relative overflow-hidden animate-fade-in">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-teal-800/20 rounded-full blur-3xl"></div>
            <h1 className="text-2xl font-black tracking-tight font-display flex items-center gap-2">
              <span className="w-2.5 h-6 bg-teal-400 rounded-full inline-block"></span>
              <span>{language === 'en' ? 'Mentorship Network' : 'Réseau de Mentorat'}</span>
            </h1>
            <p className="text-teal-100/80 text-xs mt-2.5 leading-relaxed font-sans">
              {language === 'en'
                ? 'Get 1-on-1 virtual video sessions with software engineers, agronomists, investment advisors, and leadership coaches. Ask questions, present drafts, and get support.'
                : 'Bénéficiez de sessions vidéo individuelles avec des experts. Posez vos questions et recevez des conseils personnalisés.'}
            </p>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500 transition-all bg-slate-50 focus:bg-white focus:shadow-xs"
                style={{ minHeight: '40px' }}
                id="mentor-search-input"
              />
            </div>

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-slate-50 cursor-pointer"
              style={{ minHeight: '40px' }}
              id="specialty-filter"
            >
              <option value="all">{t.allSkills}</option>
              {allAvailableSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          {/* Mentors Cards Grid */}
          {loading ? (
            <div className="py-12 text-center" id="mentors-loading-state">
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-xs">{language === 'en' ? 'Fetching mentors directory...' : 'Chargement...'}</p>
            </div>
          ) : mentors.length === 0 ? (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl" id="mentors-empty-state">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">{t.noMentors}</h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="mentors-grid">
              {mentors.map((mentor) => (
                <div 
                  key={mentor.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                  id={`mentor-card-${mentor.id}`}
                >
                  <div className="space-y-4">
                    {/* Top avatar */}
                    <div className="flex gap-4 items-start">
                      <img 
                        src={mentor.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150'} 
                        alt={mentor.name} 
                        className="w-14 h-14 rounded-xl object-cover shadow-sm bg-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[10px] bg-teal-50 border border-teal-100 text-teal-850 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-display">
                          {t.roleMentor}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm tracking-tight leading-none mt-1.5">{mentor.name}</h3>
                        <p className="text-slate-400 text-[10px] mt-0.5">{mentor.country}</p>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                      {mentor.bio || 'Professional advisor on the HerRise African platform.'}
                    </p>

                    {/* Skills list */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.skillsLabel}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mentor.skills.map(s => (
                          <span key={s} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-50">
                    <button
                      onClick={() => setSelectedMentor(mentor)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm font-display"
                      style={{ minHeight: '44px' }}
                      disabled={!token || (currentUser && currentUser.id === mentor.id)}
                      id={`schedule-session-btn-${mentor.id}`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{t.bookBtn}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Schedules (Span 4) */}
        {token && (
          <div className="lg:col-span-4 space-y-6" id="mentorship-schedule-sidebar">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2 font-display">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>{currentUser?.role === 'mentor' ? t.sessionRequests : t.sessionsHeader}</span>
              </h3>

              {sessions.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-6">{t.noSessions}</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((sess) => {
                    const isPending = sess.status === 'pending';
                    const isAccepted = sess.status === 'accepted';
                    const isDeclined = sess.status === 'declined';
                    const isCompleted = sess.status === 'completed';

                    const canAcceptDecline = currentUser?.role === 'mentor' && isPending;

                    return (
                      <div 
                        key={sess.id} 
                        className="p-4 rounded-xl border border-slate-150 bg-slate-50 text-xs space-y-3"
                        id={`session-item-${sess.id}`}
                      >
                        {/* Header details */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-bold text-slate-800">
                              {currentUser?.role === 'mentor' ? sess.learnerName : sess.mentorName}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{sess.date}</span>
                              <span className="mx-1">&bull;</span>
                              <Clock className="w-3.5 h-3.5" />
                              <span>{sess.time}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 ${
                            isPending ? 'bg-amber-100 text-amber-800' :
                            isAccepted ? 'bg-teal-50 border border-teal-100 text-teal-800' :
                            isDeclined ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {isPending ? t.statusPending :
                             isAccepted ? t.statusAccepted :
                             isDeclined ? t.statusDeclined :
                             t.statusCompleted}
                          </span>
                        </div>

                        {/* Goal text */}
                        <p className="text-slate-500 text-[11px] leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-100">
                          &ldquo;{sess.goal}&rdquo;
                        </p>

                        {/* Actions */}
                        {canAcceptDecline ? (
                          <div className="flex gap-2 pt-1.5" id={`mentor-actions-${sess.id}`}>
                            <button
                              onClick={() => handleSessionAction(sess.id, 'accept')}
                              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-1.5 rounded-xl text-[11px] cursor-pointer shadow-xs"
                              style={{ minHeight: '36px' }}
                            >
                              {t.acceptBtn}
                            </button>
                            <button
                              onClick={() => handleSessionAction(sess.id, 'decline')}
                              className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 rounded-lg text-[11px] cursor-pointer"
                              style={{ minHeight: '36px' }}
                            >
                              {t.declineBtn}
                            </button>
                          </div>
                        ) : null}

                        {/* Video Call button */}
                        {isAccepted && sess.videoRoomUrl && (
                          <div className="space-y-2 pt-1" id={`session-actions-${sess.id}`}>
                            <a
                              href={sess.videoRoomUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs font-display"
                              style={{ minHeight: '40px' }}
                            >
                              <Video className="w-4 h-4 animate-pulse" />
                              <span>{t.joinCall}</span>
                            </a>

                            {/* Mark as complete */}
                            <button
                              onClick={() => handleSessionAction(sess.id, 'complete')}
                              className="w-full text-center text-slate-600 hover:text-slate-800 text-[11px] font-bold border border-slate-200 bg-white py-1.5 rounded-lg cursor-pointer"
                              style={{ minHeight: '36px' }}
                            >
                              {t.markComplete}
                            </button>
                          </div>
                        )}

                        {/* Rating block */}
                        {isCompleted && currentUser?.role === 'learner' && !sess.rating && (
                          <button
                            onClick={() => setSessionToRate(sess)}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            style={{ minHeight: '40px' }}
                            id={`rate-session-${sess.id}`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                            <span>{t.rateSessionBtn}</span>
                          </button>
                        )}

                        {/* Rated results */}
                        {sess.rating && (
                          <div className="flex items-center gap-1.5 pt-1.5 text-amber-600 text-[11px] font-bold border-t border-slate-150">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{sess.rating} Stars Rating Shared</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

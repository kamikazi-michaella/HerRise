import React, { useState, useEffect } from 'react';
import { Search, Briefcase, Bookmark, Calendar, ExternalLink, MapPin, Layers, Building, AlertCircle } from 'lucide-react';
import { Opportunity, Bookmark as BookmarkType } from '../types.ts';

interface OpportunitiesTabProps {
  token: string | null;
  isOffline: boolean;
  language: 'en' | 'fr';
}

export default function OpportunitiesTab({
  token,
  isOffline,
  language,
}: OpportunitiesTabProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const t = {
    en: {
      headerTitle: 'Opportunities Board',
      headerDesc: 'Curated job listings, remote internships, and financial grants for female-led businesses and developers across Africa.',
      searchPlaceholder: 'Search jobs, companies, keywords...',
      allTypes: 'All Types',
      allCountries: 'All Locations',
      job: 'Job',
      internship: 'Internship',
      grant: 'Grant',
      deadline: 'Deadline:',
      applyBtn: 'Apply Online',
      savedTitle: 'Bookmarked Opportunities',
      noSaved: 'Save listings to view them here.',
      noOpps: 'No listings match your search criteria.',
      bookmarkSuccess: 'Opportunity bookmarked',
      bookmarkRemoved: 'Bookmark removed',
      applySuccess: 'Opening external application portal...',
    },
    fr: {
      headerTitle: 'Portail des Opportunités',
      headerDesc: 'Offres d\'emploi, stages à distance et subventions financières triés sur le volet pour les femmes entrepreneures et développeuses en Afrique.',
      searchPlaceholder: 'Rechercher un poste, entreprise, mot-clé...',
      allTypes: 'Tous les types',
      allCountries: 'Tous les pays',
      job: 'Emploi',
      internship: 'Stage',
      grant: 'Subvention',
      deadline: 'Date limite :',
      applyBtn: 'Postuler en ligne',
      savedTitle: 'Offres Enregistrées',
      noSaved: 'Enregistrez des opportunités pour les voir ici.',
      noOpps: 'Aucun résultat correspondant.',
      bookmarkSuccess: 'Opportunité enregistrée',
      bookmarkRemoved: 'Enregistrement retiré',
      applySuccess: 'Ouverture du portail de candidature...',
    }
  }[language];

  useEffect(() => {
    fetchOpportunities();
    if (token) {
      fetchBookmarks();
    }
  }, [search, selectedType, selectedCountry, token, isOffline]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      if (isOffline) {
        const stored = localStorage.getItem('herrise_opportunities_cache');
        if (stored) {
          let cached = JSON.parse(stored) as Opportunity[];
          if (selectedType !== 'all') cached = cached.filter(o => o.type === selectedType);
          if (selectedCountry !== 'all') cached = cached.filter(o => o.country.toLowerCase() === selectedCountry.toLowerCase());
          if (search) {
            const q = search.toLowerCase();
            cached = cached.filter(o => 
              o.title.toLowerCase().includes(q) || 
              o.company.toLowerCase().includes(q) || 
              o.description.toLowerCase().includes(q)
            );
          }
          setOpportunities(cached);
        }
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCountry !== 'all') params.append('country', selectedCountry);
      if (search) params.append('search', search);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      setOpportunities(data);
      localStorage.setItem('herrise_opportunities_cache', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      if (isOffline) {
        const stored = localStorage.getItem('herrise_bookmarks_cache');
        if (stored) setBookmarks(JSON.parse(stored));
        return;
      }

      const res = await fetch('/api/opportunities/bookmarks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookmarks(data);
      localStorage.setItem('herrise_bookmarks_cache', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (oppId: string) => {
    if (!token) return;
    try {
      if (isOffline) {
        const index = bookmarks.findIndex(b => b.opportunityId === oppId);
        let updated = [...bookmarks];
        if (index !== -1) {
          updated.splice(index, 1);
        } else {
          updated.push({
            id: 'bm_offline_' + Date.now(),
            userId: 'offline_user',
            opportunityId: oppId,
            createdAt: new Date().toISOString(),
          });
        }
        setBookmarks(updated);
        localStorage.setItem('herrise_bookmarks_cache', JSON.stringify(updated));
        return;
      }

      const res = await fetch(`/api/opportunities/${oppId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Refetch bookmarks to sync
      fetchBookmarks();
    } catch (err) {
      console.error(err);
    }
  };

  const isBookmarked = (oppId: string) => {
    return bookmarks.some(b => b.opportunityId === oppId);
  };

  const getBookmarkedOpps = () => {
    return opportunities.filter(opp => isBookmarked(opp.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="opportunities-board-panel">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-850 to-emerald-950 text-white p-6 rounded-2xl shadow-md mb-8">
        <h1 className="text-2xl font-black tracking-tight">{t.headerTitle}</h1>
        <p className="text-emerald-100 text-xs mt-1.5 max-w-2xl leading-relaxed">
          {t.headerDesc}
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between mb-6">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
            style={{ minHeight: '40px' }}
            id="opp-search-input"
          />
        </div>

        {/* Opportunity Type & Location Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-slate-50 cursor-pointer"
            style={{ minHeight: '40px' }}
            id="opp-type-filter"
          >
            <option value="all">{t.allTypes}</option>
            <option value="job">{t.job}</option>
            <option value="internship">{t.internship}</option>
            <option value="grant">{t.grant}</option>
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-slate-50 cursor-pointer"
            style={{ minHeight: '40px' }}
            id="opp-country-filter"
          >
            <option value="all">{t.allCountries}</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Kenya">Kenya</option>
            <option value="Uganda">Uganda</option>
          </select>
        </div>

      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Opportunity Listings (Left - Span 8) */}
        <div className="lg:col-span-8 space-y-4" id="opportunity-cards-list">
          {loading ? (
            <div className="py-12 text-center" id="opps-loading-state">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-xs">{language === 'en' ? 'Fetching opportunities directory...' : 'Chargement...'}</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl" id="opps-empty-state">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">{t.noOpps}</h4>
            </div>
          ) : (
            opportunities.map((opp) => {
              const bookmarked = isBookmarked(opp.id);
              const isJob = opp.type === 'job';
              const isInternship = opp.type === 'internship';
              const isGrant = opp.type === 'grant';

              return (
                <div 
                  key={opp.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative flex flex-col sm:flex-row gap-5 items-start justify-between"
                  id={`opp-card-${opp.id}`}
                >
                  <div className="flex gap-4 items-start flex-1">
                    <img 
                      src={opp.companyLogo || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=150'} 
                      alt={opp.company} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Type badge */}
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isJob ? 'bg-sky-100 text-sky-800' :
                          isInternship ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {opp.type === 'job' ? t.job : opp.type === 'internship' ? t.internship : t.grant}
                        </span>

                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                          {opp.location}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-sm tracking-tight leading-none pt-0.5">
                        {language === 'en' ? opp.title : opp.titleFr}
                      </h3>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{opp.company}</span>
                        <span>&bull;</span>
                        <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{opp.sector}</span>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed pt-1 pr-6">
                        {language === 'en' ? opp.description : opp.descriptionFr}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold pt-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>{t.deadline} {opp.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column (Apply & Bookmark toggle) */}
                  <div className="sm:text-right shrink-0 flex sm:flex-col gap-3 w-full sm:w-auto items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                    
                    {/* Bookmark icon */}
                    {token && (
                      <button
                        onClick={() => handleToggleBookmark(opp.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                          bookmarked 
                            ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100' 
                            : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                        style={{ minHeight: '44px', minWidth: '44px' }}
                        title="Bookmark opportunity"
                        id={`bookmark-toggle-${opp.id}`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    <a
                      href={opp.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                      style={{ minHeight: '40px' }}
                      id={`apply-link-${opp.id}`}
                    >
                      <span>{t.applyBtn}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                  </div>

                </div>
              )
            })
          )}
        </div>

        {/* Right Side: Saved bookmarks (Span 4) */}
        {token && (
          <div className="lg:col-span-4 space-y-6" id="bookmarks-sidebar">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-700 fill-emerald-100" />
                <span>{t.savedTitle}</span>
              </h3>

              {getBookmarkedOpps().length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-6 leading-normal">
                  {t.noSaved}
                </p>
              ) : (
                <div className="space-y-3">
                  {getBookmarkedOpps().map((opp) => (
                    <div 
                      key={opp.id} 
                      className="p-3 rounded-xl border border-slate-150 bg-slate-50 text-xs flex justify-between items-center gap-2"
                      id={`bookmark-sidebar-item-${opp.id}`}
                    >
                      <div className="truncate flex-1">
                        <p className="font-bold text-slate-800 truncate">
                          {language === 'en' ? opp.title : opp.titleFr}
                        </p>
                        <p className="text-slate-400 text-[10px] truncate mt-0.5">{opp.company}</p>
                      </div>

                      <button
                        onClick={() => handleToggleBookmark(opp.id)}
                        className="text-rose-500 hover:text-rose-700 font-bold px-2.5 py-1.5 cursor-pointer shrink-0 text-[11px]"
                        style={{ minHeight: '36px' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

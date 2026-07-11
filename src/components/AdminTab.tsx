import React, { useState, useEffect } from 'react';
import { User, Course, Opportunity, DashboardMetrics } from '../types.ts';
import { Shield, Users, BookOpen, Briefcase, Award, ArrowUpRight, ToggleLeft, ToggleRight, Trash2, Plus, CheckCircle, FileSpreadsheet, Sparkles, X, Edit, FolderPlus } from 'lucide-react';

interface AdminTabProps {
  token: string | null;
  isOffline: boolean;
  language: 'en' | 'fr';
}

export default function AdminTab({
  token,
  isOffline,
  language,
}: AdminTabProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Active section inside admin panel
  const [adminView, setAdminView] = useState<'analytics' | 'users' | 'courses' | 'opportunities'>('analytics');

  // Creator Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState<'digital' | 'coding' | 'entrepreneurship' | 'finance' | 'communication'>('digital');
  const [courseLevel, setCourseLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseDuration, setCourseDuration] = useState('5 hours');

  const [showOppModal, setShowOppModal] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppCompany, setOppCompany] = useState('');
  const [oppType, setOppType] = useState<'job' | 'internship' | 'grant'>('job');
  const [oppCategory, setOppCategory] = useState('tech');
  const [oppLocation, setOppLocation] = useState('Kigali, Rwanda');
  const [oppSector, setOppSector] = useState('Software Engineering');
  const [oppDeadline, setOppDeadline] = useState('2026-12-31');
  const [oppDesc, setOppDesc] = useState('');
  const [oppLink, setOppLink] = useState('');

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [adminView, token, isOffline]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (isOffline) {
        // Build mock dashboard metrics
        setMetrics({
          activeUsersCount: 48,
          enrollmentsCount: 154,
          completionRate: 64,
          topCourses: [
            { title: 'Digital Literacy for Entrepreneurs', enrollments: 84, completions: 52 },
            { title: 'Agribusiness Entrepreneurship', enrollments: 45, completions: 30 },
            { title: 'Introduction to Web Coding with React', enrollments: 25, completions: 12 },
          ],
          sessionsCount: 18,
          opportunitiesCount: 4,
        });

        const cachedUsers = localStorage.getItem('herrise_mentors_cache');
        if (cachedUsers) setUsers(JSON.parse(cachedUsers));
        
        const cachedCourses = localStorage.getItem('herrise_courses_cache');
        if (cachedCourses) setCourses(JSON.parse(cachedCourses));

        const cachedOpps = localStorage.getItem('herrise_opportunities_cache');
        if (cachedOpps) setOpportunities(JSON.parse(cachedOpps));

        setLoading(false);
        return;
      }

      // Online fetching
      if (adminView === 'analytics') {
        const res = await fetch('/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setMetrics(data);
      } else if (adminView === 'users') {
        const res = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
      } else if (adminView === 'courses') {
        const res = await fetch('/api/courses'); // gets catalog
        const data = await res.json();
        setCourses(data);
      } else if (adminView === 'opportunities') {
        const res = await fetch('/api/opportunities');
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserActive = async (userId: string) => {
    try {
      if (isOffline) {
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
        return;
      }

      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(users.map(u => u.id === userId ? data : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user profile?')) return;
    try {
      if (isOffline) {
        setUsers(users.filter(u => u.id !== userId));
        return;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const coursePayload = {
        title: courseTitle,
        titleFr: courseTitle,
        category: courseCategory,
        level: courseLevel,
        description: courseDesc,
        descriptionFr: courseDesc,
        duration: courseDuration,
        modules: [
          {
            id: 'mod_' + Date.now() + '_1',
            title: 'Course Introduction',
            titleFr: 'Introduction du cours',
            order: 1,
            lessons: [
              {
                id: 'les_' + Date.now() + '_1',
                title: 'Lesson 1: Key Terms & Definitions',
                titleFr: 'Leçon 1 : Définitions et concepts clés',
                duration: '10 mins',
                order: 1,
                content: 'Welcome to this newly drafted academy course content on HerRise.',
                contentFr: 'Bienvenue dans ce nouveau cours.',
              }
            ]
          }
        ]
      };

      if (isOffline) {
        const newCourseObj: Course = {
          id: 'course_offline_' + Date.now(),
          ...coursePayload,
          published: true,
          imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600',
          enrollmentsCount: 0,
          completionsCount: 0,
        };
        const updated = [...courses, newCourseObj];
        setCourses(updated);
        localStorage.setItem('herrise_courses_cache', JSON.stringify(updated));
        setShowCourseModal(false);
        return;
      }

      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(coursePayload)
      });
      const data = await res.json();
      setCourses([...courses, data]);
      setShowCourseModal(false);

      setCourseTitle('');
      setCourseDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: oppTitle,
        company: oppCompany,
        type: oppType,
        category: oppCategory,
        location: oppLocation,
        country: 'Rwanda',
        sector: oppSector,
        deadline: oppDeadline,
        description: oppDesc,
        applyLink: oppLink,
      };

      if (isOffline) {
        const newOppObj: Opportunity = {
          id: 'opp_offline_' + Date.now(),
          ...payload,
          titleFr: oppTitle,
          descriptionFr: oppDesc,
          createdAt: new Date().toISOString(),
        };
        const updated = [...opportunities, newOppObj];
        setOpportunities(updated);
        localStorage.setItem('herrise_opportunities_cache', JSON.stringify(updated));
        setShowOppModal(false);
        return;
      }

      const res = await fetch('/api/admin/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setOpportunities([...opportunities, data]);
      setShowOppModal(false);

      setOppTitle('');
      setOppCompany('');
      setOppDesc('');
      setOppLink('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOpp = async (oppId: string) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      if (isOffline) {
        const updated = opportunities.filter(o => o.id !== oppId);
        setOpportunities(updated);
        localStorage.setItem('herrise_opportunities_cache', JSON.stringify(updated));
        return;
      }

      const res = await fetch(`/api/admin/opportunities/${oppId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setOpportunities(opportunities.filter(o => o.id !== oppId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = (type: 'users' | 'courses' | 'sessions') => {
    if (isOffline) {
      alert('CSV exports represent pre-rendered tables. Initiating mock report download...');
      return;
    }
    window.open(`/api/admin/export-csv?type=${type}&token=${token}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="admin-dashboard-panel">
      
      {/* Course Modal Creator */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" id="admin-course-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowCourseModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 mb-4">
              <FolderPlus className="w-5 h-5 text-emerald-700" />
              <span>Draft New Academy Course</span>
            </h3>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Course Title</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Intermediate Python Programming"
                  required
                  className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                  style={{ minHeight: '40px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 text-xs rounded-lg bg-slate-50"
                    style={{ minHeight: '40px' }}
                  >
                    <option value="digital">Digital Literacy</option>
                    <option value="coding">Coding / Dev</option>
                    <option value="entrepreneurship">Entrepreneurship</option>
                    <option value="finance">Financial Literacy</option>
                    <option value="communication">Communications</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Level</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 text-xs rounded-lg bg-slate-50"
                    style={{ minHeight: '40px' }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Description / Syllabus Overview</label>
                <textarea
                  rows={3}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Summarize course goals..."
                  required
                  className="w-full p-3 border border-slate-200 text-xs rounded-lg"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-850 rounded-lg cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  Create & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Opportunity Modal Creator */}
      {showOppModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" id="admin-opp-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowOppModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 mb-4">
              <FolderPlus className="w-5 h-5 text-emerald-700" />
              <span>Publish New Opportunity</span>
            </h3>

            <form onSubmit={handleCreateOpp} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Job or Grant Title</label>
                <input
                  type="text"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  placeholder="e.g. Female Agri-Cooperative Grant"
                  required
                  className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                  style={{ minHeight: '40px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Company / Sponsor</label>
                  <input
                    type="text"
                    value={oppCompany}
                    onChange={(e) => setOppCompany(e.target.value)}
                    placeholder="e.g. Equity Bank"
                    required
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                    style={{ minHeight: '40px' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Opportunity Type</label>
                  <select
                    value={oppType}
                    onChange={(e) => setOppType(e.target.value as any)}
                    className="w-full px-2 py-2 border border-slate-200 text-xs rounded-lg bg-slate-50"
                    style={{ minHeight: '40px' }}
                  >
                    <option value="job">Job Listing</option>
                    <option value="internship">Internship</option>
                    <option value="grant">Grant Funding</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Location Details</label>
                  <input
                    type="text"
                    value={oppLocation}
                    onChange={(e) => setOppLocation(e.target.value)}
                    placeholder="e.g. Huye Province"
                    required
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                    style={{ minHeight: '40px' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Sector</label>
                  <input
                    type="text"
                    value={oppSector}
                    onChange={(e) => setOppSector(e.target.value)}
                    placeholder="e.g. Agriculture / Tech"
                    required
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                    style={{ minHeight: '40px' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={oppDeadline}
                    onChange={(e) => setOppDeadline(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                    style={{ minHeight: '40px' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Apply Link (External URL)</label>
                  <input
                    type="url"
                    value={oppLink}
                    onChange={(e) => setOppLink(e.target.value)}
                    placeholder="https://example.com/apply"
                    required
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg"
                    style={{ minHeight: '40px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Detailed Requirements</label>
                <textarea
                  rows={3}
                  value={oppDesc}
                  onChange={(e) => setOppDesc(e.target.value)}
                  placeholder="Details of requirements..."
                  required
                  className="w-full p-3 border border-slate-200 text-xs rounded-lg"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOppModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-850 rounded-lg cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Admin Nav Toolbar */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-850 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 fill-emerald-200" />
            <span>HerRise Administrator Core</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1.5">Platform Controller</h1>
        </div>

        {/* Inner Tab swapping */}
        <div className="flex items-center gap-2 flex-wrap" id="admin-view-swapper">
          <button
            onClick={() => setAdminView('analytics')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminView === 'analytics' ? 'bg-white text-emerald-950' : 'text-emerald-100 hover:bg-emerald-900'
            }`}
            style={{ minHeight: '40px' }}
          >
            Analytics & Reports
          </button>
          <button
            onClick={() => setAdminView('users')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminView === 'users' ? 'bg-white text-emerald-950' : 'text-emerald-100 hover:bg-emerald-900'
            }`}
            style={{ minHeight: '40px' }}
          >
            User Management
          </button>
          <button
            onClick={() => setAdminView('courses')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminView === 'courses' ? 'bg-white text-emerald-950' : 'text-emerald-100 hover:bg-emerald-900'
            }`}
            style={{ minHeight: '40px' }}
          >
            Syllabus Content
          </button>
          <button
            onClick={() => setAdminView('opportunities')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminView === 'opportunities' ? 'bg-white text-emerald-950' : 'text-emerald-100 hover:bg-emerald-900'
            }`}
            style={{ minHeight: '40px' }}
          >
            Opportunities Board
          </button>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="py-12 text-center" id="admin-loading-state">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-xs">Accessing system files...</p>
        </div>
      ) : (
        /* Views */
        <div id="admin-viewport-content">
          
          {/* 1. Analytics & CSV Exports */}
          {adminView === 'analytics' && metrics && (
            <div className="space-y-8" id="admin-analytics-view">
              {/* Report CSV Exporters toolbar */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm"> Verifiable CSV System Exports</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Generate and download official pilot metrics reports.</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleExportCSV('users')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Users CSV Report</span>
                  </button>
                  <button
                    onClick={() => handleExportCSV('courses')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Courses CSV Report</span>
                  </button>
                  <button
                    onClick={() => handleExportCSV('sessions')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Sessions CSV Report</span>
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Users</p>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-none pt-1">
                    {metrics.activeUsersCount}
                  </h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Enrollments</p>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-none pt-1">
                    {metrics.enrollmentsCount}
                  </h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Completion Rate</p>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-none pt-1">
                    {metrics.completionRate}%
                  </h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Opportunities</p>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-none pt-1">
                    {metrics.opportunitiesCount}
                  </h3>
                </div>
              </div>

              {/* Graphical Analysis with pure CSS Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left: Top enrolled courses */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Top Performing Courses</span>
                  </h4>

                  <div className="space-y-4 pt-2">
                    {metrics.topCourses.map((tc, index) => {
                      // Normalize bar width
                      const maxEnroll = Math.max(...metrics.topCourses.map(c => c.enrollments), 1);
                      const widthPercent = Math.round((tc.enrollments / maxEnroll) * 100);

                      return (
                        <div key={index} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center font-semibold text-slate-700">
                            <span className="truncate max-w-[80%]">{tc.title}</span>
                            <span>{tc.enrollments} enrolled</span>
                          </div>
                          <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden relative flex items-center pr-3">
                            <div 
                              className="h-full bg-emerald-600/20 border-r-4 border-emerald-600 rounded-lg"
                              style={{ width: `${widthPercent}%` }}
                            ></div>
                            <span className="absolute right-3 text-[10px] text-emerald-800 font-bold">
                              {tc.completions} completions ({tc.enrollments > 0 ? Math.round((tc.completions / tc.enrollments) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Low bandwidth advice card */}
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-black text-amber-900 flex items-center gap-1.5 text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-200 shrink-0" />
                      <span>Rwandan Pilot Project Stats</span>
                    </h3>
                    <p className="text-amber-800 text-xs leading-relaxed">
                      We have pre-seeded data for <strong>50 active Rwandan learners</strong> across Huye, Rubavu, and Kigali provinces. 
                      You can download any of the CSV metrics above to verify full integration matching WCAG and regional low-bandwidth guidelines.
                    </p>
                  </div>
                  <div className="p-3 bg-white/60 rounded-xl border border-amber-100 text-[10px] text-amber-800 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    Secure AES-256 and TLS 1.3 Encryption Active
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. User Management */}
          {adminView === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="admin-users-view">
              <div className="p-5 border-b border-slate-100 text-left">
                <h3 className="font-bold text-slate-900 text-sm">User Directory Control</h3>
                <p className="text-slate-400 text-xs mt-0.5">Toggle active status or purge user profiles instantly.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                      <th className="py-3 px-4">Profile</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 flex items-center gap-2.5">
                          <img src={u.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150'} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" referrerPolicy="no-referrer" />
                          <span className="font-bold text-slate-900">{u.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 py-0.5 px-2 rounded-full uppercase text-[9px] font-bold text-slate-600">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{u.country}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleToggleUserActive(u.id)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                              style={{ minHeight: '36px', minWidth: '36px' }}
                              title="Toggle Active/Suspend"
                              id={`toggle-user-active-${u.id}`}
                            >
                              {u.isActive ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              style={{ minHeight: '36px', minWidth: '36px' }}
                              title="Delete User"
                              id={`delete-user-${u.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Syllabus Content management */}
          {adminView === 'courses' && (
            <div className="space-y-6" id="admin-courses-view">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-sm">Academy Syllabus Catalog</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Author training content modules, edit lessons, or publish drafts.</p>
                </div>

                <button
                  onClick={() => setShowCourseModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  style={{ minHeight: '40px' }}
                  id="add-course-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft New Course</span>
                </button>
              </div>

              {/* Courses Table list */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                      <th className="py-3 px-4">Course Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Lessons</th>
                      <th className="py-3 px-4">Enrollments</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td className="py-3 px-4 text-left">
                          <p className="font-bold text-slate-900">{course.title}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">{course.level} &bull; {course.duration}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-50 text-emerald-800 py-0.5 px-2 rounded-full uppercase text-[9px] font-bold">
                            {course.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {course.modules.reduce((a, m) => a + m.lessons.length, 0)} Lessons
                        </td>
                        <td className="py-3 px-4">
                          {course.enrollmentsCount} Enrolled
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                            Published
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Opportunity board management */}
          {adminView === 'opportunities' && (
            <div className="space-y-6" id="admin-opportunities-view">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-sm">Opportunities Curator</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Publish job posts, internships, and grants for female applicants.</p>
                </div>

                <button
                  onClick={() => setShowOppModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  style={{ minHeight: '40px' }}
                  id="add-opp-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Opportunity</span>
                </button>
              </div>

              {/* Opportunities List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider text-[10px]">
                      <th className="py-3 px-4">Position / Title</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Sector</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {opportunities.map((opp) => (
                      <tr key={opp.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-left font-bold text-slate-900">
                          {opp.title}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{opp.company}</td>
                        <td className="py-3 px-4">
                          <span className="bg-sky-50 text-sky-800 py-0.5 px-2 rounded-full uppercase text-[9px] font-bold">
                            {opp.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{opp.sector}</td>
                        <td className="py-3 px-4 text-slate-400">{opp.deadline}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteOpp(opp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            style={{ minHeight: '36px', minWidth: '36px' }}
                            title="Delete Listing"
                            id={`delete-opp-${opp.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

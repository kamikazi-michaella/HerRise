import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, Award, CheckCircle, Play, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';
import { Course, Enrollment, Lesson, Module } from '../types.ts';

interface CourseLibraryProps {
  token: string | null;
  isOffline: boolean;
  isDataSaver: boolean;
  language: 'en' | 'fr';
  onShowCertificates: () => void;
}

export default function CourseLibrary({
  token,
  isOffline,
  isDataSaver,
  language,
  onShowCertificates,
}: CourseLibraryProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Active playing course state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showCompletionSuccess, setShowCompletionSuccess] = useState(false);
  const [completionCertificate, setCompletionCertificate] = useState<any>(null);

  const t = {
    en: {
      searchPlaceholder: 'Search courses...',
      all: 'All Categories',
      digital: 'Digital Literacy',
      coding: 'Coding',
      entrepreneurship: 'Entrepreneurship',
      finance: 'Financial Literacy',
      communication: 'Communications',
      levels: 'Levels',
      allLevels: 'All Levels',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      hours: 'hours',
      enrolled: 'Enrolled',
      enrollBtn: 'Enroll in Course',
      resumeBtn: 'Resume Study',
      progress: 'Your Progress',
      lessonsCompleted: 'lessons completed',
      backToLibrary: 'Back to Course Library',
      lessonsTitle: 'Modules & Lessons',
      completedMark: 'Completed',
      completeLessonBtn: 'Mark Lesson as Completed',
      completedStatus: 'Lesson Completed!',
      congrats: 'Congratulations!',
      courseCompletedMsg: 'You have successfully completed the course:',
      certCode: 'Certificate Verification Code:',
      viewCertificates: 'View Certificates in Profile',
      dataSaverVideoMsg: 'Video Player Hidden (Data Saver On)',
      dataSaverVideoSub: 'We have hidden the video stream to save your 3G mobile data. A full, offline-ready reading guide is provided below.',
      videoHeader: 'Video Lesson (Simulated 720p Adaptive Stream)',
    },
    fr: {
      searchPlaceholder: 'Rechercher un cours...',
      all: 'Toutes les catégories',
      digital: 'Alphabétisation numérique',
      coding: 'Programmation',
      entrepreneurship: 'Entrepreneuriat',
      finance: 'Éducation financière',
      communication: 'Communication',
      levels: 'Niveaux',
      allLevels: 'Tous les niveaux',
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
      hours: 'heures',
      enrolled: 'Inscrite',
      enrollBtn: 'S\'inscrire au cours',
      resumeBtn: 'Reprendre l\'étude',
      progress: 'Votre Progression',
      lessonsCompleted: 'leçons complétées',
      backToLibrary: 'Retour à la liste',
      lessonsTitle: 'Modules et Leçons',
      completedMark: 'Complété',
      completeLessonBtn: 'Marquer la leçon comme l\'ue',
      completedStatus: 'Leçon complétée !',
      congrats: 'Félicitations !',
      courseCompletedMsg: 'Vous avez terminé le cours avec succès :',
      certCode: 'Code de vérification du certificat :',
      viewCertificates: 'Voir les certificats dans le profil',
      dataSaverVideoMsg: 'Lecteur vidéo masqué (Économiseur actif)',
      dataSaverVideoSub: 'Nous avons désactivé le streaming vidéo pour économiser vos données 3G. Un guide textuel complet est proposé ci-dessous.',
      videoHeader: 'Leçon vidéo (Flux adaptatif simulé 720p)',
    }
  }[language];

  // Fetch courses and enrollments
  useEffect(() => {
    fetchCourses();
  }, [search, selectedCategory, selectedLevel, token, isOffline]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      if (isOffline) {
        // From offline mock databases stored in memory, or use local cached courses
        const stored = localStorage.getItem('herrise_courses_cache');
        const enrolledStored = localStorage.getItem('herrise_enrollments_cache');
        
        if (stored) {
          let cached = JSON.parse(stored) as Course[];
          if (selectedCategory !== 'all') cached = cached.filter(c => c.category === selectedCategory);
          if (selectedLevel !== 'all') cached = cached.filter(c => c.level === selectedLevel);
          if (search) cached = cached.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
          setCourses(cached);
        }
        if (enrolledStored) {
          setEnrollments(JSON.parse(enrolledStored));
        }
        setLoading(false);
        return;
      }

      // Online API fetching
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (search) params.append('search', search);

      const coursesRes = await fetch(`/api/courses?${params.toString()}`);
      const coursesData = await coursesRes.json();
      setCourses(coursesData);

      // Cache courses in local storage for offline use
      localStorage.setItem('herrise_courses_cache', JSON.stringify(coursesData));

      if (token) {
        const enrollRes = await fetch('/api/courses/my-enrollments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const enrollData = await enrollRes.json();
        setEnrollments(enrollData);
        localStorage.setItem('herrise_enrollments_cache', JSON.stringify(enrollData));
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!token) return;
    try {
      if (isOffline) {
        const newEnrollment: Enrollment = {
          id: 'enr_offline_' + Date.now(),
          userId: 'offline_user',
          courseId,
          completedLessons: [],
          enrolledAt: new Date().toISOString(),
        };
        const updated = [...enrollments, newEnrollment];
        setEnrollments(updated);
        localStorage.setItem('herrise_enrollments_cache', JSON.stringify(updated));
        
        // Find course to trigger detail screen
        const course = courses.find(c => c.id === courseId);
        if (course) {
          setActiveCourse(course);
          if (course.modules[0] && course.modules[0].lessons[0]) {
            setActiveLesson(course.modules[0].lessons[0]);
          }
        }
        return;
      }

      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await res.json();
      
      const updatedEnrollments = [...enrollments, data];
      setEnrollments(updatedEnrollments);
      localStorage.setItem('herrise_enrollments_cache', JSON.stringify(updatedEnrollments));

      // Open course
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setActiveCourse(course);
        if (course.modules[0] && course.modules[0].lessons[0]) {
          setActiveLesson(course.modules[0].lessons[0]);
        }
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    if (!activeCourse || !token) return;
    try {
      if (isOffline) {
        const enrollIndex = enrollments.findIndex(e => e.courseId === activeCourse.id);
        if (enrollIndex !== -1) {
          const updated = [...enrollments];
          const completed = updated[enrollIndex].completedLessons;
          if (!completed.includes(lessonId)) {
            completed.push(lessonId);
          }

          // Check if course is finished
          const totalLessons: string[] = [];
          activeCourse.modules.forEach(mod => {
            mod.lessons.forEach(l => totalLessons.push(l.id));
          });
          const isAllCompleted = totalLessons.every(id => completed.includes(id));
          
          if (isAllCompleted && !updated[enrollIndex].completedAt) {
            updated[enrollIndex].completedAt = new Date().toISOString();
            setCompletionCertificate({
              id: 'cert_offline_' + Date.now(),
              courseTitle: activeCourse.title,
              issuedAt: new Date().toISOString(),
              hash: 'HR-OFFLINE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            });
            setShowCompletionSuccess(true);
          }

          setEnrollments(updated);
          localStorage.setItem('herrise_enrollments_cache', JSON.stringify(updated));
        }
        return;
      }

      const res = await fetch(`/api/courses/${activeCourse.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lessonId })
      });
      const data = await res.json();

      const updatedEnrollments = enrollments.map(e => e.id === data.enrollment.id ? data.enrollment : e);
      setEnrollments(updatedEnrollments);
      localStorage.setItem('herrise_enrollments_cache', JSON.stringify(updatedEnrollments));

      if (data.completed && data.certificate) {
        setCompletionCertificate(data.certificate);
        setShowCompletionSuccess(true);
      }
    } catch (err) {
      console.error('Error ticking lesson progression:', err);
    }
  };

  const getCourseEnrollment = (courseId: string) => {
    return enrollments.find(e => e.courseId === courseId);
  };

  const calculateProgress = (course: Course) => {
    const enroll = getCourseEnrollment(course.id);
    if (!enroll) return 0;
    
    const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    if (totalLessons === 0) return 0;

    return Math.round((enroll.completedLessons.length / totalLessons) * 100);
  };

  if (activeCourse && activeLesson) {
    const enrollment = getCourseEnrollment(activeCourse.id);
    const isLessonFinished = enrollment?.completedLessons.includes(activeLesson.id);

    return (
      <div className="max-w-7xl mx-auto px-4 py-6" id="course-viewer-panel">
        
        {/* Course Success Modal */}
        {showCompletionSuccess && completionCertificate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" id="certificate-success-modal">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-center shadow-2xl relative">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.congrats}</h3>
              <p className="text-slate-600 text-sm mt-2">{t.courseCompletedMsg}</p>
              <h4 className="text-lg font-bold text-emerald-800 mt-2">
                {language === 'en' ? activeCourse.title : activeCourse.titleFr}
              </h4>

              <div className="my-5 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs">
                <p className="font-bold text-slate-700">{t.certCode}</p>
                <code className="text-sm text-emerald-700 font-mono font-bold mt-1 block">{completionCertificate.hash}</code>
                <p className="text-slate-400 text-[10px] mt-2">Issued: {new Date(completionCertificate.issuedAt).toLocaleDateString()}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowCompletionSuccess(false);
                    onShowCertificates();
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
                  id="view-certs-btn"
                >
                  {t.viewCertificates}
                </button>
                <button
                  onClick={() => setShowCompletionSuccess(false)}
                  className="w-full text-slate-600 hover:text-slate-800 text-xs font-semibold"
                  id="close-cert-modal-btn"
                >
                  {language === 'en' ? 'Close Window' : 'Fermer la fenêtre'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => {
            setActiveCourse(null);
            setActiveLesson(null);
          }}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-bold mb-4 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
          style={{ minHeight: '44px' }}
          id="back-to-library-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t.backToLibrary}</span>
        </button>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Lesson Player (Left - Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Simulated Adaptive Video Stream (Max 720p) */}
            <div className="bg-black rounded-2xl overflow-hidden aspect-video relative shadow-inner flex flex-col justify-between">
              
              <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-xs text-white z-10">
                <span className="font-semibold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                  {t.videoHeader}
                </span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-300">720p HD</span>
              </div>

              {/* Video Content Layer based on Data Saver state */}
              {isDataSaver ? (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center z-0">
                  <ShieldAlert className="w-12 h-12 text-amber-500 animate-bounce mb-2" />
                  <h4 className="text-sm font-black text-white">{t.dataSaverVideoMsg}</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mt-1 leading-relaxed">
                    {t.dataSaverVideoSub}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 bg-emerald-950/25 flex items-center justify-center z-0">
                  {/* Mock beautiful video thumbnail banner */}
                  <img 
                    src={activeCourse.imageUrl} 
                    alt="Course Video Thumbnail" 
                    className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-emerald-600/90 text-white rounded-full p-4 hover:scale-115 transition-transform shadow-lg cursor-pointer flex items-center justify-center">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
              )}

              <div className="p-4 bg-gradient-to-t from-black/80 to-transparent text-xs text-white flex items-center justify-between z-10">
                <span>{activeLesson.duration}</span>
                <span className="text-[10px] text-slate-400">Adaptive Streaming Enabled (2G/3G Safe)</span>
              </div>
            </div>

            {/* Lesson Text Guide */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                {language === 'en' ? activeLesson.title : activeLesson.titleFr}
              </h2>

              <div className="prose max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line mt-4 pt-4 border-t border-slate-100">
                {language === 'en' ? activeLesson.content : activeLesson.contentFr}
              </div>

              {/* Action completion */}
              <div className="mt-8 pt-6 border-t border-slate-150 flex items-center justify-between">
                <div>
                  {isLessonFinished ? (
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-teal-100">
                      <CheckCircle className="w-4 h-4 fill-teal-600 text-white" />
                      <span>{t.completedStatus}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCompleteLesson(activeLesson.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                      style={{ minHeight: '44px' }}
                      id="complete-lesson-btn"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t.completeLessonBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Playlist (Right - Span 4) */}
          <div className="lg:col-span-4 space-y-6" id="course-syllabus-sidebar">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150">
              <h3 className="font-bold text-slate-900 tracking-tight text-sm uppercase text-slate-500 tracking-wider mb-4">
                {t.lessonsTitle}
              </h3>

              <div className="space-y-6">
                {activeCourse.modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 bg-slate-100 py-1.5 px-3 rounded-lg flex items-center justify-between">
                      <span>{language === 'en' ? module.title : module.titleFr}</span>
                    </h4>
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => {
                        const isSelected = activeLesson.id === lesson.id;
                        const isFinished = enrollment?.completedLessons.includes(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 text-teal-950 font-bold border-l-4 border-teal-500'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                            style={{ minHeight: '44px' }}
                            id={`syllabus-lesson-${lesson.id}`}
                          >
                            <div className="flex items-center gap-2 max-w-[80%] truncate">
                              <Play className={`w-3 h-3 shrink-0 ${isSelected ? 'text-teal-700 fill-teal-700' : 'text-slate-400'}`} />
                              <span className="truncate">{language === 'en' ? lesson.title : lesson.titleFr}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                              <span>{lesson.duration}</span>
                              {isFinished && (
                                <CheckCircle className="w-3.5 h-3.5 fill-teal-500 text-white" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="course-library-panel">
      
      {/* Intro Hero Banner */}
      <div className="bg-teal-950 text-white rounded-3xl p-8 mb-8 border border-teal-850 shadow-sm relative overflow-hidden animate-fade-in">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-teal-800/20 rounded-full blur-3xl"></div>
        <h1 className="text-2xl font-black tracking-tight font-display flex items-center gap-2">
          <span className="w-2.5 h-6 bg-teal-400 rounded-full inline-block"></span>
          <span>{language === 'en' ? 'Skills Training Academy' : 'Académie de Formation'}</span>
        </h1>
        <p className="text-teal-100/80 text-xs mt-2.5 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Access structured lessons in digital literacy, web coding, financial management, agribusiness, and communication. Work offline and earn digital verifiable certificates upon completion.'
            : 'Accédez à des cours complets en informatique, codage web, finance, agriculture et communication. Étudiez hors ligne et obtenez des certificats certifiés.'}
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between mb-6">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500 transition-all bg-slate-50 focus:bg-white focus:shadow-xs"
            style={{ minHeight: '40px' }}
            id="course-search-input"
          />
        </div>

        {/* Category & Level Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-slate-50 cursor-pointer"
            style={{ minHeight: '40px' }}
            id="category-filter"
          >
            <option value="all">{t.all}</option>
            <option value="digital">{t.digital}</option>
            <option value="coding">{t.coding}</option>
            <option value="entrepreneurship">{t.entrepreneurship}</option>
            <option value="finance">{t.finance}</option>
            <option value="communication">{t.communication}</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-slate-50 cursor-pointer"
            style={{ minHeight: '40px' }}
            id="level-filter"
          >
            <option value="all">{t.allLevels}</option>
            <option value="beginner">{t.beginner}</option>
            <option value="intermediate">{t.intermediate}</option>
            <option value="advanced">{t.advanced}</option>
          </select>
        </div>

      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-12 text-center" id="courses-loading-state">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-xs">{language === 'en' ? 'Fetching course catalog...' : 'Chargement du catalogue...'}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl" id="courses-empty-state">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">
            {language === 'en' ? 'No courses found' : 'Aucun cours trouvé'}
          </h4>
          <p className="text-slate-400 text-xs mt-1">
            {language === 'en' ? 'Try adjusting your search query or filters.' : 'Ajustez votre recherche ou vos filtres.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="courses-grid">
          {courses.map((course) => {
            const enroll = getCourseEnrollment(course.id);
            const isEnrolled = !!enroll;
            const progress = calculateProgress(course);
            const isCourseFinished = isEnrolled && !!enroll.completedAt;

            return (
              <div 
                key={course.id} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                id={`course-card-${course.id}`}
              >
                <div>
                  {/* Image banner - hides in severe Data Saver mode */}
                  {!isDataSaver && (
                    <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 right-3 bg-teal-950/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-display border border-teal-800/50">
                        {course.category}
                      </span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{course.level}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-tight">
                      {language === 'en' ? course.title : course.titleFr}
                    </h3>

                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                      {language === 'en' ? course.description : course.descriptionFr}
                    </p>

                    {/* Progress Bar for enrolled */}
                    {isEnrolled && (
                      <div className="pt-2" id={`course-progress-${course.id}`}>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1">
                          <span>{t.progress}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isCourseFinished ? 'bg-amber-500' : 'bg-teal-500'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {enroll.completedLessons.length} / {course.modules.reduce((a, m) => a + m.lessons.length, 0)} {t.lessonsCompleted}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 border-t border-slate-50">
                  {isEnrolled ? (
                    <button
                      onClick={() => {
                        setActiveCourse(course);
                        // Pick first unfinished lesson, or just first lesson
                        const unfinishedId = course.modules.flatMap(m => m.lessons).map(l => l.id).find(id => !enroll.completedLessons.includes(id));
                        const lessonToPlay = course.modules.flatMap(m => m.lessons).find(l => l.id === unfinishedId) || course.modules[0].lessons[0];
                        setActiveLesson(lessonToPlay);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        isCourseFinished 
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300' 
                          : 'bg-slate-150 hover:bg-slate-200 text-slate-900'
                      }`}
                      style={{ minHeight: '44px' }}
                      id={`resume-course-${course.id}`}
                    >
                      {isCourseFinished ? (
                        <>
                          <Award className="w-4 h-4 text-amber-600 fill-amber-500" />
                          <span>{language === 'en' ? 'Review Course' : 'Réviser le cours'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-slate-700 text-slate-700" />
                          <span>{t.resumeBtn}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm font-display"
                      style={{ minHeight: '44px' }}
                      disabled={!token}
                      title={!token ? 'Sign in to enroll' : ''}
                      id={`enroll-course-${course.id}`}
                    >
                      <span>{t.enrollBtn}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

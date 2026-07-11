import React, { useState, useEffect } from 'react';
import { User, Certificate } from '../types.ts';
import { Award, User as UserIcon, Mail, Globe, MapPin, Edit, CheckCircle, Printer, ShieldCheck } from 'lucide-react';

interface ProfileTabProps {
  token: string | null;
  currentUser: User | null;
  onUpdateProfile: (updatedUser: User) => void;
  isOffline: boolean;
  language: 'en' | 'fr';
}

export default function ProfileTab({
  token,
  currentUser,
  onUpdateProfile,
  isOffline,
  language,
}: ProfileTabProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit fields
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [country, setCountry] = useState('Rwanda');
  const [userLang, setUserLang] = useState<'en' | 'fr'>('en');

  const [loading, setLoading] = useState(false);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  const t = {
    en: {
      profileHeader: 'Profile Settings',
      editBtn: 'Edit Profile',
      saveBtn: 'Save Changes',
      cancelBtn: 'Cancel',
      nameLabel: 'Full Name',
      bioLabel: 'Biography / Short Pitch',
      photoLabel: 'Photo URL',
      skillsLabel: 'Skills (comma separated)',
      countryLabel: 'Country of Residence',
      langLabel: 'Preferred Language',
      certificatesTitle: 'Your Verifiable Certificates',
      noCertificates: 'You have not completed any courses yet. Enroll in our courses to earn verifiable certificates!',
      downloadCert: 'View & Print Certificate',
      certVerificationCode: 'Verifiable Hash:',
      certTitle: 'Certificate of Achievement',
      certSubtitle: 'This certifies that',
      certBody: 'has successfully completed all modules and examinations for the course:',
      certStamp: 'OFFICIAL PILOT SEAL',
      certIssuer: 'HERRISE ACADEMY',
      certDate: 'Date Issued:',
      certVerifiedStatus: 'VERIFIED BLOCKCHAIN ANCHOR',
    },
    fr: {
      profileHeader: 'Paramètres du Profil',
      editBtn: 'Modifier le Profil',
      saveBtn: 'Enregistrer',
      cancelBtn: 'Annuler',
      nameLabel: 'Nom Complet',
      bioLabel: 'Biographie / Présentation',
      photoLabel: 'URL de la Photo',
      skillsLabel: 'Compétences (séparées par des virgules)',
      countryLabel: 'Pays de Résidence',
      langLabel: 'Langue Préférée',
      certificatesTitle: 'Vos Certificats Vérifiables',
      noCertificates: 'Vous n\'avez pas encore de certificat. Terminez des cours pour en obtenir !',
      downloadCert: 'Voir et imprimer le certificat',
      certVerificationCode: 'Hachage Vérifiable :',
      certTitle: 'Certificat de Réussite',
      certSubtitle: 'Nous certifions que',
      certBody: 'a complété avec succès tous les modules et examens pour le cours :',
      certStamp: 'SCEAU OFFICIEL',
      certIssuer: 'ACADÉMIE HERRISE',
      certDate: 'Date de délivrance :',
      certVerifiedStatus: 'ANCRE DE VÉRIFICATION OK',
    }
  }[language];

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhoto(currentUser.photo || '');
      setBio(currentUser.bio || '');
      setSkillsText(currentUser.skills.join(', '));
      setCountry(currentUser.country);
      setUserLang(currentUser.language);
    }
    if (token) {
      fetchCertificates();
    }
  }, [currentUser, token, isOffline]);

  const fetchCertificates = async () => {
    try {
      if (isOffline) {
        const stored = localStorage.getItem('herrise_certificates_cache') || '[]';
        setCertificates(JSON.parse(stored));
        return;
      }

      const res = await fetch('/api/certificates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCertificates(data);
      localStorage.setItem('herrise_certificates_cache', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    const skills = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const body = { name, photo, bio, skills, country, language: userLang };

    try {
      if (isOffline) {
        const updated = {
          ...currentUser!,
          ...body,
        };
        onUpdateProfile(updated);
        setIsEditing(false);
        return;
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      onUpdateProfile(data.user);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="profile-management-panel">
      
      {/* Visual Certificate Modal */}
      {activeCert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="certificate-viewer-modal">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 relative border-4 border-slate-100 print:border-0 print:p-0">
            
            {/* Header controls inside modal */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Certificate Viewer</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={triggerPrint}
                  className="px-4 py-2 text-xs bg-emerald-700 hover:bg-emerald-850 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PDF</span>
                </button>
                <button
                  onClick={() => setActiveCert(null)}
                  className="px-4 py-2 text-xs border border-slate-200 text-slate-600 hover:text-slate-800 font-bold rounded-xl cursor-pointer"
                  style={{ minHeight: '40px' }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Printable Certificate Layout */}
            <div 
              className="bg-amber-50/20 p-8 sm:p-12 border-8 border-double border-emerald-900 rounded-lg text-center relative space-y-6 print:border-8 print:p-12 print:my-0"
              id="printable-certificate-body"
            >
              {/* Grand background design elements */}
              <div className="absolute top-4 left-4 right-4 bottom-4 border border-emerald-800/10 pointer-events-none rounded"></div>

              <div className="space-y-2">
                <div className="bg-emerald-900 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full inline-block uppercase">
                  {t.certIssuer}
                </div>
                <h1 className="font-serif font-black text-slate-900 text-2xl sm:text-4xl tracking-tight mt-3">
                  {t.certTitle}
                </h1>
                <p className="text-slate-500 italic text-xs mt-1">
                  Verifiable Educational Document of Merit
                </p>
              </div>

              <div className="space-y-1.5 py-4">
                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  {t.certSubtitle}
                </p>
                <h2 className="font-serif font-extrabold text-emerald-800 text-xl sm:text-3xl tracking-tight underline decoration-amber-400 decoration-wavy py-1">
                  {activeCert.userName}
                </h2>
              </div>

              <div className="space-y-4 max-w-xl mx-auto">
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed leading-normal">
                  {t.certBody}
                </p>
                <h3 className="text-slate-950 font-black text-sm sm:text-lg tracking-tight leading-snug bg-white/60 p-3 rounded-xl border border-emerald-100">
                  {activeCert.courseTitle}
                </h3>
              </div>

              {/* Bottom Stamp & Verification */}
              <div className="grid grid-cols-2 gap-4 items-end pt-8 max-w-xl mx-auto border-t border-emerald-800/10">
                <div className="text-left space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.certDate}</p>
                  <p className="font-bold text-xs text-slate-800">{new Date(activeCert.issuedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="w-12 h-12 rounded-full border-4 border-dashed border-amber-500 text-amber-600 font-serif font-black flex items-center justify-center text-[8px] leading-none mb-1 shadow-xs bg-white uppercase tracking-tighter">
                    {t.certStamp}
                  </div>
                  <span className="text-[9px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-100 py-0.5 px-2 rounded-full">
                    <ShieldCheck className="w-3 h-3 fill-emerald-800 text-white shrink-0" />
                    {t.certVerifiedStatus}
                  </span>
                </div>
              </div>

              {/* Unique Hash */}
              <div className="pt-4 text-center">
                <p className="text-[9px] font-mono text-slate-400">
                  {t.certVerificationCode} <span className="font-bold text-slate-600">{activeCert.hash}</span>
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Profile Information card (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <img 
                  src={currentUser.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150'} 
                  alt={currentUser.name} 
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shadow-sm border border-slate-150"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="font-black text-slate-900 text-base tracking-tight leading-none">{currentUser.name}</h2>
                  <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                  title={t.editBtn}
                  id="edit-profile-btn"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Display / Editing Form */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4" id="edit-profile-form">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.nameLabel}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg focus:outline-none"
                    style={{ minHeight: '40px' }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.photoLabel}</label>
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="e.g. Image URL"
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg focus:outline-none"
                    style={{ minHeight: '40px' }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.bioLabel}</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 border border-slate-200 text-xs rounded-lg focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.skillsLabel}</label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="e.g. Tailoring, Basic Computer"
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg focus:outline-none"
                    style={{ minHeight: '40px' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.countryLabel}</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg focus:outline-none bg-slate-50"
                      style={{ minHeight: '40px' }}
                    >
                      <option value="Rwanda">Rwanda</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Burundi">Burundi</option>
                      <option value="DR Congo">DR Congo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">{t.langLabel}</label>
                    <select
                      value={userLang}
                      onChange={(e) => setUserLang(e.target.value as 'en' | 'fr')}
                      className="w-full px-3 py-2 border border-slate-200 text-xs rounded-lg focus:outline-none bg-slate-50"
                      style={{ minHeight: '40px' }}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(currentUser.name);
                      setPhoto(currentUser.photo || '');
                      setBio(currentUser.bio || '');
                      setSkillsText(currentUser.skills.join(', '));
                      setCountry(currentUser.country);
                      setUserLang(currentUser.language);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-850 border border-slate-200 rounded-lg cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-850 rounded-lg cursor-pointer"
                    style={{ minHeight: '40px' }}
                  >
                    {loading ? 'Saving...' : t.saveBtn}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs text-left" id="profile-details-view">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Resident of {currentUser.country}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Preference: {currentUser.language === 'en' ? 'English' : 'Français'}</span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-900">Bio / Core Pitch</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px] whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {currentUser.bio || 'Provide a short pitch in edit profile settings to summarize your goals to mentors and peers!'}
                  </p>
                </div>

                <div className="pt-2 space-y-1.5">
                  <h4 className="font-bold text-slate-900 uppercase text-[9px] tracking-wider text-slate-400">Skills & Specializations</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.skills.map(s => (
                      <span key={s} className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Certificates (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 fill-amber-100" />
              <span>{t.certificatesTitle}</span>
            </h3>

            {certificates.length === 0 ? (
              <div className="py-8 text-center" id="certs-empty-state">
                <Award className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  {t.noCertificates}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="certs-list">
                {certificates.map((cert) => (
                  <div 
                    key={cert.id} 
                    className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col justify-between items-start text-xs space-y-4"
                    id={`cert-item-${cert.id}`}
                  >
                    <div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 py-0.5 px-2 rounded-full uppercase">
                        Issued
                      </span>
                      <h4 className="font-bold text-slate-900 mt-2 line-clamp-2 leading-tight">
                        {cert.courseTitle}
                      </h4>
                      <p className="text-slate-400 text-[10px] mt-1">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                    </div>

                    <button
                      onClick={() => setActiveCert(cert)}
                      className="w-full text-center py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer text-[11px] shadow-xs"
                      style={{ minHeight: '36px' }}
                      id={`view-cert-btn-${cert.id}`}
                    >
                      {t.downloadCert}
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

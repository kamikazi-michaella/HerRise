import React, { useState } from 'react';
import { Mail, Lock, User, Globe, ArrowRight, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { UserRole } from '../types.ts';

interface RegisterLoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  language: 'en' | 'fr';
}

export default function RegisterLogin({ onLoginSuccess, language }: RegisterLoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('learner');
  const [country, setCountry] = useState('Rwanda');
  const [userLanguage, setUserLanguage] = useState<'en' | 'fr'>(language);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const t = {
    en: {
      loginTitle: 'Welcome back to HerRise',
      registerTitle: 'Create your HerRise account',
      loginSubtitle: 'Accelerate your business or tech journey with mentoring and training.',
      registerSubtitle: 'Join over 500+ women leaders, entrepreneurs, and learners across Africa.',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      nameLabel: 'Full Name',
      roleLabel: 'Join HerRise as a:',
      learnerOpt: 'Learner (Get training & mentorship)',
      mentorOpt: 'Mentor (Guide & support others)',
      countryLabel: 'Country of Residence',
      langLabel: 'Preferred Language',
      loginBtn: 'Sign In',
      registerBtn: 'Sign Up',
      googleBtn: 'Continue with Google',
      forgotPassword: 'Forgot Password?',
      backToLogin: 'Back to Sign In',
      resetBtn: 'Send Reset Link',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      registerNow: 'Sign Up Now',
      loginNow: 'Sign In Here',
    },
    fr: {
      loginTitle: 'De retour sur HerRise',
      registerTitle: 'Créer votre compte HerRise',
      loginSubtitle: 'Accélérez votre parcours entrepreneurial avec du mentorat et des formations.',
      registerSubtitle: 'Rejoignez plus de 500 femmes leaders, entrepreneures et apprenantes.',
      emailLabel: 'Adresse E-mail',
      passwordLabel: 'Mot de Passe',
      nameLabel: 'Nom Complet',
      roleLabel: 'Rejoindre HerRise en tant que :',
      learnerOpt: 'Apprenante (Se former et être mentorée)',
      mentorOpt: 'Mentore (Guider et soutenir les autres)',
      countryLabel: 'Pays de Résidence',
      langLabel: 'Langue Préférée',
      loginBtn: 'Se Connecter',
      registerBtn: 'S\'Inscrire',
      googleBtn: 'Continuer avec Google',
      forgotPassword: 'Mot de passe oublié ?',
      backToLogin: 'Retour à la connexion',
      resetBtn: 'Envoyer le lien de réinitialisation',
      noAccount: 'Pas encore de compte ?',
      hasAccount: 'Vous avez déjà un compte ?',
      registerNow: 'S\'inscrire maintenant',
      loginNow: 'Se connecter ici',
    }
  }[language];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password } 
        : { name, email, password, role, country, language: userLanguage };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request reset');
      }

      setMessage(language === 'en' ? 'Password reset link sent to ' + email : 'Lien envoyé à ' + email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Simulate OAuth login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@herrise.org', // Default admin for testing, or we can use another mock
          password: 'Password123'
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'OAuth failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4" id="auth-view-container">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        
        {/* Left Side Info Panel */}
        <div className="bg-teal-950 text-white p-8 md:col-span-5 flex flex-col justify-between" id="auth-info-panel">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-teal-900/50 text-teal-400 border border-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'en' ? 'Mobile-First Platform' : 'Plateforme Mobile-First'}</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              HerRise Platform
            </h1>
            
            <p className="text-teal-150 text-sm leading-relaxed text-teal-100/80">
              {isLogin ? t.loginSubtitle : t.registerSubtitle}
            </p>

            <div className="space-y-4 pt-4 border-t border-teal-900">
              <div className="flex items-start gap-3">
                <div className="bg-teal-900 text-teal-200 p-2 rounded-lg mt-0.5">
                  <Shield className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-display">{language === 'en' ? 'Low-Bandwidth Optimization' : 'Optimisation Bas Débit'}</h4>
                  <p className="text-[11px] text-teal-200/80 mt-0.5">
                    {language === 'en' 
                      ? 'Our pages consume 70% less data. Perfect for rural 3G networks in Rwanda.' 
                      : 'Pages ultra-légères consommant 70% moins de données. Idéal en province.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-teal-900 text-teal-200 p-2 rounded-lg mt-0.5">
                  <Globe className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-display">{language === 'en' ? 'Full Offline Course Playback' : 'Cours accessibles 100% hors-ligne'}</h4>
                  <p className="text-[11px] text-teal-200/80 mt-0.5">
                    {language === 'en'
                      ? 'Enroll once, and lessons cache in your browser so you can study without internet.'
                      : 'Inscrivez-vous et étudiez hors ligne sans aucune connexion internet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-teal-400 pt-8 mt-auto">
            &copy; 2026 HerRise Rwanda Pilot. {language === 'en' ? 'All rights reserved.' : 'Tous droits réservés.'}
          </div>
        </div>

        {/* Right Side Auth Forms */}
        <div className="p-8 md:col-span-7 flex flex-col justify-center" id="auth-form-panel">
          
          {/* Forgot Password Mode */}
          {showForgotPassword ? (
            <div className="space-y-6" id="forgot-password-form">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.forgotPassword}</h2>
                <p className="text-slate-500 text-xs mt-1">
                  {language === 'en' 
                    ? 'Enter your email address and we will generate an instant mock password reset link.'
                    : 'Entrez votre e-mail pour générer un lien instantané de réinitialisation.'}
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="bg-teal-50 border border-teal-100 text-teal-800 p-3.5 rounded-xl text-xs font-medium">
                  {message}
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.emailLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. gaju@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white transition-colors"
                      required
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  style={{ minHeight: '44px' }}
                >
                  <span>{t.resetBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setMessage('');
                  }}
                  className="w-full text-center text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  {t.backToLogin}
                </button>
              </form>
            </div>
          ) : (
            /* Login & Register Forms */
            <div className="space-y-6" id="login-or-register-form">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {isLogin ? t.loginTitle : t.registerTitle}
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  {isLogin 
                    ? (language === 'en' ? 'Sign in to access your customized dashboard.' : 'Connectez-vous à votre tableau de bord.')
                    : (language === 'en' ? 'Fill in the details to join our pilot network.' : 'Remplissez vos informations pour rejoindre le pilote.')}
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                
                {/* Full Name for Register */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.nameLabel}</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aisha Umutesi"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white transition-colors"
                        required
                        style={{ minHeight: '44px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.emailLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aisha.umutesi@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white transition-colors"
                      required
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.passwordLabel}</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setError('');
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                        id="forgot-password-link"
                      >
                        {t.forgotPassword}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 bg-slate-50 focus:bg-white transition-colors"
                      required
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                </div>

                {/* Register Additional Fields */}
                {!isLogin && (
                  <div className="space-y-4 pt-2">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.roleLabel}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('learner')}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer text-left ${
                            role === 'learner'
                              ? 'bg-teal-50 border-teal-500 text-teal-950'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          style={{ minHeight: '44px' }}
                          id="role-btn-learner"
                        >
                          {t.learnerOpt}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('mentor')}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer text-left ${
                            role === 'mentor'
                              ? 'bg-teal-50 border-teal-500 text-teal-950'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          style={{ minHeight: '44px' }}
                          id="role-btn-mentor"
                        >
                          {t.mentorOpt}
                        </button>
                      </div>
                    </div>

                    {/* Country & Preferred Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.countryLabel}</label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50"
                          style={{ minHeight: '44px' }}
                        >
                          <option value="Rwanda">Rwanda</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Burundi">Burundi</option>
                          <option value="DR Congo">DR Congo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.langLabel}</label>
                        <select
                          value={userLanguage}
                          onChange={(e) => setUserLanguage(e.target.value as 'en' | 'fr')}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50"
                          style={{ minHeight: '44px' }}
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-sm font-display"
                  style={{ minHeight: '44px' }}
                  id="auth-submit-btn"
                >
                  {loading ? (
                    <span>{language === 'en' ? 'Authenticating...' : 'Authentification...'}</span>
                  ) : (
                    <>
                      <span>{isLogin ? t.loginBtn : t.registerBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Splitter Line */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Mock Google OAuth Sign In */}
              <button
                type="button"
                onClick={handleMockGoogleLogin}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2.5 border border-slate-200"
                style={{ minHeight: '44px' }}
                id="google-oauth-btn"
              >
                {/* Simple color circles representing Google */}
                <div className="flex gap-0.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                </div>
                <span>{t.googleBtn}</span>
              </button>

              {/* Switch modes */}
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">{isLogin ? t.noAccount : t.hasAccount} </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer underline"
                  id="toggle-auth-mode-btn"
                >
                  {isLogin ? t.registerNow : t.loginNow}
                </button>
              </div>

              {/* Developer Bypass Advice */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-center">
                <strong>Demo Pilot Bypass:</strong> Log in using <code>admin@herrise.org</code> or <code>mentor1@herrise.org</code> with password <code>Password123</code> to browse pre-seeded admin/mentor dashboards!
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

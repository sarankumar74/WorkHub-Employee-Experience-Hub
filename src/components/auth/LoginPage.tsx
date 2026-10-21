import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Shuffle,
  Share2,
  BookOpen,
  Compass,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react';
import { User } from '../../types/workhub';
import { DEMO_USERS } from '../../data/mockData';
import { signInWithGoogle, signInWithMicrosoft } from '../../lib/firebase';
import loginTeamImg from '../../assets/images/workhub_login_team_1790263084810.jpg';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('you@company.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedDemoUser, setSelectedDemoUser] = useState<User>(DEMO_USERS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    onLoginSuccess(matched || selectedDemoUser);
  };

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      if (provider === 'google') {
        const firebaseUser = await signInWithGoogle();
        const authenticatedUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'WorkHub Employee',
          email: firebaseUser.email || '',
          avatar:
            firebaseUser.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'employee',
          jobTitle: 'Software Engineer',
          department: 'Engineering',
          team: 'Backend',
          managerName: 'John Smith',
          managerEmail: 'john.smith@workhub.internal',
          phone: firebaseUser.phoneNumber || '+1 (555) 234-5678',
          location: 'San Francisco, CA (HQ)',
          joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        onLoginSuccess(authenticatedUser);
      } else if (provider === 'microsoft') {
        try {
          const firebaseUser = await signInWithMicrosoft();
          const authenticatedUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'WorkHub Employee',
            email: firebaseUser.email || '',
            avatar:
              firebaseUser.photoURL ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            role: 'employee',
            jobTitle: 'Product Specialist',
            department: 'Product',
            team: 'Core Platform',
            managerName: 'David Vance',
            location: 'San Francisco, CA (HQ)',
            joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          };
          onLoginSuccess(authenticatedUser);
        } catch (msErr: any) {
          if (msErr?.code === 'auth/operation-not-allowed' || msErr?.message?.includes('operation-not-allowed')) {
            setAuthError(
              'Microsoft OAuth provider is not yet enabled in Firebase Console (Authentication > Sign-in method > Microsoft). You can use "Continue with Google" or Demo Login.'
            );
          } else {
            throw msErr;
          }
        }
      }
    } catch (err: any) {
      console.error('Firebase OAuth authentication error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed before completing authentication.');
      } else if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setAuthError(
          'Firebase auth/unauthorized-domain: "localhost" is not added to your Firebase Authorized Domains list. You can click the blue "Sign in" button to test locally with demo credentials, or add "localhost" in Firebase Console (Authentication > Settings > Authorized domains).'
        );
      } else {
        setAuthError(err?.message || 'Authentication failed. Please try again or use the Sign In button.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-8 bg-gradient-to-tr from-slate-100 via-blue-50/40 to-slate-100">
      {/* Main Card Container matching the uploaded template exactly */}
      <div className="w-full max-w-5xl bg-white rounded-3xl md:rounded-[28px] border border-blue-100/80 shadow-2xl shadow-blue-500/10 overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: HERO, VALUE PROPOSITIONS & TEAM ILLUSTRATION */}
        <div className="md:w-1/2 bg-gradient-to-b from-[#edf4ff] via-[#e5eeff] to-[#dbe8fc] p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Decorative Floating Geometric Shapes & Paper Airplanes matching template */}
          {/* Top-right floating purple crystal/sphere */}
          <div className="absolute top-8 right-10 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 shadow-md opacity-85 rotate-12 pointer-events-none" />
          
          {/* Middle-right floating turquoise paper airplane */}
          <div className="absolute top-36 right-8 text-teal-400 opacity-90 transform -rotate-12 pointer-events-none drop-shadow-md">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="#5eead4" stroke="#14b8a6" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Floating yellow paper airplane */}
          <div className="absolute top-52 right-10 text-amber-400 opacity-90 transform rotate-15 pointer-events-none drop-shadow-md">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Bottom-left floating warm orange sphere */}
          <div className="absolute bottom-28 left-6 w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/25 pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a73e8] text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/25">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M4 6.5C4 5.67 4.67 5 5.5 5h1.75c.6 0 1.13.36 1.35.91l2.4 6.01 2.1-5.78C13.3 5.48 13.84 5 14.5 5h1.75c.66 0 1.2.48 1.4 1.14l2.1 5.78 2.4-6.01c.22-.55.75-.91 1.35-.91H25.5c.83 0 1.5.67 1.5 1.5v.5c0 .24-.06.47-.18.68L22.6 18.2c-.27.56-.84.92-1.47.92h-2c-.63 0-1.2-.36-1.47-.92l-2.66-6.07-2.66 6.07c-.27.56-.84.92-1.47.92h-2c-.63 0-1.2-.36-1.47-.92L3.18 7.68c-.12-.21-.18-.44-.18-.68v-.5Z" />
                </svg>
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg tracking-tight leading-tight">
                  WorkHub
                </h2>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                  Employee Experience Hub
                </p>
              </div>
            </div>

            {/* Headline matching image */}
            <div className="mt-8">
              <h1 className="text-3xl sm:text-[34px] font-extrabold text-[#111827] tracking-tight leading-[1.15]">
                Welcome to <br />
                Employee <br />
                Experience Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-normal mt-3 max-w-sm leading-relaxed">
                A smarter way to learn, connect, grow and belong at work.
              </p>
            </div>

            {/* 4 Feature Bullet Points with colorful rounded icon badges */}
            <div className="mt-6 space-y-2.5">
              {/* Bullet 1: Learn faster */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Shuffle className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Learn faster</span>
              </div>

              {/* Bullet 2: Connect with teams */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0d9488] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Connect with teams</span>
              </div>

              {/* Bullet 3: Access company knowledge */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Access company knowledge</span>
              </div>

              {/* Bullet 4: Be part of the journey */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Be part of the journey</span>
              </div>
            </div>
          </div>

          {/* Bottom Illustration (Three friendly colleagues collaborating at desk with laptops) */}
          <div className="relative z-10 mt-6 pt-2">
            <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-blue-200/50 bg-white/40">
              <img
                src={loginTeamImg}
                alt="WorkHub team collaborating"
                className="w-full h-auto object-cover max-h-56 transform scale-102"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM (Matches Screen template) */}
        <div className="md:w-1/2 bg-white p-7 sm:p-9 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Access your workspace, teams and company resources.
              </p>
            </div>

            {/* Error message banner */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <p>{authError}</p>
                  {authError.includes('unauthorized-domain') && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onLoginSuccess(selectedDemoUser)}
                        className="px-3 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        Sign in as {selectedDemoUser.name.split(' ')[0]} (Demo)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-[#1a73e8] transition bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-[#1a73e8] transition bg-white placeholder:text-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1a73e8] focus:ring-blue-500 border-slate-300 accent-[#1a73e8]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to your email.')}
                  className="font-medium text-[#1a73e8] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>Sign in</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 font-normal">
                or continue with
              </span>
            </div>

            {/* SSO Buttons matching template */}
            <div className="space-y-2.5">
              {/* Google Button */}
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => handleOAuthLogin('google')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2.5 transition shadow-2xs hover:border-slate-300 cursor-pointer disabled:opacity-60"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.6-5.2 3.6-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.93H1.28v3.13C3.25 21.27 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.4l4.05-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.73 1.28 6.6l4.05 3.13c.94-2.83 3.57-4.98 6.67-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Microsoft Button */}
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => handleOAuthLogin('microsoft')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2.5 transition shadow-2xs hover:border-slate-300 cursor-pointer disabled:opacity-60"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                )}
                <span>Continue with Microsoft</span>
              </button>
            </div>

            {/* Quick Demo Persona Bar for instant testing */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">Quick Demo:</span>
              <div className="flex gap-1.5">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedDemoUser(u);
                      setEmail(u.email);
                    }}
                    className={`px-2 py-0.5 rounded-md border text-[10px] transition ${
                      selectedDemoUser.id === u.id
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {u.name.split(' ')[0]} ({u.role})
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] text-slate-400 mt-6">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => alert('Please contact hr@workhub.internal for new employee provisioning.')}
                className="text-slate-600 font-medium hover:underline"
              >
                Contact your administrator
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

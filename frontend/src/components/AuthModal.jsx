import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeAuthModal]);

  if (!authModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authModalMode === 'login') {
      login({ 
        id: 1, 
        name: 'Alex Johnson', 
        email: formData.email, 
        role: 'student', 
        cardId: 'BV-2024-00042' 
      });
      addToast('Welcome back, Alex!', 'success');
    } else {
      login({ 
        id: 2, 
        name: formData.name || 'New Member', 
        email: formData.email, 
        role: 'student', 
        cardId: 'BV-2024-00099' 
      });
      addToast('Account created successfully!', 'success');
    }
    closeAuthModal();
  };

  const handleTabChange = (mode) => {
    setAuthModalMode(mode);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-espresso/80 animate-in fade-in duration-300"
        onClick={closeAuthModal}
      />
      
      {/* Modal Container */}
      <div className="relative bg-cream max-w-md w-full rounded-none shadow-2xl animate-in zoom-in-95 fade-in duration-200 ease-out flex flex-col">
        {/* Top decorative bar */}
        <div className="h-1 bg-brown w-full" />
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 relative">
          <button 
            onClick={closeAuthModal}
            className="absolute top-6 right-6 text-ink-muted hover:text-ink transition-colors"
          >
            <X size={20} />
          </button>
          
          <h2 className="font-serif text-2xl text-ink font-bold tracking-tight">
            {authModalMode === 'login' ? 'Welcome back.' : 'Join BookVault.'}
          </h2>
          <p className="font-sans text-sm text-ink-muted mt-1 italic">
            {authModalMode === 'login' 
              ? 'Enter your credentials to access the library.' 
              : 'Create your digital library card in seconds.'}
          </p>
        </div>

        {/* Tab row */}
        <div className="flex border-b border-border-warm px-8">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-3 text-center text-sm font-sans font-medium uppercase tracking-widest transition-all border-b-2 ${
              authModalMode === 'login' ? 'text-ink border-brown' : 'text-ink-muted border-transparent opacity-60'
            }`}
          >
            Sign In
          </button>
          <div className="w-[1px] bg-border-warm my-3" />
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-3 text-center text-sm font-sans font-medium uppercase tracking-widest transition-all border-b-2 ${
              authModalMode === 'register' ? 'text-ink border-brown' : 'text-ink-muted border-transparent opacity-60'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          {authModalMode === 'register' && (
            <div className="space-y-1.5 transition-all animate-in slide-in-from-top-2">
              <label className="text-[12px] font-sans font-medium uppercase tracking-widest text-ink-muted pl-0.5">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full bg-parchment border border-border-warm px-4 py-3 placeholder:text-ink-muted/50 focus:outline-none focus:border-brown transition-colors font-sans text-sm"
                placeholder="Elizabeth Bennet"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[12px] font-sans font-medium uppercase tracking-widest text-ink-muted pl-0.5">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-parchment border border-border-warm px-4 py-3 placeholder:text-ink-muted/50 focus:outline-none focus:border-brown transition-colors font-sans text-sm"
              placeholder="name@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <label className="text-[12px] font-sans font-medium uppercase tracking-widest text-ink-muted pl-0.5">
                Password
              </label>
              {authModalMode === 'login' && (
                <button type="button" className="text-[10px] text-brown uppercase tracking-wider font-semibold hover:underline mb-0.5">
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-parchment border border-border-warm px-4 py-3 pr-10 placeholder:text-ink-muted/50 focus:outline-none focus:border-brown transition-colors font-sans text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {authModalMode === 'register' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2">
              <label className="text-[12px] font-sans font-medium uppercase tracking-widest text-ink-muted pl-0.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-parchment border border-border-warm px-4 py-3 placeholder:text-ink-muted/50 focus:outline-none focus:border-brown transition-colors font-sans text-sm"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-espresso text-cream py-4 font-sans font-bold uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-lg active:scale-[0.98]"
          >
            {authModalMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-border-warm flex-1" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Demo Logins</span>
            <div className="h-px bg-border-warm flex-1" />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                login({ 
                  id: 1, 
                  name: 'Alex Johnson', 
                  email: 'alex@uni.edu', 
                  role: 'student', 
                  cardId: 'BV-2024-00042' 
                });
                closeAuthModal();
              }}
              className="flex-1 border border-border-warm text-ink-muted text-[11px] font-sans font-bold uppercase tracking-widest py-3 hover:border-brown hover:text-brown transition-all"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                login({ 
                  id: 99, 
                  name: 'Dr. Sarah Malik', 
                  email: 'admin@bookvault.edu', 
                  role: 'admin', 
                  cardId: 'BV-ADMIN-001' 
                });
                closeAuthModal();
              }}
              className="flex-1 border border-brown text-brown text-[11px] font-sans font-bold uppercase tracking-widest py-3 hover:bg-brown hover:text-cream transition-all"
            >
              Admin
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border-warm flex flex-col items-center">
            <p className="font-serif italic text-[11px] text-ink-muted text-center max-w-[240px]">
              By joining, you agree to our library terms, borrowing policies, and academic code of conduct.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Catalogue', path: '/catalogue' },
    { name: 'My Library', path: '/my-library' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-espresso sticky top-0 z-50 h-[64px] flex items-center w-full shadow-lg">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between w-full h-full">
        {/* LEFT: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="BookVault" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
          <div className="flex items-baseline font-serif text-[22px] tracking-tight">
            <span className="text-white font-normal">Book</span>
            <span className="text-gold-light font-bold">Vault</span>
          </div>
        </Link>

        {/* CENTER: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/70 hover:text-gold transition-colors">Home</Link>
          <Link to="/catalogue" className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/70 hover:text-gold transition-colors">Catalogue</Link>
          {user && (
            <>
              <Link to="/my-library" className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/70 hover:text-gold transition-colors">My Library</Link>
              <Link to="/reservations" className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/70 hover:text-gold transition-colors">Logistics</Link>
              <Link to="/fines" className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/70 hover:text-gold transition-colors">Fines</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors border border-gold/30 px-3 py-1 ml-4">Admin Panel</Link>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="text-[13px] font-sans text-parchment/80 border border-parchment/30 rounded-none px-4 py-1.5 hover:border-gold hover:text-gold transition-all"
              >
                Sign in
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="text-[13px] font-sans bg-gold text-espresso font-semibold rounded-none px-4 py-1.5 hover:bg-gold-light transition-all"
              >
                Join Library
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-3 group/profile">
                <div className="w-8 h-8 rounded-full bg-brown flex items-center justify-center text-cream text-xs font-bold border border-parchment/20 group-hover/profile:border-gold transition-colors">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-parchment/80 text-sm font-sans group-hover/profile:text-gold transition-colors">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs text-parchment/50 hover:text-gold transition-colors underline underline-offset-4"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* MOBILE: Hamburger */}
        <button
          className="md:hidden text-gold p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="absolute top-[64px] left-0 w-full bg-espresso-light border-t border-parchment/10 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-6 p-6">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif font-bold text-parchment hover:text-gold transition-colors">Home</Link>
            <Link to="/catalogue" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif font-bold text-parchment hover:text-gold transition-colors">Catalogue</Link>
            {user && (
              <>
                <Link to="/my-library" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif font-bold text-parchment hover:text-gold transition-colors">My Library</Link>
                <Link to="/reservations" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif font-bold text-parchment hover:text-gold transition-colors">Logistics</Link>
                <Link to="/fines" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif font-bold text-parchment hover:text-gold transition-colors">Fines</Link>
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif font-bold text-gold">Admin Panel</Link>
                )}
              </>
            )}
            <div className="h-px bg-parchment/10 my-2" />
            {!user ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                  className="w-full py-3 border border-parchment/30 text-parchment text-sm font-sans uppercase tracking-widest"
                >
                  Sign in
                </button>
                <button
                  onClick={() => { openAuthModal('register'); setMobileMenuOpen(false); }}
                  className="w-full py-3 bg-gold text-espresso font-semibold text-sm font-sans uppercase tracking-widest"
                >
                  Join Library
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 group/mobile">
                  <div className="w-10 h-10 rounded-full bg-brown flex items-center justify-center text-cream font-bold border border-parchment/10 group-hover/mobile:border-gold transition-colors">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-parchment font-medium group-hover/mobile:text-gold transition-colors">{user.name}</div>
                    <div className="text-parchment/50 text-xs group-hover/mobile:text-gold/50 transition-colors">{user.cardId}</div>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-left text-gold text-sm underline underline-offset-4"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

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
          <BookOpen className="text-gold stroke-[1.5] group-hover:scale-110 transition-transform" size={24} />
          <div className="flex items-baseline font-serif text-[22px] tracking-tight">
            <span className="text-white font-normal">Book</span>
            <span className="text-gold-light font-bold">Vault</span>
          </div>
        </Link>

        {/* CENTER: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 h-full">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                text-[13px] font-sans uppercase tracking-[0.1em] h-full flex items-center transition-all px-1 border-b-2
                ${isActive(link.path) 
                  ? 'text-gold-light border-gold-light' 
                  : 'text-parchment/70 border-transparent hover:text-parchment'
                }
              `}
            >
              {link.name}
            </Link>
          ))}
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brown flex items-center justify-center text-cream text-xs font-bold border border-parchment/20">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-parchment/80 text-sm font-sans">{user.name}</span>
              </div>
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
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-sans uppercase tracking-widest ${isActive(link.path) ? 'text-gold' : 'text-parchment/70'}`}
              >
                {link.name}
              </Link>
            ))}
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
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-brown flex items-center justify-center text-cream font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-parchment font-medium">{user.name}</div>
                    <div className="text-parchment/50 text-xs">{user.cardId}</div>
                  </div>
                </div>
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

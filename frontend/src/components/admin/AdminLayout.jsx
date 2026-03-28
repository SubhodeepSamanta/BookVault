import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  CalendarCheck, 
  MessageSquare, 
  ArrowLeft,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Books', path: '/admin/books', icon: BookOpen },
    { name: 'Users & Borrows', path: '/admin/users', icon: Users },
    { name: 'Pickups & Fines', path: '/admin/pickups', icon: CalendarCheck },
    { name: 'Content', path: '/admin/content', icon: MessageSquare },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex min-h-screen bg-cream selection:bg-gold/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 bg-espresso min-h-screen sticky top-0 self-start flex flex-col border-r border-parchment/5">
        
        {/* TOP: Logo Area */}
        <div className="px-6 py-8 border-b border-parchment/10">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="text-gold stroke-[1.5]" size={22} />
            <div className="flex items-baseline font-serif text-[20px] tracking-tight">
              <span className="text-white font-normal">Book</span>
              <span className="text-gold-light font-bold">Vault</span>
            </div>
          </Link>
          <div className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-parchment/30 mt-2 ml-0.5">
            Institutional Admin
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-none transition-all group
                ${isActive 
                  ? 'bg-gold/10 text-gold border-l-2 border-gold pl-[14px]' 
                  : 'text-parchment/50 hover:text-parchment hover:bg-parchment/5 pl-4'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <link.icon size={18} className={isActive ? 'text-gold' : 'text-parchment/30 group-hover:text-parchment/60'} />
                  <span className="text-[13px] font-sans font-bold tracking-wide">{link.name}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="h-px bg-parchment/10 my-6 mx-2" />

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-parchment/40 hover:text-parchment/70 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[12px] font-sans font-bold tracking-wider">Back to Site</span>
          </Link>
        </nav>

        {/* BOTTOM: Profile Summary */}
        <div className="p-6 border-t border-parchment/10 bg-black/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-brown text-cream flex items-center justify-center rounded-full font-serif text-sm font-bold border border-parchment/20">
              SM
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-sans font-bold text-parchment/80 truncate leading-tight">Dr. Sarah Malik</div>
              <div className="text-[10px] font-sans text-parchment/40 truncate">Administrator</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-[10px] font-sans font-bold text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors w-full"
          >
            <LogOut size={12} />
            <span>Sign out of portal</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="bg-parchment border-b border-border-warm px-10 py-5 flex justify-between items-center sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-90">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">{title}</h1>
            <div className="text-[10px] font-sans text-ink-muted uppercase tracking-[0.2em] mt-0.5">BookVault Management Console</div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-sans font-bold text-ink-muted">{currentDate}</div>
              <div className="text-[10px] font-sans text-gold-dark font-bold uppercase tracking-widest">System Status: Optimal</div>
            </div>
            <div className="h-8 w-px bg-border-warm mx-2" />
            <div className="bg-espresso text-cream text-[10px] font-sans font-bold px-4 py-1.5 uppercase tracking-[0.2em]">
              Admin
            </div>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <div className="p-10 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;

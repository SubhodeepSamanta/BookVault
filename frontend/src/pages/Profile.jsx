import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  CreditCard, 
  BookOpen, 
  Lock, 
  Eye, 
  EyeOff, 
  Settings, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { user, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState(['Classic Fiction', 'Science Fiction']);
  const [readingGoal, setReadingGoal] = useState(30);

  useEffect(() => {
    if (!user) { navigate('/'); openAuthModal('login') }
  }, [user]);

  if (!user) return null;

  const genres = [
    'Classic Fiction', 'Science Fiction', 'Philosophy', 
    'History', 'Poetry', 'Biography', 'Arts', 'Economics'
  ];

  const passwordStrength = (pwd) => {
    if (pwd.length === 0) return 0;
    if (pwd.length < 6) return 1;
    if (pwd.length < 9) return 2;
    if (pwd.length < 13) return 3;
    return 4;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-green-500', 'bg-green-600'];

  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    } else {
      if (selectedGenres.length >= 3) {
        addToast('Max 3 genres allowed.', 'error');
        return;
      }
      setSelectedGenres(prev => [...prev, genre]);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* PAGE HEADER */}
      <header className="bg-espresso py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-4">
            <span className="text-[12px] font-sans text-parchment/40 uppercase tracking-widest">
              <Link to="/" className="hover:text-gold transition-colors">Home</Link> / <span className="text-parchment/60 font-bold">Profile</span>
            </span>
          </nav>
          <h1 className="font-serif text-5xl text-cream font-bold mb-1">My Profile</h1>
          <p className="font-sans text-sm italic text-parchment/60">Manage your account and library membership.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COLUMN: FIXED CARD */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
             <div className="bg-parchment border border-border-warm p-8 shadow-sm">
                <div className="w-24 h-24 bg-brown text-cream flex items-center justify-center rounded-full mx-auto mb-6 transform hover:rotate-3 transition-transform shadow-lg border-4 border-white">
                   <span className="font-serif text-3xl font-bold">AJ</span>
                </div>
                
                <h2 className="font-serif text-2xl font-bold text-ink text-center mb-1">{user.name}</h2>
                <p className="font-sans text-sm text-ink-muted text-center mb-4">{user.email}</p>
                
                <button className="text-[10px] font-sans font-bold text-brown uppercase tracking-widest text-center w-full underline decoration-2 underline-offset-4 hover:text-espresso transition-colors">
                   Change Avatar
                </button>

                <div className="h-px bg-border-warm my-8" />

                {/* VISUAL LIBRARY CARD */}
                <div className="mb-8">
                   <div className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-ink-muted mb-4 text-center">Library Membership</div>
                   <div className="bg-espresso rounded-none p-5 relative overflow-hidden shadow-xl aspect-[1.6/1] flex flex-col justify-between group">
                      {/* Decorative elements */}
                      <div className="absolute -right-4 -bottom-4 font-serif text-8xl text-parchment opacity-[0.03] group-hover:opacity-[0.06] transition-opacity select-none pointer-events-none">BV</div>
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gold/10 rounded-full blur-2xl" />
                      
                      <div className="flex items-center gap-2">
                         <BookOpen size={16} className="text-gold" />
                         <span className="font-sans font-bold text-[11px] text-parchment/60 uppercase tracking-[0.2em]">BookVault</span>
                      </div>
                      
                      <div>
                         <div className="font-mono text-xl text-cream font-bold tracking-[0.15em] mb-1">{user.cardId}</div>
                         <div className="text-[11px] font-sans font-medium text-parchment/50 uppercase tracking-widest">{user.name}</div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                         <div className="text-[9px] font-sans font-bold text-gold/60 uppercase tracking-[0.25em]">Student Member</div>
                         <div className="w-8 h-8 opacity-40">
                            {/* Simple barcode lines */}
                            <div className="flex gap-0.5 h-full items-end">
                               {[2, 4, 1, 3, 2, 5, 2].map((h, i) => (
                                 <div key={i} className="bg-parchment w-0.5" style={{ height: `${h * 20}%` }} />
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                   <p className="text-[11px] font-sans text-ink-muted mt-4 text-center italic">Member since Dec 2024</p>
                </div>

                <div className="h-px bg-border-warm my-6" />

                {/* STATS */}
                <div className="space-y-4">
                   {[
                     ['Books Borrowed', '5'],
                     ['Currently Reading', '2'],
                     ['Outstanding Fines', '₹9.50', 'text-red-600']
                   ].map(([label, value, color]) => (
                     <div key={label} className="flex justify-between items-center text-[13px] font-sans border-b border-border-warm/30 pb-3 last:border-none last:pb-0 group">
                        <span className="text-ink-muted group-hover:text-ink transition-colors">{label}</span>
                        <span className={`font-bold ${color || 'text-ink'}`}>{value}</span>
                     </div>
                   ))}
                </div>
             </div>
          </aside>

          {/* RIGHT COLUMN: CONTENT */}
          <div className="flex-1 space-y-16">
             
             {/* SECTION 1: PERSONAL INFO */}
             <section>
                <h3 className="font-serif text-3xl font-bold text-ink mb-2">Personal Information</h3>
                <p className="font-sans text-sm text-ink-muted mb-6">Update your identification details and contact information.</p>
                <div className="w-12 h-1 bg-gold mb-8" />

                <div className="max-w-2xl space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5">Full Name</label>
                         <input 
                           type="text"
                           defaultValue={user.name}
                           className="w-full bg-cream border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans font-medium text-ink focus:border-brown focus:outline-none"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5">Email Address</label>
                         <input 
                           type="email"
                           defaultValue={user.email}
                           className="w-full bg-cream border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans font-medium text-ink focus:border-brown focus:outline-none"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2 opacity-60">
                         <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5">Library ID</label>
                         <input 
                           type="text"
                           value={user.cardId}
                           disabled
                           className="w-full bg-parchment/50 border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans font-mono font-bold text-ink-muted cursor-not-allowed"
                         />
                         <p className="text-[11px] font-sans text-ink-muted italic pl-1">ID cannot be changed.</p>
                      </div>
                      <div className="space-y-2 opacity-60">
                         <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5">Account Role</label>
                         <input 
                           type="text"
                           value="Student Member"
                           disabled
                           className="w-full bg-parchment/50 border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans font-bold text-ink-muted cursor-not-allowed"
                         />
                      </div>
                   </div>

                   <button 
                    onClick={() => addToast('Profile updated successfully.', 'success')}
                    className="bg-espresso text-cream px-10 py-4 font-sans font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg"
                   >
                      Save Changes
                   </button>
                </div>
             </section>

             {/* SECTION 2: CHANGE PASSWORD */}
             <section>
                <h3 className="font-serif text-2xl font-bold text-ink mb-2">Security</h3>
                <p className="font-sans text-sm text-ink-muted mb-6">Manage your account protection and access credentials.</p>
                <div className="w-12 h-1 bg-gold mb-8" />

                <div className="max-w-md space-y-6">
                   <div className="space-y-2">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5">Current Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-cream border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans focus:border-brown focus:outline-none"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5">New Password</label>
                      <div className="relative">
                         <input 
                           type={showPassword ? 'text' : 'password'}
                           placeholder="Enter new password"
                           className="w-full bg-cream border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans focus:border-brown focus:outline-none pr-12"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                         />
                         <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-brown transition-colors"
                         >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                      </div>
                      
                      {/* Strength Indicator */}
                      {password.length > 0 && (
                        <div className="mt-4 animate-in slide-in-from-top-1">
                           <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-ink-muted">Password Strength:</span>
                              <span className={`text-[10px] font-sans font-bold uppercase tracking-[0.1em] ${strength > 2 ? 'text-green-600' : 'text-amber-600'}`}>
                                 {strengthLabels[strength]}
                              </span>
                           </div>
                           <div className="flex gap-1.5 h-1">
                              {[1, 2, 3, 4].map(idx => (
                                <div 
                                  key={idx} 
                                  className={`flex-1 transition-all duration-500 bg-border-warm ${idx <= strength ? strengthColors[strength] : ''}`}
                                />
                              ))}
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="space-y-2">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5">Confirm New Password</label>
                      <input 
                        type="password"
                        placeholder="Repeat new password"
                        className="w-full bg-cream border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans focus:border-brown focus:outline-none"
                      />
                   </div>

                   <button 
                    onClick={() => {
                        if (password.length < 8) {
                           addToast('Password must be at least 8 characters.', 'error');
                        } else {
                           addToast('Password updated successfully.', 'success');
                           setPassword('');
                        }
                    }}
                    className="bg-espresso text-cream px-10 py-4 font-sans font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg"
                   >
                      Update Password
                   </button>
                </div>
             </section>

             {/* SECTION 3: PREFERENCES */}
             <section>
                <h3 className="font-serif text-2xl font-bold text-ink mb-2">Reading Preferences</h3>
                <p className="font-sans text-sm text-ink-muted mb-6">Personalize your library experience and discovery tools.</p>
                <div className="w-12 h-1 bg-gold mb-8" />

                <div className="space-y-10 max-w-2xl">
                   <div>
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5 block mb-4">Favourite Genres (Max 3)</label>
                      <div className="flex flex-wrap gap-2.5">
                         {genres.map(genre => (
                           <button
                             key={genre}
                             onClick={() => handleGenreToggle(genre)}
                             className={`
                               px-5 py-2 rounded-full text-[11px] font-sans font-bold uppercase tracking-widest transition-all duration-300 border
                               ${selectedGenres.includes(genre)
                                 ? 'bg-brown text-cream border-brown shadow-md scale-105'
                                 : 'bg-cream border-border-warm text-ink-muted hover:border-brown hover:text-brown'}
                             `}
                           >
                              {genre}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5 block">Daily Reading Goal</label>
                         <span className="font-sans font-bold text-brown text-sm">{readingGoal} minutes per day</span>
                      </div>
                      <div className="relative pt-2">
                         <input 
                           type="range"
                           min="10"
                           max="120"
                           step="5"
                           value={readingGoal}
                           onChange={(e) => setReadingGoal(e.target.value)}
                           className="w-full h-1.5 bg-border-warm appearance-none cursor-pointer outline-none accent-brown rounded-none"
                         />
                         <div className="flex justify-between mt-3 text-[10px] font-sans text-ink-muted uppercase tracking-widest font-bold">
                            <span>10 min</span>
                            <span>60 min</span>
                            <span>120 min</span>
                         </div>
                      </div>
                   </div>

                   <button 
                    onClick={() => addToast('Preferences saved.', 'success')}
                    className="bg-espresso text-cream px-10 py-4 font-sans font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg"
                   >
                      Save Preferences
                   </button>
                </div>
             </section>

             {/* SECTION 4: DANGER ZONE */}
             <section className="pt-10">
                <h3 className="font-serif text-2xl font-bold text-red-600 mb-2">Danger Zone</h3>
                <div className="w-12 h-1 bg-red-200 mb-8" />
                
                <div className="bg-red-50 border border-red-200 p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                   <div className="text-center md:text-left">
                      <h4 className="font-sans font-bold text-red-700 text-base flex items-center gap-2 justify-center md:justify-start">
                         <AlertTriangle size={18} /> Deactivate Account
                      </h4>
                      <p className="text-sm text-red-500 mt-1 max-w-sm">
                         This will immediately remove your access to BookVault. Your data is retained for administrative compliance.
                      </p>
                   </div>
                   <button 
                    onClick={() => {
                        if (window.confirm('Are you certain you wish to deactivate your account? This action is immediate.')) {
                           addToast('Account deactivated.', 'error');
                           logout();
                           navigate('/');
                        }
                    }}
                    className="shrink-0 border-2 border-red-400 text-red-600 font-sans font-bold uppercase tracking-widest text-[11px] px-8 py-3.5 hover:bg-red-600 hover:text-white transition-all rounded-none"
                   >
                      Deactivate
                   </button>
                </div>
             </section>

          </div>
        </div>
      </main>

      <footer className="bg-espresso py-8 border-t border-parchment/10 text-center">
         <p className="text-[10px] font-sans text-parchment/30 uppercase tracking-[0.3em]">Institutional Member · BookVault Library Portal · Est. 1987</p>
      </footer>
    </div>
  );
};

export default Profile;

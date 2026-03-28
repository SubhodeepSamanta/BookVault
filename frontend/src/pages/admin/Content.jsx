import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Flag, 
  CheckCircle, 
  Clock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  MoreVertical,
  Paperclip,
  Calendar,
  Star as StarIcon
} from 'lucide-react';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

// MOCK DATA
const mockAnnouncements = [
  { id:1, title:'Winter Holiday Operating Hours',
    content:'Please note that the library will be closed from Dec 24 to Jan 2. Digital resources remain available 24/7.',
    date:'2024-11-28', priority:'high', status:'published', views:542 },
  { id:2, title:'New Arrival: Oxford History Series',
    content:'We have added 15 new volumes to the Oxford History of England series in the North Wing.',
    date:'2024-11-25', priority:'medium', status:'published', views:210 },
  { id:3, title:'Maintenance: Online Catalogue',
    content:'The online search portal will be down for scheduled maintenance on Sunday between 2AM and 4AM IST.',
    date:'2024-11-20', priority:'medium', status:'expired', views:89 },
];

const mockReviews = [
  { id:1, userName:'Alex Johnson', bookTitle:'The Great Gatsby',
    rating:5, comment:'A hauntingly beautiful depiction of the American dream. A must-read for everyone.',
    date:'2024-11-22', status:'pending', flags:0 },
  { id:2, userName:'Priya Sharma', bookTitle:'1984',
    rating:4, comment:'Terrifyingly relevant even today. Orwell was a prophet of our digital age.',
    date:'2024-11-18', status:'approved', flags:0 },
  { id:3, userName:'Liam Chen', bookTitle:'Sapiens',
    rating:2, comment:'Found it a bit too speculative in the latter half. Expected more rigorous data.',
    date:'2024-11-15', status:'flagged', flags:3, flagReason:'Inappropriate language reported.' },
];

const Content = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Announcements');
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [reviews, setReviews] = useState(mockReviews);
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [newAnn, setNewAnn] = useState({ title:'', content:'', priority:'medium' });

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const handleCreateAnn = (e) => {
    e.preventDefault();
    const ann = { ...newAnn, id: announcements.length+1, date: '2024-12-02', status:'published', views:0 };
    setAnnouncements([ann, ...announcements]);
    setShowAddAnn(false);
    setNewAnn({ title:'', content:'', priority:'medium' });
    addToast('Announcement published.', 'success');
  };

  const deleteAnn = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addToast('Announcement deleted.', 'error');
  };

  const moderateReview = (id, status) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    addToast(`Review marked as ${status}.`, status === 'approved' ? 'success' : 'error');
  };

  return (
    <>
      
      {/* TABS */}
      <div className="flex gap-10 border-b border-border-warm mb-8">
        {[
          { name: 'Announcements', icon: Megaphone },
          { name: 'Review Moderation', icon: MessageSquare }
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-2.5
              ${activeTab === tab.name ? 'text-brown' : 'text-ink-muted hover:text-ink'}
            `}
          >
            <tab.icon size={14} />
            {tab.name}
            {activeTab === tab.name && <div className="absolute bottom-0 left-0 w-full h-1 bg-brown" />}
          </button>
        ))}
      </div>

      {activeTab === 'Announcements' && (
        <div className="animate-in fade-in duration-500">
           {/* HEADER */}
           <div className="flex justify-between items-center mb-10">
              <div>
                 <h2 className="font-serif text-2xl font-bold text-ink underline underline-offset-8 decoration-gold/40">Bulletin Board</h2>
                 <p className="text-[13px] font-sans text-ink-muted mt-2">Manage library news, holiday alerts, and event notifications.</p>
              </div>
              <button 
                onClick={() => setShowAddAnn(true)}
                className="bg-espresso text-cream px-8 py-3.5 font-sans font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
              >
                 <Plus size={16} /> New Broadcast
              </button>
           </div>

           {/* ADD FORM MODAL */}
           {showAddAnn && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-espresso/80 backdrop-blur-sm animate-in fade-in duration-300">
                 <form onSubmit={handleCreateAnn} className="bg-cream max-w-lg w-full p-10 border-t-8 border-brown shadow-2xl relative animate-in zoom-in-95 duration-500 space-y-6">
                    <h3 className="font-serif text-2xl font-bold text-ink border-b border-border-warm pb-4 mb-4">Create Announcement</h3>
                    <div className="space-y-2">
                       <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Subject Title</label>
                       <input 
                         required
                         type="text" 
                         className="w-full bg-parchment border border-border-warm px-5 py-3.5 text-sm font-sans focus:outline-none focus:border-brown"
                         value={newAnn.title}
                         onChange={(e) => setNewAnn({...newAnn, title: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Content Body</label>
                       <textarea 
                         required
                         className="w-full bg-parchment border border-border-warm px-5 py-3.5 text-sm font-sans h-40 focus:outline-none focus:border-brown"
                         value={newAnn.content}
                         onChange={(e) => setNewAnn({...newAnn, content: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Urgency Level</label>
                       <select 
                         className="w-full bg-parchment border border-border-warm px-5 py-3.5 text-sm font-sans font-bold focus:outline-none focus:border-brown"
                         value={newAnn.priority}
                         onChange={(e) => setNewAnn({...newAnn, priority: e.target.value})}
                       >
                          <option value="low">Low - General Info</option>
                          <option value="medium">Medium - Standard News</option>
                          <option value="high">High - Urgent Alert</option>
                       </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                       <button type="button" onClick={()=>setShowAddAnn(false)} className="flex-1 border border-border-warm py-4 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-parchment transition-all">Cancel</button>
                       <button type="submit" className="flex-1 bg-brown text-cream py-4 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-espresso transition-all shadow-xl shadow-brown/10">Publish Now</button>
                    </div>
                 </form>
              </div>
           )}

           {/* LIST */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {announcements.map(a => (
                <div key={a.id} className="bg-parchment border border-border-warm p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                   {/* PRIORITY TAG */}
                   <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-sans font-bold uppercase tracking-[0.2em] shadow-sm
                      ${a.priority === 'high' ? 'bg-red-600 text-white' : a.priority === 'medium' ? 'bg-brown text-cream' : 'bg-ink-muted text-cream'}`}>
                      {a.priority} Priority
                   </div>

                   <div className="flex items-center gap-2.5 text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-4">
                      <Calendar size={12} className="text-gold-dark" />
                      {new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      <span className="mx-2 opacity-20">|</span>
                      <Eye size={12} className="text-gold-dark" />
                      {a.views} views
                   </div>

                   <h3 className="font-serif text-2xl font-bold text-ink mb-4 group-hover:text-brown transition-colors leading-tight">{a.title}</h3>
                   <p className="text-[14px] font-sans text-ink-muted leading-relaxed line-clamp-3 mb-8">{a.content}</p>

                   <div className="flex items-center justify-between pt-6 border-t border-border-warm">
                      <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${a.status === 'published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-ink-muted opacity-40'}`} />
                         <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">{a.status}</span>
                      </div>
                      <div className="flex gap-4">
                         <button className="text-ink-muted hover:text-brown transition-colors" title="Edit"><Clock size={16} /></button>
                         <button onClick={()=>deleteAnn(a.id)} className="text-ink-muted hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                         <button className="text-ink-muted hover:text-ink transition-colors"><MoreVertical size={16} /></button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'Review Moderation' && (
        <div className="animate-in fade-in duration-500">
           <div className="flex justify-between items-center mb-10">
              <div>
                 <h2 className="font-serif text-2xl font-bold text-ink underline underline-offset-8 decoration-gold/40">Review Moderation</h2>
                 <p className="text-[13px] font-sans text-ink-muted mt-2">Filter and approve member book reviews to ensure quality interactions.</p>
              </div>
              <div className="flex border border-border-warm divide-x divide-border-warm">
                 <button className="bg-cream px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-parchment">All</button>
                 <button className="bg-espresso text-cream px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest">Pending</button>
                 <button className="bg-cream px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-parchment">Flagged</button>
              </div>
           </div>

           <div className="space-y-6">
              {reviews.map(r => (
                <div key={r.id} className={`bg-parchment border ${r.status === 'flagged' ? 'border-red-200' : 'border-border-warm'} p-8 shadow-sm group hover:scale-[1.005] transition-all`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                         <div className="w-10 h-10 bg-brown text-cream flex items-center justify-center rounded-sm text-sm font-bold font-serif">
                            {r.userName.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <div>
                            <div className="text-[15px] font-sans font-bold text-ink">{r.userName}</div>
                            <div className="text-[11px] font-sans text-ink-muted italic">Reviewing <span className="font-bold text-brown">"{r.bookTitle}"</span></div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1">{r.date}</div>
                         <div className="flex justify-end gap-0.5"><StarRating rating={r.rating} /></div>
                      </div>
                   </div>

                   <p className="text-base font-serif italic text-ink/80 leading-relaxed mb-8 bg-cream/50 p-6 border-l-4 border-gold/30">
                      "{r.comment}"
                   </p>

                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-6">
                         <span className={`text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1 border
                            ${r.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 
                              r.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                              'bg-red-50 text-red-600 border-red-200'}`}>
                            Status: {r.status}
                         </span>
                         {r.flags > 0 && (
                           <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-red-600 uppercase tracking-widest">
                              <Flag size={12} fill="currentColor" /> {r.flags} Flags Reported
                           </span>
                         )}
                      </div>

                      <div className="flex gap-3">
                         {r.status !== 'approved' && (
                           <button 
                             onClick={() => moderateReview(r.id, 'approved')}
                             className="bg-green-600 text-white text-[11px] font-sans font-bold px-6 py-2.5 uppercase tracking-widest hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
                           >
                              <CheckCircle size={14} /> Approve
                           </button>
                         )}
                         {r.status !== 'flagged' && (
                           <button 
                             onClick={() => moderateReview(r.id, 'flagged')}
                             className="border-2 border-red-400 text-red-600 text-[11px] font-sans font-bold px-6 py-2.5 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                           >
                              <AlertCircle size={14} /> Flag
                           </button>
                         )}
                         <button 
                            className="bg-cream border border-border-warm p-2.5 text-ink-muted hover:text-red-600 hover:border-red-200 transition-all"
                            title="Purge Review"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                   
                   {r.flagReason && (
                      <div className="mt-6 bg-red-50/50 p-3 italic text-xs text-red-700 border border-dashed border-red-200 flex items-center gap-2">
                         <ShieldAlert size={12} /> Librarian Warning: {r.flagReason}
                      </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

    </>
  );
};

export default Content;

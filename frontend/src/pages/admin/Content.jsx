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
  AlertCircle,
  MoreVertical,
  Calendar,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import api from '../../api/client';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Content = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [newAnn, setNewAnn] = useState({ title:'', body:'', priority:'medium' });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Announcements') {
        const res = await api.get('/announcements/all');
        setAnnouncements(res.data.announcements || []);
      } else {
        const res = await api.get('/reviews/all');
        setReviews(res.data);
      }
    } catch (err) {
      addToast('Failed to sync content ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate, activeTab]);

  if (!user || user.role !== 'admin') return null;

  const handleCreateAnn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', newAnn);
      setShowAddAnn(false);
      setNewAnn({ title:'', body:'', priority:'medium' });
      addToast('Broadcast published successfully.', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to publish announcement.', 'error');
    }
  };

  const toggleAnn = async (id) => {
    try {
      await api.put(`/announcements/${id}/toggle`);
      addToast('Announcement status toggled.', 'success');
      fetchData();
    } catch (err) {
      addToast('Update failed.', 'error');
    }
  };

  const deleteAnn = async (id) => {
    if (!window.confirm('Strike this announcement from all historical records?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      addToast('Announcement purged.', 'error');
      fetchData();
    } catch (err) {
      addToast('Deletion failed.', 'error');
    }
  };

  const moderateReview = async (id, status) => {
    try {
      await api.put(`/reviews/${id}/status`, { status });
      addToast(`Member review marked as ${status}.`, status === 'approved' ? 'success' : 'error');
      fetchData();
    } catch (err) {
      addToast('Moderation action failed.', 'error');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Permanently redact this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      addToast('Review redacted.', 'error');
      fetchData();
    } catch (err) {
      addToast('Deletion failed.', 'error');
    }
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
            {activeTab === tab.name && <div className="absolute bottom-0 left-0 w-full h-1 bg-brown animate-in fade-in slide-in-from-bottom-2 duration-300" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-parchment/30 border border-border-warm">
          <Loader2 className="animate-spin text-brown mb-4" size={32} />
          <span className="text-xs font-sans uppercase tracking-widest text-ink-muted font-bold">Auditing Editorial Stack...</span>
        </div>
      ) : (
        <>
          {activeTab === 'Announcements' && (
            <div className="animate-in fade-in duration-500">
               {/* HEADER */}
               <div className="flex justify-between items-center mb-10">
                  <div>
                     <h2 className="font-serif text-2xl font-bold text-ink underline underline-offset-8 decoration-gold/40 italic">Bulletin Board</h2>
                     <p className="text-[13px] font-sans text-ink-muted mt-2">Oversee institutional broadcasts and mission-critical alerts.</p>
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
                        <h3 className="font-serif text-2xl font-bold text-ink border-b border-border-warm pb-4 mb-4 font-bold italic">Draft Broadcast</h3>
                        <div className="space-y-1">
                           <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Subject Title</label>
                           <input 
                             required
                             type="text" 
                             className="w-full bg-parchment border border-border-warm px-5 py-3.5 text-sm font-sans focus:outline-none focus:border-brown"
                             value={newAnn.title}
                             onChange={(e) => setNewAnn({...newAnn, title: e.target.value})}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Mandatory Content</label>
                           <textarea 
                             required
                             className="w-full bg-parchment border border-border-warm px-5 py-3.5 text-sm font-sans h-40 focus:outline-none focus:border-brown"
                             value={newAnn.body}
                             onChange={(e) => setNewAnn({...newAnn, body: e.target.value})}
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Urgency Tier</label>
                           <select 
                             className="w-full bg-parchment border border-border-warm px-5 py-3.5 text-sm font-sans font-bold focus:outline-none focus:border-brown"
                             value={newAnn.priority}
                             onChange={(e) => setNewAnn({...newAnn, priority: e.target.value})}
                           >
                              <option value="low">Low - Routine Update</option>
                              <option value="medium">Medium - Academic Circular</option>
                              <option value="high">High - Institutional Alert</option>
                           </select>
                        </div>
                        <div className="flex gap-4 pt-4">
                           <button type="button" onClick={()=>setShowAddAnn(false)} className="flex-1 border border-border-warm py-4 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-parchment transition-all">Cancel Draft</button>
                           <button type="submit" className="flex-1 bg-brown text-cream py-4 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-espresso transition-all shadow-xl">Confirm & Publish</button>
                        </div>
                     </form>
                  </div>
               )}

               {/* LIST */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {announcements.length > 0 ? announcements.map(a => (
                    <div key={a.id} className="bg-parchment border border-border-warm p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                       {/* STATUS TAG */}
                       <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-sans font-bold uppercase tracking-[0.2em] shadow-sm
                          ${a.is_active ? 'bg-brown text-cream' : 'bg-ink-muted text-cream'}`}>
                          {a.is_active ? 'Published' : 'Draft/Inactive'}
                       </div>

                       <div className="flex items-center gap-2.5 text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-4">
                          <Calendar size={12} className="text-gold" />
                          {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          <span className="mx-2 opacity-20">|</span>
                          <span className="font-bold">By {a.admin?.name || 'Administrative Office'}</span>
                       </div>

                       <h3 className="font-serif text-2xl font-bold text-ink mb-4 group-hover:text-brown transition-colors leading-tight italic">{a.title}</h3>
                       <p className="text-[14px] font-sans text-ink-muted leading-relaxed line-clamp-3 mb-8">{a.body}</p>

                       <div className="flex items-center justify-between pt-6 border-t border-border-warm">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${a.is_active ? 'bg-green-500 animate-pulse' : 'bg-ink-muted op-40'}`} />
                             <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Live Feed</span>
                          </div>
                          <div className="flex gap-4">
                             <button onClick={()=>toggleAnn(a.id)} className="text-ink-muted hover:text-brown transition-colors" title={a.is_active ? "Retract" : "Publish"}><Clock size={16} /></button>
                             <button onClick={()=>deleteAnn(a.id)} className="text-ink-muted hover:text-red-600 transition-colors" title="Expunge"><Trash2 size={16} /></button>
                             <button className="text-ink-muted hover:text-ink transition-colors"><MoreVertical size={16} /></button>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center border-4 border-dashed border-border-warm font-serif italic text-ink-muted">The bulletin board currently stands silent.</div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'Review Moderation' && (
            <div className="animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-10">
                  <div>
                     <h2 className="font-serif text-2xl font-bold text-ink underline underline-offset-8 decoration-gold/40 italic font-bold">Literary Discourse Audit</h2>
                     <p className="text-[13px] font-sans text-ink-muted mt-2">Moderate peer review records to ensure academic integrity and quality.</p>
                  </div>
               </div>

               <div className="space-y-6">
                  {reviews.length > 0 ? reviews.map(r => (
                    <div key={r.id} className={`bg-parchment border ${r.status === 'flagged' ? 'border-red-200' : 'border-border-warm'} p-8 shadow-sm group hover:scale-[1.005] transition-all`}>
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex gap-4 items-center">
                             <div className="w-10 h-10 bg-brown text-cream flex items-center justify-center rounded-sm text-sm font-bold font-serif shadow-sm">
                                {r.User?.name?.split(' ').map(n=>n[0]).join('')}
                             </div>
                             <div>
                             <div>
                                <div className="text-[15px] font-sans font-bold text-ink mb-0.5">{r.User?.name}</div>
                                <div className="text-[11px] font-sans text-ink-muted italic">
                                   Critique of <Link to={`/book/${r.Book?.id}`} className="font-bold text-brown hover:text-espresso transition-colors underline decoration-brown/30">"{r.Book?.title || 'Unknown Volume'}"</Link>
                                </div>
                             </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</div>
                             <div className="flex justify-end gap-0.5"><StarRating rating={r.rating} /></div>
                          </div>
                       </div>

                       <p className="text-base font-serif italic text-ink/80 leading-relaxed mb-8 bg-cream/50 p-6 border-l-4 border-gold/30">
                          "{r.comment}"
                       </p>

                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-6">
                             <span className={`text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1 border
                                ${r.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' : 
                                  r.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm' : 
                                  'bg-red-100 text-red-700 border-red-200 shadow-sm'}`}>
                                Status: {r.status}
                             </span>
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
                                onClick={() => deleteReview(r.id)}
                                className="bg-cream border border-border-warm p-2.5 text-ink-muted hover:text-red-600 hover:border-red-200 transition-all"
                                title="Purge Record"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center border-4 border-dashed border-border-warm font-serif italic text-ink-muted text-sm">No member discourse records available for audit.</div>
                  )}
               </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Content;

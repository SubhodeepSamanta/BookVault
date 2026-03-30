import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  BookMarked, 
  AlertCircle, 
  IndianRupee, 
  CalendarCheck, 
  Calendar,
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Loader2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import api from '../../api/client';
import BookCover from '../../components/BookCover';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brown mb-4" size={40} />
        <span className="text-ink-muted font-sans uppercase tracking-widest text-[10px] font-bold">Accessing Institutional Archives...</span>
      </div>
    );
  }

  const handleConfirmPickup = async (id) => {
    try {
      await api.put(`/borrows/${id}/confirm-pickup`);
      addToast('Pickup confirmed. Loan active.', 'success');
      fetchStats();
    } catch (err) {
      addToast('Action failed', 'error');
    }
  };

  return (
    <>
      {/* ── CORE METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Volumes', val: stats.totalBooks || 0, icon: BookOpen },
          { label: 'Active Members', val: stats.activeMembers || 0, icon: Users },
          { label: 'Current Loans', val: stats.activeBorrows || 0, icon: BookMarked },
          { label: 'Overdue Records', val: stats.overdueCount || 0, icon: AlertCircle, negative: stats.overdueCount > 0 }
        ].map((s, idx) => (
          <div key={idx} className="bg-parchment border border-border-warm p-6 shadow-sm group hover:border-brown transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2 bg-cream border border-border-warm text-ink-muted group-hover:bg-brown group-hover:text-cream transition-all">
                  <s.icon size={18} />
               </div>
               <div className={`text-[10px] font-sans font-bold px-2 py-0.5 uppercase tracking-tighter ${s.negative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  Live
               </div>
            </div>
            <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-1 italic">{s.label}</div>
            <div className="font-serif text-4xl font-bold text-ink">{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── LOGISTICS & REVENUE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-cream border border-border-warm p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                  <IndianRupee size={18} />
               </div>
               <div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-0.5">Revenue Collected</div>
                  <div className="font-serif text-xl font-bold text-ink">₹{(stats.collectedFines || 0).toFixed(2)}</div>
               </div>
            </div>
         </div>
         <div className="bg-cream border border-border-warm p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <CalendarCheck size={18} />
               </div>
               <div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-0.5">Pending Pickups</div>
                  <div className="font-serif text-xl font-bold text-ink">{stats.pendingPickupsCount || 0}</div>
               </div>
            </div>
         </div>
         <div className="bg-cream border border-border-warm p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
                  <Star size={18} />
               </div>
               <div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-0.5">Avg Rating</div>
                  <div className="font-serif text-xl font-bold text-ink">{stats.avgRating || '0.0'}★</div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 border-t border-border-warm pt-10">
        
        {/* ACTION QUEUE */}
        <div className="lg:col-span-3 space-y-10">
          <section>
             <div className="flex justify-between items-end mb-6">
                <div>
                   <h2 className="font-serif text-3xl font-bold text-ink">Circulation Queue</h2>
                   <p className="text-[11px] font-sans text-ink-muted uppercase tracking-widest italic mt-1">Pending collections and recent transitions</p>
                </div>
                <Link to="/admin/pickups" className="text-[10px] font-sans font-bold uppercase tracking-widest text-brown border-b border-brown/20 pb-1 hover:text-espresso transition-all">
                   Manage All Requests →
                </Link>
             </div>

             <div className="space-y-4">
                {stats.pendingPickups?.length > 0 ? stats.pendingPickups.slice(0, 5).map(p => (
                   <div key={p.id} className="bg-parchment border border-border-warm p-5 flex gap-6 items-center group hover:bg-white transition-all shadow-sm">
                      <div className="w-16 h-24 shrink-0 shadow-lg grayscale-[0.3] group-hover:grayscale-0 transition-all">
                         <BookCover book={p.Book} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-brown bg-brown/5 px-2 py-0.5 border border-brown/10">Reservation</span>
                            <span className="text-[10px] font-mono text-ink-muted">Ref: BV-{p.id}</span>
                         </div>
                         <Link to={`/book/${p.Book?.id}`} className="block group/title">
                            <h3 className="font-serif text-xl font-bold text-ink truncate mb-2 group-hover/title:text-brown transition-colors">{p.Book?.title}</h3>
                         </Link>
                         <div className="flex flex-wrap gap-4 text-ink-muted">
                            <div className="flex items-center gap-1.5">
                               <div className="w-5 h-5 bg-espresso text-cream flex items-center justify-center rounded-full text-[8px] font-bold">
                                  {p.User?.name?.[0]}
                               </div>
                               <span className="text-xs font-sans font-medium">{p.User?.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 border-l border-border-warm pl-4">
                               <Calendar size={12} />
                               <span className="text-xs font-sans">{p.pickupDate ? new Date(p.pickupDate).toLocaleDateString() : '—'}</span>
                            </div>
                         </div>
                      </div>
                      <div className="shrink-0 flex gap-2">
                         <button 
                           onClick={() => handleConfirmPickup(p.id)}
                           className="bg-espresso text-cream px-6 py-2 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md"
                         >
                            Confirm Pickup
                         </button>
                      </div>
                   </div>
                )) : (
                   <div className="py-20 text-center border-4 border-dashed border-border-warm opacity-30 font-serif italic text-xl">
                      The circulation desk is clear.
                   </div>
                )}
             </div>
          </section>

          {/* RECENT ACTIVITY TABLE */}
          <section>
             <h2 className="font-serif text-2xl font-bold text-ink mb-6">Recent Log Entries</h2>
             <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                         <th className="px-6 py-4 border-b border-parchment/10">Member</th>
                         <th className="px-6 py-4 border-b border-parchment/10">Volume</th>
                         <th className="px-6 py-4 border-b border-parchment/10 text-center">Status</th>
                         <th className="px-6 py-4 border-b border-parchment/10 text-right">Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-warm">
                      {stats.recentBorrows?.length > 0 ? stats.recentBorrows.slice(0, 8).map(b => (
                         <tr key={b.id} className="hover:bg-cream/40 transition-colors group">
                            <td className="px-6 py-4 flex items-center gap-3">
                               <div className="w-6 h-6 bg-brown text-cream flex items-center justify-center rounded-full text-[9px] font-bold">
                                  {b.User?.name?.[0]}
                               </div>
                               <span className="text-[13px] font-sans font-bold text-ink">{b.User?.name}</span>
                            </td>
                            <td className="px-6 py-4 text-[13px] font-sans text-ink-muted truncate max-w-[140px] italic">
                               <Link to={`/book/${b.Book?.id}`} className="hover:text-brown transition-colors">
                                  {b.Book?.title}
                               </Link>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                                  ${b.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 
                                    b.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 
                                    'bg-parchment text-ink-muted border-border-warm'}`}>
                                  {b.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right text-[11px] font-sans text-ink-muted">
                               {new Date(b.createdAt).toLocaleDateString()}
                            </td>
                         </tr>
                      )) : (
                        <tr><td colSpan="4" className="px-6 py-10 text-center italic text-ink-muted">Archive is empty.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </section>
        </div>

        {/* SIDEBAR STATS */}
        <div className="lg:col-span-2 space-y-10">
           <section className="bg-parchment border border-border-warm p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brown/5 rounded-full -mr-10 -mt-10" />
              <h2 className="font-serif text-xl font-bold text-ink mb-6 flex items-center gap-2">
                 <AlertCircle size={18} className="text-red-500" /> Outstanding Fines
              </h2>
              <div className="space-y-4">
                 {stats.unpaidFines?.length > 0 ? stats.unpaidFines.map(f => (
                    <div key={f.id} className="flex justify-between items-center pb-4 border-b border-border-deep group">
                       <div>
                          <div className="text-[13px] font-sans font-bold text-ink group-hover:text-red-600 transition-colors">{f.User?.name}</div>
                          <div className="text-[10px] font-sans text-ink-muted italic truncate max-w-[120px]">{f.Borrow?.Book?.title}</div>
                       </div>
                       <span className="font-mono text-sm font-bold text-red-600">₹{parseFloat(f.amount || 0).toFixed(2)}</span>
                    </div>
                 )) : (
                    <div className="text-center py-6 text-sm italic text-ink-muted font-serif">No unsettled financial obligations.</div>
                 )}
              </div>
           </section>

           <section className="bg-parchment border border-border-warm p-8 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-ink mb-6">Genre Pulse</h2>
              <div className="space-y-5">
                 {stats.genreStats?.map((item, idx) => (
                    <div key={idx} className="space-y-2 group">
                       <div className="flex justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted group-hover:text-brown transition-colors">
                          <span>{item.genre}</span>
                          <span>{item.count}</span>
                       </div>
                       <div className="h-1.5 bg-border-warm relative overflow-hidden">
                          <div 
                             className="h-full bg-brown group-hover:bg-espresso transition-all duration-1000 ease-out"
                             style={{ width: `${Math.min(100, (item.count / (stats.totalBooks || 1)) * 100)}%` }} 
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           <section className="bg-parchment border border-border-warm p-8 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-ink mb-6">Recent Broadcasts</h3>
              <div className="space-y-4">
                 {stats.announcements?.slice(0, 3).map(a => (
                    <div key={a.id} className="border-l-2 border-gold/30 pl-4 py-1">
                       <div className="text-[10px] font-sans text-ink-muted mb-1 opacity-60 font-bold">{new Date(a.created_at).toLocaleDateString()}</div>
                       <div className="text-[13px] font-sans font-bold text-ink leading-tight hover:text-brown cursor-default transition-colors">{a.title}</div>
                    </div>
                 ))}
              </div>
           </section>
        </div>

      </div>
    </>
  );
};

export default Dashboard;

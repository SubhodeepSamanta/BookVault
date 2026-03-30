import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  BookMarked, 
  AlertCircle, 
  IndianRupee, 
  CalendarCheck, 
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Loader2
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

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

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
    fetchStats();
  }, [user, navigate]);

  if (!user || user.role !== 'admin' || loading || !stats) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brown mb-4" size={40} />
        <span className="text-ink-muted font-sans uppercase tracking-widest text-xs">
          {loading ? 'Initializing Command Center...' : 'Establishing Secure Connection...'}
        </span>
      </div>
    );
  }

  const handlePickupAction = async (id, newStatus, message, type) => {
    try {
      if (newStatus === 'active') {
        await api.put(`/borrows/${id}/confirm-pickup`);
      } else {
        // For other status updates, we might still use a general route or handle specifically
        // But for this PR, 'active' (confirm) is the main one.
        // If it's 'rejected', we can just mark the borrow as cancelled
        await api.put(`/borrows/${id}/return`); // Or implement a specific cancel
      }
      addToast(message, type);
      // Refresh stats
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      addToast('Action failed', 'error');
    }
  };

  const handleRestockExpired = async () => {
    try {
      const res = await api.post('/borrows/batch-restock');
      addToast(res.data.message, 'success');
      // Refresh stats
      const resp = await api.get('/admin/stats');
      setStats(resp.data);
    } catch (err) {
      addToast('Failed to restock expired reservations', 'error');
    }
  };

  const markFinePaid = async (id) => {
    try {
      await api.put(`/fines/${id}/admin-pay`);
      addToast('Fine marked as paid.', 'success');
      // Refresh stats
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      addToast('Action failed', 'error');
    }
  };

  return (
    <>
      {/* ── STAT CARDS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Books', val: stats.totalBooks, delta: '+3', color: 'brown', icon: BookOpen },
          { label: 'Active Members', val: stats.activeMembers, delta: '+47', color: 'blue', icon: Users },
          { label: 'Books Borrowed', val: stats.activeBorrows, delta: '+124', color: 'amber', icon: BookMarked },
          { label: 'Overdue Returns', val: stats.overdueCount, delta: '+1', color: 'red', icon: AlertCircle, negative: stats.overdueCount > 0 }
        ].map((s, idx) => (
          <div key={idx} className="bg-parchment border border-border-warm p-6 shadow-sm group hover:border-brown transition-colors">
            <div className="flex items-center justify-between mb-4">
               <div className={`p-2 bg-cream border border-border-warm text-ink-muted group-hover:bg-brown group-hover:text-cream transition-colors`}>
                  <s.icon size={20} />
               </div>
               <div className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${s.negative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  <TrendingUp size={10} />
                  Live Data
               </div>
            </div>
            <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-1">{s.label}</div>
            <div className="font-serif text-4xl font-bold text-ink">{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── SECONDARY STATS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-cream border border-border-warm p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center">
                  <IndianRupee size={20} />
               </div>
               <div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Fine Revenue</div>
                  <div className="font-serif text-xl font-bold text-ink">₹{stats.collectedFines.toFixed(2)}</div>
               </div>
            </div>
            <div className="text-[10px] font-sans font-bold text-red-600 bg-red-50 px-2 py-1 uppercase tracking-tighter">₹{stats.outstandingFines.toFixed(2)} Unpaid</div>
         </div>
         <div className="bg-cream border border-border-warm p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CalendarCheck size={20} />
               </div>
               <div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Total Pickups</div>
                  <div className="font-serif text-xl font-bold text-ink">{stats.pendingPickupsCount}</div>
               </div>
            </div>
            <div className="text-[10px] font-sans font-bold text-purple-600 bg-purple-50 px-2 py-1 uppercase tracking-tighter">Pending Actions</div>
         </div>
         <div className="bg-cream border border-border-warm p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center">
                  <Star size={20} />
               </div>
               <div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Avg Book Rating</div>
                  <div className="font-serif text-xl font-bold text-ink">{stats.avgRating}★</div>
               </div>
            </div>
            <div className="text-[10px] font-sans font-bold text-ink-muted px-2 py-1 uppercase tracking-tighter">{stats.totalReviews} Reviews</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        
        {/* LEFT COLUMN (60%) */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* RECENT BORROWS */}
          <section>
             <div className="flex justify-between items-end mb-6">
                <div>
                   <h2 className="font-serif text-2xl font-bold text-ink underline decoration-gold/30 underline-offset-8 decoration-4">Recent Borrows</h2>
                </div>
                <Link to="/admin/users" className="text-[11px] font-sans font-bold uppercase tracking-widest text-brown border-b border-brown/30 hover:text-espresso transition-colors">
                   View all activity →
                </Link>
             </div>

             <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                         <th className="px-5 py-4 font-bold border-b border-parchment/10">Member</th>
                         <th className="px-5 py-4 font-bold border-b border-parchment/10">Book</th>
                         <th className="px-5 py-4 font-bold border-b border-parchment/10">Borrowed</th>
                         <th className="px-5 py-4 font-bold border-b border-parchment/10">Due Date</th>
                         <th className="px-5 py-4 font-bold border-b border-parchment/10">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-warm">
                      {stats.recentBorrows.length > 0 ? stats.recentBorrows.map((b) => (
                        <tr key={b.id} className="hover:bg-cream/50 transition-colors group">
                           <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-7 h-7 bg-brown text-cream flex items-center justify-center rounded-full text-[10px] font-bold">
                                    {b.User?.name?.split(' ').map(n=>n[0]).join('')}
                                 </div>
                                 <div className="text-[13px] font-sans font-bold text-ink group-hover:text-brown transition-colors">{b.User?.name}</div>
                              </div>
                           </td>
                           <td className="px-5 py-4">
                              <div className="text-[13px] font-sans font-bold text-ink truncate max-w-[140px]">{b.Book?.title}</div>
                           </td>
                           <td className="px-5 py-4 text-[12px] font-sans text-ink-muted">
                              {new Date(b.borrowed_at).toLocaleDateString()}
                           </td>
                           <td className="px-5 py-4 text-[12px] font-sans text-ink-muted">
                              {new Date(b.due_date).toLocaleDateString()}
                           </td>
                           <td className="px-5 py-4">
                              <div className="flex flex-col items-start gap-1">
                                 <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                                    ${b.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 
                                      b.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 
                                      'bg-parchment text-ink-muted border-border-warm'}`}>
                                    {b.status}
                                 </span>
                              </div>
                           </td>
                        </tr>
                      )) : (
                        <tr>
                           <td colSpan="5" className="px-5 py-10 text-center text-ink-muted italic font-sans text-sm">No recent borrows found.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </section>

          {/* PENDING PICKUPS */}
          <section>
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                   <h2 className="font-serif text-2xl font-bold text-ink">Pending Pickups</h2>
                   <span className="bg-amber-100 text-amber-700 text-[10px] font-sans font-bold px-2 py-0.5 uppercase tracking-widest">{stats.pendingPickups.length} pending</span>
                </div>
                <button 
                  onClick={handleRestockExpired}
                  className="text-[10px] font-sans font-bold uppercase tracking-widest text-brown border border-brown/30 px-3 py-1.5 hover:bg-brown/5 transition-colors"
                >
                  Restock Expired
                </button>
             </div>

             <div className="space-y-4">
                {stats.pendingPickups.length > 0 ? stats.pendingPickups.map(p => (
                   <div key={p.id} className="bg-parchment border border-amber-200 p-5 flex gap-6 items-start shadow-sm group hover:bg-white transition-colors">
                      <div className="shrink-0 scale-75 -mt-2 -ml-2">
                         {/* Mini book cover representation */}
                         <div className="w-[50px] h-[75px] bg-espresso border-l-4 border-gold shadow-md flex items-center justify-center p-2">
                            <span className="text-[6px] text-parchment font-serif text-center font-bold leading-tight uppercase opacity-60">{p.Book?.title}</span>
                         </div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="text-[11px] font-sans font-bold text-amber-700 uppercase tracking-widest mb-1">Reservation ID: {p.id}</div>
                         <h3 className="font-serif text-lg font-bold text-ink mb-3 group-hover:text-brown transition-colors">{p.Book?.title}</h3>
                         
                         <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2">
                               <div className="w-5 h-5 bg-brown text-cream flex items-center justify-center rounded-full text-[9px] font-bold">
                                 {p.User?.name?.split(' ').map(n=>n[0]).join('')}
                               </div>
                               <span className="text-xs font-sans font-medium text-ink">{p.User?.name}</span>
                               <span className="text-[10px] font-mono text-ink-muted opacity-60">#{p.User?.card_id}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-ink-muted">
                               <MapPin size={12} className="text-brown" />
                               <span className="text-xs font-sans">{p.Branch?.name || 'Default Branch'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-ink-muted">
                               <Clock size={12} className="text-brown" />
                               <span className="text-xs font-sans font-bold">
                                 {p.pickup_date ? new Date(p.pickup_date).toLocaleDateString() : 'TBD'} · {p.pickup_time_slot || 'Anytime'}
                               </span>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 self-center">
                         <button 
                            onClick={() => handlePickupAction(p.id, 'active', 'Pickup confirmed.', 'success')}
                            className="bg-green-600 text-white text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-green-700 transition-colors shadow-sm"
                         >
                            Confirm Pickup
                         </button>
                         <button 
                            onClick={() => handlePickupAction(p.id, 'cancelled', 'Reservation cancelled.', 'error')}
                            className="border border-red-300 text-red-600 text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-red-50 transition-colors"
                         >
                            Reject/Cancel
                         </button>
                      </div>
                   </div>
                )) : (
                  <div className="py-10 bg-cream/30 border border-border-warm text-center text-ink-muted italic font-sans text-sm">No pending pickups.</div>
                )}
             </div>
          </section>

        </div>

        {/* RIGHT COLUMN (40%) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* OUTSTANDING FINES */}
          <section className="bg-parchment border border-border-warm p-8 shadow-sm">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="font-serif text-xl font-bold text-ink mb-1">Outstanding Fines</h2>
                   <p className="text-[12px] font-sans text-red-600 font-bold uppercase tracking-wider">₹{stats.outstandingFines.toFixed(2)} Total Unpaid</p>
                </div>
                <IndianRupee className="text-red-200" size={32} />
             </div>

             <div className="space-y-4">
                {stats.unpaidFines.length > 0 ? stats.unpaidFines.map(f => (
                   <div key={f.id} className="border-b border-border-deep pb-4 flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                         <div className="w-7 h-7 bg-red-100 text-red-600 flex items-center justify-center rounded-full text-[10px] font-bold">
                            {f.User?.name?.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <div className="min-w-0">
                            <div className="text-[13px] font-sans font-bold text-ink truncate group-hover:text-red-600 transition-colors">{f.User?.name}</div>
                            <div className="text-[11px] font-sans text-ink-muted italic truncate max-w-[120px]">{f.Borrow?.Book?.title}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="font-mono text-sm font-bold text-red-600">₹{parseFloat(f.amount).toFixed(2)}</span>
                         <button 
                            onClick={() => markFinePaid(f.id)}
                            className="text-[10px] font-sans font-bold text-brown uppercase tracking-widest underline underline-offset-4 hover:text-espresso transition-colors"
                         >
                            Mark Paid
                         </button>
                      </div>
                   </div>
                )) : (
                  <div className="text-center text-ink-muted italic font-sans text-sm py-4">No outstanding fines.</div>
                )}
             </div>
          </section>

          {/* GENRE DISTRIBUTION */}
          <section className="bg-parchment border border-border-warm p-8 shadow-sm">
             <h2 className="font-serif text-xl font-bold text-ink mb-6">Collection by Genre</h2>
             
             <div className="space-y-5">
                {stats.genreStats.map((item, idx) => (
                   <div key={idx} className="space-y-2 group">
                      <div className="flex justify-between items-center text-[11px] font-sans font-bold uppercase tracking-widest">
                         <span className="text-ink group-hover:text-brown transition-colors">{item.genre}</span>
                         <span className="text-ink-muted">{item.count}</span>
                      </div>
                      <div className="h-2 bg-border-warm relative group-hover:bg-border-deep transition-colors">
                         <div 
                            className="h-full bg-brown group-hover:bg-espresso transition-all duration-700 ease-out"
                            style={{ width: `${Math.min(100, (item.count / 10) * 100)}%` }} 
                         />
                      </div>
                   </div>
                ))}
             </div>
          </section>

          {/* ANNOUNCEMENTS */}
          <section className="bg-parchment border border-border-warm p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold text-ink">Announcements</h2>
                <Link to="/admin/content" className="text-[10px] font-sans font-bold uppercase tracking-widest text-brown underline underline-offset-4">Manage</Link>
             </div>

             <div className="space-y-6">
                {stats.announcements.length > 0 ? stats.announcements.map(a => (
                   <div key={a.id} className="relative pl-4 border-l-2 border-gold/40">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-green-50 text-green-700 px-1.5 py-0.5 border border-green-100">Live</span>
                         <span className="text-[10px] font-sans text-ink-muted font-bold">{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-[13px] font-sans font-bold text-ink line-clamp-1 hover:text-brown transition-colors cursor-default">{a.title}</h3>
                   </div>
                )) : (
                  <div className="text-ink-muted italic text-[12px] font-sans">No active announcements.</div>
                )}
             </div>
          </section>

        </div>

      </div>
    </>
  );
};

export default Dashboard;

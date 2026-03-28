import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  MessageSquare,
  Bookmark,
  Archive,
  CalendarCheck,
  Loader2,
  Trash2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCover from '../components/BookCover';

const branches = [
  { id: 1, name: 'Main Campus Library', address: 'Block A, University Road', openTime: '8:00 AM', closeTime: '9:00 PM' },
  { id: 2, name: 'North Wing Reading Centre', address: 'Block C, North Campus', openTime: '9:00 AM', closeTime: '7:00 PM' },
  { id: 3, name: 'South Block Library', address: 'Block F, South Campus', openTime: '10:00 AM', closeTime: '6:00 PM' },
];

const timeSlots = [
  '9:00 AM – 10:00 AM', '10:00 AM – 11:00 AM', '11:00 AM – 12:00 PM',
  '1:00 PM – 2:00 PM', '2:00 PM – 3:00 PM', '3:00 PM – 4:00 PM', '4:00 PM – 5:00 PM',
];

const ReservationsPickups = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [eligibleBooks, setEligibleBooks] = useState([]); // Those "Ready to Claim" or on active loans
  
  // Form State
  const [formData, setFormData] = useState({
    bookId: '',
    branch: '',
    slotDate: '',
    slotTime: ''
  });

  useEffect(() => {
    if (!user) { navigate('/'); openAuthModal('login'); return; }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [resRes, pickRes, borrowsRes] = await Promise.all([
          api.get('/reservations/my'),
          api.get('/pickups/my'),
          api.get('/borrows/my')
        ]);
        
        setReservations(resRes.data.reservations);
        setPickups(pickRes.data.pickups);
        
        // Find books eligible for pickup:
        // 1. In "notified" status in reservations
        // 2. Active loans that might need a "return via pickup" (though usually pickup is for collection)
        // Let's stick to reservations ready to claim for now as per design
        const readyToClaim = resRes.data.reservations.filter(r => r.status === 'notified').map(r => ({
          id: r.book_id,
          title: r.Book?.title,
          type: 'Ready to Claim'
        }));
        setEligibleBooks(readyToClaim);
      } catch (err) {
        console.error('Error fetching data:', err);
        addToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate, openAuthModal]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brown mb-4" size={40} />
        <span className="text-ink-muted font-sans uppercase tracking-widest text-xs">Accessing Logistics Queue...</span>
      </div>
    );
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pickups', formData);
      addToast('Pickup scheduled! Pending admin confirmation.', 'success');
      setFormData({ bookId: '', branch: '', slotDate: '', slotTime: '' });
      // Refresh pickups
      const res = await api.get('/pickups/my');
      setPickups(res.data.pickups);
      setActiveTab('pickups');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to schedule pickup', 'error');
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      addToast('Reservation cancelled', 'success');
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      addToast('Failed to cancel reservation', 'error');
    }
  };

  const handleCancelPickup = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pickup?')) return;
    try {
      await api.put(`/pickups/${id}/cancel`);
      addToast('Pickup cancelled', 'success');
      setPickups(prev => prev.map(p => p.id === id ? { ...p, status: 'cancelled' } : p));
    } catch (err) {
      addToast('Failed to cancel pickup', 'error');
    }
  };

  const calculateHoursLeft = (notifiedAt) => {
    const notified = new Date(notifiedAt);
    const deadline = new Date(notified.getTime() + 48 * 60 * 60 * 1000);
    const now = new Date();
    const diff = deadline - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* PAGE HEADER */}
      <header className="bg-espresso py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-4">
            <span className="text-[12px] font-sans text-parchment/40 uppercase tracking-widest">
              <Link to="/" className="hover:text-gold transition-colors">Home</Link> / <span className="text-parchment/60 font-bold">Reservations</span>
            </span>
          </nav>
          <h1 className="font-serif text-5xl text-cream font-bold mb-1">Reservations & Pickups</h1>
          <p className="font-sans text-sm italic text-parchment/60">Manage your waitlists and scheduled collections.</p>
          
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="bg-parchment/10 border border-parchment/20 rounded-none px-4 py-2 flex items-center gap-2">
              <Bookmark size={14} className="text-parchment/70" />
              <span className="text-[12px] font-sans text-parchment/70 font-medium">{reservations.filter(r => r.status === 'waiting').length} Waitlist</span>
            </div>
            <div className="bg-parchment/10 border border-parchment/20 rounded-none px-4 py-2 flex items-center gap-2 text-parchment/70">
              <Archive size={14} />
              <span className="text-[12px] font-sans font-medium">{pickups.filter(p => p.status === 'pending' || p.status === 'confirmed').length} Active Pickups</span>
            </div>
            <div className="bg-gold/20 border border-gold/40 rounded-none px-4 py-2 flex items-center gap-2 text-gold">
              <CheckCircle size={14} />
              <span className="text-[12px] font-sans font-bold">{reservations.filter(r => r.status === 'notified').length} Ready to Claim</span>
            </div>
          </div>
        </div>
      </header>

      {/* STICKY TAB ROW */}
      <div className="bg-parchment border-b border-border-warm sticky top-[64px] z-40">
        <div className="max-w-5xl mx-auto px-6 flex">
          {['reservations', 'pickups', 'schedule a pickup'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-8 py-4 text-[12px] uppercase tracking-[0.15em] font-sans transition-all
                ${activeTab === tab 
                  ? 'text-ink font-bold border-b-2 border-brown bg-cream' 
                  : 'text-ink-muted hover:text-ink hover:bg-cream/50'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 pb-20">
        {activeTab === 'reservations' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="bg-parchment/60 border border-border-warm border-l-4 border-l-brown p-4 mb-8 flex gap-3 text-ink-soft">
                <Info size={18} className="text-brown shrink-0" />
                <p className="text-[13px] font-sans leading-relaxed">
                  When all copies of a book are borrowed, you can join the waitlist. You'll be notified here when a copy becomes available. You have 48 hours to claim it.
                </p>
             </div>

             <div className="space-y-4">
                {reservations.length > 0 ? reservations.map(res => {
                  const book = res.Book;
                  const hoursLeft = res.status === 'notified' ? calculateHoursLeft(res.updated_at) : null;
                  
                  return (
                    <div key={res.id} className={`bg-parchment border border-border-warm overflow-hidden ${res.status === 'expired' || res.status === 'cancelled' ? 'opacity-60' : ''}`}>
                       <div className="px-5 py-4 flex gap-5 items-start">
                          <div className="w-16 shrink-0 shadow-md">
                             <BookCover book={book} className="w-full h-full !rounded-none" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                             <h3 className="font-serif text-lg font-bold text-ink truncate">{book?.title}</h3>
                             <p className="font-sans text-xs italic text-ink-muted mb-3">by {book?.author}</p>
                             <div className="text-[11px] font-sans text-ink-muted font-medium">Added to waitlist: {new Date(res.created_at).toLocaleDateString()}</div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-2">
                             <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 border flex items-center gap-1.5 ${
                                res.status === 'waiting' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                res.status === 'notified' ? 'bg-green-50 text-green-700 border-green-200' :
                                'bg-gray-100 text-gray-500 border-gray-200'
                             }`}>
                                {res.status === 'waiting' ? `Queue Position #${res.queue_position}` :
                                 res.status === 'notified' ? (
                                   <>
                                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                     Ready to Claim
                                   </>
                                 ) : res.status}
                             </span>
                          </div>
                       </div>

                       {res.status === 'waiting' && (
                         <div className="px-5 pb-5 pt-2 border-t border-border-warm/50">
                            <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-3">Your position in queue:</div>
                            <div className="flex gap-3 items-center">
                               {[1, 2, 3, 4, 5].map(pos => (
                                 <div key={pos} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-sans font-bold border-2 ${
                                   pos < res.queue_position ? 'bg-brown border-brown text-cream' :
                                   pos === res.queue_position ? 'border-gold text-gold ring-2 ring-gold/20' :
                                   'border-border-warm text-ink-muted'
                                 }`}>
                                    {pos}
                                 </div>
                               ))}
                               <div className="h-px flex-1 bg-border-warm mx-2" />
                               <span className="text-[11px] font-sans text-ink-muted italic">Dynamic tracking enabled</span>
                            </div>
                            <button 
                              onClick={() => handleCancelReservation(res.id)}
                              className="mt-4 text-[10px] font-sans font-bold text-red-500 uppercase tracking-widest underline underline-offset-4 hover:text-red-700 flex items-center gap-1"
                            >
                               <Trash2 size={12} /> Cancel Waitlist
                            </button>
                         </div>
                       )}

                       {res.status === 'notified' && (
                         <div className="px-5 pb-5">
                            <div className="bg-green-50 border border-green-200 p-4 rounded-none flex flex-col md:flex-row justify-between items-center gap-4">
                               <div className="flex gap-3 items-start">
                                  <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                                  <div>
                                     <h4 className="text-sm font-sans font-bold text-green-800">A copy is available for you!</h4>
                                     <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
                                        You have 48 hours to borrow or schedule a pickup before this reservation expires.
                                     </p>
                                     <div className="text-xs font-bold text-green-700 mt-2">{hoursLeft} hours remaining</div>
                                  </div>
                               </div>
                               <div className="flex gap-2 w-full md:w-auto">
                                  <button 
                                    onClick={() => navigate(`/book/${res.book_id}`)}
                                    className="flex-1 md:flex-none bg-espresso text-cream px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-espresso-light transition-colors"
                                  >
                                     View & Borrow
                                  </button>
                                  <button 
                                    onClick={() => { setActiveTab('schedule a pickup'); setFormData(prev => ({ ...prev, bookId: res.book_id })); }}
                                    className="flex-1 md:flex-none border border-brown text-brown px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-brown hover:text-cream transition-all"
                                  >
                                     Schedule Pickup
                                  </button>
                               </div>
                            </div>
                         </div>
                       )}
                    </div>
                  );
                }) : (
                  <div className="py-20 flex flex-col items-center text-center">
                    <Bookmark size={40} className="text-border-deep mb-4" />
                    <h2 className="font-serif text-2xl font-bold text-ink mb-2">No reservations</h2>
                    <p className="font-sans text-sm text-ink-muted max-w-sm">When a book you want is unavailable, add it to your waitlist from the Book Detail page.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'pickups' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
             {pickups.length > 0 ? pickups.map(pickup => {
                const book = pickup.Book;
                const statusStyles = {
                  pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  confirmed: 'bg-green-50 text-green-700 border-green-200',
                  rejected: 'bg-red-50 text-red-700 border-red-200',
                  collected: 'bg-parchment text-ink-muted border-border-warm',
                  cancelled: 'bg-gray-100 text-gray-500 border-gray-200'
                };
                
                return (
                  <div key={pickup.id} className={`bg-parchment border border-border-warm overflow-hidden group ${pickup.status === 'cancelled' ? 'opacity-60' : ''}`}>
                     <div className="bg-espresso px-5 py-3 flex justify-between items-center border-b border-parchment/10">
                        <div className="flex items-center gap-2 text-cream">
                           <MapPin size={12} className="text-gold" />
                           <span className="text-[11px] font-sans font-bold uppercase tracking-widest">{pickup.branch}</span>
                        </div>
                        <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border flex items-center gap-1.5 ${statusStyles[pickup.status]}`}>
                           {(pickup.status === 'pending' || pickup.status === 'confirmed') && <Clock size={10} />}
                           {pickup.status === 'collected' && <Archive size={10} />}
                           {pickup.status}
                        </span>
                     </div>
                     
                     <div className="px-5 py-5 flex gap-6">
                        <div className="w-20 shrink-0 shadow-lg">
                           <BookCover book={book} className="w-full h-full !rounded-none" />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-serif text-lg font-bold text-ink">{book?.title}</h3>
                           <p className="font-sans text-xs italic text-ink-muted mb-4">by {book?.author}</p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-1.5 text-ink-muted">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Date</span>
                                 </div>
                                 <div className="text-sm font-sans font-bold text-ink">{new Date(pickup.slot_date).toLocaleDateString()}</div>
                              </div>
                              <div className="space-y-1">
                                 <div className="flex items-center gap-1.5 text-ink-muted">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Time Slot</span>
                                 </div>
                                 <div className="text-sm font-sans font-bold text-ink">{pickup.slot_time}</div>
                              </div>
                           </div>

                           {pickup.admin_note && (
                             <div className="bg-cream border border-border-warm mt-5 px-4 py-2.5 rounded-none flex gap-3 text-ink-muted">
                                <MessageSquare size={14} className="shrink-0 mt-0.5" />
                                <span className="text-[12px] font-sans italic leading-relaxed">{pickup.admin_note}</span>
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="px-5 py-3 border-t border-border-warm flex justify-end items-center gap-4 bg-cream/30">
                        {pickup.status === 'pending' && (
                          <button 
                            onClick={() => handleCancelPickup(pickup.id)}
                            className="text-[11px] font-sans font-bold text-red-500 uppercase tracking-widest underline underline-offset-4 hover:text-red-700"
                          >
                             Cancel Pickup
                          </button>
                        )}
                        {pickup.status === 'confirmed' && (
                          <span className="text-[10px] font-sans text-ink-muted italic mr-auto">Please bring your library card ID: <span className="font-mono font-bold text-ink">{user.card_id}</span></span>
                        )}
                     </div>
                  </div>
                );
             }) : (
              <div className="py-20 flex flex-col items-center text-center">
                 <Archive size={40} className="text-border-deep mb-4" />
                 <h2 className="font-serif text-2xl font-bold text-ink mb-2">No pickups scheduled</h2>
                 <p className="font-sans text-sm text-ink-muted max-w-sm">Schedule a pickup for your reserved volumes or confirmed loans.</p>
              </div>
             )}
          </div>
        )}

        {activeTab === 'schedule a pickup' && (
          <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
             <div className="bg-parchment border border-border-warm p-8 shadow-sm">
                <h2 className="font-serif text-3xl font-bold text-ink mb-2">Schedule a Pickup</h2>
                <p className="font-sans text-[13px] text-ink-muted mb-10 leading-relaxed">
                   Choose a branch, date, and time slot to collect your book. Admin confirmation typically arrives within 2 hours.
                </p>

                <form onSubmit={handleFormSubmit} className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5">Select Volume</label>
                      <select 
                        required
                        className="w-full bg-cream border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans font-medium text-ink focus:border-brown focus:outline-none cursor-pointer"
                        value={formData.bookId}
                        onChange={(e) => setFormData(prev => ({ ...prev, bookId: e.target.value }))}
                      >
                         <option value="">Choose a volume from your queue...</option>
                         {eligibleBooks.map(b => (
                           <option key={b.id} value={b.id}>{b.title} — {b.type}</option>
                         ))}
                      </select>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5 block">Select Library Branch</label>
                      <div className="grid grid-cols-1 gap-3">
                         {branches.map(branch => (
                           <label 
                            key={branch.id} 
                            onClick={() => setFormData(prev => ({ ...prev, branch: branch.name }))}
                            className={`
                              relative border p-5 cursor-pointer flex flex-col transition-all duration-300 rounded-none shadow-sm
                              ${formData.branch === branch.name ? 'border-brown bg-brown/5 ring-1 ring-brown' : 'border-border-warm bg-cream hover:border-brown/40'}
                            `}
                           >
                              {formData.branch === branch.name && (
                                <div className="absolute top-4 right-4 bg-brown text-cream p-1 rounded-full">
                                   <CheckCircle size={12} />
                                 </div>
                              )}
                              <span className="text-sm font-sans font-bold text-ink mb-1">{branch.name}</span>
                              <span className="text-[13px] font-sans text-ink-muted mb-3">{branch.address}</span>
                              <div className="flex items-center gap-2 text-[11px] font-sans text-ink-muted">
                                 <Clock size={12} />
                                 <span>{branch.openTime} – {branch.closeTime}</span>
                              </div>
                           </label>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5 block">Pickup Date</label>
                      <input 
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-cream border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans text-ink focus:border-brown focus:outline-none"
                        value={formData.slotDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, slotDate: e.target.value }))}
                      />
                   </div>

                   <div className="space-y-4">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5 block">Select Time Slot</label>
                      <div className="flex flex-wrap gap-2.5">
                         {timeSlots.map((slot) => (
                           <button
                             key={slot}
                             type="button"
                             onClick={() => setFormData(prev => ({ ...prev, slotTime: slot }))}
                             className={`
                               px-4 py-2.5 text-[12px] font-sans font-medium transition-all duration-300 border
                               ${formData.slotTime === slot ? 'bg-brown text-cream border-brown' : 'bg-cream border-border-warm text-ink hover:border-brown'}
                             `}
                           >
                              {slot}
                           </button>
                         ))}
                      </div>
                   </div>

                   <button 
                    type="submit"
                    className="w-full bg-espresso text-cream py-4.5 font-sans font-bold uppercase tracking-[0.2em] text-sm hover:bg-espresso-light transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                      <CalendarCheck size={18} />
                      Confirm Pickup
                   </button>
                </form>
             </div>
          </div>
        )}
      </main>
      
      <footer className="bg-espresso py-8 border-t border-parchment/10 text-center">
         <p className="text-[10px] font-sans text-parchment/30 uppercase tracking-[0.3em]">Institutional Member · BookVault Library Portal · Est. 1987</p>
      </footer>
    </div>
  );
};

export default ReservationsPickups;

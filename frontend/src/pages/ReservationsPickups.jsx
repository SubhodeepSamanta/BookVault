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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCover from '../components/BookCover';
import { books } from '../data/books';

const mockReservations = [
  {
    id: 1, bookId: 4, status: 'waiting',
    queuePos: 2, createdAt: '2024-11-28'
  },
  {
    id: 2, bookId: 8, status: 'notified',
    queuePos: 1, createdAt: '2024-11-20',
    notifiedAt: '2024-12-01T08:00:00'
  },
  {
    id: 3, bookId: 12, status: 'expired',
    queuePos: 1, createdAt: '2024-11-10'
  },
];

const mockPickups = [
  {
    id: 1, bookId: 1, branch: 'Main Campus Library',
    slotDate: '2024-12-05', slotTime: '10:00 AM – 11:00 AM',
    status: 'confirmed', adminNote: 'Please bring your library card.'
  },
  {
    id: 2, bookId: 6, branch: 'North Wing Reading Centre',
    slotDate: '2024-12-08', slotTime: '2:00 PM – 3:00 PM',
    status: 'pending', adminNote: null
  },
  {
    id: 3, bookId: 9, branch: 'South Block Library',
    slotDate: '2024-11-15', slotTime: '11:00 AM – 12:00 PM',
    status: 'collected', adminNote: null
  },
];

const branches = [
  {
    id: 1, name: 'Main Campus Library',
    address: 'Block A, University Road',
    openTime: '8:00 AM', closeTime: '9:00 PM'
  },
  {
    id: 2, name: 'North Wing Reading Centre',
    address: 'Block C, North Campus',
    openTime: '9:00 AM', closeTime: '7:00 PM'
  },
  {
    id: 3, name: 'South Block Library',
    address: 'Block F, South Campus',
    openTime: '10:00 AM', closeTime: '6:00 PM'
  },
];

const timeSlots = [
  '9:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
  '1:00 PM – 2:00 PM',
  '2:00 PM – 3:00 PM',
  '3:00 PM – 4:00 PM',
  '4:00 PM – 5:00 PM',
];

const ReservationsPickups = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('reservations');
  
  // Form State
  const [formData, setFormData] = useState({
    bookId: '',
    branchId: '',
    date: '',
    timeSlot: ''
  });

  useEffect(() => {
    if (!user) { navigate('/'); openAuthModal('login') }
  }, [user]);

  if (!user) return null;

  const eligibleBooks = [
    { id: 1, title: 'The Great Gatsby', type: 'Active Loan' },
    { id: 8, title: 'Homer: The Odyssey', type: 'Ready to Claim' }
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addToast('Pickup scheduled! Pending admin confirmation.', 'success');
    setFormData({ bookId: '', branchId: '', date: '', timeSlot: '' });
    setActiveTab('pickups');
  };

  const calculateHoursLeft = (notifiedAt) => {
    const notified = new Date(notifiedAt);
    const deadline = new Date(notified.getTime() + 48 * 60 * 60 * 1000);
    const today = new Date('2024-12-01T10:00:00'); // Mocked "today"
    const diff = deadline - today;
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
              <span className="text-[12px] font-sans text-parchment/70 font-medium">1 Waitlist</span>
            </div>
            <div className="bg-parchment/10 border border-parchment/20 rounded-none px-4 py-2 flex items-center gap-2 text-parchment/70">
              <Archive size={14} />
              <span className="text-[12px] font-sans font-medium">2 Pickups</span>
            </div>
            <div className="bg-gold/20 border border-gold/40 rounded-none px-4 py-2 flex items-center gap-2 text-gold">
              <CheckCircle size={14} />
              <span className="text-[12px] font-sans font-bold">1 Ready to Claim</span>
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
                {mockReservations.length > 0 ? mockReservations.map(res => {
                  const book = books.find(b => b.id === res.bookId);
                  const hoursLeft = res.notifiedAt ? calculateHoursLeft(res.notifiedAt) : null;
                  
                  return (
                    <div key={res.id} className={`bg-parchment border border-border-warm overflow-hidden ${res.status === 'expired' ? 'opacity-60' : ''}`}>
                       <div className="px-5 py-4 flex gap-5 items-start">
                          <div className="w-16 shrink-0 shadow-md">
                             <BookCover book={book} className="w-full h-full !rounded-none" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                             <h3 className="font-serif text-lg font-bold text-ink truncate">{book.title}</h3>
                             <p className="font-sans text-xs italic text-ink-muted mb-3">by {book.author}</p>
                             <div className="text-[11px] font-sans text-ink-muted font-medium">Added to waitlist: {res.createdAt}</div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-2">
                             <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 border flex items-center gap-1.5 ${
                               res.status === 'waiting' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                               res.status === 'notified' ? 'bg-green-50 text-green-700 border-green-200' :
                               'bg-gray-100 text-gray-500 border-gray-200'
                             }`}>
                                {res.status === 'waiting' ? `Queue Position #${res.queuePos}` :
                                 res.status === 'notified' ? (
                                   <>
                                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                     Ready to Claim
                                   </>
                                 ) : 'Expired'}
                             </span>
                          </div>
                       </div>

                       {res.status === 'waiting' && (
                         <div className="px-5 pb-5 pt-2 border-t border-border-warm/50">
                            <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-3">Your position in queue:</div>
                            <div className="flex gap-3 items-center">
                               {[1, 2, 3].map(pos => (
                                 <div key={pos} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-sans font-bold border-2 ${
                                   pos < res.queuePos ? 'bg-brown border-brown text-cream' :
                                   pos === res.queuePos ? 'border-gold text-gold ring-2 ring-gold/20' :
                                   'border-border-warm text-ink-muted'
                                 }`}>
                                    {pos}
                                 </div>
                               ))}
                               <div className="h-px flex-1 bg-border-warm mx-2" />
                               <span className="text-[11px] font-sans text-ink-muted italic">Estimated wait: ~14 days</span>
                            </div>
                            <button className="mt-4 text-[10px] font-sans font-bold text-red-500 uppercase tracking-widest underline underline-offset-4 hover:text-red-700">
                               Cancel Waitlist
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
                                  <button className="flex-1 md:flex-none bg-espresso text-cream px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-espresso-light transition-colors">
                                     Borrow Now
                                  </button>
                                  <button 
                                    onClick={() => { setActiveTab('schedule a pickup'); setFormData(prev => ({ ...prev, bookId: res.bookId })); }}
                                    className="flex-1 md:flex-none border border-brown text-brown px-6 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-brown hover:text-cream transition-all"
                                  >
                                     Schedule Pickup
                                  </button>
                               </div>
                            </div>
                         </div>
                       )}

                       {res.status === 'expired' && (
                         <div className="px-5 pb-4 border-t border-border-warm/50 pt-3 flex justify-between items-center">
                            <span className="text-xs font-sans text-ink-muted italic">This reservation expired. You can rejoin the waitlist.</span>
                            <button className="text-xs font-sans font-bold text-brown uppercase tracking-widest underline underline-offset-4">
                               Rejoin Waitlist
                            </button>
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
             {mockPickups.map(pickup => {
                const book = books.find(b => b.id === pickup.bookId);
                const statusStyles = {
                  pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  confirmed: 'bg-green-50 text-green-700 border-green-200',
                  rejected: 'bg-red-50 text-red-700 border-red-200',
                  collected: 'bg-parchment text-ink-muted border-border-warm'
                };
                
                return (
                  <div key={pickup.id} className="bg-parchment border border-border-warm overflow-hidden group">
                     <div className="bg-espresso px-5 py-3 flex justify-between items-center border-b border-parchment/10">
                        <div className="flex items-center gap-2 text-cream">
                           <MapPin size={12} className="text-gold" />
                           <span className="text-[11px] font-sans font-bold uppercase tracking-widest">{pickup.branch}</span>
                        </div>
                        <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border flex items-center gap-1.5 ${statusStyles[pickup.status]}`}>
                           {pickup.status === 'pending' && <Clock size={10} />}
                           {pickup.status === 'confirmed' && <CheckCircle size={10} />}
                           {pickup.status === 'rejected' && <XCircle size={10} />}
                           {pickup.status === 'collected' && <Archive size={10} />}
                           {pickup.status}
                        </span>
                     </div>
                     
                     <div className="px-5 py-5 flex gap-6">
                        <div className="w-20 shrink-0 shadow-lg">
                           <BookCover book={book} className="w-full h-full !rounded-none" />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-serif text-lg font-bold text-ink">{book.title}</h3>
                           <p className="font-sans text-xs italic text-ink-muted mb-4">by {book.author}</p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-1.5 text-ink-muted">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Date</span>
                                 </div>
                                 <div className="text-sm font-sans font-bold text-ink">{pickup.slotDate}</div>
                              </div>
                              <div className="space-y-1">
                                 <div className="flex items-center gap-1.5 text-ink-muted">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Time Slot</span>
                                 </div>
                                 <div className="text-sm font-sans font-bold text-ink">{pickup.slotTime}</div>
                              </div>
                           </div>

                           {pickup.adminNote && (
                             <div className="bg-cream border border-border-warm mt-5 px-4 py-2.5 rounded-none flex gap-3 text-ink-muted">
                                <MessageSquare size={14} className="shrink-0 mt-0.5" />
                                <span className="text-[12px] font-sans italic leading-relaxed">{pickup.adminNote}</span>
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="px-5 py-3 border-t border-border-warm flex justify-end items-center gap-4 bg-cream/30">
                        {pickup.status === 'pending' && (
                          <button className="text-[11px] font-sans font-bold text-red-500 uppercase tracking-widest underline underline-offset-4 hover:text-red-700">
                             Cancel Pickup
                          </button>
                        )}
                        {pickup.status === 'confirmed' && (
                          <>
                             <span className="text-[10px] font-sans text-ink-muted italic mr-auto">Please bring your library card ID: <span className="font-mono font-bold text-ink">{user.cardId}</span></span>
                             <button 
                                onClick={() => navigate(`/book/${pickup.bookId}`)}
                                className="text-[11px] font-sans font-bold text-brown uppercase tracking-widest underline underline-offset-4 hover:text-espresso transition-colors"
                             >
                                View Details
                             </button>
                          </>
                        )}
                        {pickup.status === 'collected' && (
                          <button 
                            onClick={() => navigate('/catalogue')}
                            className="text-[11px] font-sans font-bold text-brown uppercase tracking-widest underline underline-offset-4 hover:text-espresso transition-colors"
                          >
                             Borrow Again
                          </button>
                        )}
                     </div>
                  </div>
                );
             })}
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
                   {/* FIELD 1: Book Selection */}
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

                   {/* FIELD 2: Branch Selection */}
                   <div className="space-y-4">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5 block">Select Library Branch</label>
                      <div className="grid grid-cols-1 gap-3">
                         {branches.map(branch => (
                           <label 
                            key={branch.id} 
                            onClick={() => setFormData(prev => ({ ...prev, branchId: branch.id }))}
                            className={`
                              relative border p-5 cursor-pointer flex flex-col transition-all duration-300 rounded-none shadow-sm
                              ${formData.branchId === branch.id ? 'border-brown bg-brown/5 ring-1 ring-brown' : 'border-border-warm bg-cream hover:border-brown/40'}
                            `}
                           >
                              {formData.branchId === branch.id && (
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

                   {/* FIELD 3: Date Selection */}
                   <div className="space-y-2">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5 block">Pickup Date</label>
                      <input 
                        type="date"
                        required
                        min="2024-12-01"
                        max="2024-12-15"
                        className="w-full bg-cream border border-border-warm rounded-none px-4 py-3.5 text-sm font-sans text-ink focus:border-brown focus:outline-none"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                      <p className="text-[11px] font-sans text-ink-muted italic pl-1">Pickup slots available up to 14 days in advance.</p>
                   </div>

                   {/* FIELD 4: Time Slot Selection */}
                   <div className="space-y-4">
                      <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-0.5 block">Select Time Slot</label>
                      <div className="flex flex-wrap gap-2.5">
                         {timeSlots.map((slot, index) => {
                           const isFull = index === 2 || index === 5; // Mark slots 3 and 6 as full
                           return (
                             <button
                               key={slot}
                               type="button"
                               disabled={isFull}
                               onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                               className={`
                                 px-4 py-2.5 text-[12px] font-sans font-medium transition-all duration-300 border
                                 ${isFull ? 'bg-border-warm text-ink-muted cursor-not-allowed opacity-60 border-border-warm' :
                                   formData.timeSlot === slot ? 'bg-brown text-cream border-brown' : 'bg-cream border-border-warm text-ink hover:border-brown'}
                               `}
                             >
                                {slot} {isFull && '(Full)'}
                             </button>
                           );
                         })}
                      </div>
                   </div>

                   {/* SUMMARY BOX */}
                   {formData.bookId && formData.branchId && formData.date && formData.timeSlot && (
                     <div className="bg-espresso/5 border border-border-warm p-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-4 pb-2 border-b border-border-warm/50">Pickup Summary</div>
                        <div className="space-y-3">
                           {[
                             ['Volume', eligibleBooks.find(b => b.id === parseInt(formData.bookId))?.title],
                             ['Branch', branches.find(b => b.id === formData.branchId)?.name],
                             ['Date', formData.date],
                             ['Time Slot', formData.timeSlot]
                           ].map(([label, value]) => (
                             <div key={label} className="flex justify-between items-center text-[13px] font-sans">
                               <span className="text-ink-muted">{label}</span>
                               <span className="text-ink font-bold">{value}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   <button 
                    type="submit"
                    className="w-full bg-espresso text-cream py-4.5 font-sans font-bold uppercase tracking-[0.2em] text-sm hover:bg-espresso-light transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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

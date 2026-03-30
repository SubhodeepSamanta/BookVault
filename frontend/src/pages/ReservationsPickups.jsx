import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Info, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  Archive,
  CalendarCheck,
  Loader2,
  BookOpen,
  ArrowRight,
  History,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCover from '../components/BookCover';

const branches = [
  { id: 1, name: 'Main Campus Library', address: 'Block A, University Road' },
  { id: 2, name: 'North Wing Reading Centre', address: 'Block C, North Campus' },
  { id: 3, name: 'South Block Library', address: 'Block F, South Campus' },
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
  const [activeTab, setActiveTab] = useState('Pickups');
  const [borrows, setBorrows] = useState([]);
  
  // Return scheduling state
  const [schedulingReturnFor, setSchedulingReturnFor] = useState(null);
  const [returnFormData, setReturnFormData] = useState({
    returnDate: '',
    returnTime: '',
    branchId: 1
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/borrows/my');
      setBorrows(res.data.borrows);
    } catch (err) {
      addToast('Failed to load logistics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/'); openAuthModal('login'); return; }
    fetchData();
  }, [user]);

  const handleRequestExtension = async (id) => {
    try {
      await api.put(`/borrows/${id}/request-extension`);
      addToast('Extension requested. Pending admin approval.', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Extension request failed', 'error');
    }
  };

  const handleScheduleReturn = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/borrows/${schedulingReturnFor}/schedule-return`, returnFormData);
      addToast('Return session scheduled!', 'success');
      setSchedulingReturnFor(null);
      fetchData();
    } catch (err) {
      addToast('Failed to schedule return', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brown mb-4" size={40} />
        <span className="text-ink-muted font-sans uppercase tracking-[0.25em] text-[10px] font-bold">Synchronizing Pickup Schedule...</span>
      </div>
    );
  }

  const categorized = {
    Pickups: borrows.filter(b => b.status === 'reserved'),
    Active: borrows.filter(b => b.status === 'active' || b.status === 'overdue'),
    Archive: borrows.filter(b => b.status === 'returned' || b.status === 'cancelled')
  };

  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* HEADER */}
      <header className="bg-espresso pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl text-cream font-bold mb-2">Institutional Logistics</h1>
          <p className="font-sans text-sm italic text-parchment/60">Track your reservations, active loans, and scheduled returns.</p>
          
          <div className="mt-8 flex gap-8 border-b border-parchment/10">
            {['Pickups', 'Active', 'Archive'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] transition-all relative
                  ${activeTab === tab ? 'text-gold' : 'text-parchment/40 hover:text-parchment/60'}
                `}
              >
                {tab === 'Pickups' && `Scheduled Pickups (${categorized.Pickups.length})`}
                {tab === 'Active' && `Active Loans (${categorized.Active.length})`}
                {tab === 'Archive' && `Circulation History`}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold" />}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {activeTab === 'Pickups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {categorized.Pickups.length > 0 ? categorized.Pickups.map(item => (
              <div key={item.id} className="bg-parchment border border-border-warm flex overflow-hidden shadow-sm hover:border-brown transition-all group">
                <div className="w-32 shrink-0 bg-espresso/5 border-r border-border-warm">
                  <BookCover book={item.Book} className="w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-ink leading-tight">{item.Book.title}</h3>
                      <p className="text-[11px] font-sans italic text-ink-muted">by {item.Book.author}</p>
                    </div>
                    <div className="bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-widest">
                      Reserved
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-border-warm">
                    <div className="flex items-center gap-2 text-ink-muted">
                      <MapPin size={12} className="text-brown" />
                      <span className="text-[11px] font-sans font-bold uppercase tracking-widest">{item.Branch?.name || 'Main Campus'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-ink-muted" />
                          <span className="text-xs font-sans font-bold text-ink">{new Date(item.pickupDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-ink-muted" />
                          <span className="text-xs font-sans font-bold text-ink">{item.pickupTimeSlot}</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-sans font-bold text-gold uppercase bg-gold/5 px-2 py-1">
                        Stock: {item.Book?.available_copies} Left
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 bg-cream/50 p-2 border border-dashed border-border-warm">
                    <Info size={12} className="text-brown" />
                    <span className="text-[10px] font-sans italic text-ink-muted leading-tight">Bring your student ID for verification at the counter.</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 flex flex-col items-center opacity-40">
                <Archive size={48} className="mb-4 text-espresso" />
                <p className="font-serif text-xl italic">No scheduled collections pending.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Active' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {categorized.Active.length > 0 ? categorized.Active.map(item => (
              <div key={item.id} className="bg-parchment border border-border-warm shadow-md flex flex-col md:flex-row">
                <div className="w-full md:w-48 shrink-0 bg-espresso p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-24 shadow-2xl mb-4">
                    <BookCover book={item.Book} />
                  </div>
                  <div className="text-[10px] font-sans font-bold text-parchment/40 uppercase tracking-[0.2em]">Loan Period</div>
                  <div className="text-cream font-serif text-lg">14 Days</div>
                </div>

                <div className="flex-1 p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-ink mb-1">{item.Book.title}</h2>
                      <p className="font-sans text-sm text-ink-muted">Loan Reference: <code className="text-brown font-bold text-xs bg-parchment px-2 py-0.5 border border-border-warm">BV-{item.id.toString().padStart(5, '0')}</code></p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-1 border mb-1 ${item.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {item.status}
                      </div>
                      <span className="text-[11px] font-sans text-ink-muted font-medium italic">Handed over on {new Date(item.borrowed_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-border-warm">
                    <div>
                      <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 italic">Due Date</div>
                      <div className={`text-sm font-sans font-bold ${item.status === 'overdue' ? 'text-red-600' : 'text-ink'}`}>
                        {new Date(item.due_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 italic">Extension Status</div>
                      <div className="text-sm font-sans font-medium text-ink flex items-center gap-2">
                        {item.hasExtended ? (
                          <span className="text-espresso font-bold flex items-center gap-1.5"><CheckCircle size={14} className="text-green-600" /> Extended (Final)</span>
                        ) : item.extensionStatus === 'requested' ? (
                          <span className="text-gold font-bold flex items-center gap-1.5"><Clock size={14} /> Request Pending</span>
                        ) : 'Eligible for 14d Renewal'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 italic">Return Logistics</div>
                      <div className="text-sm font-sans font-medium text-ink">
                        {item.returnStatus === 'scheduled' ? (
                          <span className="text-green-700 font-bold">Scheduled for {new Date(item.returnDate).toLocaleDateString()}</span>
                        ) : 'Not Scheduled'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {!item.hasExtended && item.extensionStatus !== 'requested' && (
                      <button 
                        onClick={() => handleRequestExtension(item.id)}
                        className="bg-brown text-cream px-8 py-3 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-espresso transition-all flex items-center gap-2"
                      >
                         Request Extension
                      </button>
                    )}
                    {item.returnStatus !== 'scheduled' && (
                      <button 
                        onClick={() => setSchedulingReturnFor(item.id)}
                        className="border border-espresso text-espresso px-8 py-3 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-espresso hover:text-cream transition-all flex items-center gap-2"
                      >
                         Schedule Return
                      </button>
                    )}
                    {item.returnStatus === 'scheduled' && (
                       <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 border border-green-100 text-[11px] font-sans font-bold uppercase tracking-widest">
                          <CheckCircle size={14} /> Return In Progress
                       </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 flex flex-col items-center opacity-40">
                <BookOpen size={48} className="mb-4 text-espresso" />
                <p className="font-serif text-xl italic">No active loans found in your account.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Archive' && (
           <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                       <th className="px-6 py-4 border-b border-parchment/10">Archives Volume</th>
                       <th className="px-6 py-4 border-b border-parchment/10 text-center">Outcome</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Dates</th>
                       <th className="px-6 py-4 border-b border-parchment/10 text-right">Details</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-warm">
                    {categorized.Archive.length > 0 ? categorized.Archive.map(item => (
                       <tr key={item.id} className="hover:bg-cream/40 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 shrink-0">
                                   <BookCover book={item.Book} className="!rounded-none" />
                                </div>
                                <div>
                                   <div className="text-[13px] font-sans font-bold text-ink">{item.Book.title}</div>
                                   <div className="text-[11px] font-sans text-ink-muted italic">{item.Book.author}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                               ${item.status === 'returned' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500'}`}>
                                {item.status}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-[11px] font-sans text-ink-muted">
                                {item.borrowed_at ? `Borrowed: ${new Date(item.borrowed_at).toLocaleDateString()}` : 'Not Picked Up'}
                             </div>
                             {item.returned_at && <div className="text-[11px] font-sans text-ink-muted">Returned: {new Date(item.returned_at).toLocaleDateString()}</div>}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <Link to={`/book/${item.book_id}`} className="text-brown hover:text-espresso transition-colors">
                                <ArrowRight size={16} className="inline" />
                             </Link>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan="4" className="px-6 py-10 text-center text-ink-muted italic font-serif">Your circulation history is currently empty.</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        )}
      </main>

      {/* SCHEDULE RETURN MODAL */}
      {schedulingReturnFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-espresso/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-cream max-w-md w-full p-8 border-t-8 border-espresso shadow-2xl relative animate-in zoom-in-95 duration-400">
              <h2 className="font-serif text-3xl font-bold text-ink mb-2">Schedule Return</h2>
              <p className="font-sans text-[13px] text-ink-muted mb-8 italic">Please select a time to handover the volume to our archives.</p>
              
              <form onSubmit={handleScheduleReturn} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted block ml-0.5">Preferred Date</label>
                    <input 
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-parchment border border-border-warm px-4 py-3 text-sm font-sans focus:border-espresso focus:outline-none"
                      value={returnFormData.returnDate}
                      onChange={(e) => setReturnFormData(p => ({ ...prev, returnDate: e.target.value }))}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted block ml-0.5">Select Time Slot</label>
                    <div className="flex flex-wrap gap-2">
                       {timeSlots.map(slot => (
                         <button 
                           key={slot}
                           type="button"
                           onClick={() => setReturnFormData(p => ({ ...prev, returnTime: slot }))}
                           className={`px-3 py-2 text-[11px] font-sans font-medium border transition-all ${returnFormData.returnTime === slot ? 'bg-espresso text-cream border-espresso' : 'bg-parchment border-border-warm text-ink-muted hover:border-espresso'}`}
                         >
                            {slot}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted block ml-0.5">Return Branch</label>
                    <div className="space-y-2">
                       {branches.map(b => (
                         <label key={b.id} className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${returnFormData.branchId === b.id ? 'bg-espresso/5 border-espresso ring-1 ring-espresso/20' : 'border-border-warm hover:border-espresso/40'}`}>
                            <input 
                              type="radio" 
                              className="accent-espresso" 
                              checked={returnFormData.branchId === b.id} 
                              onChange={() => setReturnFormData(p => ({ ...prev, branchId: b.id }))}
                            />
                            <div>
                               <div className="text-[12px] font-sans font-bold text-ink">{b.name}</div>
                               <div className="text-[10px] font-sans text-ink-muted uppercase tracking-widest">{b.address}</div>
                            </div>
                         </label>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setSchedulingReturnFor(null)}
                      className="flex-1 border border-border-warm py-4 text-[11px] font-sans font-bold uppercase tracking-widest text-ink-muted hover:bg-gray-50 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-espresso text-cream py-4 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                    >
                       Confirm Schedule
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPickups;

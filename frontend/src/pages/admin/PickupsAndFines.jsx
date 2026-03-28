import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  FileText,
  IndianRupee,
  Loader2
} from 'lucide-react';
import api from '../../api/client';
import BookCover from '../../components/BookCover';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const PickupsAndFines = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Pickup Requests');
  const [pickupList, setPickupList] = useState([]);
  const [fineList, setFineList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pickupsRes, finesRes] = await Promise.all([
        api.get('/pickups/all'),
        api.get('/fines/all')
      ]);
      setPickupList(pickupsRes.data.data);
      setFineList(finesRes.data.data);
    } catch (err) {
      addToast('Failed to sync administrative records.', 'error');
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
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/pickups/${id}/status`, { 
        status, 
        admin_note: status === 'rejected' ? rejectNote || 'Request denied.' : null 
      });
      addToast(`Pickup request ${status} successfully.`, status === 'confirmed' || status === 'collected' ? 'success' : 'error');
      setShowRejectInput(null);
      setRejectNote('');
      fetchData();
    } catch (err) {
      addToast('Critical error updating pickup status.', 'error');
    }
  };

  const markFinePaid = async (id) => {
    try {
      await api.put(`/fines/${id}/pay`);
      addToast('Financial obligation settled.', 'success');
      fetchData();
    } catch (err) {
      addToast('Fine settlement failed.', 'error');
    }
  };

  const filteredPickups = pickupList.filter(p => filter === 'All' || p.status.toLowerCase() === filter.toLowerCase());
  const filteredFines = fineList.filter(f => filter === 'All' || (filter === 'Paid' ? f.paid : !f.paid));

  return (
    <>
      {/* TABS */}
      <div className="flex gap-10 border-b border-border-warm mb-8">
        {[
          { name: 'Pickup Requests', count: pickupList.filter(p=>p.status==='pending').length },
          { name: 'Fine Management', count: fineList.filter(f=>!f.paid).length }
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => { setActiveTab(tab.name); setFilter('All'); }}
            className={`pb-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-2
              ${activeTab === tab.name ? 'text-brown' : 'text-ink-muted hover:text-ink'}
            `}
          >
            {tab.name}
            {tab.count > 0 && (
               <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold ${activeTab === tab.name ? 'bg-brown text-cream' : 'bg-parchment border border-border-warm text-ink-muted'}`}>
                  {tab.count}
               </span>
            )}
            {activeTab === tab.name && <div className="absolute bottom-0 left-0 w-full h-1 bg-brown animate-in fade-in slide-in-from-bottom-2 duration-300" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-parchment/30 border border-border-warm">
          <Loader2 className="animate-spin text-brown mb-4" size={32} />
          <span className="text-xs font-sans uppercase tracking-widest text-ink-muted font-bold">Synchronizing Archives...</span>
        </div>
      ) : (
        <>
          {activeTab === 'Pickup Requests' && (
            <div className="animate-in fade-in duration-500">
               {/* SUMMARY ROW */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total Requests', val: pickupList.length, color: 'text-ink' },
                    { label: 'Pending Approval', val: pickupList.filter(p=>p.status==='pending').length, color: 'text-amber-600' },
                    { label: 'Confirmed', val: pickupList.filter(p=>p.status==='confirmed').length, color: 'text-green-600' },
                    { label: 'Collected', val: pickupList.filter(p=>p.status==='collected').length, color: 'text-ink-muted' }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-parchment border border-border-warm p-5 shadow-sm group hover:border-brown transition-all">
                       <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2">{s.label}</div>
                       <div className={`font-serif text-3xl font-bold ${s.color}`}>{s.val}</div>
                    </div>
                  ))}
               </div>

               {/* FILTERS */}
               <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                  {['All', 'Pending', 'Confirmed', 'Rejected', 'Collected'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-6 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all border
                        ${filter === f ? 'bg-espresso text-cream border-espresso shadow-md' : 'bg-cream border-border-warm text-ink-muted hover:border-brown hover:text-brown'}
                      `}
                    >
                       {f}
                    </button>
                  ))}
               </div>

               {/* LIST */}
               <div className="space-y-6">
                  {filteredPickups.length > 0 ? filteredPickups.map(p => (
                    <div key={p.id} className="bg-white border border-border-warm overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                       <div className="bg-espresso px-6 py-3 flex justify-between items-center group-hover:bg-black transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="w-6 h-6 bg-brown text-cream flex items-center justify-center rounded-full text-[10px] font-bold">
                                {p.User?.name?.split(' ').map(n=>n[0]).join('')}
                             </div>
                             <div className="flex items-baseline gap-2">
                                <span className="text-[13px] font-sans font-bold text-cream">{p.User?.name}</span>
                                <span className="text-[10px] font-mono text-parchment/40">{p.User?.card_id}</span>
                             </div>
                          </div>
                          <span className={`text-[9px] font-sans font-bold uppercase tracking-[0.2em] px-2 py-0.5 border
                             ${p.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                               p.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : 
                               p.status === 'collected' ? 'bg-parchment text-ink-muted border-border-warm opacity-60' :
                               'bg-red-100 text-red-600 border-red-200'}`}>
                             {p.status}
                          </span>
                       </div>

                       <div className="p-6 flex gap-8 items-start">
                          <div className="shrink-0 -mt-2 group-hover:rotate-1 transition-transform duration-500 shadow-xl">
                             <BookCover width={72} height={104} title={p.Book?.title} cover={{ bg: '#2D2416', accent: '#D97706', text: '#FFFBEB' }} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                             <h3 className="font-serif text-xl font-bold text-ink mb-4 group-hover:text-brown transition-colors truncate">{p.Book?.title}</h3>
                             
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-2.5">
                                   <MapPin size={14} className="text-brown mt-0.5" />
                                   <div>
                                      <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-0.5 font-bold italic">Location</div>
                                      <div className="text-sm font-sans font-medium text-ink">Main Campus Library</div>
                                   </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                   <Calendar size={14} className="text-brown mt-0.5" />
                                   <div>
                                      <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-0.5 font-bold italic">Date</div>
                                      <div className="text-sm font-sans font-medium text-ink">{new Date(p.pickup_date).toLocaleDateString()}</div>
                                   </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                   <Clock size={14} className="text-brown mt-0.5" />
                                   <div>
                                      <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-0.5 font-bold italic">Timeslot</div>
                                      <div className="text-sm font-sans font-medium text-ink uppercase">{p.timeslot}</div>
                                   </div>
                                </div>
                             </div>

                             {p.admin_note && (
                               <div className="mt-6 bg-cream border-l-4 border-amber-400 p-4 flex items-start gap-3 italic">
                                  <ShieldAlert size={14} className="text-amber-600 mt-1 shrink-0" />
                                  <div className="text-[13px] font-sans text-ink-muted">"{p.admin_note}"</div>
                               </div>
                            )}
                          </div>

                          <div className="shrink-0 w-44 flex flex-col gap-3 self-center border-l border-border-warm pl-8 ml-4">
                             {p.status === 'pending' ? (
                               <>
                                  {showRejectInput === p.id ? (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                       <input 
                                         type="text" 
                                         placeholder="Rejection reason..." 
                                         className="w-full bg-cream border border-border-warm px-3 py-2 text-xs font-sans focus:outline-none focus:border-red-400"
                                         value={rejectNote}
                                         onChange={(e) => setRejectNote(e.target.value)}
                                       />
                                       <div className="flex gap-1">
                                          <button 
                                            onClick={() => handleUpdateStatus(p.id, 'rejected')}
                                            className="flex-1 bg-red-600 text-white text-[9px] font-bold py-2 uppercase tracking-widest"
                                          >
                                             Confirm
                                          </button>
                                          <button 
                                            onClick={() => setShowRejectInput(null)}
                                            className="flex-1 border border-border-warm text-ink-muted text-[9px] font-bold py-2 uppercase tracking-widest"
                                          >
                                             Cancel
                                          </button>
                                       </div>
                                    </div>
                                  ) : (
                                    <>
                                       <button 
                                         onClick={() => handleUpdateStatus(p.id, 'confirmed')}
                                         className="w-full bg-green-600 text-white text-[10px] font-sans font-bold py-3 uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                       >
                                          Confirm
                                       </button>
                                       <button 
                                         onClick={() => setShowRejectInput(p.id)}
                                         className="w-full border border-red-200 text-red-600 text-[10px] font-sans font-bold py-3 uppercase tracking-widest hover:bg-red-50 transition-all"
                                       >
                                          Reject
                                       </button>
                                    </>
                                  )}
                               </>
                             ) : p.status === 'confirmed' ? (
                                <button 
                                  onClick={() => handleUpdateStatus(p.id, 'collected')}
                                  className="w-full bg-espresso text-cream text-[10px] font-sans font-bold py-3 uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                   <FileText size={14} /> Mark Collected
                                </button>
                             ) : (
                               <div className="text-center py-4 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted italic opacity-40">
                                  Archived
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  )) : (
                     <div className="py-20 text-center border-4 border-dashed border-border-warm font-serif italic text-ink-muted">No pickup requests found in the current ledger.</div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'Fine Management' && (
            <div className="animate-in fade-in duration-500">
               {/* SUMMARY ROW */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Total Fine Records', val: fineList.length, color: 'text-ink' },
                    { label: 'Outstanding Dues', val: `₹${fineList.filter(f=>!f.paid).reduce((sum,f)=>sum+(parseFloat(f.amount)||0), 0).toFixed(2)}`, color: 'text-red-600', large: true },
                    { label: 'Total Revenue', val: `₹${fineList.filter(f=>f.paid).reduce((sum,f)=>sum+(parseFloat(f.amount)||0), 0).toFixed(2)}`, color: 'text-green-600' }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-parchment border border-border-warm p-6 shadow-sm flex items-center justify-between group hover:border-brown transition-all">
                       <div>
                          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2 font-bold italic">{s.label}</div>
                          <div className={`font-serif ${s.large ? 'text-4xl' : 'text-3xl'} font-bold ${s.color}`}>{s.val}</div>
                       </div>
                       <IndianRupee className={`${s.color} opacity-10 group-hover:opacity-20 transition-opacity`} size={48} />
                    </div>
                  ))}
               </div>

               {/* FILTERS */}
               <div className="flex gap-2 mb-8">
                  {['All', 'Unpaid', 'Paid'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-8 py-2.5 text-[10px] font-sans font-bold uppercase tracking-widest transition-all border
                        ${filter === f ? 'bg-brown text-cream border-brown shadow-md' : 'bg-cream border-border-warm text-ink-muted hover:border-brown hover:text-brown'}
                      `}
                    >
                       {f}
                    </button>
                  ))}
               </div>

               {/* TABLE */}
               <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                           <th className="px-6 py-4 border-b border-parchment/10">Member</th>
                           <th className="px-6 py-4 border-b border-parchment/10">Resource</th>
                           <th className="px-6 py-4 border-b border-parchment/10 text-center">Days Overdue</th>
                           <th className="px-6 py-4 border-b border-parchment/10">Amount</th>
                           <th className="px-6 py-4 border-b border-parchment/10">Status</th>
                           <th className="px-6 py-4 border-b border-parchment/10 text-right">Settlement</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border-warm">
                        {filteredFines.length > 0 ? filteredFines.map(f => (
                          <tr key={f.id} className="hover:bg-cream/40 transition-colors group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-brown text-cream flex items-center justify-center rounded-full text-xs font-bold font-serif font-bold">
                                      {f.User?.name?.split(' ').map(n=>n[0]).join('')}
                                   </div>
                                   <div className="text-[13px] font-sans font-bold text-ink group-hover:text-brown transition-colors">{f.User?.name}</div>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="text-[13px] font-sans font-medium text-ink truncate max-w-[140px]">{f.Book?.title}</div>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className="text-[12px] font-sans font-bold text-ink-muted">
                                   {f.days_overdue} days
                                </span>
                             </td>
                             <td className="px-6 py-4 font-mono text-sm">
                                <span className={`font-bold ${f.paid ? 'text-green-700' : 'text-red-600'}`}>
                                   ₹{(parseFloat(f.amount) || 0).toFixed(2)}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                                   ${f.paid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                   {f.paid ? 'Paid' : 'Outstanding'}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                {!f.paid ? (
                                   <button 
                                     onClick={() => markFinePaid(f.id)}
                                     className="bg-green-600 text-white text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-green-700 shadow-sm"
                                   >
                                      Mark Paid
                                   </button>
                                ) : (
                                   <span className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest italic opacity-60">Settled</span>
                                )}
                             </td>
                          </tr>
                        )) : (
                          <tr>
                             <td colSpan="6" className="px-6 py-20 text-center text-ink-muted italic font-sans text-sm">No financial records found.</td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default PickupsAndFines;

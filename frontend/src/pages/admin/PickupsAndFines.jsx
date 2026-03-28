import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  ShieldAlert, 
  History, 
  FileText,
  Filter,
  Search,
  IndianRupee,
  ChevronRight
} from 'lucide-react';
import BookCover from '../../components/BookCover';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

// MOCK DATA
const mockAllPickups = [
  { id:1, userId:1, userName:'Alex Johnson',
    userCardId:'BV-2024-00042',
    bookId:1, bookTitle: 'The Great Gatsby', branch:'Main Campus Library',
    slotDate:'2024-12-05',
    slotTime:'10:00 AM – 11:00 AM',
    status:'pending', adminNote:null },
  { id:2, userId:2, userName:'Priya Sharma',
    userCardId:'BV-2024-00043',
    bookId:3, bookTitle: '1984', branch:'North Wing Reading Centre',
    slotDate:'2024-12-06',
    slotTime:'2:00 PM – 3:00 PM',
    status:'pending', adminNote:null },
  { id:3, userId:3, userName:'Liam Chen',
    userCardId:'BV-2024-00044',
    bookId:5, bookTitle: 'Sapiens', branch:'Main Campus Library',
    slotDate:'2024-12-04',
    slotTime:'11:00 AM – 12:00 PM',
    status:'confirmed',
    adminNote:'Please bring your card.' },
  { id:4, userId:5, userName:'Marcus Webb',
    userCardId:'BV-2024-00046',
    bookId:7, bookTitle: 'Meditations', branch:'South Block Library',
    slotDate:'2024-11-15',
    slotTime:'3:00 PM – 4:00 PM',
    status:'collected', adminNote:null },
];

const mockAllFines = [
  { id:1, userId:1, userName:'Alex Johnson',
    bookId:3, bookTitle: '1984', borrowId:2,
    amount:9.50, paid:false,
    daysOverdue:19, createdAt:'2024-11-16' },
  { id:2, userId:3, userName:'Liam Chen',
    bookId:7, bookTitle: 'Meditations', borrowId:5,
    amount:3.00, paid:false,
    daysOverdue:6, createdAt:'2024-11-20' },
  { id:3, userId:5, userName:'Marcus Webb',
    bookId:9, bookTitle: 'Pride and Prejudice', borrowId:6,
    amount:5.50, paid:true,
    daysOverdue:11, paidAt:'2024-11-25',
    txnId:'TXN7492810BV' },
  { id:4, userId:2, userName:'Priya Sharma',
    bookId:2, bookTitle: 'Brave New World', borrowId:7,
    amount:1.50, paid:true,
    daysOverdue:3, paidAt:'2024-10-30',
    txnId:'TXN3318847BV' },
];

const PickupsAndFines = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Pickup Requests');
  const [pickupList, setPickupList] = useState(mockAllPickups);
  const [fineList, setFineList] = useState(mockAllFines);
  const [filter, setFilter] = useState('All');
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const handleUpdateStatus = (id, status) => {
    setPickupList(prev => prev.map(p => p.id === id ? { ...p, status, adminNote: status === 'rejected' ? rejectNote || 'Request denied.' : p.adminNote } : p));
    addToast(`Pickup ${status}.`, status === 'confirmed' || status === 'collected' ? 'success' : 'error');
    setShowRejectInput(null);
    setRejectNote('');
  };

  const markFinePaid = (id) => {
    setFineList(prev => prev.map(f => f.id === id ? { ...f, paid: true, paidAt: '2024-12-02', txnId: `TXN${Math.floor(Math.random()*10000000)}BV` } : f));
    addToast('Fine marked as paid.', 'success');
  };

  const waiveFine = (id) => {
    if (window.confirm('Are you sure you want to waive this fine? This cannot be undone.')) {
      setFineList(prev => prev.filter(f => f.id !== id));
      addToast('Fine waived successfully.', 'success');
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
            {activeTab === tab.name && <div className="absolute bottom-0 left-0 w-full h-1 bg-brown animate-in fade-in slide-in-from-bottom-2" />}
          </button>
        ))}
      </div>

      {activeTab === 'Pickup Requests' && (
        <div className="animate-in fade-in duration-500">
           {/* SUMMARY ROW */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Requests', val: pickupList.length, color: 'ink' },
                { label: 'Pending', val: pickupList.filter(p=>p.status==='pending').length, color: 'amber-600' },
                { label: 'Confirmed', val: pickupList.filter(p=>p.status==='confirmed').length, color: 'green-600' },
                { label: 'Collected Today', val: pickupList.filter(p=>p.status==='collected').length, color: 'ink-muted' }
              ].map((s, idx) => (
                <div key={idx} className="bg-parchment border border-border-warm p-5 shadow-sm group hover:border-brown transition-all">
                   <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2">{s.label}</div>
                   <div className={`font-serif text-3xl font-bold text-${s.color}`}>{s.val}</div>
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

           {/* CARDS */}
           <div className="space-y-6">
              {filteredPickups.map(p => (
                <div key={p.id} className="bg-white border border-border-warm overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                   <div className="bg-espresso px-6 py-3 flex justify-between items-center group-hover:bg-black transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-6 h-6 bg-brown text-cream flex items-center justify-center rounded-full text-[10px] font-bold">
                            {p.userName.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <div className="flex items-baseline gap-2">
                            <span className="text-[13px] font-sans font-bold text-cream">{p.userName}</span>
                            <span className="text-[10px] font-mono text-parchment/40">{p.userCardId}</span>
                         </div>
                      </div>
                      <span className={`text-[9px] font-sans font-bold uppercase tracking-[0.2em] px-2 py-0.5 border
                         ${p.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                           p.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 
                           p.status === 'collected' ? 'bg-parchment text-ink-muted border-border-warm opacity-60' :
                           'bg-red-50 text-red-600 border-red-100'}`}>
                         {p.status}
                      </span>
                   </div>

                   <div className="p-6 flex gap-8 items-start">
                      <div className="shrink-0 -mt-2 group-hover:rotate-2 transition-transform duration-500 shadow-xl">
                         <BookCover width={72} height={104} title={p.bookTitle} cover={{ bg: '#2D2416', accent: '#D97706', text: '#FFFBEB' }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <h3 className="font-serif text-xl font-bold text-ink mb-4 group-hover:text-brown transition-colors">{p.bookTitle}</h3>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-start gap-2.5">
                               <MapPin size={14} className="text-brown mt-0.5" />
                               <div>
                                  <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-0.5">Pickup Location</div>
                                  <div className="text-sm font-sans font-medium text-ink">{p.branch}</div>
                               </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                               <Calendar size={14} className="text-brown mt-0.5" />
                               <div>
                                  <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-0.5">Date</div>
                                  <div className="text-sm font-sans font-medium text-ink">{p.slotDate}</div>
                               </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                               <Clock size={14} className="text-brown mt-0.5" />
                               <div>
                                  <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-0.5">Timeslot</div>
                                  <div className="text-sm font-sans font-medium text-ink">{p.slotTime}</div>
                               </div>
                            </div>
                         </div>

                         {p.adminNote && (
                           <div className="mt-6 bg-cream border border-border-warm p-4 flex items-start gap-3 italic">
                              <ShieldAlert size={14} className="text-amber-600 mt-1 shrink-0" />
                              <div className="text-[13px] font-sans text-ink-muted">"{p.adminNote}"</div>
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
                                     placeholder="Reason for rejection..." 
                                     className="w-full bg-cream border border-border-warm px-3 py-2 text-xs font-sans focus:outline-none focus:border-red-400"
                                     value={rejectNote}
                                     onChange={(e) => setRejectNote(e.target.value)}
                                   />
                                   <div className="flex gap-2">
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
                                      <CheckCircle size={14} /> Confirm
                                   </button>
                                   <button 
                                     onClick={() => setShowRejectInput(p.id)}
                                     className="w-full border border-red-200 text-red-600 text-[10px] font-sans font-bold py-3 uppercase tracking-widest hover:bg-red-50 transition-all"
                                   >
                                      Reject Request
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
                              Archived Action
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              ))}
              {filteredPickups.length === 0 && (
                 <div className="py-20 text-center border-4 border-dashed border-border-warm font-serif italic text-ink-muted">No pickup requests found for this category.</div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'Fine Management' && (
        <div className="animate-in fade-in duration-500">
           {/* SUMMARY ROW */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Fine Records', val: fineList.length, color: 'ink' },
                { label: 'Outstanding Dues', val: `₹${fineList.filter(f=>!f.paid).reduce((sum,f)=>sum+f.amount, 0).toFixed(2)}`, color: 'red-600', large: true },
                { label: 'Revenue Collected', val: `₹${fineList.filter(f=>f.paid).reduce((sum,f)=>sum+f.amount, 0).toFixed(2)}`, color: 'green-600' }
              ].map((s, idx) => (
                <div key={idx} className="bg-parchment border border-border-warm p-6 shadow-sm flex items-center justify-between group hover:border-brown transition-all">
                   <div>
                      <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2">{s.label}</div>
                      <div className={`font-serif ${s.large ? 'text-4xl' : 'text-3xl'} font-bold text-${s.color}`}>{s.val}</div>
                   </div>
                   <IndianRupee className={`text-${s.color} opacity-10 group-hover:opacity-20 transition-opacity`} size={48} />
                </div>
              ))}
           </div>

           {/* FILTERS */}
           <div className="flex gap-2 mb-8">
              {['All', 'Unpaid', 'Paid'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-8 py-2.5 rounded-none text-[10px] font-sans font-bold uppercase tracking-widest transition-all border
                    ${filter === f ? 'bg-brown text-cream border-brown' : 'bg-cream border-border-warm text-ink-muted hover:border-brown hover:text-brown'}
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
                       <th className="px-6 py-4 border-b border-parchment/10">Inciting Book</th>
                       <th className="px-6 py-4 border-b border-parchment/10 text-center">Overdue</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Amount</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Status</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Timestamp</th>
                       <th className="px-6 py-4 border-b border-parchment/10 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-warm">
                    {filteredFines.map(f => (
                      <tr key={f.id} className="hover:bg-cream/40 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-brown text-cream flex items-center justify-center rounded-full text-xs font-bold font-serif">
                                  {f.userName.split(' ').map(n=>n[0]).join('')}
                               </div>
                               <div className="text-[13px] font-sans font-bold text-ink group-hover:text-brown transition-colors">{f.userName}</div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="text-[13px] font-sans font-medium text-ink truncate max-w-[140px]">{f.bookTitle}</div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`text-[12px] font-sans font-bold ${f.daysOverdue > 14 ? 'text-red-600' : 'text-ink-muted'}`}>
                               {f.daysOverdue} days
                            </span>
                         </td>
                         <td className="px-6 py-4 font-mono text-sm">
                            <span className={`font-bold ${f.paid ? 'text-green-700' : 'text-red-600 underline underline-offset-4 decoration-red-200'}`}>
                               ₹{f.amount.toFixed(2)}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                               ${f.paid ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                               {f.paid ? 'Paid' : 'Unpaid'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-[11px] font-sans text-ink-muted italic">
                            {f.paid ? `Paid on ${f.paidAt}` : `Created ${f.createdAt}`}
                         </td>
                         <td className="px-6 py-4 text-right">
                            {!f.paid ? (
                               <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => markFinePaid(f.id)}
                                    className="bg-green-600 text-white text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-green-700 shadow-sm"
                                  >
                                     Mark Paid
                                  </button>
                                  <button 
                                    onClick={() => waiveFine(f.id)}
                                    className="border border-amber-400 text-amber-700 text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-amber-50"
                                  >
                                     Waive
                                  </button>
                               </div>
                            ) : (
                               <button 
                                onClick={() => addToast(`Receipt ID: ${f.txnId}`, 'success')}
                                className="text-brown text-[11px] font-sans font-bold uppercase tracking-widest underline underline-offset-4 hover:text-espresso"
                               >
                                  Receipt
                               </button>
                            )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
                 {filter !== 'Paid' && (
                    <tfoot className="bg-cream/50">
                       <tr>
                          <td colSpan="3" className="px-6 py-4 text-right text-[11px] font-sans font-bold uppercase tracking-widest text-ink-muted">Outstanding Total</td>
                          <td className="px-6 py-4 font-mono text-lg font-bold text-red-600">₹{fineList.filter(f=>!f.paid).reduce((sum,f)=>sum+f.amount, 0).toFixed(2)}</td>
                          <td colSpan="3"></td>
                       </tr>
                    </tfoot>
                 )}
              </table>
           </div>
        </div>
      )}

    </>
  );
};

export default PickupsAndFines;

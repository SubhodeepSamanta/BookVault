import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  FileText,
  IndianRupee,
  Loader2,
  XCircle,
  ExternalLink,
  ChevronRight,
  History
} from 'lucide-react';
import api from '../../api/client';
import BookCover from '../../components/BookCover';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';

const PickupsAndFines = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Pickups');
  const [loading, setLoading] = useState(true);
  const [borrowList, setBorrowList] = useState([]);
  const [fineList, setFineList] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [borrowsRes, finesRes] = await Promise.all([
        api.get('/borrows/all'),
        api.get('/fines/all')
      ]);
      setBorrowList(borrowsRes.data.data);
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
  }, [user]);

  const handleConfirmPickup = async (id) => {
    try {
      await api.put(`/borrows/${id}/confirm-pickup`);
      addToast('Pickup confirmed. Loan period started.', 'success');
      fetchData();
    } catch (err) {
      addToast('Action failed: Record out of sync.', 'error');
    }
  };

  const handleApproveExtension = async (id) => {
    try {
      await api.put(`/borrows/${id}/approve-extension`);
      addToast('Extension granted (+14 days).', 'success');
      fetchData();
    } catch (err) {
      addToast('Critical error granting extension.', 'error');
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      await api.put(`/borrows/${id}/confirm-return`);
      addToast('Return finalized. Volume restocked.', 'success');
      fetchData();
    } catch (err) {
      addToast('Return confirmation failed.', 'error');
    }
  };

  const handlePayFine = async (id) => {
    try {
      await api.put(`/fines/${id}/pay`);
      addToast('Fine settled successfully.', 'success');
      fetchData();
    } catch (err) {
      addToast('Payment recording failed.', 'error');
    }
  };

  if (!user || user.role !== 'admin') return null;

  const categories = {
    Pickups: borrowList.filter(b => b.status === 'reserved'),
    Extensions: borrowList.filter(b => b.extensionStatus === 'requested'),
    Returns: borrowList.filter(b => b.returnStatus === 'scheduled'),
    Fines: fineList.filter(f => !f.paid)
  };

  return (
    <>
      {/* COMMAND TABS */}
      <div className="flex gap-10 border-b border-border-warm mb-8 overflow-x-auto scrollbar-none">
        {['Pickups', 'Extensions', 'Returns', 'Fines'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-2
              ${activeTab === tab ? 'text-brown' : 'text-ink-muted hover:text-ink'}
            `}
          >
            {tab}
            {categories[tab].length > 0 && (
               <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold ${activeTab === tab ? 'bg-brown text-cream shadow-sm' : 'bg-parchment border border-border-warm text-ink-muted'}`}>
                  {categories[tab].length}
               </span>
            )}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-brown animate-in fade-in slide-in-from-bottom-2 duration-300" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-parchment/30 border border-border-warm">
          <Loader2 className="animate-spin text-brown mb-4" size={32} />
          <span className="text-xs font-sans uppercase tracking-widest text-ink-muted font-bold">Synchronizing Terminal...</span>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* SECTION: PICKUP MANAGEMENT */}
           {activeTab === 'Pickups' && (
              <div className="space-y-6">
                 {categories.Pickups.length > 0 ? categories.Pickups.map(item => (
                   <div key={item.id} className="bg-white border border-border-warm overflow-hidden shadow-sm hover:border-brown transition-all group flex h-48">
                      <Link to={`/book/${item.Book?.id}`} className="w-32 bg-espresso/5 border-r border-border-warm overflow-hidden block hover:opacity-80 transition-opacity">
                         <BookCover book={item.Book} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                      </Link>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-2">
                               <div className="min-w-0 flex-1">
                                  <Link to={`/book/${item.Book?.id}`} className="block">
                                     <h3 className="font-serif text-xl font-bold text-ink leading-tight truncate group-hover:text-brown transition-colors">{item.Book.title}</h3>
                                  </Link>
                                  <p className="text-[11px] font-sans text-ink-muted italic border-l-2 border-brown pl-2 mt-1">Requested by {item.User.name} ({item.User.card_id})</p>
                               </div>
                               <div className="text-[10px] font-mono font-bold text-ink-muted bg-parchment px-2 py-0.5 border border-border-warm">
                                  ID: {item.id}
                               </div>
                            </div>
                            <div className="flex gap-8 mt-4">
                               <div className="flex items-center gap-2">
                                  <Calendar size={13} className="text-brown" />
                                  <span className="text-xs font-sans font-bold text-ink">{item.pickupDate ? new Date(item.pickupDate).toLocaleDateString() : '—'}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <Clock size={13} className="text-brown" />
                                  <span className="text-xs font-sans font-bold text-ink">{item.pickup_time_slot}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <MapPin size={13} className="text-brown" />
                                  <span className="text-xs font-sans font-bold text-ink uppercase tracking-widest">{item.Branch?.name || 'Main Campus'}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex justify-end pt-4 border-t border-border-warm">
                            <button 
                              onClick={() => handleConfirmPickup(item.id)}
                              className="bg-espresso text-cream px-10 py-3 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                            >
                               Confirm Physical Handover
                            </button>
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="py-32 flex flex-col items-center justify-center opacity-40 border-4 border-dashed border-border-warm">
                      <Clock size={48} className="mb-4 text-espresso" />
                      <p className="font-serif text-2xl italic">No collection requests pending.</p>
                   </div>
                 )}
              </div>
           )}

           {/* SECTION: EXTENSION APPROVALS */}
           {activeTab === 'Extensions' && (
              <div className="space-y-6">
                 {categories.Extensions.length > 0 ? categories.Extensions.map(item => (
                   <div key={item.id} className="bg-parchment border border-border-warm p-6 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-brown text-cream flex items-center justify-center rounded-full text-lg font-serif font-bold">
                            {item.User.name[0]}
                         </div>
                         <div>
                            <h3 className="font-sans font-bold text-ink">{item.User.name} <span className="font-normal text-ink-muted">requests extension for</span></h3>
                            <Link to={`/book/${item.Book?.id}`} className="block hover:opacity-80 transition-opacity">
                               <div className="text-serif text-lg font-bold text-brown italic">"{item.Book.title}"</div>
                            </Link>
                            <div className="flex items-center gap-4 mt-2 text-[11px] font-sans font-bold uppercase tracking-widest text-ink-muted">
                               <span className="text-red-500">Current Due: {new Date(item.due_date).toLocaleDateString()}</span>
                               <ChevronRight size={12} />
                               <span className="text-green-600 font-bold italic">Revised Due: {new Date(new Date(item.due_date).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={() => handleApproveExtension(item.id)}
                           className="bg-green-600 text-white px-8 py-3 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                         >
                            Approve +14 Days
                         </button>
                         <button className="border border-red-200 text-red-600 px-8 py-3 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-red-50 transition-all">
                            Reject
                         </button>
                      </div>
                   </div>
                 )) : (
                   <div className="py-32 flex flex-col items-center justify-center opacity-40 border-4 border-dashed border-border-warm">
                      <History size={48} className="mb-4 text-espresso" />
                      <p className="font-serif text-2xl italic">No renewal requests found.</p>
                   </div>
                 )}
              </div>
           )}

           {/* SECTION: RETURN CONFIRMATIONS */}
           {activeTab === 'Returns' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {categories.Returns.length > 0 ? categories.Returns.map(item => (
                   <div key={item.id} className="bg-cream border border-border-warm overflow-hidden shadow-sm hover:shadow-lg transition-all rounded-none ring-1 ring-border-warm">
                      <div className="bg-espresso px-5 py-3 flex justify-between items-center text-cream">
                         <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gold" />
                            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">{item.returnTimeSlot}</span>
                         </div>
                         <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]">{new Date(item.returnDate).toLocaleDateString()}</div>
                      </div>
                      <div className="p-6">
                         <div className="flex gap-4 mb-6">
                            <Link to={`/book/${item.Book?.id}`} className="w-16 shadow-lg shrink-0 block hover:opacity-80 transition-opacity">
                               <BookCover book={item.Book} />
                            </Link>
                            <div className="min-w-0 flex-1">
                               <Link to={`/book/${item.Book?.id}`} className="block">
                                  <h3 className="font-serif text-lg font-bold text-ink truncate group-hover:text-brown transition-colors">{item.Book.title}</h3>
                               </Link>
                               <p className="text-[11px] font-sans font-bold text-brown uppercase mb-1">Returner: {item.User.name}</p>
                               <p className="text-[10px] font-sans text-ink-muted italic leading-tight">Handheld confirmation required to restore inventory copies.</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleConfirmReturn(item.id)}
                           className="w-full bg-green-600 text-white py-3.5 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                         >
                            <CheckCircle size={16} /> Confirm Reception & Restock
                         </button>
                      </div>
                   </div>
                 )) : (
                   <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-40 border-4 border-dashed border-border-warm">
                      <FileText size={48} className="mb-4 text-espresso" />
                      <p className="font-serif text-2xl italic">No scheduled returns today.</p>
                   </div>
                 )}
              </div>
           )}

           {/* SECTION: FINANCIALS */}
           {activeTab === 'Fines' && (
              <div className="bg-parchment border border-border-warm overflow-hidden shadow-md">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                          <th className="px-6 py-4 border-b border-parchment/10">Member Insight</th>
                          <th className="px-6 py-4 border-b border-parchment/10">Reference Volume</th>
                          <th className="px-6 py-4 border-b border-parchment/10">Outstanding Amount</th>
                          <th className="px-6 py-4 border-b border-parchment/10 text-right">Settlement</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border-warm">
                       {categories.Fines.length > 0 ? categories.Fines.map(f => (
                          <tr key={f.id} className="hover:bg-cream transition-colors group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-brown text-cream flex items-center justify-center rounded-full text-xs font-bold font-serif">
                                      {f.User.name[0]}
                                   </div>
                                   <div>
                                      <div className="text-[13px] font-sans font-bold text-ink">{f.User.name}</div>
                                      <div className="text-[10px] font-mono text-ink-muted">{f.User.card_id}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-[13px] font-sans text-ink-muted italic font-medium">
                                {f.Book?.title || 'Unknown Volume'}
                             </td>
                             <td className="px-6 py-4 font-mono text-sm">
                                <span className="text-red-600 font-bold">₹{parseFloat(f.amount).toFixed(2)}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handlePayFine(f.id)}
                                  className="bg-green-600 text-white px-6 py-2 text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-md"
                                >
                                   Mark Paid
                                </button>
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan="4" className="px-6 py-20 text-center text-ink-muted italic font-serif">No outstanding financial dues across the campus.</td>
                       </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           )}
        </div>
      )}
    </>
  );
};

export default PickupsAndFines;

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Power, 
  AlertTriangle, 
  Mail, 
  Calendar, 
  BookOpen,
  X,
  Bell,
  Loader2,
  Clock,
  ArrowRight,
  CheckCircle,
  History
} from 'lucide-react';
import api from '../../api/client';
import BookCover from '../../components/BookCover';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const UsersAndBorrows = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Members');
  const [userList, setUserList] = useState([]);
  const [borrowList, setBorrowList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  
  // Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBorrows, setUserBorrows] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, borrowsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/borrows/all')
      ]);
      setUserList(usersRes.data.data || []);
      setBorrowList(borrowsRes.data.data || []);
    } catch (err) {
      addToast('Records synchronization failure.', 'error');
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

  const toggleUserStatus = async (targetUser) => {
    try {
      await api.put(`/admin/users/${targetUser.id}/status`);
      addToast(`Status updated for ${targetUser.name}.`, 'success');
      fetchData();
    } catch (err) {
      addToast('Action failed', 'error');
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      await api.put(`/borrows/${id}/confirm-return`);
      addToast('Volume returned to inventory.', 'success');
      fetchData();
    } catch (err) {
      addToast('Confirmation failed', 'error');
    }
  };

  const openUserDetail = (member) => {
    setSelectedUser(member);
    setUserBorrows(borrowList.filter(b => b.user_id === member.id));
    setShowUserModal(true);
  };

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(searchQ.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQ.toLowerCase()) || 
    u.card_id?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredBorrows = borrowList.filter(b => 
    b.User?.name?.toLowerCase().includes(searchQ.toLowerCase()) || 
    b.Book?.title?.toLowerCase().includes(searchQ.toLowerCase())
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <>
      {/* DIRECTORY TABS */}
      <div className="flex gap-10 border-b border-border-warm mb-8 overflow-x-auto scrollbar-none">
        {['Members', 'All Borrows', 'Overdue Assets'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] transition-all relative
              ${activeTab === tab ? 'text-brown' : 'text-ink-muted hover:text-ink'}
            `}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-brown animate-in fade-in duration-300" />}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* SEARCH BAR */}
        <div className="relative mb-8 max-w-lg group">
           <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-muted group-hover:text-brown transition-colors" />
           <input 
             type="text" 
             placeholder={activeTab === 'Members' ? "Query member database..." : "Filter circulation logs..."}
             className="w-full bg-parchment border border-border-warm pl-12 pr-6 py-4 text-sm font-sans focus:border-brown focus:outline-none transition-all shadow-sm italic"
             value={searchQ}
             onChange={(e) => setSearchQ(e.target.value)}
           />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-parchment/30 border border-border-warm animate-pulse">
            <Loader2 className="animate-spin text-brown mb-4" size={32} />
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-ink-muted font-bold">Synchronising Archives...</span>
          </div>
        ) : (
          <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm">
            {activeTab === 'Members' ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                        <th className="px-6 py-4 border-b border-parchment/10">Scholarly Identity</th>
                        <th className="px-6 py-4 border-b border-parchment/10">Card Index</th>
                        <th className="px-6 py-4 border-b border-parchment/10">Financial Dues</th>
                        <th className="px-6 py-4 border-b border-parchment/10">Status</th>
                        <th className="px-6 py-4 border-b border-parchment/10 text-right">Insight</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border-warm">
                     {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-cream/50 transition-colors group">
                           <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-10 h-10 bg-brown text-cream flex items-center justify-center rounded-full text-sm font-serif font-bold shadow-sm">
                                 {u.name[0]}
                              </div>
                              <div>
                                 <div className="text-[13px] font-sans font-bold text-ink group-hover:text-brown transition-colors">{u.name}</div>
                                 <div className="text-[10px] font-sans text-ink-muted italic">{u.email}</div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <code className="bg-cream border border-border-warm px-2 py-0.5 text-[10px] font-mono font-bold text-ink-muted">{u.card_id}</code>
                           </td>
                           <td className="px-6 py-4 font-mono text-sm">
                              {u.totalFineAmount > 0 ? <span className="text-red-700 font-bold">₹{u.totalFineAmount.toFixed(2)}</span> : <span className="text-ink-muted/50">—</span>}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                                ${u.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-parchment text-ink-muted border-border-warm'}`}>
                                 {u.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex gap-2 justify-end">
                                 <button 
                                   onClick={() => openUserDetail(u)}
                                   className="bg-cream border border-border-warm p-2 text-ink-muted hover:border-brown hover:text-brown transition-all"
                                 >
                                    <Eye size={14} />
                                 </button>
                                 <button 
                                   onClick={() => toggleUserStatus(u)}
                                   className={`p-2 border transition-all ${u.status === 'active' ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-600 hover:text-white'}`}
                                 >
                                    <Power size={14} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
                </table>
            ) : (
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                         <th className="px-6 py-4 border-b border-parchment/10">Circulator</th>
                         <th className="px-6 py-4 border-b border-parchment/10">Archival Volume</th>
                         <th className="px-6 py-4 border-b border-parchment/10">Maturity Date</th>
                         <th className="px-6 py-4 border-b border-parchment/10 text-center">Status</th>
                         <th className="px-6 py-4 border-b border-parchment/10 text-right">Handover</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-warm">
                      {(activeTab === 'Overdue Assets' ? filteredBorrows.filter(b=>b.status==='overdue') : filteredBorrows).map((b) => (
                         <tr key={b.id} className={`hover:bg-cream/50 transition-colors ${b.status === 'overdue' ? 'bg-red-50/30' : ''}`}>
                            <td className="px-6 py-4">
                               <div className="text-[13px] font-sans font-bold text-ink">{b.User?.name}</div>
                               <div className="text-[10px] font-mono text-ink-muted">#{b.User?.card_id}</div>
                            </td>
                            <td className="px-6 py-4 text-[13px] font-sans font-medium text-ink italic truncate max-w-[200px]">
                               {b.Book?.title}
                            </td>
                            <td className="px-6 py-4 text-[11px] font-sans font-bold text-ink-muted">
                               {new Date(b.due_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-3 py-1 border
                                 ${b.status === 'active' ? 'bg-green-50 text-green-700 border-green-100 shadow-sm' : 
                                   b.status === 'overdue' ? 'bg-red-600 text-white border-red-700' : 
                                   b.status === 'reserved' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                   'bg-parchment text-ink-muted border-border-warm opacity-40'}`}>
                                  {b.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               {b.status === 'active' || b.status === 'overdue' ? (
                                 <button 
                                   onClick={() => handleConfirmReturn(b.id)}
                                   className="bg-espresso text-cream text-[10px] font-sans font-bold px-6 py-2 uppercase tracking-widest hover:bg-black transition-all shadow-md"
                                 >
                                    Confirm Reception
                                 </button>
                               ) : (
                                 <span className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest italic opacity-40">—</span>
                               )}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
            )}
          </div>
        )}
      </div>

      {/* MEMBER INSIGHT MODAL */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-espresso/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-cream max-w-xl w-full border border-border-deep shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] relative animate-in zoom-in-95 duration-500 overflow-hidden">
              <div className="h-2 bg-brown w-full" />
              <button onClick={() => setShowUserModal(false)} className="absolute top-6 right-6 text-ink-muted hover:text-brown transition-all"><X size={24} /></button>

              <div className="p-10">
                 <div className="flex items-center gap-8 mb-10">
                    <div className="w-20 h-20 bg-espresso text-cream flex items-center justify-center text-3xl font-serif font-bold shadow-2xl ring-4 ring-parchment">
                       {selectedUser.name[0]}
                    </div>
                    <div>
                       <h2 className="font-serif text-4xl font-bold text-ink leading-tight">{selectedUser.name}</h2>
                       <div className="flex items-center gap-4 mt-2">
                          <code className="text-xs font-mono font-bold text-brown bg-brown/5 px-3 py-1 border border-brown/10">{selectedUser.card_id}</code>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">{selectedUser.email}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-10 mb-12 border-y border-border-warm py-8">
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-2 italic">Active Circulation</div>
                       <div className="text-xl font-serif font-bold text-ink">{selectedUser.activeBorrowCount} Volumes</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-2 italic">Financial Liability</div>
                       <div className={`text-xl font-serif font-bold ${selectedUser.totalFineAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{selectedUser.totalFineAmount.toFixed(2)}
                       </div>
                    </div>
                 </div>

                 <section>
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-ink-muted mb-6 flex items-center gap-2">
                       <History size={14} className="text-brown" /> Archival Record
                    </h3>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-4 scrollbar-thin">
                       {userBorrows.map(b => (
                          <div key={b.id} className="bg-parchment p-4 border border-border-warm flex justify-between items-center group hover:border-brown transition-colors">
                             <div className="min-w-0">
                                <div className="text-[13px] font-sans font-bold text-ink truncate group-hover:text-brown transition-colors">{b.Book?.title}</div>
                                <div className="text-[9px] font-sans text-ink-muted uppercase tracking-widest mt-0.5">Due {new Date(b.due_date).toLocaleDateString()}</div>
                             </div>
                             <span className={`text-[8px] font-sans font-bold uppercase px-2 py-0.5 border ${b.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-parchment text-ink-muted/50 border-border-warm'}`}>
                                {b.status}
                             </span>
                          </div>
                       ))}
                       {userBorrows.length === 0 && <p className="text-center py-6 text-sm italic text-ink-muted font-serif">The archive contains no previous circulation logs.</p>}
                    </div>
                 </section>

                 <button onClick={() => setShowUserModal(false)} className="w-full mt-10 py-4 bg-espresso text-cream text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                    Dismiss Portfolio
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default UsersAndBorrows;

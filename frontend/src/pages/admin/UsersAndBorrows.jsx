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
  Clock
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

  const [activeTab, setActiveTab] = useState('All Members');
  const [userList, setUserList] = useState([]);
  const [borrowList, setBorrowList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBorrows, setUserBorrows] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'All Members') {
        const res = await api.get('/admin/users');
        setUserList(res.data.data);
      } else {
        const res = await api.get('/borrows/all');
        setBorrowList(res.data.data);
      }
    } catch (err) {
      addToast('Failed to load data', 'error');
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

  const toggleUserStatus = async (targetUser) => {
    try {
      await api.put(`/admin/users/${targetUser.id}/status`);
      addToast(`Member status updated to ${targetUser.status === 'active' ? 'inactive' : 'active'}.`, 'success');
      fetchData();
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  const markReturned = async (id) => {
    try {
      await api.put(`/borrows/${id}/return`);
      addToast('Book marked as returned.', 'success');
      fetchData();
    } catch (err) {
      addToast('Return action failed', 'error');
    }
  };

  const openUserDetail = async (member) => {
    setSelectedUser(member);
    setShowUserModal(true);
    setUserBorrows([]);
    try {
      // Find all borrows for this user in the borrowList if available, or fetch
      const res = await api.get('/borrows/all');
      const filtered = res.data.data.filter(b => b.user_id === member.id);
      setUserBorrows(filtered);
    } catch (err) {
      console.error('Failed to fetch user borrows');
    }
  };

  const filteredUsers = userList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQ.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQ.toLowerCase()) || 
                         u.card_id?.toLowerCase().includes(searchQ.toLowerCase());
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredBorrows = borrowList.filter(b => {
    const matchesSearch = b.User?.name?.toLowerCase().includes(searchQ.toLowerCase()) || 
                         b.Book?.title?.toLowerCase().includes(searchQ.toLowerCase());
    
    let matchesStatus = true;
    if (activeTab === 'Overdue') {
      matchesStatus = b.status === 'overdue';
    } else if (filterStatus !== 'All') {
      matchesStatus = b.status.toUpperCase() === filterStatus.toUpperCase();
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* TABS */}
      <div className="flex gap-10 border-b border-border-warm mb-8 overflow-x-auto scrollbar-none">
        {['All Members', 'Active Borrows', 'Overdue'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setFilterStatus('All'); setSearchQ(''); }}
            className={`pb-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] transition-all relative
              ${activeTab === tab ? 'text-brown' : 'text-ink-muted hover:text-ink'}
            `}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-brown animate-in fade-in zoom-in-95 duration-300" />}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* TOOLBAR */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
             <input 
               type="text" 
               placeholder={activeTab === 'All Members' ? "Search members..." : "Search student or book..."}
               className="w-full bg-parchment border border-border-warm pl-11 pr-4 py-3 text-sm font-sans focus:border-brown focus:outline-none"
               value={searchQ}
               onChange={(e) => setSearchQ(e.target.value)}
             />
          </div>
          {activeTab !== 'Overdue' && (
            <select 
              className="bg-parchment border border-border-warm px-6 py-3 text-sm font-sans font-bold appearance-none pr-10 focus:outline-none focus:border-brown"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
               <option value="All">All Statuses</option>
               {activeTab === 'All Members' ? (
                 <>
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                 </>
               ) : (
                 <>
                   <option value="Active">Active</option>
                   <option value="Returned">Returned</option>
                   <option value="Overdue">Overdue</option>
                 </>
               )}
            </select>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-parchment/30 border border-border-warm">
            <Loader2 className="animate-spin text-brown mb-4" size={32} />
            <span className="text-xs font-sans uppercase tracking-widest text-ink-muted font-bold">Verifying Records...</span>
          </div>
        ) : (
          <>
            {activeTab === 'All Members' && (
              <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                        <th className="px-6 py-4 border-b border-parchment/10">Member</th>
                        <th className="px-6 py-4 border-b border-parchment/10">Card ID</th>
                        <th className="px-6 py-4 border-b border-parchment/10">Joined</th>
                        <th className="px-6 py-4 border-b border-parchment/10 text-center">Active Borrows</th>
                        <th className="px-6 py-4 border-b border-parchment/10">Unpaid Fines</th>
                        <th className="px-6 py-4 border-b border-parchment/10">Status</th>
                        <th className="px-6 py-4 border-b border-parchment/10 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border-warm">
                     {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-cream/40 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 bg-brown text-cream flex items-center justify-center rounded-full text-xs font-bold font-serif">
                                    {u.name.split(' ').map(n=>n[0]).join('')}
                                 </div>
                                 <div>
                                    <div className="text-[13px] font-sans font-bold text-ink group-hover:text-brown transition-colors">{u.name}</div>
                                    <div className="text-[11px] font-sans text-ink-muted">{u.email}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <code className="bg-cream border border-border-warm px-2 py-0.5 text-[10px] font-mono font-bold text-ink-muted">{u.card_id}</code>
                           </td>
                           <td className="px-6 py-4 text-[12px] font-sans font-medium text-ink-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                           <td className="px-6 py-4 text-[12px] font-sans font-bold text-ink text-center">{u.activeBorrowCount}</td>
                           <td className="px-6 py-4 font-mono text-sm">
                              {u.totalFineAmount > 0 ? <span className="text-red-600 font-bold">₹{u.totalFineAmount.toFixed(2)}</span> : <span className="text-ink-muted">—</span>}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                                ${u.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-parchment text-ink-muted border-border-warm'}`}>
                                 {u.status}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex gap-2 justify-end">
                                 <button 
                                   onClick={() => openUserDetail(u)}
                                   className="bg-blue-50 text-blue-600 border border-blue-100 p-2 hover:bg-blue-600 hover:text-white transition-all"
                                   title="View Details"
                                 >
                                    <Eye size={14} />
                                 </button>
                                 <button 
                                   onClick={() => toggleUserStatus(u)}
                                   className={`p-2 border transition-all ${u.status === 'active' ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white'}`}
                                   title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                                 >
                                    <Power size={14} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     )) : (
                       <tr>
                          <td colSpan="7" className="px-6 py-10 text-center text-ink-muted italic font-sans text-sm">No members found matching your search.</td>
                       </tr>
                     )}
                  </tbody>
                </table>
              </div>
            )}

            {(activeTab === 'Active Borrows' || activeTab === 'Overdue') && (
              <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                         <th className="px-6 py-4 border-b border-parchment/10">Member</th>
                         <th className="px-6 py-4 border-b border-parchment/10">Book</th>
                         <th className="px-6 py-4 border-b border-parchment/10">Borrowed</th>
                         <th className="px-6 py-4 border-b border-parchment/10">Due Date</th>
                         <th className="px-6 py-4 border-b border-parchment/10 text-center">Status</th>
                         <th className="px-6 py-4 border-b border-parchment/10 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-warm">
                      {filteredBorrows.length > 0 ? filteredBorrows.map((b) => (
                         <tr key={b.id} className={`hover:bg-cream/40 transition-colors ${b.status === 'overdue' ? 'bg-red-50/20' : ''}`}>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 bg-brown text-cream flex items-center justify-center rounded-full text-[10px] font-bold">
                                     {b.User?.name?.split(' ').map(n=>n[0]).join('')}
                                  </div>
                                  <div className="text-[13px] font-sans font-bold text-ink">{b.User?.name}</div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-[13px] font-sans font-medium text-ink truncate max-w-[180px]">{b.Book?.title}</div>
                            </td>
                            <td className="px-6 py-4 text-[12px] font-sans text-ink-muted">{new Date(b.borrowed_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-[12px] font-sans text-ink-muted">{new Date(b.due_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-center">
                               <div className="flex flex-col items-center">
                                  <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                                    ${b.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 
                                      b.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 
                                      'bg-parchment text-ink-muted border-border-warm'}`}>
                                     {b.status}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               {b.status !== 'returned' ? (
                                 <button 
                                   onClick={() => markReturned(b.id)}
                                   className="bg-green-600 text-white text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-green-700 transition-colors"
                                 >
                                    Mark Returned
                                 </button>
                               ) : (
                                 <span className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest italic">Completed</span>
                               )}
                            </td>
                         </tr>
                      )) : (
                        <tr>
                           <td colSpan="6" className="px-6 py-10 text-center text-ink-muted italic font-sans text-sm">No activity records found.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* USER DETAIL MODAL */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-espresso/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-cream max-w-lg w-full overflow-hidden border-t-8 border-brown shadow-2xl relative animate-in slide-in-from-top-4 duration-500">
              <button 
                onClick={() => setShowUserModal(false)}
                className="absolute top-4 right-4 text-ink-muted hover:text-brown transition-colors"
              >
                 <X size={24} />
              </button>

              <div className="p-8">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-brown text-cream flex items-center justify-center rounded-full text-2xl font-bold font-serif border-4 border-white shadow-lg">
                       {selectedUser.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                       <h2 className="font-serif text-3xl font-bold text-ink leading-tight">{selectedUser.name}</h2>
                       <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs font-mono font-bold text-ink-muted bg-parchment px-2 py-0.5 border border-border-warm">{selectedUser.card_id}</code>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brown px-2 py-0.5 bg-gold/10 border border-gold/20">{selectedUser.role}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-10 pb-8 border-b border-border-warm">
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 flex items-center gap-1.5 font-bold italic">Email Address</div>
                       <div className="text-[13px] font-sans font-medium text-ink">{selectedUser.email}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 font-bold italic">Joined Date</div>
                       <div className="text-[13px] font-sans font-medium text-ink">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 font-bold italic">Current Status</div>
                       <div className="text-[13px] font-sans font-bold text-ink uppercase text-[11px] tracking-wider">{selectedUser.status}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 font-bold italic">Active Fines</div>
                       <div className={`text-[13px] font-sans font-bold ${selectedUser.totalFineAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedUser.totalFineAmount > 0 ? `₹${selectedUser.totalFineAmount.toFixed(2)}` : 'None'}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-4">Active Circulation</h3>
                    {userBorrows.filter(b => b.status !== 'returned').map(b => (
                       <div key={b.id} className="bg-parchment p-3 border border-border-warm flex gap-4 items-center group hover:border-brown transition-colors">
                          <div className="shrink-0 -mt-2">
                             <div className="w-8 h-12 bg-espresso border-l-2 border-gold shadow-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="text-[12px] font-sans font-bold text-ink truncate group-hover:text-brown transition-colors">{b.Book?.title}</div>
                             <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[8px] font-sans font-bold uppercase px-1.5 border ${b.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                   {b.status}
                                </span>
                                <span className="text-[10px] font-sans text-ink-muted font-medium">Due {new Date(b.due_date).toLocaleDateString()}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                    {userBorrows.filter(b => b.status !== 'returned').length === 0 && (
                       <div className="text-center py-6 text-sm italic text-ink-muted border border-dashed border-border-warm font-serif">No active borrows found.</div>
                    )}
                 </div>
              </div>

              <div className="bg-parchment p-6 border-t border-border-warm flex justify-end">
                 <button 
                   onClick={() => setShowUserModal(false)}
                   className="bg-espresso text-cream px-10 py-3 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-black transition-all"
                 >
                    Close Member Insight
                 </button>
              </div>
           </div>
        </div>
      )}

    </>
  );
};

export default UsersAndBorrows;

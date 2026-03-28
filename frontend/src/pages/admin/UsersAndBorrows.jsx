import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Power, 
  AlertTriangle, 
  Mail, 
  Calendar, 
  Clock, 
  BookOpen,
  X,
  CheckCircle,
  Bell
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import BookCover from '../../components/BookCover';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

// MOCK DATA
const mockUsers = [
  { id:1, name:'Alex Johnson', email:'alex@uni.edu',
    cardId:'BV-2024-00042', role:'student',
    borrowCount:5, activeFines:9.50,
    joinedAt:'2024-09-01', status:'active' },
  { id:2, name:'Priya Sharma', email:'priya@uni.edu',
    cardId:'BV-2024-00043', role:'student',
    borrowCount:12, activeFines:0,
    joinedAt:'2024-08-15', status:'active' },
  { id:3, name:'Liam Chen', email:'liam@uni.edu',
    cardId:'BV-2024-00044', role:'student',
    borrowCount:3, activeFines:3.00,
    joinedAt:'2024-10-02', status:'active' },
  { id:4, name:'Fatima Al-Sayed', email:'fatima@uni.edu',
    cardId:'BV-2024-00045', role:'student',
    borrowCount:8, activeFines:0,
    joinedAt:'2024-07-20', status:'inactive' },
  { id:5, name:'Marcus Webb', email:'marcus@uni.edu',
    cardId:'BV-2024-00046', role:'student',
    borrowCount:1, activeFines:1.50,
    joinedAt:'2024-11-01', status:'active' },
];

const mockAllBorrows = [
  { id:1, userId:1, userName:'Alex Johnson',
    bookId:1, bookTitle: 'The Great Gatsby', status:'active',
    borrowedAt:'2024-11-20', dueDate:'2024-12-04',
    returnedAt:null },
  { id:2, userId:2, userName:'Priya Sharma',
    bookId:3, bookTitle: '1984', status:'overdue',
    borrowedAt:'2024-11-01', dueDate:'2024-11-15',
    returnedAt:null, daysOverdue:19 },
  { id:3, userId:3, userName:'Liam Chen',
    bookId:5, bookTitle: 'Sapiens', status:'returned',
    borrowedAt:'2024-10-10', dueDate:'2024-10-24',
    returnedAt:'2024-10-22' },
  { id:4, userId:1, userName:'Alex Johnson',
    bookId:2, bookTitle: 'Brave New World', status:'active',
    borrowedAt:'2024-11-25', dueDate:'2024-12-09',
    returnedAt:null },
  { id:5, userId:5, userName:'Marcus Webb',
    bookId:7, bookTitle: 'Meditations', status:'overdue',
    borrowedAt:'2024-11-05', dueDate:'2024-11-19',
    returnedAt:null, daysOverdue:11 },
  { id:6, userId:2, userName:'Priya Sharma',
    bookId:9, bookTitle: 'Pride and Prejudice', status:'returned',
    borrowedAt:'2024-10-01', dueDate:'2024-10-15',
    returnedAt:'2024-10-14' },
];

const UsersAndBorrows = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('All Members');
  const [userList, setUserList] = useState(mockUsers);
  const [borrowList, setBorrowList] = useState(mockAllBorrows);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const toggleUserStatus = (id) => {
    setUserList(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    addToast('User status updated.', 'success');
  };

  const markReturned = (id) => {
    setBorrowList(prev => prev.map(b => b.id === id ? { ...b, status: 'returned', returnedAt: '2024-12-02' } : b));
    addToast('Book marked as returned.', 'success');
  };

  const openUserDetail = (member) => {
    setSelectedUser(member);
    setShowUserModal(true);
  };

  const filteredUsers = userList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase()) || u.cardId.toLowerCase().includes(searchQ.toLowerCase());
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredBorrows = borrowList.filter(b => {
    const matchesSearch = b.userName.toLowerCase().includes(searchQ.toLowerCase()) || b.bookTitle.toLowerCase().includes(searchQ.toLowerCase());
    const matchesStatus = filterStatus === 'All' || b.status.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Users & Borrows">
      
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

      {activeTab === 'All Members' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* TOOLBAR */}
           <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
                 <input 
                   type="text" 
                   placeholder="Search members..." 
                   className="w-full bg-parchment border border-border-warm pl-11 pr-4 py-3 text-sm font-sans focus:border-brown focus:outline-none"
                   value={searchQ}
                   onChange={(e) => setSearchQ(e.target.value)}
                 />
              </div>
              <select 
                className="bg-parchment border border-border-warm px-6 py-3 text-sm font-sans font-bold appearance-none pr-10 focus:outline-none focus:border-brown"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                 <option value="All">All Statuses</option>
                 <option value="Active">Active</option>
                 <option value="Inactive">Inactive</option>
              </select>
           </div>

           {/* TABLE */}
           <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                       <th className="px-6 py-4 border-b border-parchment/10">Member</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Card ID</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Joined</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Borrows</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Fines</th>
                       <th className="px-6 py-4 border-b border-parchment/10">Status</th>
                       <th className="px-6 py-4 border-b border-parchment/10 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-warm">
                    {filteredUsers.map((u) => (
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
                             <code className="bg-cream border border-border-warm px-2 py-0.5 text-[10px] font-mono font-bold text-ink-muted">{u.cardId}</code>
                          </td>
                          <td className="px-6 py-4 text-[12px] font-sans font-medium text-ink-muted">{new Date(u.joinedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-[12px] font-sans font-bold text-ink">{u.borrowCount} total</td>
                          <td className="px-6 py-4 font-mono text-sm">
                             {u.activeFines > 0 ? <span className="text-red-600 font-bold">₹{u.activeFines.toFixed(2)}</span> : <span className="text-ink-muted">—</span>}
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
                                  onClick={() => toggleUserStatus(u.id)}
                                  className={`p-2 border transition-all ${u.status === 'active' ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white'}`}
                                  title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                                >
                                   <Power size={14} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'Active Borrows' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* FILTERS */}
           <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
                 <input 
                   type="text" 
                   placeholder="Search student or book..." 
                   className="w-full bg-parchment border border-border-warm pl-11 pr-4 py-3 text-sm font-sans focus:border-brown focus:outline-none"
                   value={searchQ}
                   onChange={(e) => setSearchQ(e.target.value)}
                 />
              </div>
              <select 
                className="bg-parchment border border-border-warm px-6 py-3 text-sm font-sans font-bold appearance-none pr-10 focus:outline-none focus:border-brown"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                 <option value="All">All Activity</option>
                 <option value="Active">Active Only</option>
                 <option value="Overdue">Overdue Only</option>
                 <option value="Returned">Returned</option>
              </select>
           </div>

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
                    {filteredBorrows.map((b) => (
                       <tr key={b.id} className={`hover:bg-cream/40 transition-colors ${b.status === 'overdue' ? 'bg-red-50/20' : ''}`}>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-brown text-cream flex items-center justify-center rounded-full text-[10px] font-bold">
                                   {b.userName.split(' ').map(n=>n[0]).join('')}
                                </div>
                                <div className="text-[13px] font-sans font-bold text-ink">{b.userName}</div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-[13px] font-sans font-medium text-ink truncate max-w-[180px]">{b.bookTitle}</div>
                          </td>
                          <td className="px-6 py-4 text-[12px] font-sans text-ink-muted">{new Date(b.borrowedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-[12px] font-sans text-ink-muted">{new Date(b.dueDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-center">
                             <div className="flex flex-col items-center">
                                <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                                  ${b.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 
                                    b.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 
                                    'bg-parchment text-ink-muted border-border-warm'}`}>
                                   {b.status}
                                </span>
                                {b.status === 'overdue' && <span className="text-[9px] font-sans text-red-500 font-bold mt-1">{b.daysOverdue}d overdue</span>}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             {b.status !== 'returned' ? (
                               <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => markReturned(b.id)}
                                    className="bg-green-600 text-white text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-green-700 transition-colors"
                                  >
                                     Return
                                  </button>
                                  {b.status === 'overdue' && (
                                    <button 
                                      onClick={() => addToast('Overdue fine applied.', 'success')}
                                      className="border border-red-400 text-red-600 text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-red-50 transition-colors"
                                    >
                                       Fine
                                    </button>
                                  )}
                               </div>
                             ) : (
                               <span className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest italic">Completed</span>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'Overdue' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="bg-red-50 border border-red-200 p-5 mb-8 flex gap-4 items-center">
              <div className="w-10 h-10 bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                 <AlertTriangle size={20} />
              </div>
              <div>
                 <h4 className="font-sans font-bold text-red-700 text-sm">Critical Attention Required</h4>
                 <p className="text-red-600/70 text-[13px] font-sans">2 overdue books require immediate attention. Fines are accruing at ₹0.50 per day.</p>
              </div>
           </div>

           <div className="space-y-6">
              {borrowList.filter(b => b.status === 'overdue').map(b => (
                 <div key={b.id} className="bg-parchment border border-red-200 overflow-hidden shadow-sm group hover:border-red-400 transition-all">
                    <div className="bg-red-600 px-6 py-2 flex justify-between items-center">
                       <div className="text-[11px] font-sans font-bold text-red-50 px-2 bg-red-700 uppercase tracking-widest">Borrow ID: {b.id}</div>
                       <div className="text-[11px] font-sans font-bold text-red-50 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={12} /> {b.daysOverdue} Days Late
                       </div>
                    </div>
                    
                    <div className="p-6 flex gap-8 items-start">
                       <div className="shrink-0 -mt-2 group-hover:scale-105 transition-transform duration-500">
                          <BookCover width={56} height={80} title={b.bookTitle} cover={{ bg: '#5F1A1A', accent: '#F87171', text: '#FFF5F5' }} />
                       </div>
                       
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-5 h-5 bg-brown text-cream flex items-center justify-center rounded-full text-[9px] font-bold">AJ</div>
                             <span className="text-sm font-sans font-bold text-ink">{b.userName}</span>
                          </div>
                          <h3 className="font-serif text-xl font-bold text-ink mb-2 group-hover:text-red-700 transition-colors">{b.bookTitle}</h3>
                          
                          <div className="grid grid-cols-2 gap-4 text-[12px] font-sans">
                             <div className="space-y-1">
                                <div className="text-ink-muted">Borrowed Date</div>
                                <div className="font-bold text-ink">{new Date(b.borrowedAt).toLocaleDateString()}</div>
                             </div>
                             <div className="space-y-1">
                                <div className="text-ink-muted">Expected Due Date</div>
                                <div className="font-bold text-red-600 underline underline-offset-4 decoration-red-200">{new Date(b.dueDate).toLocaleDateString()}</div>
                             </div>
                          </div>
                       </div>

                       <div className="text-right border-l border-red-100 pl-8 shrink-0 flex flex-col justify-center">
                          <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1">Accrued Late Fee</div>
                          <div className="font-mono text-3xl font-bold text-red-600">₹{(b.daysOverdue * 0.5).toFixed(2)}</div>
                       </div>
                    </div>

                    <div className="bg-cream/50 border-t border-red-100 px-6 py-4 flex gap-4">
                       <button 
                        onClick={() => markReturned(b.id)}
                        className="bg-green-600 text-white text-[11px] font-sans font-bold px-6 py-2.5 uppercase tracking-widest hover:bg-green-700 transition-colors shadow-sm"
                       >
                          Mark Returned
                       </button>
                       <button 
                         onClick={() => addToast(`Alert sent to ${b.userName.split(' ')[0]}.`, 'success')}
                         className="border-2 border-amber-400 text-amber-700 text-[11px] font-sans font-bold px-6 py-2.5 uppercase tracking-widest hover:bg-amber-400 hover:text-white transition-all flex items-center gap-2"
                       >
                          <Bell size={14} /> Send Reminder
                       </button>
                       <button 
                        onClick={() => addToast('Fine record finalized.', 'success')}
                        className="border-2 border-red-400 text-red-600 text-[11px] font-sans font-bold px-6 py-2.5 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                       >
                          Finalize Fine
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

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
                          <code className="text-xs font-mono font-bold text-ink-muted bg-parchment px-2 py-0.5 border border-border-warm">{selectedUser.cardId}</code>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brown px-2 py-0.5 bg-gold/10 border border-gold/20">{selectedUser.role}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-10 pb-8 border-b border-border-warm">
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><Mail size={10} /> Email Address</div>
                       <div className="text-[13px] font-sans font-medium text-ink">{selectedUser.email}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={10} /> Joined Date</div>
                       <div className="text-[13px] font-sans font-medium text-ink">{selectedUser.joinedAt}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><BookOpen size={10} /> Total Borrows</div>
                       <div className="text-[13px] font-sans font-bold text-ink">{selectedUser.borrowCount} books</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest mb-1 flex items-center gap-1.5"><AlertTriangle size={10} /> Active Fines</div>
                       <div className={`text-[13px] font-sans font-bold ${selectedUser.activeFines > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedUser.activeFines > 0 ? `₹${selectedUser.activeFines.toFixed(2)}` : 'None'}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-4">Active Circulation</h3>
                    {borrowList.filter(b => b.userId === selectedUser.id && b.status !== 'returned').map(b => (
                       <div key={b.id} className="bg-parchment p-3 border border-border-warm flex gap-4 items-center group hover:border-brown transition-colors">
                          <div className="shrink-0 scale-75 -mt-1 -ml-2">
                             <BookCover width={32} height={44} title={b.bookTitle} cover={{ bg: '#2D2416', accent: '#D97706', text: '#FFFBEB' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="text-[12px] font-sans font-bold text-ink truncate group-hover:text-brown transition-colors">{b.bookTitle}</div>
                             <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[8px] font-sans font-bold uppercase px-1.5 border ${b.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                   {b.status}
                                </span>
                                <span className="text-[10px] font-sans text-ink-muted font-medium">Due {new Date(b.dueDate).toLocaleDateString()}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                    {borrowList.filter(b => b.userId === selectedUser.id && b.status !== 'returned').length === 0 && (
                       <div className="text-center py-6 text-sm italic text-ink-muted border border-dashed border-border-warm font-serif">No active borrows found for this member.</div>
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

    </AdminLayout>
  );
};

export default UsersAndBorrows;

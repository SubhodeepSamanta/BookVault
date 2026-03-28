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
  TrendingDown
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import BookCover from '../../components/BookCover';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// ADMIN MOCK DATA
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
    bookId:7, borrowId:5,
    amount:3.00, paid:false,
    daysOverdue:6, createdAt:'2024-11-20' },
  { id:3, userId:5, userName:'Marcus Webb',
    bookId:9, borrowId:6,
    amount:5.50, paid:true,
    daysOverdue:11, paidAt:'2024-11-25',
    txnId:'TXN7492810BV' },
];

const mockAnnouncements = [
  { id:1, adminId:99, adminName:'Dr. Sarah Malik',
    title:'Holiday Closure — Dec 25 & 26',
    body:'All branches will be closed on Christmas Day and Boxing Day.',
    isActive:true, createdAt:'2024-12-01' },
  { id:2, adminId:99, adminName:'Dr. Sarah Malik',
    title:'48 New Books Added This Week',
    body:'We have added 48 new titles across Science, Technology, and History.',
    isActive:true, createdAt:'2024-11-28' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [pickups, setPickups] = useState(mockAllPickups);
  const [fines, setFines] = useState(mockAllFines);

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const handlePickupAction = (id, newStatus, message, type) => {
    setPickups(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    addToast(message, type);
  };

  const markFinePaid = (id) => {
    setFines(prev => prev.map(f => f.id === id ? { ...f, paid: true, paidAt: '2024-12-02' } : f));
    addToast('Fine marked as paid.', 'success');
  };

  return (
    <AdminLayout title="System Dashboard">
      
      {/* ── STAT CARDS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Books', val: '20', delta: '+3', color: 'brown', icon: BookOpen },
          { label: 'Active Members', val: '4,218', delta: '+47', color: 'blue', icon: Users },
          { label: 'Books Borrowed', val: '892', delta: '+124', color: 'amber', icon: BookMarked },
          { label: 'Overdue Returns', val: '2', delta: '+1', color: 'red', icon: AlertCircle, negative: true }
        ].map((s, idx) => (
          <div key={idx} className="bg-parchment border border-border-warm p-6 shadow-sm group hover:border-brown transition-colors">
            <div className="flex items-center justify-between mb-4">
               <div className={`p-2 bg-cream border border-border-warm text-${s.color}-600 group-hover:bg-brown group-hover:text-cream transition-colors`}>
                  <s.icon size={20} />
               </div>
               <div className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${s.negative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {s.negative ? <TrendingUp size={10} /> : <TrendingUp size={10} />}
                  {s.delta} this week
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
                  <div className="font-serif text-xl font-bold text-ink">₹18.00</div>
               </div>
            </div>
            <div className="text-[10px] font-sans font-bold text-red-600 bg-red-50 px-2 py-1 uppercase tracking-tighter">₹9.50 Unpaid</div>
         </div>
         <div className="bg-cream border border-border-warm p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CalendarCheck size={20} />
               </div>
               <div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Pickups Today</div>
                  <div className="font-serif text-xl font-bold text-ink">3</div>
               </div>
            </div>
            <div className="text-[10px] font-sans font-bold text-purple-600 bg-purple-50 px-2 py-1 uppercase tracking-tighter">2 Pending</div>
         </div>
         <div className="bg-cream border border-border-warm p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center">
                  <Star size={20} />
               </div>
               <div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Avg Book Rating</div>
                  <div className="font-serif text-xl font-bold text-ink">4.3★</div>
               </div>
            </div>
            <div className="text-[10px] font-sans font-bold text-ink-muted px-2 py-1 uppercase tracking-tighter">284 Reviews</div>
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
                      {mockAllBorrows.map((b) => (
                        <tr key={b.id} className="hover:bg-cream/50 transition-colors group">
                           <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-7 h-7 bg-brown text-cream flex items-center justify-center rounded-full text-[10px] font-bold">
                                    {b.userName.split(' ').map(n=>n[0]).join('')}
                                 </div>
                                 <div className="text-[13px] font-sans font-bold text-ink group-hover:text-brown transition-colors">{b.userName}</div>
                              </div>
                           </td>
                           <td className="px-5 py-4">
                              <div className="text-[13px] font-sans font-bold text-ink truncate max-w-[140px]">{b.bookTitle}</div>
                           </td>
                           <td className="px-5 py-4 text-[12px] font-sans text-ink-muted">
                              {new Date(b.borrowedAt).toLocaleDateString()}
                           </td>
                           <td className="px-5 py-4 text-[12px] font-sans text-ink-muted">
                              {new Date(b.dueDate).toLocaleDateString()}
                           </td>
                           <td className="px-5 py-4">
                              <div className="flex flex-col items-start gap-1">
                                 <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border
                                    ${b.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 
                                      b.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 
                                      'bg-parchment text-ink-muted border-border-warm'}`}>
                                    {b.status}
                                 </span>
                                 {b.status === 'overdue' && <span className="text-[9px] font-sans text-red-500 font-bold italic">{b.daysOverdue} days late</span>}
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          {/* PENDING PICKUPS */}
          <section>
             <div className="flex items-center gap-4 mb-6">
                <h2 className="font-serif text-2xl font-bold text-ink">Pending Pickups</h2>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-sans font-bold px-2 py-0.5 uppercase tracking-widest">{pickups.filter(p=>p.status==='pending').length} pending</span>
             </div>

             <div className="space-y-4">
                {pickups.filter(p => p.status === 'pending').map(p => (
                   <div key={p.id} className="bg-parchment border border-amber-200 p-5 flex gap-6 items-start shadow-sm group hover:bg-white transition-colors">
                      <div className="shrink-0 scale-75 -mt-3 -ml-4 group-hover:scale-90 transition-transform duration-500">
                         <BookCover 
                            width={54} height={78} 
                            cover={{ bg: '#2D2416', accent: '#D97706', text: '#FFFBEB' }}
                            title={p.bookTitle}
                         />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="text-[11px] font-sans font-bold text-amber-700 uppercase tracking-widest mb-1">Pickup ID: {p.id}</div>
                         <h3 className="font-serif text-lg font-bold text-ink mb-3 group-hover:text-brown transition-colors">{p.bookTitle}</h3>
                         
                         <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2">
                               <div className="w-5 h-5 bg-brown text-cream flex items-center justify-center rounded-full text-[9px] font-bold">AJ</div>
                               <span className="text-xs font-sans font-medium text-ink">{p.userName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-ink-muted">
                               <MapPin size={12} className="text-brown" />
                               <span className="text-xs font-sans">{p.branch}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-ink-muted">
                               <Clock size={12} className="text-brown" />
                               <span className="text-xs font-sans font-bold">{p.slotDate} · {p.slotTime}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 self-center">
                         <button 
                            onClick={() => handlePickupAction(p.id, 'confirmed', 'Pickup confirmed.', 'success')}
                            className="bg-green-600 text-white text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-green-700 transition-colors shadow-sm"
                         >
                            Confirm
                         </button>
                         <button 
                            onClick={() => handlePickupAction(p.id, 'rejected', 'Pickup rejected.', 'error')}
                            className="border border-red-300 text-red-600 text-[10px] font-sans font-bold px-4 py-2 uppercase tracking-widest hover:bg-red-50 transition-colors"
                         >
                            Reject
                         </button>
                      </div>
                   </div>
                ))}
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
                   <p className="text-[12px] font-sans text-red-600 font-bold uppercase tracking-wider">₹18.00 Total Unpaid</p>
                </div>
                <IndianRupee className="text-red-200" size={32} />
             </div>

             <div className="space-y-4">
                {fines.filter(f => !f.paid).map(f => (
                   <div key={f.id} className="border-b border-border-deep pb-4 flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                         <div className="w-7 h-7 bg-red-100 text-red-600 flex items-center justify-center rounded-full text-[10px] font-bold">
                            {f.userName.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <div className="min-w-0">
                            <div className="text-[13px] font-sans font-bold text-ink truncate group-hover:text-red-600 transition-colors">{f.userName}</div>
                            <div className="text-[11px] font-sans text-ink-muted italic truncate max-w-[120px]">{f.bookTitle}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="font-mono text-sm font-bold text-red-600">₹{f.amount.toFixed(2)}</span>
                         <button 
                            onClick={() => markFinePaid(f.id)}
                            className="text-[10px] font-sans font-bold text-brown uppercase tracking-widest underline underline-offset-4 hover:text-espresso transition-colors"
                         >
                            Mark Paid
                         </button>
                      </div>
                   </div>
                ))}
             </div>

             <div className="mt-8 pt-4 border-t border-border-deep flex justify-between items-center">
                <span className="text-[12px] font-sans font-bold text-ink-muted uppercase tracking-widest">Grand Total</span>
                <span className="font-mono text-xl font-bold text-red-600 underline decoration-double decoration-red-200 underline-offset-4">₹18.00</span>
             </div>
          </section>

          {/* GENRE DISTRIBUTION */}
          <section className="bg-parchment border border-border-warm p-8 shadow-sm">
             <h2 className="font-serif text-xl font-bold text-ink mb-6">Collection by Genre</h2>
             
             <div className="space-y-5">
                {[
                   { g: 'Classic Fiction', c: 284 },
                   { g: 'Science Fiction', c: 156 },
                   { g: 'History', c: 203 },
                   { g: 'Technology', c: 178 },
                   { g: 'Philosophy', c: 97 },
                   { g: 'Biography', c: 134 },
                   { g: 'Science', c: 211 },
                   { g: 'Poetry', c: 68 }
                ].map((item, idx) => (
                   <div key={idx} className="space-y-2 group">
                      <div className="flex justify-between items-center text-[11px] font-sans font-bold uppercase tracking-widest">
                         <span className="text-ink group-hover:text-brown transition-colors">{item.g}</span>
                         <span className="text-ink-muted">{item.c}</span>
                      </div>
                      <div className="h-2 bg-border-warm relative group-hover:bg-border-deep transition-colors">
                         <div 
                            className="h-full bg-brown group-hover:bg-espresso transition-all duration-700 ease-out"
                            style={{ width: `${(item.c / 284) * 100}%` }} 
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
                {mockAnnouncements.map(a => (
                   <div key={a.id} className="relative pl-4 border-l-2 border-gold/40">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-green-50 text-green-700 px-1.5 py-0.5 border border-green-100">Live</span>
                         <span className="text-[10px] font-sans text-ink-muted font-bold">{a.createdAt}</span>
                      </div>
                      <h3 className="text-[13px] font-sans font-bold text-ink line-clamp-1 hover:text-brown transition-colors cursor-default">{a.title}</h3>
                   </div>
                ))}
             </div>
          </section>

        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;

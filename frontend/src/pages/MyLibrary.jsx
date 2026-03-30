import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  BookOpen, 
  AlertCircle, 
  IndianRupee, 
  Search,
  CheckCircle,
  Loader2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCover from '../components/BookCover';
import ProgressRing from '../components/ProgressRing';
import LogisticsModal from '../components/LogisticsModal';

const MyLibrary = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active loans');
  const [borrows, setBorrows] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [finesTotal, setFinesTotal] = useState(0);
  const [historySearch, setHistorySearch] = useState('');
  const [loanFilter, setLoanFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [pagesReadInput, setPagesReadInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return Logistics Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnLoan, setReturnLoan] = useState(null);

  useEffect(() => {
    if (!user) { 
      navigate('/'); 
      openAuthModal('login'); 
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [borrowsRes, progressRes, finesRes] = await Promise.all([
          api.get('/borrows/my'),
          api.get('/progress/my'),
          api.get('/fines/my')
        ]);
        
        setBorrows(borrowsRes.data.borrows);
        setProgressData(progressRes.data.progress);
        
        const total = finesRes.data.fines.reduce((sum, f) => !f.paid ? sum + parseFloat(f.amount) : sum, 0);
        setFinesTotal(total);
      } catch (err) {
        console.error('Error fetching library data:', err);
        addToast('Failed to load library data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate, openAuthModal]);

  const handleUpdateProgress = (book, currentProgress) => {
    setSelectedBook(book);
    setPagesReadInput(currentProgress?.pages_read || '');
    setIsModalOpen(true);
  };

  const submitProgress = async () => {
    if (!pagesReadInput || isNaN(pagesReadInput)) {
      addToast('Please enter a valid page number', 'error');
      return;
    }
    
    if (parseInt(pagesReadInput) > selectedBook.pages) {
      addToast(`Max pages for this book is ${selectedBook.pages}`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/progress/upsert', {
        bookId: selectedBook.id,
        pages_read: parseInt(pagesReadInput)
      });
      
      const updatedProgress = res.data.progress;
      
      // Update local state
      setProgressData(prev => {
        const exists = prev.find(p => p.book_id === updatedProgress.book_id);
        if (exists) {
          return prev.map(p => p.book_id === updatedProgress.book_id ? updatedProgress : p);
        }
        return [updatedProgress, ...prev];
      });

      addToast(`Progress updated to ${updatedProgress.percent}%`, 'success');
      setIsModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update progress', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brown mb-4" size={40} />
        <span className="text-ink-muted font-sans uppercase tracking-widest text-xs">Opening Personal Vault...</span>
      </div>
    );
  }

  const activeLoans = borrows.filter(b => b.status === 'active' || b.status === 'overdue');
  const filteredLoans = activeLoans.filter(loan => {
    if (loanFilter === 'All') return true;
    return loan.status.toLowerCase() === loanFilter.toLowerCase();
  });

  const historyLoans = borrows.filter(b => 
    b.Book?.title.toLowerCase().includes(historySearch.toLowerCase())
  );

  const calculateDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleReturn = (loan) => {
    setReturnLoan(loan);
    setIsReturnModalOpen(true);
  };

  const handleReturnConfirm = async (logisticsData) => {
    try {
      await api.put(`/borrows/${returnLoan.id}/schedule-return`, logisticsData);
      addToast(`Restoration scheduled for "${returnLoan.Book.title}".`, 'success');
      
      // Refresh data to reflect scheduled status
      const res = await api.get('/borrows/my');
      setBorrows(res.data.borrows);
      
      const progRes = await api.get('/progress/my');
      setProgressData(progRes.data.progress);
    } catch (err) {
      addToast(err.response?.data?.error || 'Logistics scheduling failed', 'error');
      throw err;
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* PAGE HEADER */}
      <header className="bg-espresso py-10 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="z-10">
            <nav className="mb-4">
              <span className="text-[12px] font-sans text-parchment/40 uppercase tracking-widest">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link> / <span className="text-parchment/60 font-bold">My Library</span>
              </span>
            </nav>
            <h1 className="font-serif text-5xl text-cream font-bold mb-1">My Library</h1>
            <p className="font-sans text-sm italic text-parchment/60">Welcome back, {user.name.split(' ')[0]}.</p>
            
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="bg-parchment/10 border border-parchment/20 rounded-none px-4 py-2 flex items-center gap-2">
                <BookOpen size={14} className="text-parchment/70" />
                <span className="text-[12px] font-sans text-parchment/70 font-medium">{activeLoans.length} Active Loans</span>
              </div>
              <div className="bg-parchment/10 border border-red-400/40 rounded-none px-4 py-2 flex items-center gap-2 text-red-300">
                <AlertCircle size={14} />
                <span className="text-[12px] font-sans font-medium">{activeLoans.filter(l => l.status === 'overdue').length} Overdue</span>
              </div>
              <div className="bg-parchment/10 border border-parchment/20 rounded-none px-4 py-2 flex items-center gap-2">
                <IndianRupee size={14} className="text-parchment/70" />
                <span className="text-[12px] font-sans text-parchment/70 font-medium">₹{finesTotal} Fines Due</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block bg-parchment/10 border border-parchment/20 rounded-none px-6 py-4 absolute right-12 top-1/2 -translate-y-1/2">
             <div className="flex items-center gap-2 mb-2">
                <CreditCard size={14} className="text-gold" />
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-parchment/50 font-bold">Library Card</span>
             </div>
             <div className="font-mono text-xl text-cream font-bold tracking-[0.15em] mb-1">
                {user.card_id}
             </div>
             <div className="text-[11px] font-sans text-parchment/40 font-medium uppercase tracking-wider">
                {user.name}
             </div>
          </div>
        </div>
      </header>

      {/* STICKY TAB ROW */}
      <div className="bg-parchment border-b border-border-warm sticky top-[64px] z-40">
        <div className="max-w-5xl mx-auto px-6 flex">
          {['active loans', 'borrow history', 'reading progress'].map((tab) => (
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

      <main className="max-w-5xl mx-auto px-6 py-8 pb-20">
        {activeTab === 'active loans' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex gap-2 mb-8">
              {['All', 'Active', 'Overdue'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setLoanFilter(filter)}
                  className={`
                    px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-sans font-bold transition-all
                    ${loanFilter === filter 
                      ? 'bg-espresso text-cream' 
                      : 'bg-parchment border border-border-warm text-ink-muted hover:border-brown hover:text-brown'}
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredLoans.length > 0 ? (
              <div className="space-y-4">
                {filteredLoans.map(loan => {
                  const book = loan.Book;
                  const progress = progressData.find(p => p.book_id === loan.book_id) || { percent: 0, pages_read: 0 };
                  const daysRemaining = calculateDaysRemaining(loan.due_date);
                  const isOverdue = daysRemaining < 0;
                  const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3;

                  return (
                    <div key={loan.id} className="bg-parchment border border-border-warm flex overflow-hidden group hover:border-brown/40 transition-colors">
                      <Link to={`/book/${book.id}`} className="w-20 shrink-0 block hover:opacity-80 transition-opacity">
                         <BookCover book={book} className="w-full h-full shadow-none !rounded-none" />
                      </Link>
                      
                      <div className="flex-1 px-5 py-4 min-w-0">
                         <div className="flex justify-between items-start">
                            <Link to={`/book/${book.id}`} className="block min-w-0 flex-1">
                               <h3 className="font-serif text-lg font-bold text-ink truncate group-hover:text-brown transition-colors">
                                  {book.title}
                               </h3>
                            </Link>
                            <button 
                              onClick={() => handleUpdateProgress(book, progress)}
                              className="text-[10px] font-sans font-bold uppercase tracking-widest text-brown hover:text-espresso transition-colors"
                            >
                              Update Progress
                            </button>
                         </div>
                         <p className="font-sans text-xs italic text-ink-muted mb-4">by {book.author}</p>
                         
                         <div className="flex flex-wrap gap-x-8 gap-y-2 mb-4">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Borrowed</span>
                               <span className="text-xs font-sans text-ink">{loan.borrowed_at ? new Date(loan.borrowed_at).toLocaleDateString() : '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Due</span>
                               <span className={`text-xs font-sans font-bold ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-ink'}`}>
                                 {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '—'}
                                 {isOverdue && <span className="text-red-500 font-normal ml-1">({Math.abs(daysRemaining)} days overdue)</span>}
                                 {isDueSoon && <span className="text-amber-500 font-normal ml-1">(due soon)</span>}
                               </span>
                            </div>
                         </div>

                         <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-sans text-ink-muted uppercase tracking-widest font-bold">
                               <span>Reading progress</span>
                               <span className="text-brown">{progress.percent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-border-warm">
                               <div 
                                className="h-full bg-brown transition-all duration-1000" 
                                style={{ width: `${progress.percent}%` }}
                               />
                            </div>
                         </div>
                      </div>

                      <div className="w-36 shrink-0 border-l border-border-warm p-4 flex flex-col justify-between items-end bg-cream/30">
                         <div className={`text-[9px] font-sans font-bold uppercase tracking-[0.15em] px-2.5 py-1 border ${isOverdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            {loan.status}
                         </div>
                         
                         <div className="text-right">
                            <div className={`font-serif text-2xl font-bold leading-none ${isOverdue ? 'text-red-600' : 'text-ink'}`}>
                               {Math.abs(daysRemaining)} days
                            </div>
                            <div className={`text-[10px] font-sans font-bold uppercase tracking-widest ${isOverdue ? 'text-red-400' : 'text-ink-muted'}`}>
                               {isOverdue ? 'overdue' : 'remaining'}
                            </div>
                         </div>

                         <div className="w-full space-y-1">
                            {loan.returnStatus === 'scheduled' ? (
                              <div className="w-full bg-brown/10 text-brown border border-brown/20 text-[9px] font-sans font-bold uppercase tracking-widest py-2 text-center">
                                Scheduled Return
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleReturn(loan)}
                                className="w-full bg-espresso text-cream text-[10px] font-sans font-bold uppercase tracking-wider py-2 hover:bg-espresso-light transition-colors"
                              >
                                 Return Book
                              </button>
                            )}
                            {isOverdue && (
                              <button 
                                onClick={() => navigate('/fines')}
                                className="w-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-sans font-bold uppercase tracking-wider py-1.5 hover:bg-red-100 transition-colors"
                              >
                                Pay Fine
                              </button>
                            )}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center text-center">
                 <div className="w-20 h-20 rounded-full bg-parchment flex items-center justify-center mb-6">
                    <BookOpen size={40} className="text-border-deep" />
                 </div>
                 <h2 className="font-serif text-2xl font-bold text-ink mb-2">No active loans found</h2>
                 <p className="font-sans text-sm text-ink-muted max-w-xs mb-8">Your reading queue is currently empty. Explore our collection to find your next great read.</p>
                 <Link to="/catalogue" className="bg-espresso text-cream px-10 py-4 font-sans font-bold uppercase tracking-widest text-xs hover:bg-espresso-light transition-all">
                    Browse Catalogue
                 </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'borrow history' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="mb-6 relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={14} />
                <input 
                  type="text" 
                  placeholder="Search your history..."
                  className="w-full bg-cream border border-border-warm rounded-none pl-10 pr-4 py-2.5 text-[13px] font-sans focus:outline-none focus:border-brown placeholder:italic"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
             </div>

             <div className="bg-parchment border border-border-warm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-espresso text-parchment/70 text-[10px] uppercase tracking-[0.2em] font-sans">
                         <th className="py-4 px-6 font-bold">Volume</th>
                         <th className="py-4 px-6 font-bold">Borrowed</th>
                         <th className="py-4 px-6 font-bold">Due Date</th>
                         <th className="py-4 px-6 font-bold">Returned</th>
                         <th className="py-4 px-6 font-bold">Status</th>
                      </tr>
                   </thead>
                   <tbody>
                      {historyLoans.map(loan => {
                        const book = loan.Book;
                        return (
                          <tr key={loan.id} className="border-b border-border-warm last:border-none group hover:bg-cream/50 transition-colors">
                             <td className="py-4 px-6">
                                <div className="flex items-center gap-4">
                                   <Link to={`/book/${book.id}`} className="w-10 h-14 shrink-0 overflow-hidden shadow-sm hover:opacity-80 transition-opacity block">
                                      <BookCover book={book} className="w-full h-full !rounded-none scale-110" />
                                   </Link>
                                   <div>
                                      <Link to={`/book/${book.id}`} className="text-sm font-sans font-bold text-ink group-hover:text-brown transition-colors block">
                                         {book.title}
                                      </Link>
                                      <div className="text-[11px] font-sans text-ink-muted italic">by {book.author}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="py-4 px-6 text-[12px] font-sans text-ink">{loan.borrowed_at ? new Date(loan.borrowed_at).toLocaleDateString() : '—'}</td>
                             <td className="py-4 px-6 text-[12px] font-sans text-ink">{loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '—'}</td>
                             <td className="py-4 px-6 text-[12px] font-sans text-ink">{loan.returned_at ? new Date(loan.returned_at).toLocaleDateString() : '—'}</td>
                             <td className="py-4 px-6">
                                <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border ${
                                  loan.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                  loan.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-parchment-dark text-ink-muted border-border-warm'
                                }`}>
                                   {loan.status}
                                </span>
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'reading progress' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-warm">
                <h2 className="font-serif text-2xl font-bold text-ink">Your Reading Journey</h2>
                <div className="text-[13px] font-sans text-ink-muted">
                   {progressData.length} levels tracked · {progressData.filter(p => p.percent === 100).length} volumes complete
                </div>
             </div>

             <div className="bg-espresso text-cream rounded-none p-8 mb-12 flex flex-col md:flex-row items-center gap-12">
                <div className="shrink-0 flex flex-col items-center">
                   <ProgressRing 
                    percent={progressData.length > 0 ? Math.round(progressData.reduce((a, b) => a + b.percent, 0) / progressData.length) : 0} 
                    size={110} 
                    strokeWidth={6} 
                    variant="light"
                   />
                   <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/40 mt-4">Avg. Completion</span>
                </div>
                
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-10 w-full text-center md:text-left">
                   <div>
                      <div className="font-serif text-4xl font-bold text-gold mb-1">{progressData.length}</div>
                      <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/40">Books Tracked</div>
                   </div>
                   <div>
                      <div className="font-serif text-4xl font-bold text-gold mb-1">
                        {progressData.reduce((sum, p) => sum + Math.round((p.percent / 100) * (p.Book?.pages || 0)), 0)}
                      </div>
                      <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/40">Pages Read</div>
                   </div>
                   <div>
                      <div className="font-serif text-4xl font-bold text-gold mb-1">{progressData.filter(p => p.percent === 100).length}</div>
                      <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-parchment/40">Volumes Completed</div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {progressData.map((progress) => {
                  const book = progress.Book;
                  const isCompleted = progress.percent === 100;
                  
                  return (
                    <div key={progress.id} className="bg-parchment border border-border-warm p-5 flex gap-5 group hover:border-brown/40 transition-colors">
                       <Link to={`/book/${book.id}`} className="w-14 shrink-0 shadow-md transform group-hover:scale-105 transition-transform block">
                          <BookCover book={book} className="w-full h-full !rounded-none" />
                       </Link>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                             <Link to={`/book/${book.id}`} className="block min-w-0 flex-1">
                                <h4 className="font-serif text-[15px] font-bold text-ink truncate group-hover:text-brown transition-colors">{book.title}</h4>
                             </Link>
                             {activeLoans.find(al => al.book_id === progress.book_id) && (
                               <button 
                                onClick={() => handleUpdateProgress(book, progress)}
                                className="text-[9px] font-sans font-bold uppercase tracking-widest text-brown"
                               >
                                 Update
                               </button>
                             )}
                          </div>
                          <p className="font-sans text-[11px] italic text-ink-muted mb-3">by {book.author}</p>
                          
                          <div className="space-y-2 mt-auto">
                             <div className="h-2 w-full bg-border-warm">
                                <div 
                                  className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-600' : 'bg-brown'}`} 
                                  style={{ width: `${progress.percent}%` }}
                                />
                             </div>
                             <div className="flex justify-between items-center text-[11px] font-sans">
                                <span className={`font-bold ${isCompleted ? 'text-green-700' : 'text-brown'}`}>{progress.percent}%</span>
                                <span className="text-ink-muted">{progress.pages_read || 0} of {book.pages} pages</span>
                             </div>
                             
                             {isCompleted && (
                               <div className="inline-flex mt-2 items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-0.5">
                                  <CheckCircle size={10} /> Volume Completed
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}
      </main>

      <LogisticsModal 
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        book={returnLoan?.Book}
        mode="return"
        onConfirm={handleReturnConfirm}
      />

      {/* UPDATE PROGRESS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-espresso/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-cream w-full max-w-sm border-t-4 border-brown p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="font-serif text-2xl font-bold text-ink mb-4">Update Reading Progress</h3>
            <p className="font-sans text-sm text-ink-muted mb-6">How many pages have you read of <span className="font-bold text-ink">"{selectedBook?.title}"</span>?</p>
            
            <div className="space-y-6">
               <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-sans text-ink-muted bg-parchment px-2 py-1">/ {selectedBook?.pages} pages</span>
                  <input 
                    type="number"
                    value={pagesReadInput}
                    onChange={(e) => setPagesReadInput(e.target.value)}
                    placeholder="Enter page number..."
                    className="w-full bg-parchment border border-border-warm px-4 py-4 pr-32 text-lg font-sans font-bold focus:outline-none focus:border-brown transition-colors"
                  />
               </div>

               <div className="bg-parchment/50 p-4 border border-border-warm border-dashed">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted">Estimated Completion</span>
                     <span className="text-sm font-serif font-bold text-brown">
                        {pagesReadInput && !isNaN(pagesReadInput) && selectedBook?.pages 
                          ? Math.min(100, Math.round((parseInt(pagesReadInput) / selectedBook.pages) * 100)) 
                          : 0}%
                     </span>
                  </div>
                  <div className="h-1 bg-border-warm w-full overflow-hidden">
                     <div 
                        className="h-full bg-brown transition-all duration-500" 
                        style={{ width: `${pagesReadInput && !isNaN(pagesReadInput) && selectedBook?.pages 
                          ? Math.min(100, Math.round((parseInt(pagesReadInput) / selectedBook.pages) * 100)) 
                          : 0}%` }}
                     />
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={submitProgress}
                    className="flex-1 bg-espresso text-cream py-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] hover:bg-espresso-light transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'Record Progress'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-espresso py-8 border-t border-parchment/10 text-center">
         <p className="text-[10px] font-sans text-parchment/30 uppercase tracking-[0.3em]">
            Institutional Member · BookVault Library Portal · Est. 1987
         </p>
      </footer>
    </div>
  );
};

export default MyLibrary;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Calendar, 
  Book as BookIcon, 
  Globe, 
  Barcode, 
  Download, 
  CreditCard, 
  Lock, 
  CheckCircle,
  Clock,
  Layout,
  TrendingUp,
  Loader2,
  Bookmark,
  CalendarCheck
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCover from '../components/BookCover';
import BookCard from '../components/BookCard';
import StarRating from '../components/StarRating';
import ProgressRing from '../components/ProgressRing';
import ReserveModal from '../components/ReserveModal';

const BookDetail = () => {
  const { id } = useParams();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();
  
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [userBorrow, setUserBorrow] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [pagesRead, setPagesRead] = useState(0); 
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const [bookRes, reviewsRes, similarRes] = await Promise.all([
        api.get(`/books/${id}`),
        api.get(`/reviews/book/${id}`),
        api.get(`/books?limit=4`)
      ]);

      setBook(bookRes.data.book);
      setReviews(reviewsRes.data.reviews || []);
      setAvgRating(reviewsRes.data.avg_rating || 0);
      setSimilarBooks(similarRes.data.books.filter(b => b.id !== parseInt(id)).slice(0, 3));
      
      if (user) {
        // Fetch specific borrow/progress for this book
        const [borrowsRes, progressRes] = await Promise.all([
          api.get('/borrows/my'),
          api.get('/progress/my')
        ]);
        
        const myBorrow = borrowsRes.data.borrows?.find(b => b.book_id === parseInt(id) && b.status !== 'returned' && b.status !== 'cancelled');
        setUserBorrow(myBorrow);

        const myProg = progressRes.data.progress?.find(p => p.book_id === parseInt(id));
        if (myProg) {
          setReadingProgress(myProg.percent || 0);
          setPagesRead(myProg.pages_read || 0);
        }
      }

    } catch (err) {
      console.error('Error fetching book details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brown mb-4" size={40} />
        <span className="text-ink-muted font-sans uppercase tracking-widest text-xs">Retrieving Volume...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <h2 className="font-serif text-3xl text-ink mb-4 text-center">Volume not found in the archives</h2>
        <Link to="/catalogue" className="text-brown font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Catalogue
        </Link>
      </div>
    );
  }

  const isAvailable = book.available_copies > 0;

  const handleReserveClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsReserveModalOpen(true);
  };

  const handleReserveSubmit = async (reservationData) => {
    try {
      await api.post('/borrows', reservationData);
      addToast(`Successfully reserved "${book.title}"!`, 'success');
      fetchBookData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to complete reservation', 'error');
      throw err;
    }
  };

  const handleSaveProgress = async () => {
    try {
      const res = await api.post('/progress', { 
        bookId: book.id, 
        pages_read: parseInt(pagesRead) 
      });
      setReadingProgress(res.data.progress.percent);
      addToast(`Reading progress chronicled: ${res.data.progress.percent}%`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update progress', 'error');
    }
  };

  const handleReviewSubmit = async () => {
    if (!revComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/reviews', { 
        bookId: book.id, 
        rating: revRating, 
        comment: revComment 
      });
      setReviewSubmitted(true);
      addToast('Review published.', 'success');
      fetchBookData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Review submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* BREATHING BAND */}
      <div className="bg-espresso h-1.5 w-full" />

      {/* BACK NAVIGATION */}
      <div className="max-w-7xl mx-auto px-6 py-6 border-b border-border-warm flex items-center justify-between">
        <Link to="/catalogue" className="flex items-center gap-2 text-ink-muted hover:text-brown transition-colors text-xs font-sans font-bold uppercase tracking-widest">
          <ArrowLeft size={16} />
          Back to Collection
        </Link>
        <div className="text-[10px] font-mono text-ink-muted opacity-40">BV-VOL-{book.id}</div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT: VISUAL & LOGISTICS (4 cols) */}
        <aside className="lg:col-span-4 animate-in fade-in slide-in-from-left-6 duration-700">
           <div className="sticky top-24">
              <div className="shadow-2xl ring-1 ring-border-warm mb-10 overflow-hidden transform hover:-translate-y-1 transition-transform duration-500">
                 <BookCover book={book} size="xl" className="w-full h-auto" />
              </div>

              {/* LOGISTICS CARD */}
              <div className="bg-parchment border border-border-warm p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <Layout size={14} className="text-brown" />
                       <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink">Circulation Status</span>
                    </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm
                           ${isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-100'}`}>
                           {book.available_copies > 0 ? `${book.available_copies} Units Available` : 'All Units Allocated'}
                        </span>
                        <div className="text-[8px] font-sans text-ink-muted uppercase tracking-widest opacity-60">Total Archival Stock: {book.total_copies}</div>
                     </div>
                 </div>

                 {!userBorrow ? (
                    <div className="space-y-4">
                       <p className="text-xs font-sans text-ink-muted italic mb-4 leading-relaxed">
                          {isAvailable 
                             ? "This volume is currently available for 14-day physical collection. Reservations are processed within 24 hours."
                             : "All physical copies are currently in active academic circulation. You may join the waitlist for the next available slot."}
                       </p>
                       <button 
                          onClick={handleReserveClick}
                          disabled={!isAvailable}
                          className={`w-full py-4 text-[11px] font-sans font-bold uppercase tracking-[0.2em] shadow-md transition-all active:scale-[0.98]
                             ${isAvailable ? 'bg-espresso text-cream hover:bg-black' : 'bg-parchment border border-border-warm text-ink-muted cursor-not-allowed opacity-50'}`}
                       >
                          {isAvailable ? "Reserve for Pickup" : "Copies at Capacity"}
                       </button>
                    </div>
                 ) : (
                    <div className="bg-cream border border-brown/20 p-4 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-2 opacity-5">
                          <CheckCircle size={48} className="text-brown" />
                       </div>
                       <div className="text-[10px] font-sans font-bold text-brown uppercase tracking-widest mb-1 italic">Your Current Access</div>
                       <h4 className="text-sm font-sans font-bold text-ink mb-3">
                          {userBorrow.status === 'reserved' ? 'Scheduled for Collection' : 
                           userBorrow.status === 'active' ? 'Currently Borrowed' : 'Overdue Status'}
                       </h4>
                       <Link to="/reservations" className="inline-flex items-center gap-2 text-[10px] font-sans font-bold text-espresso underline underline-offset-4 hover:text-brown transition-colors">
                          Go to Logistics Hub <ArrowRight size={12} />
                       </Link>
                    </div>
                 )}

                 {book.gutenberg_url && (
                    <a 
                       href={book.gutenberg_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-border-warm text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted hover:border-brown hover:text-brown transition-all"
                    >
                       <Download size={14} /> Digital Copy (External)
                    </a>
                 )}
              </div>
           </div>
        </aside>

        {/* RIGHT: SCHOLARLY DETAILS (8 cols) */}
        <main className="lg:col-span-8 animate-in fade-in slide-in-from-right-6 duration-700">
           <header className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                 <span className="bg-espresso text-cream text-[9px] font-sans font-bold uppercase tracking-[0.25em] px-3 py-1">
                    {book.genre}
                 </span>
                 <div className="h-px flex-1 bg-border-warm opacity-40" />
              </div>
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-ink leading-tight mb-4">{book.title}</h1>
              <p className="font-serif text-2xl italic text-ink-muted">
                 by <span className="text-ink font-bold border-b-2 border-gold/30 pb-0.5">{book.author}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mt-10">
                 {[
                    { icon: Calendar, val: book.published_year, label: 'Edition' },
                    { icon: BookIcon, val: `${book.pages} pp`, label: 'Pagination' },
                    { icon: Globe, val: book.language, label: 'Linguistic' },
                    { icon: Barcode, val: book.isbn, label: 'Reference' }
                 ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-1">
                       <div className="flex items-center gap-2 text-brown">
                          <stat.icon size={13} />
                          <span className="text-xs font-sans font-bold text-ink uppercase tracking-wider">{stat.val}</span>
                       </div>
                       <span className="text-[9px] font-sans text-ink-muted uppercase tracking-[0.2em] italic pl-5 font-bold">{stat.label}</span>
                    </div>
                 ))}
              </div>
           </header>

           {/* SCHOLARLY TABS */}
           <div className="mt-16">
              <div className="flex gap-12 border-b border-border-warm overflow-x-auto scrollbar-none">
                 {['overview', 'reviews', 'reading journal'].map(tab => (
                    <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`pb-4 text-[11px] font-sans font-bold uppercase tracking-[0.25em] transition-all relative
                          ${activeTab === tab ? 'text-brown' : 'text-ink-muted hover:text-ink'}`}
                    >
                       {tab}
                       {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brown animate-in fade-in slide-in-from-bottom-2 duration-300" />}
                    </button>
                 ))}
              </div>

              <div className="py-10 min-h-[400px]">
                 {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                       <div className="font-serif text-xl leading-relaxed text-ink-soft space-y-8 text-justify italic opacity-90 first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-brown border-l-4 border-parchment pl-8 py-2">
                          {book.description || "No scholarly abstract available for this volume."}
                       </div>

                       <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="bg-parchment p-8 border border-border-warm">
                             <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-8 border-b border-border-deep pb-2">Technical Metadata</h4>
                             <table className="w-full space-y-4">
                                <tbody className="divide-y divide-border-warm/50">
                                   {[
                                      ['Access Protocol', 'Physical Collection / Digital'],
                                      ['Archival ID', `BV-VOL-${book.id}`],
                                      ['Copies in Reserve', book.available_copies],
                                      ['Verified Ratings', reviews.length]
                                   ].map(([l, v], i) => (
                                      <tr key={i} className="group">
                                         <td className="py-3 text-[10px] font-sans font-bold text-ink-muted uppercase tracking-widest">{l}</td>
                                         <td className="py-3 text-xs font-sans font-bold text-ink text-right">{v}</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>

                             <div className="mt-8 pt-8 border-t border-border-deep space-y-4">
                                <h5 className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-brown">Scholarly Regulations</h5>
                                <ul className="space-y-2">
                                   {[
                                      ['Return Interval', '14 Earth Days'],
                                      ['Extension Limit', '1 Instance / Term'],
                                      ['Archival Care', 'Parchment Integrity Critical'],
                                      ['Late Protocol', '₹10/Day Institutional Fine']
                                   ].map(([label, rule], i) => (
                                      <li key={i} className="flex justify-between items-center text-[10px] font-sans">
                                         <span className="text-ink-muted italic">{label}</span>
                                         <span className="text-ink font-bold uppercase tracking-tighter">{rule}</span>
                                      </li>
                                   ))}
                                </ul>
                             </div>
                          </div>
                          <div>
                             <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-6">Similar Volumes</h4>
                             <div className="grid grid-cols-2 gap-6">
                                {similarBooks.map(b => (
                                   <Link key={b.id} to={`/book/${b.id}`} className="group block">
                                      <div className="shadow-md mb-2 group-hover:scale-105 transition-transform">
                                         <BookCover book={b} height={140} />
                                      </div>
                                      <div className="text-[10px] font-sans font-bold text-ink truncate uppercase tracking-widest transition-colors group-hover:text-brown">{b.title}</div>
                                   </Link>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'reviews' && (
                    <div className="animate-in fade-in duration-500 space-y-12">
                       {/* CRITIQUE BREAKDOWN */}
                       <div className="bg-parchment border border-border-warm p-10 flex flex-col md:flex-row gap-12 items-center">
                          <div className="text-center md:text-left shrink-0">
                             <div className="font-serif text-8xl font-bold text-espresso leading-none mb-1">{avgRating.toFixed(1)}</div>
                             <div className="inline-block"><StarRating rating={avgRating} size={18} /></div>
                             <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mt-3">Collective Wisdom</p>
                          </div>
                          <div className="flex-1 w-full flex flex-col gap-3">
                             {[5, 4, 3, 2, 1].map(s => {
                                const count = reviews.filter(r => r.rating === s).length;
                                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                return (
                                   <div key={s} className="flex items-center gap-4 group">
                                      <span className="text-[10px] font-sans font-bold text-ink-muted w-4">{s}★</span>
                                      <div className="flex-1 h-1.5 bg-border-warm relative">
                                         <div className="h-full bg-gold transition-all duration-700" style={{ width: `${pct}%` }} />
                                      </div>
                                      <span className="text-[9px] font-mono text-ink-muted/60 w-8">{Math.round(pct)}%</span>
                                   </div>
                                )
                             })}
                          </div>
                       </div>

                       {/* WRITE CRITIQUE */}
                       <div className="bg-cream border-2 border-dashed border-border-warm p-10">
                          {!user ? (
                             <div className="text-center py-6">
                                <Lock size={32} className="mx-auto text-border-deep mb-4" />
                                <h4 className="font-serif text-2xl font-bold text-ink mb-2">Publish your perspective</h4>
                                <p className="text-sm text-ink-muted mb-8 italic">Only verified members of the collection can archival reviews.</p>
                                <button onClick={() => openAuthModal('login')} className="bg-espresso text-cream px-10 py-3 text-[11px] font-sans font-bold uppercase tracking-widest">Sign In to Review</button>
                             </div>
                          ) : (
                             reviewSubmitted ? (
                                <div className="text-center py-6 animate-in zoom-in-95">
                                   <CheckCircle size={40} className="mx-auto text-green-600 mb-4" />
                                   <h4 className="font-serif text-2xl font-bold text-ink mb-2">Review Published</h4>
                                   <p className="text-sm text-ink-muted">Your scholarship has been added to the archives.</p>
                                </div>
                             ) : (
                                <div className="space-y-6">
                                   <div className="flex items-center justify-between">
                                      <h4 className="text-[11px] font-sans font-bold uppercase tracking-widest text-ink">New Critical Entry</h4>
                                      <div className="flex gap-1.5">
                                         {[1,2,3,4,5].map(s => (
                                            <button key={s} onClick={() => setRevRating(s)} className={`text-xl transition-all ${revRating >= s ? 'text-gold' : 'text-parchment-deep'}`}>★</button>
                                         ))}
                                      </div>
                                   </div>
                                   <textarea 
                                      value={revComment}
                                      onChange={e => setRevComment(e.target.value)}
                                      className="w-full bg-parchment/30 border border-border-warm p-5 h-32 focus:outline-none focus:border-brown font-serif italic text-lg"
                                      placeholder="Share your academic critique..."
                                   />
                                   <button 
                                      onClick={handleReviewSubmit}
                                      disabled={submitting}
                                      className="bg-espresso text-cream px-10 py-3 text-[11px] font-sans font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 ml-auto"
                                   >
                                      {submitting ? 'Archiving...' : 'Publish Critique'}
                                   </button>
                                </div>
                             )
                          )}
                       </div>

                       {/* REVIEW LIST */}
                       <div className="space-y-10">
                          {reviews.map(r => (
                             <div key={r.id} className="relative group pl-12 border-l border-border-warm/30 py-2">
                                <div className="absolute left-[-16px] top-4 w-8 h-8 bg-espresso text-cream flex items-center justify-center rounded-full text-[10px] font-bold ring-4 ring-cream group-hover:scale-110 transition-transform">
                                   {r.User?.name?.[0]}
                                </div>
                                <div className="flex items-center gap-4 mb-3">
                                   <h5 className="text-[13px] font-sans font-bold text-ink italic">{r.User?.name}</h5>
                                   <span className="text-[10px] font-sans text-ink-muted font-bold opacity-50 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</span>
                                   <div className="ml-auto"><StarRating rating={r.rating} size={10} /></div>
                                </div>
                                <p className="font-serif text-lg leading-relaxed text-ink-soft italic group-hover:text-ink transition-colors">"{r.comment}"</p>
                             </div>
                          ))}
                          {reviews.length === 0 && (
                             <div className="py-20 text-center text-ink-muted italic border-t border-border-warm font-serif text-lg">The annals are silent on this volume.</div>
                          )}
                       </div>
                    </div>
                 )}

                 {activeTab === 'reading journal' && (
                    <div className="animate-in fade-in duration-500">
                       {!user ? (
                          <div className="bg-parchment border border-border-warm p-20 text-center">
                             <Layout size={48} className="mx-auto text-border-deep mb-6" />
                             <h4 className="font-serif text-3xl font-bold text-ink mb-4">Track your scholarly progress</h4>
                             <p className="max-w-md mx-auto text-sm text-ink-muted mb-10 italic">Archival members can track reading milestones, pages completed, and project completion dates through our unified journal system.</p>
                             <button onClick={() => openAuthModal('login')} className="bg-espresso text-cream px-12 py-4 text-[11px] font-sans font-bold uppercase tracking-widest shadow-xl">Sign In to Journal</button>
                          </div>
                       ) : (
                          <div className="flex flex-col lg:flex-row gap-20 items-stretch">
                             <div className="shrink-0 flex flex-col items-center bg-parchment border border-border-warm p-10 shadow-sm relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={64} /></div>
                                <ProgressRing percent={readingProgress} size={220} strokeWidth={10} />
                             </div>
                             <div className="flex-1 space-y-10 py-6">
                                <div>
                                   <h4 className="text-[11px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-8 border-b border-border-deep pb-2">Journal Statistics</h4>
                                   <div className="grid grid-cols-2 gap-8">
                                      <div className="bg-cream/40 p-6 border border-border-warm ring-1 ring-border-warm/50">
                                         <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2 block">Pagination Depth</span>
                                         <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-serif font-bold text-ink">{pagesRead}</span>
                                            <span className="text-ink-muted/50 font-serif text-lg">/ {book.pages}</span>
                                         </div>
                                      </div>
                                      <div className="bg-cream/40 p-6 border border-border-warm ring-1 ring-border-warm/50">
                                         <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted mb-2 block">Percentile Complete</span>
                                         <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-serif font-bold text-brown">{readingProgress}%</span>
                                         </div>
                                      </div>
                                   </div>
                                </div>

                                <div className="space-y-6">
                                   <div className="flex flex-col gap-3">
                                      <label className="text-[11px] font-sans font-bold uppercase tracking-widest text-ink font-bold">Latest Read Position</label>
                                      <div className="relative group">
                                         <input 
                                            type="number" 
                                            min="0"
                                            max={book.pages}
                                            value={pagesRead.toString().padStart(3, '0')}
                                            onChange={e => {
                                               const val = parseInt(e.target.value) || 0;
                                               setPagesRead(val);
                                               setReadingProgress(Math.min(100, Math.round((val / book.pages) * 100)));
                                            }}
                                            className="w-full bg-white border-2 border-border-warm pl-8 pr-32 py-5 text-4xl font-serif font-bold text-espresso focus:outline-none focus:border-brown transition-colors shadow-inner"
                                         />
                                         <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-end opacity-40 group-focus-within:opacity-100 transition-opacity">
                                            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-brown">Pages Read</span>
                                            <div className="text-[10px] font-mono text-ink-muted italic">Total: {book.pages}</div>
                                         </div>
                                      </div>
                                   </div>
                                   <button 
                                      onClick={handleSaveProgress}
                                      className="w-full py-5 bg-espresso text-cream text-[11px] font-sans font-bold uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                                   >
                                      <Bookmark size={14} /> Commit to Permanent Journal
                                   </button>
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                 )}
              </div>
           </div>
        </main>
      </div>

      <ReserveModal 
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        book={book}
        onReserve={handleReserveSubmit}
      />
    </div>
  );
};

export default BookDetail;

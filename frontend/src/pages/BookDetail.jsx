import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
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
  Loader2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCover from '../components/BookCover';
import BookCard from '../components/BookCard';
import StarRating from '../components/StarRating';
import StarPicker from '../components/StarPicker';
import ReserveModal from '../components/ReserveModal';
import ProgressRing from '../components/ProgressRing';


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
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const [bookRes, reviewsRes, similarRes, progressRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get(`/reviews/book/${id}`),
          api.get(`/books?limit=4`), // Simple similar books for now
          user ? api.get('/progress/my') : Promise.resolve({ data: { progress: [] } })
        ]);

        setBook(bookRes.data.book);
        setReviews(reviewsRes.data.reviews);
        setAvgRating(reviewsRes.data.avg_rating);
        setSimilarBooks(similarRes.data.books.filter(b => b.id !== parseInt(id)).slice(0, 3));
        
        if (user) {
          const myProg = progressRes.data.progress.find(p => p.book_id === parseInt(id));
          if (myProg) setReadingProgress(myProg.percent);
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };
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
        <h2 className="font-serif text-3xl text-ink mb-4">Book not found</h2>
        <Link to="/catalogue" className="text-brown font-bold uppercase tracking-widest hover:underline">
          Back to Catalogue
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
    if (!isAvailable) {
      handleJoinWaitlist();
      return;
    }
    setIsReserveModalOpen(true);
  };

  const handleReserveSubmit = async (reservationData) => {
    try {
      await api.post('/borrows', reservationData);
      addToast(`Successfully reserved "${book.title}" for pickup!`, 'success');
      // Refresh book data
      const res = await api.get(`/books/${id}`);
      setBook(res.data.book);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to complete reservation', 'error');
      throw err; // Re-throw for modal submitting state
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      await api.post('/reservations', { bookId: book.id });
      addToast(`Joined the waitlist for "${book.title}"!`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to join waitlist', 'error');
    }
  };

  const handleSaveProgress = async () => {
    try {
      await api.post('/progress', { bookId: book.id, percent: readingProgress });
      addToast('Reading progress updated!', 'success');
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
      addToast('Review submitted!', 'success');
      // Refresh reviews
      const res = await api.get(`/reviews/book/${id}`);
      setReviews(res.data.reviews);
      setAvgRating(res.data.avg_rating);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* HERO BAND */}
      <div className="bg-espresso py-4 px-6 border-b border-parchment/10">
        <div className="max-w-7xl mx-auto">
          <Link to="/catalogue" className="flex items-center gap-2 text-parchment/50 hover:text-gold transition-colors text-sm font-sans">
            <ArrowLeft size={16} />
            Back to Catalogue
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 flex flex-col lg:flex-row gap-12">
        
        {/* LEFT COLUMN: Actions */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 lg:pt-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="lg:sticky lg:top-24">
            <BookCover book={book} className="w-full shadow-2xl rounded-none" size="xl" />
            
            <div className="mt-8 space-y-6">
              <div className="p-4 bg-parchment/50 border border-border-warm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
                  <span className="text-sm font-sans font-bold text-ink">
                    {isAvailable ? 'Available to borrow' : 'All copies borrowed'}
                  </span>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-sans text-ink-muted">
                    {book.available_copies} of {book.total_copies} units available
                  </span>
                  <span className="text-[11px] font-sans font-bold text-ink">
                    {Math.round((book.available_copies / book.total_copies) * 100)}%
                  </span>
                </div>
                <div className="h-1 w-full bg-border-warm">
                  <div 
                    className="h-full bg-brown transition-all duration-1000" 
                    style={{ width: `${(book.available_copies / book.total_copies) * 100}%` }}
                  />
                </div>
                {!isAvailable && (
                  <p className="mt-4 text-[10px] text-ink-muted italic font-sans leading-relaxed">
                    Physical collections are currently at maximum capacity. Join the digital waitlist to be notified of availability.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {isAvailable ? (
                  <button 
                    onClick={handleReserveClick}
                    className="w-full bg-espresso text-cream py-4 font-sans font-bold uppercase tracking-[0.2em] text-xs hover:bg-espresso-light transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    Reserve for Pickup
                  </button>
                ) : (
                  <button 
                    onClick={handleJoinWaitlist}
                    className="w-full bg-brown text-cream py-4 font-sans font-bold uppercase tracking-[0.2em] text-xs hover:bg-brown-light transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    Join Academic Waitlist
                  </button>
                )}

                {book.gutenberg_url && (
                  <a 
                    href={book.gutenberg_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-brown/30 text-brown py-3.5 font-sans font-medium uppercase tracking-[0.05em] text-xs hover:bg-brown/5 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Download size={16} />
                    Access Digital Volume
                  </a>
                )}
              </div>


              {user && (
                <div className="bg-parchment border border-border-warm p-4 group transition-colors hover:border-brown/40">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-brown" />
                    <span className="text-[11px] font-sans uppercase tracking-widest text-ink-muted font-bold">Your Library Card</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-ink tracking-widest">
                    {user.card_id}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Details */}
        <main className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
          <div className="mb-8">
            <span className="bg-brown/10 text-brown text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full font-bold inline-block mb-4">
              {book.genre}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-ink font-bold leading-tight mb-2">
              {book.title}
            </h1>
            <p className="font-serif italic text-2xl text-ink-muted">
              by <span className="text-ink decoration-gold underline underline-offset-4">{book.author}</span>
            </p>

            <div className="flex flex-wrap items-center gap-y-4 gap-x-8 mt-8">
              <div className="flex items-center gap-2 text-ink-muted">
                <Calendar size={16} className="text-gold" />
                <span className="text-sm font-sans">{book.published_year}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <BookIcon size={16} className="text-gold" />
                <span className="text-sm font-sans">{book.pages} pages</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Globe size={16} className="text-gold" />
                <span className="text-sm font-sans">{book.language}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Barcode size={16} className="text-gold" />
                <span className="text-sm font-sans">ISBN {book.isbn}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border-warm">
               <div className="flex items-center gap-3">
                  <StarRating rating={avgRating} size={22} />
                  <span className="font-serif text-2xl font-bold text-ink">{avgRating}</span>
               </div>
               <div className="h-6 w-px bg-border-warm" />
               <div className="text-sm font-sans text-ink-muted">
                 Based on <span className="text-brown font-bold">{reviews.length} verifying reviews</span>
               </div>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-12">
            <div className="flex border-b border-border-warm">
              {['overview', 'reviews', 'reading progress'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    relative px-0 py-4 mr-10 font-sans text-xs uppercase tracking-[0.15em] transition-all
                    ${activeTab === tab ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'}
                  `}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brown" />
                  )}
                </button>
              ))}
            </div>

            <div className="py-8 min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="animate-in fade-in duration-300">
                  <p className="font-serif text-lg leading-relaxed text-ink-soft mb-12 text-justify">
                     {book.description}
                  </p>

                  <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-ink-muted mb-6 border-b border-border-warm pb-3">Technical Specifications</h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        ['International Standard Book Number (ISBN)', book.isbn],
                        ['Disciplinary Genre', book.genre],
                        ['Original Publication Year', book.published_year],
                        ['Physical Pagination', `${book.pages} pages`],
                        ['Instructional Language', book.language],
                        ['Live Resource Availability', `${book.available_copies} of ${book.total_copies} units`]
                      ].map(([label, value], i) => (
                        <tr key={i} className="border-b border-border-warm group">
                          <td className="py-4 text-xs font-sans font-medium text-ink-muted uppercase tracking-wider w-1/2">{label}</td>
                          <td className="py-4 text-sm font-sans font-bold text-ink">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-16">
                     <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-ink-muted mb-8">You Might Also Like</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                       {similarBooks.map(b => (
                         <BookCard key={b.id} book={b} />
                       ))}
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="animate-in fade-in duration-300">
                  {/* Rating breakdown */}
                  <div className="bg-parchment border border-border-warm p-8 mb-10 flex flex-col md:flex-row gap-10 items-center">
                    <div className="text-center md:text-left">
                       <div className="font-serif text-7xl font-bold text-ink leading-none">{avgRating}</div>
                       <div className="text-sm text-ink-muted mt-2">out of 5 stars</div>
                       <div className="mt-4"><StarRating rating={avgRating} size={18} /></div>
                       <div className="text-[11px] font-sans uppercase tracking-widest text-ink-muted mt-2 font-bold">{reviews.length} reviews</div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-3">
                      {[5, 4, 3, 2, 1].map((s) => {
                        const count = reviews.filter(r => r.rating === s).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={s} className="flex items-center gap-4">
                            <span className="text-xs font-sans text-ink-muted w-4">{s}★</span>
                            <div className="flex-1 h-2 bg-border-warm">
                              <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] font-sans text-ink-muted w-10 text-right">{Math.round(pct)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review list */}
                  <div className="space-y-0">
                    {reviews.map((review) => (
                      <div key={review.id} className="py-8 border-b border-border-warm last:border-none">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-brown flex items-center justify-center text-cream font-bold text-xs">
                            {review.User?.name?.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-sans font-bold text-ink">{review.User?.name}</div>
                            <div className="text-[11px] font-sans text-ink-muted">{new Date(review.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="ml-auto bg-green-50 text-green-700 text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border border-green-100 flex items-center gap-1">
                            <CheckCircle size={10} /> Verified Borrower
                          </div>
                        </div>
                        <div className="mb-3"><StarRating rating={review.rating} size={12} /></div>
                        <p className="font-sans text-sm text-ink-soft leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="py-12 text-center text-ink-muted italic font-sans text-sm">
                        No reviews yet. Be the first to share your perspective.
                      </div>
                    )}
                  </div>

                  {/* Write a review */}
                  <div className="mt-12 bg-parchment border border-border-warm p-8">
                    {!user ? (
                      <div className="text-center py-6">
                        <div className="flex justify-center mb-4 text-border-deep"><Lock size={40} /></div>
                        <h4 className="font-serif text-2xl font-bold text-ink mb-2">Sign in to leave a review</h4>
                        <p className="text-sm text-ink-muted mb-6">Only registered members who have borrowed this volume can share their thoughts.</p>
                        <button 
                          onClick={() => openAuthModal('login')}
                          className="bg-espresso text-cream px-10 py-3.5 font-sans font-bold uppercase tracking-widest text-xs hover:bg-espresso-light"
                        >
                          Sign In
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviewSubmitted ? (
                          <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                             <div className="flex justify-center mb-4 text-gold"><CheckCircle size={48} /></div>
                             <h4 className="font-serif text-2xl font-bold text-ink mb-2">Review submitted</h4>
                             <p className="text-sm text-ink-muted">Thank you for sharing your academic perspective with the community.</p>
                             <button onClick={() => setReviewSubmitted(false)} className="mt-6 text-sm text-brown font-bold tracking-widest uppercase underline">Write another</button>
                          </div>
                        ) : (
                          <>
                            <h4 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Your Review</h4>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-ink-muted font-sans mb-3">Rate your reading experience</p>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <button 
                                      key={s} 
                                      onClick={() => setRevRating(s)}
                                      className={`${revRating >= s ? 'text-gold' : 'text-border-deep'} hover:scale-110 transition-transform`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <textarea 
                                value={revComment}
                                onChange={(e) => setRevComment(e.target.value)}
                                className="w-full bg-cream border border-border-warm p-6 text-sm font-sans text-ink focus:outline-none focus:border-brown min-h-[160px] placeholder:italic"
                                placeholder="Share your academic or personal thoughts on this volume..."
                              />
                              <button 
                                onClick={handleReviewSubmit}
                                disabled={submitting}
                                className="bg-espresso text-cream px-10 py-3.5 font-sans font-bold uppercase tracking-widest text-xs hover:bg-espresso-light transition-all disabled:opacity-50"
                              >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'reading progress' && (
                <div className="animate-in fade-in duration-300">
                   {!user ? (
                    <div className="bg-parchment border border-border-warm p-20 text-center">
                      <div className="flex justify-center mb-8 text-border-deep"><Layout size={56} /></div>
                      <h4 className="font-serif text-3xl font-bold text-ink mb-4">Track your reading journey</h4>
                      <p className="font-sans text-ink-muted max-w-sm mx-auto mb-10">Access your personalized dashboard to track pages read, estimate completion dates, and manage your library queue.</p>
                      <button 
                        onClick={() => openAuthModal('login')}
                        className="bg-espresso text-cream px-12 py-4 font-sans font-bold uppercase tracking-widest text-sm hover:bg-espresso-light"
                      >
                        Sign In to Track Progress
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                      <div className="shrink-0">
                         <ProgressRing percent={readingProgress} size={200} strokeWidth={8} />
                      </div>
                      
                      <div className="flex-1 w-full space-y-8">
                         <div>
                            <h4 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-6">Update Your Progress</h4>
                            <div className="space-y-6">
                              <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-sans">
                                  <span className="text-ink-muted">Overall progress</span>
                                  <span className="text-brown font-bold text-lg">{readingProgress}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={readingProgress}
                                  onChange={(e) => setReadingProgress(parseInt(e.target.value))}
                                  className="w-full accent-brown h-1 bg-border-warm appearance-none cursor-pointer"
                                />
                              </div>

                              <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-2">
                                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink-muted block pl-0.5">Pages Read (of {book.pages})</label>
                                  <input 
                                    type="number" 
                                    value={Math.round((readingProgress / 100) * book.pages)}
                                    onChange={(e) => setReadingProgress(Math.min(100, Math.max(0, Math.round((parseInt(e.target.value) || 0) / book.pages * 100))))}
                                    className="w-full bg-cream border border-border-warm px-4 py-3 text-sm font-sans focus:outline-none focus:border-brown"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <button 
                                    onClick={handleSaveProgress}
                                    className="h-[46px] bg-espresso text-cream px-10 font-sans font-bold uppercase tracking-widest text-xs hover:bg-espresso-light transition-all whitespace-nowrap"
                                  >
                                    Save Progress
                                  </button>
                                </div>
                              </div>
                            </div>
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

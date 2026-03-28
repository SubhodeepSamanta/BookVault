import React, { useState, useMemo } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { books } from '../data/books';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCover from '../components/BookCover';
import BookCard from '../components/BookCard';
import StarRating from '../components/StarRating';
import StarPicker from '../components/StarPicker';
import ProgressRing from '../components/ProgressRing';

const BookDetail = () => {
  const { id } = useParams();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [readingProgress, setReadingProgress] = useState(47);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  
  const book = useMemo(() => books.find(b => b.id === parseInt(id)), [id]);

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

  const similarBooks = books.filter(b => b.genre === book.genre && b.id !== book.id).slice(0, 3);
  const isAvailable = book.available_copies > 0;

  const handleBorrow = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      addToast(`Successfully borrowed "${book.title}"!`, 'success');
    }
  };

  const reviews = [
    { id: 1, user: 'Julian M.', date: 'Oct 12, 2023', rating: 5, text: 'An absolute masterpiece of American literature. The prose is beautiful and the themes are just as relevant today as they were in 1925.' },
    { id: 2, user: 'Sarah K.', date: 'Dec 02, 2023', rating: 4, text: 'Great read for my literature class. Gatsby is such a fascinating, tragic character. The ending always hits hard.' },
    { id: 3, user: 'Academic Reader', date: 'Jan 15, 2024', rating: 5, text: 'The definitive edition for researchers. Excellent notes and the cover design is quite stunning.' },
    { id: 4, user: 'Liam W.', date: 'Mar 10, 2024', rating: 4, text: 'A classic for a reason. Quick read but stays with you for a long time.' },
  ];

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
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* LEFT COLUMN: Actions */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="lg:sticky lg:top-24">
            <BookCover book={book} className="w-full shadow-2xl rounded-none" />
            
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
                    {book.available_copies} of {book.total_copies} copies currently available
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
                  <button className="w-full mt-4 py-2 text-xs font-sans font-bold text-brown uppercase tracking-widest border border-brown/30 hover:bg-brown/5 transition-colors">
                    Join the waitlist
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleBorrow}
                  className="w-full bg-espresso text-cream py-4 font-sans font-semibold uppercase tracking-[0.1em] text-sm hover:bg-espresso-light transition-all flex items-center justify-center gap-3"
                >
                  Borrow This Book
                </button>
                
                <button className="w-full border border-espresso text-espresso py-3.5 font-sans font-medium uppercase tracking-[0.05em] text-sm hover:bg-espresso hover:text-cream transition-all">
                  Reserve for Pickup
                </button>

                {book.gutenberg_url && (
                  <a 
                    href={book.gutenberg_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-brown text-brown py-3.5 font-sans font-medium uppercase tracking-[0.05em] text-sm hover:bg-brown hover:text-cream transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download Free PDF
                  </a>
                )}
                
                <button className="text-ink-muted hover:text-brown transition-colors text-xs font-sans underline underline-offset-4 text-center mt-2">
                  Request academic extension
                </button>
              </div>

              {user && (
                <div className="bg-parchment border border-border-warm p-4 group transition-colors hover:border-brown/40">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-brown" />
                    <span className="text-[11px] font-sans uppercase tracking-widest text-ink-muted font-bold">Your Library Card</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-ink tracking-widest">
                    {user.cardId}
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
                <span className="text-sm font-sans">{book.published_year > 0 ? book.published_year : `${Math.abs(book.published_year)} BC`}</span>
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
                <span className="text-sm font-sans">ISBN {book.isbn.split('-').slice(-2).join('-')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border-warm">
               <div className="flex items-center gap-3">
                  <StarRating rating={book.rating} size={22} />
                  <span className="font-serif text-2xl font-bold text-ink">{book.rating}</span>
               </div>
               <div className="h-6 w-px bg-border-warm" />
               <div className="text-sm font-sans text-ink-muted">
                 Based on <button className="text-brown font-bold underline decoration-brown/30 hover:decoration-brown transition-all">{book.rating_count} verifying reviews</button>
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
                  <p className="font-serif text-lg leading-relaxed text-ink-soft mb-12">
                     {book.description} Additional context: This volume remains a cornerstone of academic inquiry and literary criticism. Our library provides access to several critical editions and peer-reviewed journals discussing the implications of this work in modern sociology.
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
                       <div className="font-serif text-7xl font-bold text-ink leading-none">{book.rating}</div>
                       <div className="text-sm text-ink-muted mt-2">out of 5 stars</div>
                       <div className="mt-4"><StarRating rating={book.rating} size={18} /></div>
                       <div className="text-[11px] font-sans uppercase tracking-widest text-ink-muted mt-2 font-bold">{book.rating_count} reviews</div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-3">
                      {[ 
                        { s: 5, w: '68%' }, 
                        { s: 4, w: '19%' }, 
                        { s: 3, w: '8%' }, 
                        { s: 2, w: '3%' }, 
                        { s: 1, w: '2%' } 
                      ].map((bar) => (
                        <div key={bar.s} className="flex items-center gap-4">
                          <span className="text-xs font-sans text-ink-muted w-4">{bar.s}★</span>
                          <div className="flex-1 h-2 bg-border-warm">
                            <div className="h-full bg-gold" style={{ width: bar.w }} />
                          </div>
                          <span className="text-[10px] font-sans text-ink-muted w-10 text-right">{bar.w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review list */}
                  <div className="space-y-0">
                    {reviews.map((review) => (
                      <div key={review.id} className="py-8 border-b border-border-warm last:border-none">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-brown flex items-center justify-center text-cream font-bold text-sm">
                            {review.user.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-sans font-bold text-ink">{review.user}</div>
                            <div className="text-[11px] font-sans text-ink-muted">{review.date}</div>
                          </div>
                          <div className="ml-auto bg-green-50 text-green-700 text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border border-green-100 flex items-center gap-1">
                            <CheckCircle size={10} /> Verified Borrower
                          </div>
                        </div>
                        <div className="mb-3"><StarRating rating={review.rating} size={12} /></div>
                        <p className="font-sans text-sm text-ink-soft leading-relaxed">{review.text}</p>
                      </div>
                    ))}
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
                          </div>
                        ) : (
                          <>
                            <h4 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Your Review</h4>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-ink-muted font-sans mb-3">Rate your reading experience</p>
                                <StarPicker size={24} />
                              </div>
                              <textarea 
                                className="w-full bg-cream border border-border-warm p-6 text-sm font-sans text-ink focus:outline-none focus:border-brown min-h-[160px] placeholder:italic"
                                placeholder="Share your academic or personal thoughts on this volume..."
                              />
                              <button 
                                onClick={() => setReviewSubmitted(true)}
                                className="bg-espresso text-cream px-10 py-3.5 font-sans font-bold uppercase tracking-widest text-xs hover:bg-espresso-light transition-all"
                              >
                                Submit Review
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
                                    onClick={() => addToast('Reading progress updated successfully!', 'success')}
                                    className="h-[46px] bg-espresso text-cream px-10 font-sans font-bold uppercase tracking-widest text-xs hover:bg-espresso-light transition-all whitespace-nowrap"
                                  >
                                    Save Progress
                                  </button>
                                </div>
                              </div>
                            </div>
                         </div>

                         <div className="pt-8 border-t border-border-warm grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                               <div className="flex items-center gap-2 text-ink-muted mb-1">
                                 <Calendar size={12} />
                                 <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Started Reading</span>
                               </div>
                               <div className="text-sm font-sans text-ink">October 14, 2023</div>
                            </div>
                            <div className="space-y-1">
                               <div className="flex items-center gap-2 text-ink-muted mb-1">
                                 <Clock size={12} />
                                 <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Last Updated</span>
                               </div>
                               <div className="text-sm font-sans text-ink">2 days ago</div>
                            </div>
                            <div className="space-y-1">
                               <div className="flex items-center gap-2 text-ink-muted mb-1">
                                 <TrendingUp size={12} className="text-gold" />
                                 <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold">Est. Completion</span>
                               </div>
                               <div className="text-sm font-sans text-ink font-bold">April 02, 2024</div>
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
    </div>
  );
};

export default BookDetail;

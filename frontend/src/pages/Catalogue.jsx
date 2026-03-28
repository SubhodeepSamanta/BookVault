import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookX, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { books } from '../data/books';
import BookCard from '../components/BookCard';

const Catalogue = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [hasFreeDownload, setHasFreeDownload] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 9;

  const allGenres = [...new Set(books.map(b => b.genre))].sort();

  const filteredBooks = useMemo(() => {
    let result = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            book.isbn.includes(searchQuery);
      
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(book.genre);
      const matchesAvailability = !showAvailableOnly || book.available_copies > 0;
      const matchesRating = book.rating >= minRating;
      const matchesDownload = !hasFreeDownload || book.gutenberg_url !== null;

      return matchesSearch && matchesGenre && matchesAvailability && matchesRating && matchesDownload;
    });

    // Sorting
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.published_year - a.published_year);
    }

    return result;
  }, [searchQuery, selectedGenres, showAvailableOnly, minRating, hasFreeDownload, sortBy]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const currentBooks = filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setShowAvailableOnly(false);
    setMinRating(0);
    setHasFreeDownload(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* PAGE HEADER */}
      <header className="bg-espresso py-12 px-6 text-center md:text-left">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-4">
             <span className="text-[12px] font-sans text-parchment/40 uppercase tracking-widest">
               <Link to="/" className="hover:text-gold transition-colors">Home</Link> / <span className="text-parchment/60 font-bold">Catalogue</span>
             </span>
          </nav>
          <h1 className="font-serif text-4xl md:text-6xl text-cream font-bold mb-2">The Collection</h1>
          <p className="font-sans text-sm md:text-base text-parchment/50 italic mb-6">12,400 volumes across every discipline</p>
          <div className="w-16 h-px bg-gold" />
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="bg-parchment border-b border-border-warm sticky top-[64px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
            <input
              type="text"
              placeholder="Search by title, author or ISBN..."
              className="w-full bg-cream border border-border-warm rounded-none pl-10 pr-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brown placeholder:text-ink-muted/50"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedGenres.map(genre => (
              <span key={genre} className="bg-brown text-cream text-[11px] px-3 py-1 flex items-center gap-2 font-medium tracking-wide">
                {genre}
                <button onClick={() => toggleGenre(genre)}><X size={12} /></button>
              </span>
            ))}
            {selectedGenres.length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-[11px] text-brown font-bold uppercase tracking-widest hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-sans text-ink-muted uppercase tracking-widest min-w-max">Sort by</span>
              <select 
                className="bg-cream border border-border-warm rounded-none px-3 py-2 text-sm font-sans focus:outline-none focus:border-brown cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="title">Title A–Z</option>
                <option value="rating">Rating ↓</option>
                <option value="newest">Newest first</option>
              </select>
            </div>
            <span className="text-[12px] font-sans text-ink-muted ml-4 hidden md:inline">
              Showing {currentBooks.length} of {filteredBooks.length}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-[145px] self-start space-y-10">
          <div className="bg-parchment border border-border-warm p-6">
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted flex items-center gap-2">
                 <Filter size={14} className="text-gold" /> Filters
               </h4>
            </div>
            <div className="w-6 h-px bg-gold mb-8" />

            {/* Genre Filter */}
            <div className="space-y-4 mb-8">
              <h5 className="text-[12px] font-sans font-bold uppercase tracking-widest text-ink-soft">Genre</h5>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {allGenres.map(genre => (
                  <label key={genre} className="flex items-center group cursor-pointer">
                    <div className={`w-4 h-4 border border-border-deep rounded-none mr-3 flex items-center justify-center transition-colors ${selectedGenres.includes(genre) ? 'bg-brown border-brown' : 'bg-white'}`}>
                      {selectedGenres.includes(genre) && <Check size={12} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedGenres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                    />
                    <span className="text-[13px] font-sans text-ink group-hover:text-brown transition-colors">
                      {genre}
                    </span>
                    <span className="text-[11px] font-sans text-ink-muted ml-auto">
                      ({books.filter(b => b.genre === genre).length})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="pt-6 border-t border-border-warm space-y-4 mb-8">
              <h5 className="text-[12px] font-sans font-bold uppercase tracking-widest text-ink-soft">Availability</h5>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${showAvailableOnly ? 'bg-brown' : 'bg-border-warm'}`}
                 >
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showAvailableOnly ? 'left-6' : 'left-1'}`} />
                 </button>
                 <span className="text-[13px] font-sans text-ink">Show available only</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="pt-6 border-t border-border-warm space-y-4 mb-8">
              <h5 className="text-[12px] font-sans font-bold uppercase tracking-widest text-ink-soft">Minimum Rating</h5>
              <div className="space-y-3">
                {[4, 3, 2].map(rating => (
                  <label key={rating} className="flex items-center group cursor-pointer">
                    <div className={`w-4 h-4 border border-border-deep rounded-none mr-3 flex items-center justify-center transition-colors ${minRating === rating ? 'bg-brown border-brown' : 'bg-white'}`}>
                      {minRating === rating && <Check size={12} className="text-white" />}
                    </div>
                    <input 
                      type="radio" 
                      name="rating"
                      className="hidden" 
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating === minRating ? 0 : rating)}
                    />
                    <span className="text-[13px] font-sans text-ink group-hover:text-brown transition-colors">
                      {rating}★ and above
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Digital Download Filter */}
            <div className="pt-6 border-t border-border-warm space-y-4">
              <h5 className="text-[12px] font-sans font-bold uppercase tracking-widest text-ink-soft">Resources</h5>
              <label className="flex items-center group cursor-pointer">
                <div className={`w-4 h-4 border border-border-deep rounded-none mr-3 flex items-center justify-center transition-colors ${hasFreeDownload ? 'bg-brown border-brown' : 'bg-white'}`}>
                  {hasFreeDownload && <Check size={12} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={hasFreeDownload}
                  onChange={() => setHasFreeDownload(!hasFreeDownload)}
                />
                <span className="text-[13px] font-sans text-ink group-hover:text-brown transition-colors">
                  Free to download
                </span>
              </label>
            </div>

            {(selectedGenres.length > 0 || showAvailableOnly || minRating > 0 || hasFreeDownload) && (
              <button 
                onClick={clearFilters}
                className="w-full mt-10 py-3 border border-brown text-brown text-xs font-bold uppercase tracking-widest hover:bg-brown hover:text-cream transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* BOOK GRID CONTENT */}
        <main className="flex-1 min-w-0">
          {currentBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-bold text-brown disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brown/5"
                  >
                    <ChevronLeft size={16} /> <span>Prev</span>
                  </button>
                  
                  <div className="flex gap-2 mx-4">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 font-sans text-sm transition-colors ${currentPage === i + 1 ? 'bg-espresso text-cream' : 'bg-parchment border border-border-warm text-ink hover:border-brown'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-bold text-brown disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brown/5"
                  >
                    <span>Next</span> <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-32 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-parchment flex items-center justify-center mb-8">
                <BookX size={48} className="text-border-deep" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-ink mb-3">No books found</h2>
              <p className="font-sans text-ink-muted max-w-sm mb-10">Try adjusting your filters or search term to discover other volumes in our collection.</p>
              <button 
                onClick={clearFilters}
                className="bg-espresso text-cream px-10 py-4 font-sans font-bold uppercase tracking-widest text-sm hover:bg-espresso-light"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalogue;

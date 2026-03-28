import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  BookOpen, 
  Rocket, 
  Landmark, 
  Cpu, 
  Brain, 
  User, 
  FlaskConical, 
  Feather,
  ChevronRight,
  TrendingUp,
  Download,
  Calendar
} from 'lucide-react';
import { books } from '../data/books';
import BookCover from '../components/BookCover';
import BookCard from '../components/BookCard';
import StarRating from '../components/StarRating';

const Home = () => {
  // Mock data for featured sections
  const featuredBook = books[0]; // The Great Gatsby
  const popularBooks = books.slice(1, 4);
  const newArrivals = books.slice(4, 12);
  
  const announcements = [
    { id: 1, title: "Holiday closure — Dec 25 & 26", date: "Dec 18", desc: "All branches closed for winter break. Digital loans remain active." },
    { id: 2, title: "New arrivals — 48 books added this week", date: "Dec 20", desc: "Science & Technology sections expanded with 2024 editions." },
    { id: 3, title: "Fine amnesty week — all fees waived", date: "Dec 21", desc: "Late fees waived until Jan 5. Return books at any drop box." },
  ];

  const genres = [
    { name: "Classic Fiction", icon: BookOpen, count: 284 },
    { name: "Science Fiction", icon: Rocket, count: 156 },
    { name: "History", icon: Landmark, count: 203 },
    { name: "Technology", icon: Cpu, count: 178 },
    { name: "Philosophy", icon: Brain, count: 97 },
    { name: "Biography", icon: User, count: 134 },
    { name: "Science", icon: FlaskConical, count: 211 },
    { name: "Poetry", icon: Feather, count: 68 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* SECTION 1: HERO */}
      <section className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* LEFT COLUMN: Content */}
        <div className="w-full md:w-[55%] bg-espresso text-cream flex flex-col justify-center p-8 md:p-16 lg:p-24 relative">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-[32px] h-[1px] bg-gold" />
              <span className="text-[11px] font-sans uppercase tracking-[0.3em] text-gold/70">
                Est. 1987 · University Library
              </span>
            </div>
            
            <h1 className="font-serif leading-[1.1] mb-8">
              <span className="block text-5xl md:text-6xl lg:text-[64px] font-normal text-cream/90">A Library</span>
              <span className="block text-5xl md:text-6xl lg:text-[64px] font-normal text-cream/90">Built For</span>
              <span className="block text-6xl md:text-7xl lg:text-[72px] font-black italic text-gold-light mt-2">Curious</span>
              <span className="block text-6xl md:text-7xl lg:text-[72px] font-black text-cream">Minds.</span>
            </h1>

            <div className="w-full h-px bg-parchment/20 mb-8" />

            <p className="font-sans text-base md:text-lg text-parchment/60 leading-relaxed max-w-md mb-10">
              From timeless classics to cutting-edge research — borrow, reserve, and download from our collection of 12,400+ titles across every discipline.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Link 
                to="/catalogue"
                className="bg-gold text-espresso font-sans font-semibold px-8 py-4 rounded-none text-sm uppercase tracking-[0.2em] hover:bg-gold-light transition-all transform hover:-translate-y-1"
              >
                Browse Collection
              </Link>
              <button className="border border-parchment/30 text-parchment/70 font-sans px-8 py-4 rounded-none text-sm uppercase tracking-[0.2em] hover:border-gold hover:text-gold transition-all">
                Join Free
              </button>
            </div>

            {/* Stats row */}
            <div className="mt-16 pt-8 border-t border-parchment/10 flex items-center justify-between max-w-lg">
              <div className="flex-1">
                <div className="font-serif text-3xl md:text-4xl text-gold mb-1">12,400+</div>
                <div className="text-[10px] md:text-[11px] font-sans uppercase tracking-widest text-parchment/50">Books in Collection</div>
              </div>
              <div className="w-px h-10 bg-parchment/20 mx-4 md:mx-6" />
              <div className="flex-1 text-center">
                <div className="font-serif text-3xl md:text-4xl text-gold mb-1">3</div>
                <div className="text-[10px] md:text-[11px] font-sans uppercase tracking-widest text-parchment/50">Campus Branches</div>
              </div>
              <div className="w-px h-10 bg-parchment/20 mx-4 md:mx-6" />
              <div className="flex-1 text-right">
                <div className="font-serif text-3xl md:text-4xl text-gold mb-1">2,800+</div>
                <div className="text-[10px] md:text-[11px] font-sans uppercase tracking-widest text-parchment/50">Free Downloads</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visuals */}
        <div className="w-full md:w-[45%] bg-parchment flex flex-col items-center justify-between p-8 md:p-12 relative overflow-hidden group">
          <div className="w-full animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-[11px] font-sans uppercase tracking-[0.3em] text-ink-muted mb-12 flex items-center gap-2">
              <ChevronRight size={12} className="text-gold" />
              Featured this week
            </div>

            <div className="relative flex flex-col items-center">
              <div 
                className="w-[160px] md:w-[220px] transition-transform duration-700 group-hover:scale-105"
                style={{ transform: 'rotate(-3deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
              >
                <BookCover book={featuredBook} />
              </div>
              
              <div className="mt-8 text-center bg-white/40 backdrop-blur-sm p-6 border border-white/60 shadow-sm min-w-[280px]">
                <h3 className="font-serif text-xl md:text-2xl text-ink font-bold mb-1">{featuredBook.title}</h3>
                <p className="text-sm text-ink-muted italic mb-3">by {featuredBook.author}</p>
                <div className="flex justify-center mb-3">
                  <StarRating rating={featuredBook.rating} size={14} />
                </div>
                <span className="inline-block bg-brown/10 text-brown text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-medium">
                  {featuredBook.genre}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
             <div className="text-[11px] font-sans uppercase tracking-[0.3em] text-ink-muted mb-4">
              Also popular
            </div>
            <div className="flex gap-4 md:gap-6">
              {popularBooks.map(book => (
                <div key={book.id} className="w-[60px] md:w-[80px] flex flex-col gap-2">
                  <BookCover book={book} />
                  <p className="text-[10px] font-serif text-ink italic truncate">{book.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative element */}
          <div className="absolute -right-8 -bottom-12 font-serif text-[200px] md:text-[300px] leading-none text-parchment-dark opacity-[0.15] select-none pointer-events-none transform rotate-12">
            &
          </div>
        </div>
      </section>

      {/* SECTION 2: ANNOUNCEMENT STRIP */}
      <section className="bg-brown/5 border-y border-border-warm overflow-hidden h-[64px]">
        <div className="flex h-full divide-x divide-border-warm overflow-x-auto scrollbar-hide">
          {announcements.map((item) => (
            <div key={item.id} className="flex-shrink-0 flex items-center gap-4 px-8 h-full min-w-max hover:bg-brown/[0.03] transition-colors cursor-default">
              <Megaphone size={16} className="text-brown" />
              <div className="flex flex-col">
                <span className="text-[13px] font-sans font-semibold text-ink leading-none mb-1">{item.title}</span>
                <span className="text-[11px] font-sans text-ink-muted leading-none">
                  {item.date} <span className="mx-1">·</span> {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: BOOK OF THE WEEK */}
      <section className="bg-cream py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10 pl-2">
            <div className="w-[24px] h-[1px] bg-gold" />
            <span className="text-[11px] font-sans uppercase tracking-[0.3em] text-brown font-bold">
              Book of the Week
            </span>
          </div>

          <div className="bg-parchment border border-border-warm flex flex-col md:flex-row overflow-hidden shadow-sm group">
            {/* Left Image */}
            <div className="w-full md:w-[40%] h-[420px] md:h-auto overflow-hidden">
               <BookCover book={featuredBook} className="w-full h-full transform group-hover:scale-105 transition-transform duration-700" />
            </div>
            
            {/* Right Content */}
            <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col">
              <div className="mb-6">
                 <span className="bg-brown/10 text-brown text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full font-bold">
                  {featuredBook.genre}
                </span>
              </div>
              
              <h2 className="font-serif text-3xl md:text-5xl text-ink font-bold leading-tight mb-2">
                {featuredBook.title}
              </h2>
              <p className="font-serif italic text-xl text-ink-muted mb-6">
                by {featuredBook.author}
              </p>

              <div className="flex items-center gap-3 mb-6">
                <StarRating rating={featuredBook.rating} size={18} />
                <span className="font-serif font-bold text-lg text-ink">{featuredBook.rating}</span>
                <span className="text-ink-muted text-sm">(284 verifying reviews)</span>
              </div>

              <div className="w-full h-px bg-border-warm mb-8" />

              <p className="font-sans text-base md:text-lg text-ink-soft leading-relaxed mb-8 max-w-2xl">
                {featuredBook.description}
              </p>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-10 max-w-lg">
                <div className="flex flex-col">
                   <span className="text-[10px] font-sans uppercase tracking-widest text-ink-muted mb-1">Published</span>
                   <span className="text-sm font-sans font-medium text-ink">{featuredBook.published_year}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-sans uppercase tracking-widest text-ink-muted mb-1">Number of Pages</span>
                   <span className="text-sm font-sans font-medium text-ink">{featuredBook.pages} pages</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-sans uppercase tracking-widest text-ink-muted mb-1">Language</span>
                   <span className="text-sm font-sans font-medium text-ink">{featuredBook.language}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-sans uppercase tracking-widest text-ink-muted mb-1">ISBN Reference</span>
                   <span className="text-sm font-sans font-medium text-ink">{featuredBook.isbn}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-auto">
                <button className="bg-espresso text-cream font-sans font-semibold px-8 py-4 rounded-none text-sm uppercase tracking-[0.15em] hover:bg-espresso-light transition-all">
                  Borrow This Book
                </button>
                {featuredBook.gutenberg_url && (
                  <a 
                    href={featuredBook.gutenberg_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-brown text-brown font-sans font-semibold px-8 py-4 rounded-none text-sm uppercase tracking-[0.15em] hover:bg-brown hover:text-cream transition-all flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download Free PDF
                  </a>
                )}
                <button className="text-ink-muted hover:text-brown transition-colors text-sm underline underline-offset-4 ml-2">
                  Schedule Pickup
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: BROWSE BY GENRE */}
      <section className="bg-parchment py-24 px-6 border-y border-border-warm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-ink font-bold mb-3">Explore the Collection</h2>
            <p className="font-sans text-lg text-ink-muted italic">Every discipline. Every interest.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {genres.map((genre, idx) => (
              <div 
                key={idx}
                className="bg-cream border border-border-warm p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-brown hover:bg-brown/5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-parchment flex items-center justify-center mb-6 group-hover:bg-brown/10 transition-colors">
                  <genre.icon size={24} className="text-brown" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink mb-2 group-hover:text-brown transition-colors">{genre.name}</h3>
                <span className="text-[11px] font-sans uppercase tracking-widest text-ink-muted">{genre.count} volumes</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: READING STATS BANNER */}
      <section className="bg-espresso py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-[40%] text-center lg:text-left">
            <h2 className="font-serif text-3xl md:text-4xl text-cream leading-snug mb-4">
              Join 4,200+ students reading on BookVault
            </h2>
            <p className="font-sans text-base text-parchment/60 mb-8 max-w-md mx-auto lg:mx-0">
              Free to join for all university members. No credit card required. Instant access to digital loans and campus reservations.
            </p>
            <button className="bg-gold text-espresso font-sans font-bold px-8 py-4 rounded-none text-sm uppercase tracking-[0.2em] hover:bg-gold-light transition-all">
              Get Your Library Card
            </button>
          </div>

          <div className="w-full lg:w-[60%] grid grid-cols-2 gap-4">
            {[
              { val: "4,218", label: "Active Members" },
              { val: "892", label: "Borrowed Today" },
              { val: "127", label: "Pickups Pending" },
              { val: "$0", label: "Lifetime Cost" }
            ].map((stat, i) => (
              <div key={i} className="bg-espresso-light rounded-sm p-8 border border-parchment/10 flex flex-col items-center lg:items-start group hover:border-gold/30 transition-colors">
                <span className="font-serif text-4xl md:text-5xl text-gold font-bold mb-2 group-hover:scale-110 transition-transform origin-left">{stat.val}</span>
                <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-parchment/50 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: RECENTLY ADDED */}
      <section className="bg-cream py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={16} className="text-gold" />
                <span className="text-[11px] font-sans uppercase tracking-[0.3em] text-gold font-bold">New Arrivals</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-ink font-bold">Fresh to the Shelves</h2>
            </div>
            <Link to="/catalogue" className="text-brown font-sans font-semibold uppercase tracking-widest text-[12px] pb-2 border-b-2 border-brown/30 hover:border-brown transition-all">
              View All Arrivals
            </Link>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
            {newArrivals.map((book) => (
              <div key={book.id} className="min-w-[160px] md:min-w-[180px] group transition-transform hover:-translate-y-2">
                <Link to={`/books/${book.id}`}>
                  <BookCover book={book} className="w-full aspect-[2/3] shadow-lg group-hover:shadow-2xl transition-shadow" />
                </Link>
                <div className="mt-4">
                  <h4 className="font-serif font-bold text-ink group-hover:text-brown transition-colors truncate">{book.title}</h4>
                  <p className="text-xs text-ink-muted italic mb-2">by {book.author}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={book.rating} size={10} />
                    <span className="text-[10px] font-bold text-ink-soft">{book.rating}</span>
                  </div>
                  <Link to={`/books/${book.id}`} className="text-brown text-[11px] font-bold uppercase tracking-widest underline underline-offset-4 decoration-brown/30 hover:decoration-brown transition-all">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="bg-espresso-light text-parchment/60 pt-20 pb-10 px-6 border-t border-parchment/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-parchment/10">
            {/* Col 1 */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2">
                <BookOpen className="text-gold" size={28} />
                <div className="flex items-baseline font-serif text-[28px] tracking-tight">
                  <span className="text-white">Book</span>
                  <span className="text-gold-light font-bold">Vault</span>
                </div>
              </Link>
              <p className="font-sans text-sm text-parchment/50 leading-relaxed max-w-xs">
                Your university's complete library, reimagined for the digital age. A comprehensive portal for learning and discovery.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-sans uppercase tracking-[2px] text-parchment/30 italic">
                  A project by the Faculty of Computer Science
                </span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-6">Library</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="text-sm hover:text-gold transition-colors">Home</Link></li>
                <li><Link to="/catalogue" className="text-sm hover:text-gold transition-colors">Catalogue</Link></li>
                <li><Link to="/" className="text-sm hover:text-gold transition-colors">Book of the Week</Link></li>
                <li><Link to="/" className="text-sm hover:text-gold transition-colors">Free Downloads</Link></li>
                <li><Link to="/" className="text-sm hover:text-gold transition-colors">Resources</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-6">My Account</h4>
              <ul className="space-y-4">
                <li className="text-sm hover:text-gold transition-colors cursor-pointer">Sign In</li>
                <li className="text-sm hover:text-gold transition-colors cursor-pointer">Register</li>
                <li><Link to="/my-library" className="text-sm hover:text-gold transition-colors">My Library</Link></li>
                <li className="text-sm hover:text-gold transition-colors cursor-pointer">My Fines</li>
                <li className="text-sm hover:text-gold transition-colors cursor-pointer">Borrowing History</li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-gold/60 mb-6">Library Hours</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Mon – Fri</span>
                  <span className="text-parchment font-medium">8:00 AM – 9:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Saturday</span>
                  <span className="text-parchment font-medium">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sunday</span>
                  <span className="text-parchment font-medium">11:00 AM – 5:00 PM</span>
                </div>
                <div className="pt-2 flex items-center gap-2 text-xs text-parchment/40 italic">
                  <Calendar size={12} />
                  <span>Public Holidays: Closed</span>
                </div>
                <div className="mt-6 pt-6 border-t border-parchment/10">
                   <p className="text-xs text-parchment/40">Campus Central Branch</p>
                   <p className="text-xs text-parchment/40">12 University Way, Cambridge</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] font-sans text-parchment/30 uppercase tracking-[0.2em]">
              © 2024 BookVault · University Library Management System
            </p>
            <p className="text-[11px] font-sans text-parchment/30 uppercase tracking-[0.2em]">
              Built with React · Vite · Tailwind CSS
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;

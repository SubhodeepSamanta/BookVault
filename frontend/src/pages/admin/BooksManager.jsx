import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  X, 
  BookMarked, 
  Check,
  Star as StarIcon,
  ChevronDown
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import BookCover from '../../components/BookCover';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { books } from '../../data/books';
import { useNavigate } from 'react-router-dom';

const BooksManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [bookList, setBookList] = useState([...books]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');

  // Form State
  const initialForm = {
    title: '',
    author: '',
    isbn: '',
    genre: 'Classic Fiction',
    year: '2024',
    totalCopies: 5,
    availableCopies: 5,
    pages: 350,
    language: 'English',
    description: '',
    gutenberg_url: '',
    cover: { bg: '#1E3A5F', accent: '#60A5FA', text: '#EFF6FF' }
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const genres = [
    'Classic Fiction', 'Science Fiction', 'Philosophy', 
    'History', 'Poetry', 'Biography', 'Arts', 'Economics', 'Technology', 'Science'
  ];

  const colorPresets = [
    { bg:'#1E3A5F', accent:'#60A5FA', text:'#EFF6FF' },
    { bg:'#1A3A2A', accent:'#4ADE80', text:'#F0FFF4' },
    { bg:'#3B1A5F', accent:'#C084FC', text:'#FAF5FF' },
    { bg:'#5F1A1A', accent:'#F87171', text:'#FFF5F5' },
    { bg:'#2D2416', accent:'#D97706', text:'#FFFBEB' },
    { bg:'#1A2A3F', accent:'#38BDF8', text:'#F0F9FF' },
  ];

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      ...book,
      year: book.published_year || '2024',
      totalCopies: book.total_copies || 5,
      availableCopies: book.available_copies || 5
    });
    setShowDrawer(true);
  };

  const handleAddNew = () => {
    setEditingBook(null);
    setFormData(initialForm);
    setShowDrawer(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBookList(prev => prev.filter(b => b.id !== id));
      addToast('Book removed from collection.', 'error');
    }
  };

  const toggleFeatured = (id) => {
    setBookList(prev => prev.map(b => b.id === id ? { ...b, is_featured: !b.is_featured } : b));
    addToast('Featured status updated.', 'success');
  };

  const saveBook = (e) => {
    e.preventDefault();
    if (editingBook) {
      setBookList(prev => prev.map(b => b.id === editingBook.id ? { ...b, ...formData } : b));
      addToast('Book details updated.', 'success');
    } else {
      const newBook = { ...formData, id: bookList.length + 1 };
      setBookList(prev => [newBook, ...prev]);
      addToast('New book added to library.', 'success');
    }
    setShowDrawer(false);
  };

  const filteredBooks = bookList.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQ.toLowerCase()) || 
                         b.author.toLowerCase().includes(searchQ.toLowerCase());
    const matchesGenre = filterGenre === 'All' || b.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <AdminLayout title="Books Manager">
      <div className="flex h-[calc(100vh-160px)] gap-10 overflow-hidden relative">
        
        {/* MAIN TABLE AREA */}
        <div className={`flex-1 overflow-y-auto transition-all duration-500 ${showDrawer ? 'opacity-40 pointer-events-none skew-y-0 translate-x-[-20px]' : ''}`}>
          
          {/* TOOLBAR */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
            <div className="flex gap-4 items-center">
              <div className="relative group/search">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within/search:text-brown transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search titles or authors..." 
                  className="bg-parchment border border-border-warm pl-11 pr-4 py-3 text-sm font-sans w-72 focus:outline-none focus:border-brown transition-all"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                />
              </div>
              <div className="relative">
                <select 
                  className="bg-parchment border border-border-warm px-6 py-3 text-sm font-sans font-bold appearance-none pr-10 focus:outline-none focus:border-brown cursor-pointer"
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                >
                  <option value="All">All Genres</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted" />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="border-2 border-brown text-brown px-6 py-3 font-sans font-bold text-xs uppercase tracking-widest hover:bg-brown hover:text-cream transition-all">
                Feature a Book
              </button>
              <button 
                onClick={handleAddNew}
                className="bg-espresso text-cream px-8 py-3 font-sans font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
              >
                <Plus size={16} /> Add New Book
              </button>
            </div>
          </div>

          {/* BOOKS TABLE */}
          <div className="bg-parchment border border-border-warm overflow-hidden shadow-sm">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-espresso text-parchment/60 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
                      <th className="px-6 py-4 border-b border-parchment/10 text-center">Cover</th>
                      <th className="px-6 py-4 border-b border-parchment/10">Title & Author</th>
                      <th className="px-6 py-4 border-b border-parchment/10">Genre</th>
                      <th className="px-6 py-4 border-b border-parchment/10">Copies</th>
                      <th className="px-6 py-4 border-b border-parchment/10">Rating</th>
                      <th className="px-6 py-4 border-b border-parchment/10">Featured</th>
                      <th className="px-6 py-4 border-b border-parchment/10 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border-warm">
                   {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-cream/40 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex justify-center transform group-hover:scale-110 transition-transform duration-500">
                               <BookCover width={36} height={52} cover={book.cover} title={book.title} />
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-sans font-bold text-ink text-[13px]">{book.title}</div>
                            <div className="font-sans italic text-ink-muted text-[11px] mt-0.5">{book.author}</div>
                            <div className="font-mono text-[9px] text-ink-muted mt-1 uppercase opacity-40 group-hover:opacity-100 transition-opacity">ISBN: 978-0141023908</div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="text-[10px] font-sans font-bold uppercase tracking-widest border border-border-warm px-2 py-0.5 bg-cream/50 text-ink-muted">
                               {book.genre}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 w-24">
                               <div className="flex justify-between text-[11px] font-bold font-sans">
                                  <span>{book.available_copies || book.availableCopies}</span>
                                  <span className="text-ink-muted">/ {book.total_copies || book.totalCopies}</span>
                                </div>
                                <div className="h-1 bg-border-warm rounded-full overflow-hidden">
                                   <div 
                                    className="h-full bg-brown group-hover:bg-gold transition-colors duration-500" 
                                    style={{ width: `${((book.available_copies || book.availableCopies) / (book.total_copies || book.totalCopies)) * 100}%` }}
                                   />
                                </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                               <StarIcon size={12} className="text-gold fill-gold" />
                               <span className="font-sans font-bold text-[12px]">{book.rating || '4.5'}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <button 
                              onClick={() => toggleFeatured(book.id)}
                              className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${book.is_featured ? 'bg-gold' : 'bg-border-warm'}`}
                            >
                               <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${book.is_featured ? 'right-1' : 'left-1'}`} />
                            </button>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                               <button 
                                onClick={() => handleEdit(book)}
                                className="bg-blue-50 text-blue-600 border border-blue-100 p-2 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-0.5"
                                title="Edit Book"
                               >
                                  <Pencil size={14} />
                               </button>
                               <button 
                                onClick={() => handleDelete(book.id)}
                                className="bg-red-50 text-red-600 border border-red-100 p-2 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-0.5"
                                title="Delete Book"
                               >
                                  <Trash2 size={14} />
                               </button>
                               {book.gutenberg_url && (
                                 <a 
                                  href={book.gutenberg_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="bg-parchment border border-border-warm p-2 hover:bg-gold hover:border-gold hover:text-espresso transition-all transform hover:-translate-y-0.5"
                                 >
                                    <ExternalLink size={14} />
                                 </a>
                               )}
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* SIDE DRAWER (PUSH LAYOUT) */}
        {showDrawer && (
          <div className="w-[480px] bg-cream border-l border-border-warm flex flex-col h-full animate-in slide-in-from-right duration-500 shadow-2xl relative z-50">
             {/* DRAWER HEADER */}
             <div className="bg-espresso px-8 py-6 flex justify-between items-center shrink-0">
                <div>
                   <h2 className="font-serif text-2xl font-bold text-cream underline underline-offset-8 decoration-gold/50">
                      {editingBook ? 'Edit Book Details' : 'Add New Edition'}
                   </h2>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="text-parchment/60 hover:text-gold transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                   <X size={24} />
                </button>
             </div>

             {/* DRAWER BODY */}
             <form onSubmit={saveBook} className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-thin scrollbar-thumb-gold/20">
                
                {/* LIVE PREVIEW BOX */}
                <div className="bg-parchment border-2 border-dashed border-gold/30 p-8 flex flex-col items-center justify-center relative group/preview overflow-hidden">
                   <div className="absolute top-2 right-4 text-[9px] font-sans font-bold uppercase tracking-widest text-gold-dark italic">Live Cover Preview</div>
                   <div className="transform scale-110 group-hover:scale-125 transition-transform duration-700 shadow-2xl skew-y-1">
                      <BookCover 
                        width={100} 
                        height={140} 
                        cover={formData.cover} 
                        title={formData.title || "The Title"} 
                      />
                   </div>
                   <div className="mt-8 text-center">
                      <div className="font-serif text-xl font-bold text-ink leading-tight">{formData.title || "Untiled Work"}</div>
                      <div className="font-sans text-[11px] text-ink-muted italic mt-1">{formData.author || "Anonymous Author"}</div>
                   </div>
                </div>

                {/* FORM FIELDS */}
                <div className="space-y-6">
                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Book Title</label>
                         <input 
                           type="text" 
                           required
                           className="w-full bg-parchment border border-border-warm px-5 py-4 text-sm font-sans focus:outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all font-bold text-ink"
                           value={formData.title}
                           onChange={(e) => setFormData({...formData, title: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Author Name</label>
                         <input 
                           type="text" 
                           required
                           className="w-full bg-parchment border border-border-warm px-5 py-4 text-sm font-sans focus:outline-none focus:border-brown transition-all overflow-hidden"
                           value={formData.author}
                           onChange={(e) => setFormData({...formData, author: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">ISBN-13</label>
                         <input 
                           type="text" 
                           className="w-full bg-parchment border border-border-warm px-5 py-4 text-sm font-mono focus:outline-none focus:border-brown transition-all"
                           placeholder="978-XXXXXXXXXX"
                           value={formData.isbn}
                           onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Genre</label>
                         <select 
                           className="w-full bg-parchment border border-border-warm px-5 py-4 text-sm font-sans font-bold focus:outline-none focus:border-brown"
                           value={formData.genre}
                           onChange={(e) => setFormData({...formData, genre: e.target.value})}
                         >
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Copies</label>
                         <input 
                           type="number" min="1"
                           className="w-full bg-parchment border border-border-warm px-5 py-4 text-sm font-sans focus:outline-none focus:border-brown transition-all"
                           value={formData.totalCopies}
                           onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Year</label>
                         <input 
                           type="text"
                           className="w-full bg-parchment border border-border-warm px-5 py-4 text-sm font-sans focus:outline-none focus:border-brown transition-all"
                           value={formData.year}
                           onChange={(e) => setFormData({...formData, year: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Pages</label>
                         <input 
                           type="number"
                           className="w-full bg-parchment border border-border-warm px-5 py-4 text-sm font-sans focus:outline-none focus:border-brown transition-all"
                           value={formData.pages}
                           onChange={(e) => setFormData({...formData, pages: parseInt(e.target.value)})}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Cover Aesthetic</label>
                      <div className="flex flex-wrap gap-4 pt-2">
                         {colorPresets.map((preset, idx) => (
                           <button
                             key={idx}
                             type="button"
                             className={`w-10 h-10 border-2 transition-all ${formData.cover.bg === preset.bg ? 'border-brown scale-125 shadow-md shadow-gold/20 rotate-3' : 'border-transparent hover:scale-110'}`}
                             style={{ backgroundColor: preset.bg }}
                             onClick={() => setFormData({...formData, cover: preset})}
                           >
                              <div className="w-full h-1/3 mt-1" style={{ backgroundColor: preset.accent }} />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Digital Link (Gutenberg)</label>
                      <input 
                        type="url" 
                        className="w-full bg-parchment border border-border-warm px-5 py-4 text-xs font-mono focus:outline-none focus:border-brown"
                        placeholder="https://gutenberg.org/..."
                        value={formData.gutenberg_url}
                        onChange={(e) => setFormData({...formData, gutenberg_url: e.target.value})}
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-ink-muted ml-1">Description / Summary</label>
                      <textarea 
                        className="w-full bg-parchment border border-border-warm px-5 py-4 text-sm font-sans h-32 focus:outline-none focus:border-brown scrollbar-thin"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                   </div>
                </div>

                {/* DRAWER FOOTER BUTTONS */}
                <div className="pt-6 border-t border-border-warm flex gap-4 sticky bottom-0 bg-cream pb-4">
                   <button 
                     type="button"
                     onClick={() => setShowDrawer(false)}
                     className="flex-1 border border-border-warm text-ink-muted font-sans font-bold uppercase tracking-widest text-xs py-4 hover:bg-parchment transition-all"
                   >
                      Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 bg-brown text-cream font-sans font-bold uppercase tracking-widest text-xs py-4 hover:bg-espresso transition-all shadow-xl shadow-brown/10 flex items-center justify-center gap-2"
                   >
                      <Check size={16} /> Save Book
                   </button>
                </div>
             </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BooksManager;

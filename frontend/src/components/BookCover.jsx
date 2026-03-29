import React from 'react';

const BookCover = ({ book, className = '' }) => {
  if (!book) return null;

  // Handle both nested 'cover' object (if any) and flat database fields
  const title = book.title;
  const author = book.author;
  const genre = book.genre;
  const bg = book.cover_bg || (book.cover && book.cover.bg) || '#F5F5DC';
  const accent = book.cover_accent || (book.cover && book.cover.accent) || '#DAA520';
  const text = book.cover_text || (book.cover && book.cover.text) || '#3E2723';

  // Clamp font size based on title length
  const getTitleClass = (text = '') => {
    if (text.length < 15) return 'text-xl';
    if (text.length <= 25) return 'text-base';
    return 'text-sm';
  };

  return (
    <div 
      className={`aspect-[2/3] relative overflow-hidden rounded-sm shadow-md group ${className}`}
      style={{ 
        backgroundColor: bg,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {/* Left spine strip */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[8%] opacity-80"
        style={{ backgroundColor: accent }}
      />

      {/* Top decorative line */}
      <div 
        className="absolute top-[8%] left-[14%] right-[8%] h-[1px] opacity-30"
        style={{ backgroundColor: text }}
      />

      {/* Bottom decorative line */}
      <div 
        className="absolute bottom-[8%] left-[14%] right-[8%] h-[1px] opacity-30"
        style={{ backgroundColor: text }}
      />

      {/* Author line */}
      <div 
        className="absolute top-[12%] left-0 right-0 text-center font-serif italic text-[10px] tracking-wide opacity-70 px-4"
        style={{ color: text }}
      >
        {author}
      </div>

      {/* Title */}
      <div 
        className={`absolute inset-0 flex items-center justify-center px-4 font-serif font-bold text-center leading-tight ${getTitleClass(title)}`}
        style={{ color: text }}
      >
        {title}
      </div>

      {/* Genre badge */}
      <div 
        className="absolute bottom-[12%] left-0 right-0 text-center font-sans text-[9px] uppercase tracking-widest opacity-60 px-2"
        style={{ color: text }}
      >
        {genre}
      </div>
    </div>
  );
};

export default BookCover;

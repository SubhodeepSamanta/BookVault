import React from 'react';

const BookCover = ({ book, className = '', size = 'md' }) => {
  if (!book) return null;

  // Sizing scale mapping
  const scales = {
    'xs': 0.38,
    'sm': 0.6,
    'md': 1.0,
    'lg': 1.25,
    'xl': 1.5
  };
  const scale = scales[size] || 1.0;

  const title = book.title;
  const author = book.author;
  const genre = book.genre;
  const bg = book.cover_bg || (book.cover && book.cover.bg) || '#F5F5DC';
  const accent = book.cover_accent || (book.cover && book.cover.accent) || '#DAA520';
  const text = book.cover_text || (book.cover && book.cover.text) || '#3E2723';

  const getTitleStyle = (text = '') => {
    const len = text.length;
    let baseSize = 20;
    if (len > 50) baseSize = 10;
    else if (len > 35) baseSize = 12;
    else if (len > 25) baseSize = 14;
    else if (len > 15) baseSize = 18;
    
    // Scale the base size
    const finalSize = Math.max(8, baseSize * scale);
    
    return { 
      fontSize: `${finalSize}px`,
      maxHeight: size === 'xs' || size === 'sm' ? '35%' : '45%',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: size === 'xs' || size === 'sm' ? '2' : '4',
      WebkitBoxOrient: 'vertical',
      paddingBottom: size === 'xs' ? '18%' : '0' // Shift up slightly for XS to not hit genre
    };
  };

  return (
    <div 
      className={`aspect-[2/3] relative overflow-hidden rounded-sm shadow-md group ${className}`}
      style={{ 
        backgroundColor: bg,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: `${20 * scale}px ${20 * scale}px`
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
        className="absolute top-[12%] left-0 right-0 text-center font-serif italic tracking-wide opacity-70 px-4"
        style={{ 
          color: text,
          fontSize: `${Math.max(6, 10 * scale)}px`
        }}
      >
        {author}
      </div>

      {/* Title */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div 
          className="font-serif font-bold text-center leading-[1.1]"
          style={{ color: text, ...getTitleStyle(title) }}
        >
          {title}
        </div>
      </div>

      {/* Genre badge */}
      <div 
        className="absolute bottom-[12%] left-0 right-0 text-center font-sans uppercase tracking-widest opacity-60 px-2"
        style={{ 
          color: text,
          fontSize: `${Math.max(5, 9 * scale)}px`
        }}
      >
        {genre}
      </div>
    </div>
  );
};

export default BookCover;

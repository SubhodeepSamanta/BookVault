import React from 'react';
import { Link } from 'react-router-dom';
import BookCover from './BookCover';
import StarRating from './StarRating';

const BookCard = ({ book }) => {
  if (!book) return null;

  const isAvailable = book.available_copies > 0;

  return (
    <Link 
      to={`/books/${book.id}`}
      className="bg-parchment border border-border-warm hover:border-brown hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <BookCover book={book} className="w-full h-full" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2">
          <span className="bg-brown/80 text-cream text-[9px] uppercase px-2 py-0.5 rounded-sm backdrop-blur-none font-sans tracking-wider">
            {book.genre}
          </span>
        </div>
        
        {book.gutenberg_url && (
          <div className="absolute top-2 right-2">
            <span className="bg-gold text-espresso text-[9px] font-bold px-2 py-0.5 rounded-sm font-sans tracking-wider">
              FREE
            </span>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2">
          <div className="flex items-center gap-1.5 bg-black/60 text-white px-2 py-0.5 rounded-sm text-[9px] font-sans">
            <div className={`w-1 h-1 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
            {isAvailable ? 'Available' : 'Unavailable'}
          </div>
        </div>
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-serif font-semibold text-ink text-sm leading-snug line-clamp-2 mb-1 group-hover:text-brown transition-colors">
          {book.title}
        </h3>
        <p className="font-sans text-ink-muted text-xs mb-2">
          {book.author}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] text-ink-muted">
            <StarRating rating={book.rating} size={10} />
            <span>{book.rating}</span>
            <span>({book.rating_count})</span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border-warm flex items-center justify-between">
            <span className="text-[10px] text-ink-muted bg-cream px-2 py-0.5 border border-border-warm font-sans">
              {book.available_copies}/{book.total_copies} copies
            </span>
            <span className="text-brown text-xs font-medium hover:underline flex items-center gap-1">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;

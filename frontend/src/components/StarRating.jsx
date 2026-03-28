import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 12 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${
            i < fullStars 
              ? 'fill-gold text-gold' 
              : (i === fullStars && hasHalfStar) 
                ? 'fill-gold/50 text-gold' 
                : 'text-ink-muted'
          }`}
        />
      ))}
    </div>
  );
};

export default StarRating;

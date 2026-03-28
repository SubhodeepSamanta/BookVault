import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarPicker = ({ value = 0, onChange, size = 28 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-colors focus:outline-none"
        >
          <Star
            size={size}
            className={`cursor-pointer transition-colors ${
              star <= (hover || value)
                ? 'fill-gold text-gold'
                : 'text-border-deep'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarPicker;

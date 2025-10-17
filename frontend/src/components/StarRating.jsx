import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "../styles/StarRating.css";

function StarRating({ rating = 0, interactive = false, onRatingChange, size = "medium" }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive ? (hoverRating || rating) : rating;

  const renderStar = (position) => {
    const filled = displayRating >= position;
    const halfFilled = displayRating >= position - 0.5 && displayRating < position;

    return (
      <span
        key={position}
        className={`star ${interactive ? "interactive" : ""} ${size}`}
        onClick={() => handleClick(position)}
        onMouseEnter={() => handleMouseEnter(position)}
        onMouseLeave={handleMouseLeave}
      >
        {filled ? (
          <FaStar className="star-icon filled" />
        ) : halfFilled ? (
          <FaStarHalfAlt className="star-icon half-filled" />
        ) : (
          <FaRegStar className="star-icon empty" />
        )}
      </span>
    );
  };

  return (
    <div className="star-rating-container">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((position) => renderStar(position))}
      </div>
      {!interactive && rating > 0 && (
        <span className="rating-value">({rating.toFixed(1)})</span>
      )}
    </div>
  );
}

export default StarRating;

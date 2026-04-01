import { useState } from 'react';
import './FeedbackRating.css';

const FeedbackRating = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitFeedback = (e) => {
    e.preventDefault();
    if (!rating) {
      return;
    }

    onSubmit?.({ rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <form className="feedback-rating" onSubmit={submitFeedback}>
      <h4>Donation Feedback</h4>
      <div className="stars" role="radiogroup" aria-label="Rate donation experience">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= rating ? 'active' : ''}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience"
      />
      <button type="submit" className="submit-btn">
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackRating;

type RatingStarsProps = {
  rating: number;
};

export function RatingStars({ rating }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex text-sm text-amber-400" aria-label={`${rating} stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index}>{index + 1 <= Math.round(rating) ? "★" : "☆"}</span>
        ))}
      </div>
      <span className="text-sm font-bold text-ink">{rating.toFixed(1)}</span>
    </div>
  );
}

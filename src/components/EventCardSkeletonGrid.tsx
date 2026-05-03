export function EventCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="event-card-grid event-card-grid-skeleton" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="event-card-mobile event-card-skeleton" key={index}>
          <div className="event-card-header">
            <div className="event-card-dateblock event-card-dateblock-skeleton">
              <span className="sg-skeleton sg-skeleton-line sg-skeleton-month" />
              <span className="sg-skeleton sg-skeleton-line sg-skeleton-day" />
              <span className="sg-skeleton sg-skeleton-line sg-skeleton-year" />
            </div>
            <div className="event-card-topline">
              <span className="sg-skeleton sg-skeleton-pill" />
              <span className="sg-skeleton sg-skeleton-pill sg-skeleton-pill-wide" />
            </div>
          </div>
          <div className="event-card-body">
            <span className="sg-skeleton sg-skeleton-line sg-skeleton-title" />
            <span className="sg-skeleton sg-skeleton-line sg-skeleton-subtitle" />
            <span className="sg-skeleton sg-skeleton-line sg-skeleton-meta" />
          </div>
          <div className="event-card-facts">
            <span className="sg-skeleton sg-skeleton-line sg-skeleton-fact" />
            <span className="sg-skeleton sg-skeleton-line sg-skeleton-fact" />
          </div>
          <div className="event-card-actions">
            <span className="sg-skeleton sg-skeleton-button" />
            <span className="sg-skeleton sg-skeleton-button" />
          </div>
        </div>
      ))}
    </div>
  );
}

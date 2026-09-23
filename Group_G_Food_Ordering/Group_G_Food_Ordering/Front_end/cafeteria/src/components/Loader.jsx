import React from "react";

// A steaming bowl with a label — for page-level loading.
export function Loader({ label = "Loading…" }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="bowl-wrap" aria-hidden="true">
        <span className="steam s1" />
        <span className="steam s2" />
        <span className="steam s3" />
        <svg className="bowl" viewBox="0 0 64 40">
          <path d="M4 10h56c0 15.5-12.5 28-28 28S4 25.5 4 10Z" />
          <path className="bowl-rim" d="M2 10h60" />
        </svg>
      </div>
      <p>{label}</p>
    </div>
  );
}

// Placeholder shop tabs and menu cards shaped like the real layout.
export function CatalogueSkeleton() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading shops and menu">
      <div className="restaurant-tabs">
        {[0, 1, 2].map((i) => (
          <div key={i} className="restaurant skeleton-tab">
            <span className="sk sk-circle" />
            <span className="sk-lines">
              <span className="sk sk-line w60" />
              <span className="sk sk-line w40" />
            </span>
          </div>
        ))}
      </div>
      <div className="sk sk-line w30 sk-heading" />
      <div className="order-layout">
        <div className="menu-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="menu-card skeleton-card" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="sk sk-image" />
              <div className="card-content">
                <span className="sk sk-line w70" />
                <span className="sk sk-line w90" />
                <span className="sk sk-line w40" />
              </div>
            </div>
          ))}
        </div>
        <div className="basket skeleton-basket">
          <span className="sk sk-line w40 dark" />
          <span className="sk sk-line w70 dark" />
          <span className="sk sk-block dark" />
        </div>
      </div>
    </div>
  );
}

export const Spinner = () => <span className="spinner" aria-hidden="true" />;

export function TypingDots() {
  return (
    <span className="typing-dots" aria-label="Assistant is typing">
      <i />
      <i />
      <i />
    </span>
  );
}

import React from 'react';

export default function CTAButton({ label, url, onClick }) {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="cta-button"
        onClick={handleClick}
      >
        {label || 'Book Now'}
      </a>
    );
  }
  return (
    <button type="button" className="cta-button" onClick={handleClick}>
      {label || 'Book Now'}
    </button>
  );
}

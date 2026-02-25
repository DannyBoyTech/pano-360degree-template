import React from 'react';

export default function Header({ brandName }) {
  return (
    <header className="app-header">
      <div className="header-brand">{brandName || 'Resort Explorer'}</div>
    </header>
  );
}

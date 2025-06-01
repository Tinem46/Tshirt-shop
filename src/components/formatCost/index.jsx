// CurrencyFormat.js (hoặc CurrencyFormat.tsx nếu dùng TypeScript)
import React from 'react';

const FormatCost = ({ value }) => {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

  return <span>{formatted}</span>;
};

export default FormatCost;

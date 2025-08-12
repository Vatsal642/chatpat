"use client";

import React from 'react';

export default function MessageBubble(props: { role: 'user' | 'assistant'; text?: string; imageUrl?: string }) {
  const { role, text, imageUrl } = props;
  return (
    <div className={`p-2 rounded ${role === 'user' ? 'bg-primary text-white' : 'bg-light border'}`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="generated" className="img-fluid rounded" />
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}
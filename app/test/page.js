'use client'
import { useEffect, useRef } from 'react';

export default function TestChat() {
  const messagesRef = useRef(null);

  // always scroll to bottom when input focuses
  useEffect(() => {
    function updateVh() {
      const vh = window.visualViewport
        ? window.visualViewport.height * 0.01
        : window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    updateVh();
    window.visualViewport?.addEventListener('resize', updateVh);
    window.visualViewport?.addEventListener('scroll', updateVh);
    window.addEventListener('resize', updateVh);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateVh);
      window.visualViewport?.removeEventListener('scroll', updateVh);
      window.removeEventListener('resize', updateVh);
    };
  }, []);

  return (
    <div
      style={{
        height: 'calc(var(--vh) * 100)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ flexShrink: 0, padding: 8, background: '#ddd' }}>
        Header
      </div>

      <div
        ref={messagesRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          background: '#f9f9f9'
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{ padding: 8 }}>
            Message {i + 1}
          </div>
        ))}
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid #ccc' }}>
        <div style={{ display: 'flex', padding: 8, gap: 8 }}>
          <textarea
            style={{ flex: 1, resize: 'none' }}
            placeholder="Type…"
          />
          <button>Send</button>
        </div>
      </div>
    </div>
  );
}

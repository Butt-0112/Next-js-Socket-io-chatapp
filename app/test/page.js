'use client'
import React, { useRef, useEffect } from "react";

/**
 * Hook to dynamically set the height of a container
 * to the current visible viewport height (works with Android keyboard).
 */

export default function TestChatAndroid() {
  

  return (
    <div className="chat-container">
      <header className="header">Header</header>
      <div className="messages">
        {Array.from({ length: 50 }).map((_, i) => (
          <div className="msg" key={i}>Message {i}</div>
        ))}
      </div>
      <div className="input-bar">
        <input placeholder="Type…" />
        <button>Send</button>
      </div>
    </div>
  );
}

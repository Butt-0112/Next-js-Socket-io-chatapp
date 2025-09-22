'use client'
import React, { useRef, useEffect } from "react";

/**
 * Hook to dynamically set the height of a container
 * to the current visible viewport height (works with Android keyboard).
 */

export default function TestChatAndroid() {
  const messageRef = useRef(null)
  useEffect(() => {
function updateVh() {
  const messageContainer = messageRef.current
  const vh = window.visualViewport
    ? window.visualViewport.height 
    : window.innerHeight ;
  if(messageContainer){
    messageContainer.style.height = vh+'px'
  }
}
updateVh();
window.visualViewport?.addEventListener('resize', updateVh);
window.visualViewport?.addEventListener('scroll', updateVh);
window.addEventListener('resize', updateVh);

  }, []);
  return (
    <div className="chat-container">
      <header className="header">Header</header>
      <div ref={messageRef} className="messages">
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

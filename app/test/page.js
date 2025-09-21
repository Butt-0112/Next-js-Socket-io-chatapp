'use client'
import React, { useRef, useEffect } from "react";

/**
 * Hook to dynamically set the height of a container
 * to the current visible viewport height (works with Android keyboard).
 */
function useVisualViewportHeight(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function updateHeight() {
      const vh = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      el.style.height = vh + "px";
    }

    updateHeight();

    window.visualViewport?.addEventListener("resize", updateHeight);
    window.visualViewport?.addEventListener("scroll", updateHeight);
    window.addEventListener("resize", updateHeight);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.visualViewport?.removeEventListener("scroll", updateHeight);
      window.removeEventListener("resize", updateHeight);
    };
  }, [ref]);
}

export default function TestChatAndroid() {
  const chatRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  useVisualViewportHeight(chatRef);

  // auto scroll to bottom on input focus
  useEffect(() => {
    function scrollToBottom() {
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop =
            messagesRef.current.scrollHeight;
        }
      }, 300);
    }
    const inp = inputRef.current;
    inp?.addEventListener("focus", scrollToBottom);
    return () => inp?.removeEventListener("focus", scrollToBottom);
  }, []);

  return (
    <div
      ref={chatRef}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#f9f9f9",
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, padding: 8, background: "#ddd" }}>
        Header Area
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        style={{
          flex: 1,
          minHeight: 0, // crucial
          overflowY: "auto",
          padding: 8,
          background: "#fff",
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              marginBottom: 6,
              padding: 6,
              background: "#eee",
              borderRadius: 4,
            }}
          >
            Message {i + 1}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid #ccc",
          background: "#fafafa",
          padding: 8,
          display: "flex",
          gap: 8,
        }}
      >
        <textarea
          ref={inputRef}
          placeholder="Type a message…"
          style={{
            flex: 1,
            resize: "none",
            borderRadius: 4,
            padding: 6,
            minHeight: 40,
            maxHeight: 120,
          }}
        />
        <button
          style={{
            padding: "6px 12px",
            background: "#007bff",
            color: "#fff",
            borderRadius: 4,
            border: "none",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

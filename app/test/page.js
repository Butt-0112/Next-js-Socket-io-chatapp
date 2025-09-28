"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatGPTStyleUI() {
  const messagesRef = useRef(null);
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    // scroll to bottom initially
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }

    // Listen to viewport resize (keyboard open/close)
    const handleResize = () => {
      // This tells us how much space is left at the bottom of the viewport
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const layoutHeight = window.innerHeight;
        // how much the keyboard overlaps the viewport
        const offset = layoutHeight - viewportHeight;
        setBottomOffset(offset);
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleResize);
    handleResize(); // initial

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="h-12 flex items-center justify-center border-b">Header</div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-2 py-2"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: bottomOffset ? bottomOffset + 60 : 60, // reserve space for input
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="mb-2 p-2 bg-gray-100 rounded">
            Message {i + 1}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div
        className="border-t bg-white p-2"
        style={{
          position: "fixed",
          bottom: bottomOffset,
          left: 0,
          right: 0,
        }}
      >
        <div>

        <input
          type="text"
          className="w-1/2 border rounded p-2"
          placeholder="Type here…"
          onFocus={() => {
            // scroll messages to bottom on focus
            setTimeout(() => {
              if (messagesRef.current) {
                messagesRef.current.scrollTop =
                  messagesRef.current.scrollHeight;
                }
            }, 300);
        }}
        />
        </div>
      </div>
    </div>
  );
}

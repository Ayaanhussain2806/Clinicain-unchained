import React, { useState, useRef, useEffect } from "react";

const ConsultationChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: crypto.randomUUID(),
      content: input,
      sender: "doctor",
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <h2>Consultation Chat</h2>

      <div className="chat-box">
        {messages.map((msg) => (
          <div key={msg.id} className={`msg ${msg.sender}`}>
            <div>{msg.content}</div>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="chat-input">
        <input
          value={input}
          placeholder="Type message..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ConsultationChat;
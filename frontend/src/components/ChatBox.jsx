import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../axiosInstance";
import PlanModal from "./PlanModal";
import "../css/ChatBox.css";

const ChatBox = ({ senderId, receiverId, roomName, token, darkMode, userRole, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const computedRoomName = `chat_${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchChatHistoryAndConnect = async () => {
      try {
        const res = await axiosInstance.get(
          `/chat-history/${senderId}/${receiverId}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
          
        );

        await axiosInstance.post("/chat/mark-seen/", {
  partner_id: receiverId,
});

        setMessages(
          res.data.map((msg) => ({
            ...msg,
            isPlanCard: msg.message_type === "plan_card",
          }))
        );

        const wsUrl = `ws://localhost:8000/ws/chat/${computedRoomName}/`;
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
          console.log("✅ WebSocket connected");
        };

        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("📩 WebSocket received:", data);

          if (data.type === "chat_message") {
  const isPlan = data.message_type === "plan_card";
          
          if (onNewMessage && data.sender_id === receiverId) {
  onNewMessage(); // ✅ notify parent to reload chat partners
}

  if (data.sender_id === receiverId) {
    // mark their messages as seen
    axiosInstance.post("/chat/mark-seen/", {
      partner_id: receiverId,
    });
  }

  setMessages((prev) => {
    const exists = prev.some(
      (msg) =>
        msg.content === data.content &&
        msg.sender_id === data.sender_id &&
        msg.timestamp === data.timestamp
    );
    return exists ? prev : [...prev, { ...data, isPlanCard: isPlan }];
  });
} else if (data.type === "typing") {
            if (data.sender_id !== senderId) {
              setTypingSender(data.sender_id);
              setIsTyping(data.typing);
            }
          } else if (data.error) {
            alert(data.error);
          }
        };

        socketRef.current.onerror = (err) => {
          console.error("❌ WebSocket error:", err);
        };

        socketRef.current.onclose = () => {
          console.log("🔌 WebSocket disconnected");
        };
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    fetchChatHistoryAndConnect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [senderId, receiverId, token, computedRoomName]);

  const sendMessage = () => {
    if (
      !messageInput.trim() ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const messageData = {
      type: "chat_message",
      sender_id: senderId,
      receiver_id: receiverId,
      content: messageInput,
    };

    socketRef.current.send(JSON.stringify(messageData));
    setMessageInput("");

    if (onNewMessage) {
    onNewMessage();
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "typing",
          sender_id: senderId,
          typing: true,
        })
      );

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.send(
          JSON.stringify({
            type: "typing",
            sender_id: senderId,
            typing: false,
          })
        );
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={`chat-wrapper ${darkMode ? "dark-mode" : ""}`}>
      <div className="chat-header">
        <h3>Chat</h3>
        {userRole === 'trainer' && senderId && receiverId && (
          <button className="plan-button" onClick={() => setShowPlanModal(true)}>
            ➕ Assign Workout Plan
          </button>
        )}
      </div>

      <div className="chat-box" ref={chatContainerRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender_id === senderId ? "sent" : "received"}`}
          >
            {msg.isPlanCard ? (
              <div className="plan-card">
                <h4>{msg.content.split("\n")[0].replace("🏋️ Workout Plan: ", "")}</h4>
                <p>{msg.content.split("\n")[1]}</p>
                <ul>
                  {msg.content
                    .split("\n")
                    .slice(2)
                    .map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                </ul>
              </div>
            ) : (
              <div className="message-bubble">{msg.content}</div>
            )}

            <div className="message-time">
              {msg.timestamp &&
                new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </div>
          </div>
        ))}

        {isTyping && typingSender === receiverId && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="input-wrapper">
        <input
          type="text"
          value={messageInput}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="message-input"
        />
        <button onClick={sendMessage} className="send-btn">🚀</button>

      </div>

      {showPlanModal && (
        <PlanModal
          receiverId={receiverId}
          authToken={token}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </div>
  );
};

export default ChatBox;

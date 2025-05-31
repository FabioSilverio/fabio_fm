import React, { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";
import EmojiPicker from "emoji-picker-react";
import "./App.css";

function getTimeString(date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function Chat({ onClose }) {
  const [username, setUsername] = useState(() => localStorage.getItem("chat_username") || "");
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem("chat_username"));
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const chatRef = ref(db, "chat-messages");
    return onValue(chatRef, (snapshot) => {
      const arr = [];
      snapshot.forEach((snap) => {
        arr.push(snap.val());
      });
      setMessages(arr);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !username.trim()) return;
    push(ref(db, "chat-messages"), {
      username,
      text: input,
      timestamp: Date.now(),
    });
    setInput("");
    setShowEmoji(false);
    inputRef.current?.focus();
  }

  function handleSetUsername(e) {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("chat_username", username);
      setIsLogged(true);
    }
  }

  function handleEmojiClick(emojiData) {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  }

  return (
    <div className="chat-modal-bg">
      <div className="chat-modal">
        <button className="chat-close-btn" onClick={onClose}>×</button>
        <div className="chat-title">Chat ao Vivo</div>
        {!isLogged ? (
          <form className="chat-username-form" onSubmit={handleSetUsername}>
            <input
              className="chat-username-input"
              placeholder="Seu nome de usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={20}
              required
            />
            <button className="chat-username-btn" type="submit">Entrar</button>
          </form>
        ) : (
          <>
            <div className="chat-messages">
              {loading ? <div className="chat-loading">Carregando...</div> :
                messages.map((msg, i) => (
                  <div className="chat-message" key={i}>
                    <span className="chat-message-user">{msg.username}</span>
                    <span className="chat-message-time">{getTimeString(new Date(msg.timestamp))}</span>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSend}>
              <button
                type="button"
                className="chat-emoji-btn"
                onClick={() => setShowEmoji((v) => !v)}
                tabIndex={-1}
                title="Inserir emoji"
              >😊</button>
              {showEmoji && (
                <div className="chat-emoji-picker"><EmojiPicker onEmojiClick={handleEmojiClick} autoFocusSearch={false} /></div>
              )}
              <input
                className="chat-input"
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={e => setInput(e.target.value)}
                maxLength={200}
                required
                ref={inputRef}
              />
              <button className="chat-send-btn" type="submit">Enviar</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
} 
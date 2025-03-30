import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recipient, setRecipient] = useState("");
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data?.messages) {
          return;
        }
        if (data.type === "typing") {
          setTypingUser(`${data.name} is typing...`);
          setTimeout(() => setTypingUser(""), 3000);
        } else {
          console.log("Received from server:", data);
          setMessages((prev) => [...prev, data]);
        }
      };

      ws.onclose = () => {
        console.warn("WebSocket closed. Reconnecting...");
        setTimeout(() => {
          if (!ws || ws.readyState === WebSocket.CLOSED) {
            console.log("Reconnecting WebSocket...");
            initializeWebSocket();
          }
        }, 2000);
      };
    }
  }, [ws]);

  const handleTyping = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "typing", name }));
    }
  };

  const initializeWebSocket = () => {
    console.log("Initializing WebSocket...");
    if (ws) ws.close();

    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => {
      console.log("WebSocket connected!");
      socket.send(JSON.stringify({ type: "join", name: username }));
    };
    // window.ws = socket;

    setWs(socket);
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      setToken(res.data.token);
      setName(username);
      setTimeout(() => {
        initializeWebSocket();
      }, 100);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      alert("Registered successfully");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleSend = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected.");
      return;
    }

    if (message.trim()) {
      const msg = recipient
        ? { type: "private_message", name, to: recipient, text: message }
        : { type: "message", name, text: message };

      console.log("Sending message:", msg);
      ws.send(JSON.stringify(msg));
      setMessage("");
    }
  };

  return (
    <div>
      {!token ? (
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
          />
          <input
            type="text"
            placeholder="Recipient (optional)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <button onClick={handleSend}>Send</button>
          <div>
            {messages.map((msg, index) => (
              <p key={index}>
                <strong>{msg.name || msg.sender || "System"}:</strong>{" "}
                {msg.text || msg.message}
              </p>
            ))}
            {typingUser && <p className="typing-indicator">{typingUser}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

require("dotenv").config();
const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Message = mongoose.model("Message", MessageSchema);

let clients = {};

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    let data = JSON.parse(message);
    console.log(`Received message:`, data);

    switch (data.type) {
      case "join":
        if (!data.name || !ws) {
          console.log("Invalid join request");
          return;
        }
        clients[data.name] = ws;
        console.log(`${data.name} joined. Active users:`, Object.keys(clients));
        const history = await Message.find({})
          .sort({ timestamp: -1 })
          .limit(10);
        ws.send(JSON.stringify({ type: "history", messages: history }));
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "notification",
                message: `${data.name} joined the chat`,
              })
            );
          }
        });
        break;

      case "message":
        const newMessage = new Message({ sender: data.name, text: data.text });
        await newMessage.save();
        broadcast({ type: "message", name: data.name, text: data.text });
        break;
      case "typing":
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "typing",
                name: data.name,
              })
            );
          }
        });
        break;
      case "private_message":
        console.log(
          `Private message from ${data.name} to ${data.to}: ${data.text}`
        );

        await new Message({
          sender: data.name,
          receiver: data.to,
          text: data.text,
        }).save();

        if (clients[data.to]) {
          clients[data.to].send(
            JSON.stringify({
              type: "private_message",
              sender: data.name,
              text: data.text,
            })
          );
        } else {
          clients[data.name].send(
            JSON.stringify({
              type: "private_message",
              sender: data.name,
              text: `User ${data.to} is offline. Message saved.`,
            })
          );
          console.log(`User ${data.to} is offline. Message saved.`);
        }
        break;
    }
  });

  ws.on("close", () => {
    Object.keys(clients).forEach((name) => {
      if (clients[name] === ws) {
        delete clients[name];
        broadcast({ type: "notification", message: `${name} left the chat` });
      }
    });
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.json({ message: "User registered" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

server.listen(5000, () => console.log("Server running on port 5000"));

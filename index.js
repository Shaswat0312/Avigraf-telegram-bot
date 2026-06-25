import dotenv from "dotenv";
import express from "express";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.post("/new-message", async (req, res) => {
  const { message } = req.body;

  if (
    !message ||
    !message.text ||
    !message.text.toLowerCase().includes("marco")
  ) {
    return res.sendStatus(200);
  }

  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: message.chat.id,
      text: "Polo!!",
    });

    console.log("Message sent");
    res.sendStatus(200);
  } catch (err) {
    console.error("Error sending message:", err.message);
    res.sendStatus(500);
  }
});


app.get("/", (req, res) => {
  res.send("Bot is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});